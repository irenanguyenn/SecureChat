# filepath: c:\Users\lilyt\OneDrive\Desktop\SecureChatBeta-main\serv.py
import asyncio
import websockets
import ssl
import bcrypt
import os
import time
from datetime import datetime
from http.server import SimpleHTTPRequestHandler
import socketserver
from firebase_admin import db
from firebase_admin_init import firebase_admin

def load_users():
    """Load user credentials from Firebase"""
    users_ref = db.reference('users')
    users = users_ref.get()
    return {username: user['password'].encode() for username, user in users.items()} if users else {}

def save_user(username, password):
    """Save a new user to Firebase"""
    hashed_password = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=4))
    users_ref = db.reference('users')
    users_ref.child(username).set({
        'password': hashed_password.decode()
    })

clients = {}  # Active clients: {websocket: username}

async def authenticate(websocket):
    """Authenticate users or create new accounts."""
    users = load_users()
    
    await websocket.send("Type 'login' to sign in or 'register' to create an account:")
    action = await websocket.recv()

    await websocket.send("Enter username:")
    username = await websocket.recv()

    if action == "register":
        if username in users:
            await websocket.send("Username already exists. Connection closed.")
            return None

        await websocket.send("Enter password:")
        password = await websocket.recv()
        save_user(username, password)
        await websocket.send("Registration successful! Please log in.")
        return None

    elif action == "login":
        if username not in users:
            await websocket.send("User not found. Connection closed.")
            return None

        await websocket.send("Enter password:")
        password = await websocket.recv()

        if bcrypt.checkpw(password.encode(), users[username]):
            await websocket.send("Authentication successful!")
            return username
        else:
            await websocket.send("Authentication failed. Connection closed.")
            return None

async def notify_all(message, exclude=None):
    """Send a message to all connected clients except the excluded one."""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    formatted_message = f"[{timestamp}] {message}"
    
    for client in list(clients.keys()):
        if client != exclude:
            try:
                await client.send(formatted_message)
            except websockets.exceptions.ConnectionClosed:
                del clients[client]

rate_limiters = {}

class MessageRateLimiter:
    def __init__(self, max_messages, time_period):
        self.max_messages = max_messages
        self.time_period = time_period
        self.amount_granted = max_messages
        self.last_time = time.monotonic()

    def can_send(self):
        current_time = time.monotonic()
        elapsed_time = current_time - self.last_time
        self.last_time = current_time

        self.amount_granted += elapsed_time * (self.max_messages / self.time_period)
        if self.amount_granted > self.max_messages:
            self.amount_granted = self.max_messages

        if self.amount_granted < 1:
            return False
        else:
            self.amount_granted -= 1
            return True
            
async def handler(websocket):
    """Handles new client connections and message broadcasting."""
    username = await authenticate(websocket)
    if not username:
        await websocket.close()
        return

    print(f"{username} connected.")
    clients[websocket] = username
    rate_limiters[username] = MessageRateLimiter(5, 10)

    join_message = f"{username} has joined the chat."
    await notify_all(join_message)

    try:
        while True:
            msg = await asyncio.wait_for(websocket.recv(), timeout=45)
            if msg == "ping":
                await websocket.send("pong")
                continue

            if not rate_limiters[username].can_send():
                await websocket.send("Rate limit exceeded! Messages after will not appear for other client. Resend message after 2 seconds.")
                continue

            formatted_msg = f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {username}: {msg}"
            print(formatted_msg)
            await notify_all(f"{username}: {msg}", exclude=websocket)

    except asyncio.TimeoutError:
        try:
            await websocket.send("You have been disconnected due to inactivity.")
        except websockets.exceptions.ConnectionClosed:
            pass
        print(f"{username} timed out due to inactivity.")
        await websocket.close()

    except websockets.exceptions.ConnectionClosed:
        print(f"{username} disconnected.")
    finally:
        if websocket in clients:
            del clients[websocket]
        if username in rate_limiters:
            del rate_limiters[username]
        leave_message = f"{username} has disconnected."
        await notify_all(leave_message)

async def main():
    """Starts the WebSocket server with SSL encryption."""
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain("cert.pem", "key.pem")

    server = await websockets.serve(handler, "0.0.0.0", 8765, ssl=ssl_context, ping_interval=None)
    print("Secure WebSocket Server started on wss://0.0.0.0:8765/")
    await asyncio.Future()

def start_http_server():
    PORT = 8000
    with socketserver.TCPServer(("", PORT), SimpleHTTPRequestHandler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

if __name__ == "__main__":
    asyncio.run(main())
    start_http_server()