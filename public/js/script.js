// Initializing Firebase
if (!firebase.apps.length) {
    firebase.initializeApp({
        apiKey: "AIzaSyBWxzAPXQEWy9Eld6EbVfYI1RIMJfglDeQ",
        authDomain: "smooth-state-453618-p4.firebaseapp.com",
        databaseURL: "https://smooth-state-453618-p4-default-rtdb.firebaseio.com",
        projectId: "smooth-state-453618-p4",
        storageBucket: "smooth-state-453618-p4.appspot.com",
        messagingSenderId: "386881722135",
        appId: "1:386881722135:web:6a99d55fa4a890268d4952",
        measurementId: "G-S81WYQY8ZX"
    });
} else {
    firebase.app();
}

const db = firebase.database();
const chatRef = db.ref("messages");

const chat = document.querySelector('.chat-messages');
const messageInput = document.querySelector('#message-input');
const sendButton = document.querySelector('.send-btn');

// Fetch Correct Username from Firebase
async function getCurrentUsername() {
    let username = localStorage.getItem("loggedInUsername");

    if (!username) {
        const user = firebase.auth().currentUser;
        if (!user) return "Unknown";

        const userRef = db.ref("users/" + user.uid);
        const snapshot = await userRef.once("value");
        const userData = snapshot.val();
        username = userData?.username || "Unknown";

        localStorage.setItem("loggedInUsername", username);
        console.log("Fetched and stored username:", username);
    }

    return username;
}

// Send Message with Correct Username
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;

    const username = await getCurrentUsername();

    chatRef.push({
        username: username,
        message: message,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    messageInput.value = "";
}

// Make the function accessible globally
window.sendMessage = sendMessage;

// Display Messages in Chat
function displayMessage(username, message) {
    const loggedInUsername = localStorage.getItem("loggedInUsername") || "Unknown";

    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add('message-wrapper', username === loggedInUsername ? 'sent' : 'received');

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timestampElement = document.createElement("div");
    timestampElement.classList.add("timestamp");
    timestampElement.textContent = timestamp;

    const messageElement = document.createElement("div");
    messageElement.classList.add("message", username === loggedInUsername ? "sent" : "received");
    messageElement.textContent = `${username}: ${message}`;

    messageWrapper.appendChild(timestampElement);
    messageWrapper.appendChild(messageElement);
    chat.appendChild(messageWrapper);

    chat.scrollTop = chat.scrollHeight; // Auto-scroll to latest message
}

// Listen for New Messages in Firebase
chatRef.on("child_added", (snapshot) => {
    const data = snapshot.val();
    displayMessage(data.username, data.message);
});

// Send Message on Button Click or Enter Key
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("send-btn").addEventListener("click", sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});

// Load Friend Requests
function loadFriendRequests() {
    const currentUser = firebase.auth().currentUser;
    if (!currentUser) return;

    const currentUsername = localStorage.getItem("loggedInUsername");
    if (!currentUsername) return;

    const requestsRef = db.ref(`friendRequests/${currentUsername}`);
    requestsRef.on("value", (snapshot) => {
        const friendRequestsList = document.getElementById("friend-requests");
        friendRequestsList.innerHTML = "";

        snapshot.forEach((childSnapshot) => {
            const senderUsername = childSnapshot.key;
            const requestData = childSnapshot.val();

            const listItem = document.createElement("li");
            listItem.innerHTML = `
                ${senderUsername}
                <button class="accept-btn" data-username="${senderUsername}">✔ Accept</button>
                <button class="decline-btn" data-username="${senderUsername}">✖ Decline</button>
            `;

            friendRequestsList.appendChild(listItem);
        });

        // Add event listeners for Accept/Decline
        document.querySelectorAll(".accept-btn").forEach((button) => {
            button.addEventListener("click", acceptFriendRequest);
        });

        document.querySelectorAll(".decline-btn").forEach((button) => {
            button.addEventListener("click", declineFriendRequest);
        });
    });
}

// Accept Friend Request
async function acceptFriendRequest(event) {
    const senderUsername = event.target.dataset.username;
    const currentUsername = localStorage.getItem("loggedInUsername");
    if (!currentUsername) return;

    // Add both users to each other's friends list
    const friendsRef1 = db.ref(`friends/${currentUsername}/${senderUsername}`);
    const friendsRef2 = db.ref(`friends/${senderUsername}/${currentUsername}`);

    await friendsRef1.set(true);
    await friendsRef2.set(true);

    // Remove the friend request
    const requestRef = db.ref(`friendRequests/${currentUsername}/${senderUsername}`);
    await requestRef.remove();

    alert("Friend request accepted!");
}

// Decline Friend Request
async function declineFriendRequest(event) {
    const senderUsername = event.target.dataset.username;
    const currentUsername = localStorage.getItem("loggedInUsername");
    if (!currentUsername) return;

    const requestRef = db.ref(`friendRequests/${currentUsername}/${senderUsername}`);
    await requestRef.remove();

    alert("Friend request declined.");
}

// Load Friends List
function loadFriends() {
    const currentUsername = localStorage.getItem("loggedInUsername");
    if (!currentUsername) return;

    const friendsRef = db.ref(`friends/${currentUsername}`);
    friendsRef.on("value", (snapshot) => {
        const friendsList = document.getElementById("users");
        friendsList.innerHTML = "";

        snapshot.forEach((childSnapshot) => {
            const friendUsername = childSnapshot.key;

            const listItem = document.createElement("li");
            listItem.textContent = friendUsername;
            friendsList.appendChild(listItem);
        });
    });
}

// Initialize Functions on Page Load
document.addEventListener("DOMContentLoaded", () => {
    loadFriendRequests();
    loadFriends();
});

// Logout Function
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            firebase.auth().signOut().then(() => {
                console.log("User logged out.");
                window.location.href = "index.html";
            }).catch((error) => {
                console.error("Logout failed:", error);
            });
        });
    }
});
