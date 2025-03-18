const websocket = new WebSocket('wss://192.168.12.244:8765');
const chat = document.querySelector('.chat-messages');
const messageInput = document.querySelector('.chat-input input');
const sendButton = document.querySelector('.send-btn');

// Get the logged-in user's name
const loggedInUser = localStorage.getItem("loggedInUser") || "User";

websocket.onopen = () => {
    console.log('Connected to chat server');
};

websocket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    displayMessage(data.username, data.message);
};

websocket.onclose = () => {
    console.log('Disconnected from chat server');
};

// Send message function
function sendMessage() {
    const messageInput = document.getElementById('message-input');
    const chatMessages = document.getElementById('chat-messages');
    const message = messageInput.value.trim();

    if (message) {
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-wrapper', 'sent');

        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const timestampElement = document.createElement('div');
        timestampElement.classList.add('timestamp');
        timestampElement.textContent = timestamp;

        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'sent');
        messageElement.textContent = message;

        messageWrapper.appendChild(timestampElement);
        messageWrapper.appendChild(messageElement);
        chatMessages.appendChild(messageWrapper);
        messageInput.value = '';
    }
}

// Message
function displayMessage(username, message, type = "received") {
    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message', type);

    // Set message text
    messageContainer.innerHTML = `<strong>${username}:</strong> ${message}`;

    chat.appendChild(messageContainer);
    chat.scrollTop = chat.scrollHeight; // Auto-scroll
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

// Set logged-in username in UI
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector(".user-name").textContent = loggedInUser;

    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPicker = document.getElementById('emoji-picker');
    const messageInput = document.getElementById('message-input');

    emojiBtn.addEventListener('click', () => {
        emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'block' : 'none';
    });

    emojiPicker.addEventListener('emoji-click', (event) => {
        messageInput.value += event.detail.unicode;
    });

    document.addEventListener('click', (event) => {
        if (!emojiPicker.contains(event.target) && !emojiBtn.contains(event.target)) {
            emojiPicker.style.display = 'none';
        }
    });
});

