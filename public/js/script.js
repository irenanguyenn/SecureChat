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

// Function to fetch current user's username
async function getCurrentUsername() {
    let username = sessionStorage.getItem("loggedInUsername");

    if (!username) {
        const user = firebase.auth().currentUser;
        if (!user) return "Unknown";

        const userRef = db.ref("users/" + user.uid);
        const snapshot = await userRef.once("value");
        const userData = snapshot.val();
        username = userData?.username || "Unknown";

        sessionStorage.setItem("loggedInUsername", username);
        console.log("Username stored in sessionStorage:", username);
    }
    return username;
}

// Function to add a friend
async function addFriend() {
    const usernameToAdd = document.getElementById("add-user-input").value.trim();
    if (!usernameToAdd) return alert("Please enter a username.");

    const currentUsername = await getCurrentUsername();
    if (usernameToAdd === currentUsername) return alert("You cannot add yourself.");

    const usersRef = db.ref("users");
    usersRef.orderByChild("username").equalTo(usernameToAdd).once("value", async (snapshot) => {
        if (snapshot.exists()) {
            // Create relationship in both directions
            const updates = {};
            updates[`friends/${currentUsername}/${usernameToAdd}`] = true;
            updates[`friends/${usernameToAdd}/${currentUsername}`] = true;

            await db.ref().update(updates);
            alert(`You are now friends with ${usernameToAdd}`);
        } else {
            alert("User not found.");
        }
    });

    document.getElementById("add-user-input").value = "";
}

// Event listener for add friend button
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("add-user-btn").addEventListener("click", addFriend);
});

