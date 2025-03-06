from flask import Flask, request, jsonify
import mysql.connector
import jwt
import bcrypt
import datetime

app = Flask(__name__)
SECRET_KEY = "your_secret_key"

# Function to Connect to MySQL
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",         # If running MySQL locally
        user="root",              # Change to your MySQL username
        password="password", # Change to your MySQL password
        database="securechat"     # Ensure this database exists
    )

def hash_password(password):
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

def check_password(password, hashed_password):
    return bcrypt.checkpw(password.encode(), hashed_password.encode())

@app.route('/register', methods=['POST'])
def register():
    """Handles user registration."""
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"success": False, "message": "Username and password required."}), 400

    conn = get_db_connection()
    cursor = conn.cursor()

    try:
        hashed_pw = hash_password(password)
        cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", (username, hashed_pw))
        conn.commit()
        return jsonify({"success": True, "message": "Registration successful! Please log in."})
    except mysql.connector.IntegrityError:
        return jsonify({"success": False, "message": "Username already exists."}), 409
    finally:
        cursor.close()
        conn.close()

@app.route('/login', methods=['POST'])
def login():
    """Handles user authentication and JWT token generation."""
    data = request.json
    username = data.get("username")
    password = data.get("password")

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT password FROM users WHERE username = %s", (username,))
    result = cursor.fetchone()
    
    if not result or not check_password(password, result[0]):
        return jsonify({"success": False, "message": "Invalid username or password."}), 401

    # Generate JWT token valid for 1 hour
    token = jwt.encode({
        "username": username,
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
    }, SECRET_KEY, algorithm="HS256")

    cursor.close()
    conn.close()
    return jsonify({"success": True, "token": token})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
