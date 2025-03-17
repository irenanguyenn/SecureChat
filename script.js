const websocket = new WebSocket('wss://192.168.12.244:8765');
const chat = document.querySelector('.chat-messages');
const messageInput = document.querySelector('.chat-input input');
const sendButton = document.querySelector('.send-btn');

// Get the logged-in user's name
const loggedInUser = localStorage.getItem("loggedInUser") || "User";

// WebSocket connection open
websocket.onopen = () => {
    console.log('Connected to chat server');
};

// WebSocket receive message
websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    displayMessage(data.username, data.message);
};

// WebSocket closed
websocket.onclose = () => {
    console.log('Disconnected from chat server');
};

// Send message function
function sendMessage() {
    const message = messageInput.value.trim();
    if (message) {
        const messageData = { username: loggedInUser, message };
        websocket.send(JSON.stringify(messageData));
        displayMessage(loggedInUser, message, "sent"); // Show sent message
        messageInput.value = '';
    }
}

// Function to display messages in chat
function displayMessage(username, message, type = "received") {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', type);

    // Set message text
    messageContainer.innerHTML = `<strong>${username}:</strong> ${message}`;

    chat.appendChild(messageContainer);
    chat.scrollTop = chat.scrollHeight; // Auto-scroll
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Set logged-in username in UI
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".user-name").textContent = loggedInUser;
});