// Load Friend Requests
function loadFriendRequests() {
    const currentUsername = sessionStorage.getItem("loggedInUsername");

    if (!currentUsername) {
        console.error("No username in sessionStorage");
        return;
    }

    console.log("Loading friend requests for:", currentUsername);

    const requestsRef = db.ref(`friendRequests/${currentUsername}`);
    requestsRef.on("value", (snapshot) => {
        console.log("Friend requests snapshot:", snapshot.val());

        const friendRequestsList = document.getElementById("friend-requests");
        friendRequestsList.innerHTML = "";

        if (!snapshot.exists()) {
            console.log("No friend requests found for:", currentUsername);
            return;
        }

        snapshot.forEach((childSnapshot) => {
            const senderUsername = childSnapshot.key;
            console.log("Friend request from:", senderUsername);

            const listItem = document.createElement("li");
            listItem.innerHTML = `
                ${senderUsername}
                <button class="accept-btn" data-username="${senderUsername}">✔ Accept</button>
                <button class="decline-btn" data-username="${senderUsername}">✖ Decline</button>
            `;
            friendRequestsList.appendChild(listItem);
        });

        // Attach event listeners for accepting/declining requests
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

    await Promise.all([
        friendsRef1.set(true),
        friendsRef2.set(true)
    ]);
    
    loadFriends();
    

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
    const currentUsername = sessionStorage.getItem("loggedInUsername");
    if (!currentUsername) return;

    console.log("Loading friends for:", currentUsername);

    const friendsRef = db.ref(`friends/${currentUsername}`);
    friendsRef.on("value", (snapshot) => {
        console.log("/.l.,l.,.,Friends snapshot:", snapshot.val());

        const friendsList = document.getElementById("users");
        friendsList.innerHTML = ""; // Clear existing list

        if (!snapshot.exists()) {
            console.log("No friends found for:", currentUsername);
            return;
        }

        snapshot.forEach((childSnapshot) => {
            const friendUsername = childSnapshot.key;
            console.log("Found friend:", friendUsername);

            const listItem = document.createElement("li");

            const nameSpan = document.createElement("span");
            nameSpan.textContent = friendUsername;
            nameSpan.classList.add("friend-name");
            nameSpan.style.cursor = "pointer";
            nameSpan.addEventListener("click", () => {
                startPrivateChat(friendUsername);
            });
                        
            const removeBtn = document.createElement("button");
            removeBtn.classList.add("remove-btn");
            removeBtn.innerHTML = "🗑";
            removeBtn.setAttribute("data-username", friendUsername);
            removeBtn.addEventListener("click", removeFriend);
            
            listItem.appendChild(nameSpan);
            listItem.appendChild(removeBtn);            
            friendsList.appendChild(listItem);
        });
    });
}

// Remove Friend Function
async function removeFriend(event) {
    const friendUsername = event.target.dataset.username;
    const currentUsername = sessionStorage.getItem("loggedInUsername");
    if (!currentUsername || !friendUsername) return;

    // Remove friendship from both users
    const updates = {};
    updates[`friends/${currentUsername}/${friendUsername}`] = null;
    updates[`friends/${friendUsername}/${currentUsername}`] = null;

    try {
        await db.ref().update(updates);
        alert(`${friendUsername} has been removed from your friends list.`);
    } catch (error) {
        console.error("Failed to remove friend:", error);
        alert("Failed to remove friend.");
    }
}

// Heartbeat Functionality
let disconnectMsgRef = null;

async function setupHeartbeat() {
    const username = await getCurrentUsername();
    const statusRef = db.ref(`status/${username}`);
    const systemMsgRef = db.ref("systemMessages");

    // Mark as online
    statusRef.set({ state: "online", lastSeen: firebase.database.ServerValue.TIMESTAMP });

    // Handle unexpected disconnect
    statusRef.onDisconnect().set({ state: "offline", lastSeen: firebase.database.ServerValue.TIMESTAMP });

    // Generate a new system message key
    const newMsgRef = systemMsgRef.push();
    newMsgRef.onDisconnect().set({
        type: "disconnect",
        message: `${username} disconnected from chat.`,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    // Send heartbeat every 5 seconds
    setInterval(() => {
        statusRef.set({ state: "online", lastSeen: firebase.database.ServerValue.TIMESTAMP });
    }, 5000);

    disconnectMsgRef = systemMsgRef.push();
    disconnectMsgRef.onDisconnect().set({
        type: "disconnect",
        message: `${username} disconnected from chat.`,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
}

// Initialize Functions on Page Load
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("Auth ready:", user.email);
        loadFriendRequests();
        loadFriends();
        setupHeartbeat(); // 👈 Add this
    } else {
        console.warn("No user signed in yet");
    }
});

let selectedFriend = null;
let privateChatRef = null;

async function startPrivateChat(friendUsername) {
    const currentUsername = await getCurrentUsername();
    selectedFriend = friendUsername;

    const chatId = [currentUsername, friendUsername].sort().join("_");
    privateChatRef = db.ref(`privateMessages/${chatId}`);

    document.getElementById("chat-messages").innerHTML = "";
    document.getElementById("chat-header").textContent = `Chatting with ${friendUsername}`;

    privateChatRef.off(); // Remove previous listeners
    privateChatRef.on("child_added", (snapshot) => {
        const data = snapshot.val();
        displayMessage(data.username, data.message);
    });

    console.log(`Started private chat between ${currentUsername} and ${friendUsername}`);
}

const systemMsgRef = db.ref("systemMessages");

systemMsgRef.on("child_added", (snapshot) => {
    const data = snapshot.val();
    if (data.type === "disconnect") {
        displaySystemMessage(data.message);
    }
});

// Spam Protection
const messageTimestamps = [];
const MAX_MESSAGES = 3;
const SPAM_WINDOW = 5000; // 5 seconds
const COOLDOWN_TIME = 20000; // 20 seconds
let isCooldown = false;

async function sendMessage() {
    if (isCooldown) {
        alert("You are sending messages too fast. Please wait 20 seconds.");
        return;
    }

    const message = messageInput.value.trim();
    if (!message) return;

    const username = await getCurrentUsername();
    const now = Date.now();

    // Remove old timestamps outside the spam window
    while (messageTimestamps.length > 0 && now - messageTimestamps[0] > SPAM_WINDOW) {
        messageTimestamps.shift();
    }

    // Check if user has exceeded message limit
    if (messageTimestamps.length >= MAX_MESSAGES) {
        isCooldown = true;
        alert("You are sending messages too fast. Please wait 20 seconds.");
        
        // Auto-remove cooldown after 20 seconds
        setTimeout(() => {
            isCooldown = false;
            messageTimestamps.length = 0; // Reset message history
        }, COOLDOWN_TIME);

        return;
    }

    // Record timestamp
    messageTimestamps.push(now);

    // Send message to Firebase
    const refToUse = privateChatRef || chatRef;
    refToUse.push({
        username: username,
        message: message,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    messageInput.value = "";
}

const chatRef = db.ref("messages");

const chat = document.querySelector('.chat-messages');
const messageInput = document.querySelector('#message-input');
const sendButton = document.querySelector('.send-btn');
window.sendMessage = sendMessage;

// Display Messages in Chat
function displayMessage(username, message) {
    const loggedInUsername = sessionStorage.getItem("loggedInUsername") || "Unknown";

    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add('message-wrapper', username === loggedInUsername ? 'sent' : 'received');

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const timestampElement = document.createElement("div");
    timestampElement.classList.add("timestamp");
    timestampElement.textContent = timestamp;

    const messageElement = document.createElement("div");
    messageElement.classList.add("message");
    
    // Apply different styles for sent and received messages
    if (username === loggedInUsername) {
        messageElement.classList.add("sent");
        messageElement.style.backgroundColor = "#31737A"; // Right side
        messageElement.style.color = "white";
        messageWrapper.style.justifyContent = "flex-end";
    } else {
        messageElement.classList.add("received");
        messageElement.style.backgroundColor = "#E0E0E0"; // Left side
        messageElement.style.color = "black";
        messageWrapper.style.justifyContent = "flex-start";
    }

    messageElement.textContent = `${username}: ${message}`;
    
    messageWrapper.appendChild(timestampElement);
    messageWrapper.appendChild(messageElement);
    chat.appendChild(messageWrapper);

    chat.scrollTop = chat.scrollHeight; // Auto-scroll to latest message
}

function displaySystemMessage(message) {
    const messageWrapper = document.createElement("div");
    messageWrapper.classList.add("system-message");

    const messageElement = document.createElement("div");
    messageElement.style.textAlign = "center";
    messageElement.style.color = "#888";
    messageElement.style.fontStyle = "italic";
    messageElement.textContent = message;

    messageWrapper.appendChild(messageElement);
    chat.appendChild(messageWrapper);

    chat.scrollTop = chat.scrollHeight;
}

// Listen for New Messages in Firebase
chatRef.on("child_added", (snapshot) => {
    const data = snapshot.val();
    displayMessage(data.username, data.message);
});

// Send Message on Button Click or Enter Key
document.addEventListener("DOMContentLoaded", () => {
    const sendButton = document.getElementById("send-btn");
    const messageInput = document.getElementById("message-input");

    if (sendButton) {
        sendButton.addEventListener("click", sendMessage);
    } else {
        console.error("Send button not found in DOM");
    }

    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    } else {
        console.error("Message input field not found in DOM");
    }
});

// Logout Function
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            const username = await getCurrentUsername();
            const statusRef = db.ref(`status/${username}`);

            if (disconnectMsgRef) {
                await disconnectMsgRef.onDisconnect().cancel();
            }

            await statusRef.set({ state: "offline", lastSeen: firebase.database.ServerValue.TIMESTAMP });

            firebase.auth().signOut().then(() => {
                console.log("User logged out.");
                window.location.href = "index.html";
            }).catch((error) => {
                console.error("Logout failed:", error);
            });
        });
    }
});
