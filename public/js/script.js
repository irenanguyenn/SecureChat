// Initializing Firebase
if (!firebase.apps.length) {
    firebase.initializeApp({
        apiKey: "AIzaSyBWxzAPXQEWy9Eld6EbVfYI1RIMJfglDeQ",
        authDomain: "smooth-state-453618-p4.firebaseapp.com",
        databaseURL: "https://smooth-state-453618-p4-default-rtdb.firebaseio.com",
        projectId: "smooth-state-453618-p4",
        storageBucket: "smooth-state-453618-p4.firebasestorage.app",
        messagingSenderId: "386881722135",
        appId: "1:386881722135:web:6a99d55fa4a890268d4952",
        measurementId: "G-S81WYQY8ZX"
    });
} else {
    firebase.app();
}

const db = firebase.database();
const storage = firebase.storage();

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

// Add Friend
async function addFriend() {
    const usernameToAdd = document.getElementById("add-user-input").value.trim();
    if (!usernameToAdd) return alert("Please enter a username.");

    const currentUsername = await getCurrentUsername();
    if (usernameToAdd === currentUsername) return alert("You cannot add yourself.");

    const usersRef = db.ref("users");
    usersRef.orderByChild("username").equalTo(usernameToAdd).once("value", async (snapshot) => {
        if (snapshot.exists()) {
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

    const friendsRef1 = db.ref(`friends/${currentUsername}/${senderUsername}`);
    const friendsRef2 = db.ref(`friends/${senderUsername}/${currentUsername}`);

    await Promise.all([
        friendsRef1.set(true),
        friendsRef2.set(true)
    ]);
    
    loadFriends();
    
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
const currentUsername = await getCurrentUsername();
const friendsRef = db.ref(`friends/${currentUsername}`);

async function loadFriends() {
    const currentUsername = await getCurrentUsername();
    const friendsRef = db.ref(`friends/${currentUsername}`);
    const friendsListContainer = document.getElementById("users"); 

    friendsListContainer.innerHTML = "";

    friendsRef.once("value", (snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const friendUsername = childSnapshot.key;

            const listItem = document.createElement("li");

            const nameSpan = document.createElement("span");
            nameSpan.textContent = friendUsername;
            nameSpan.classList.add("friend-name");
            nameSpan.style.cursor = "pointer";

            const statusRef = db.ref(`status/${friendUsername}`);
            statusRef.on("value", (statusSnapshot) => {
                const status = statusSnapshot.val();
                if (status && status.state === "online") {
                    nameSpan.classList.add("online");
                } else {
                    nameSpan.classList.remove("online");
                }
            });

            nameSpan.addEventListener("click", () => {
                startPrivateChat(friendUsername);
            });

            const removeBtn = document.createElement("button");
            removeBtn.classList.add("remove-btn");
            removeBtn.dataset.username = friendUsername;
            removeBtn.innerHTML = "<i class='bx bx-trash'></i>"; 
            removeBtn.addEventListener("click", removeFriend);
            
            listItem.appendChild(nameSpan);
            listItem.appendChild(removeBtn);
            friendsListContainer.appendChild(listItem);
        });
    });
}

// Remove Friend Function
async function removeFriend(event) {
    const friendUsername = event.target.dataset.username;
    const currentUsername = sessionStorage.getItem("loggedInUsername");
    if (!currentUsername || !friendUsername) return;

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

    statusRef.set({ state: "online", lastSeen: firebase.database.ServerValue.TIMESTAMP });

    statusRef.onDisconnect().set({ state: "offline", lastSeen: firebase.database.ServerValue.TIMESTAMP });

    const newMsgRef = systemMsgRef.push();
    newMsgRef.onDisconnect().set({
        type: "disconnect",
        message: `${username} disconnected from chat.`,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });

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

firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        console.log("Auth ready:", user.email);
        loadFriendRequests();
        loadFriends();
        setupHeartbeat(); 
    } else {
        console.warn("No user signed in yet");
    }
});

// Group Chat Toggle
let selectedFriend = null;
let privateChatRef = null;

async function startPrivateChat(friendUsername) {
    const currentUsername = await getCurrentUsername();
    selectedFriend = friendUsername;

    const chatId = [currentUsername, friendUsername].sort().join("_");
    privateChatRef = db.ref(`privateMessages/${chatId}`);

    document.getElementById("chat-messages").innerHTML = "";
    document.getElementById("chat-header").textContent = `Chatting with ${friendUsername}`;
    document.getElementById("chat-area").classList.remove("hidden");
    document.querySelector(".sidebar").classList.add("shrink");

    let disconnectNotified = false;

    const friendStatusRef = db.ref(`status/${friendUsername}`);
    friendStatusRef.on("value", (snapshot) => {
        const status = snapshot.val();
        if (!status) return;

        const now = Date.now();
        const lastSeen = status.lastSeen;
        const secondsSinceLastSeen = (now - lastSeen) / 1000;

        if (secondsSinceLastSeen > 60 && status.state === "offline" && !disconnectNotified) {
            displaySystemMessage(`${friendUsername} disconnected from chat.`);
            disconnectNotified = true;
        }

        if (status.state === "online") {
            disconnectNotified = false;
        }
    });

    privateChatRef.off(); 
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

    while (messageTimestamps.length > 0 && now - messageTimestamps[0] > SPAM_WINDOW) {
        messageTimestamps.shift();
    }

    if (messageTimestamps.length >= MAX_MESSAGES) {
        isCooldown = true;
        alert("You are sending messages too fast. Please wait 20 seconds.");
        
        setTimeout(() => {
            isCooldown = false;
            messageTimestamps.length = 0;
        }, COOLDOWN_TIME);

        return;
    }

    messageTimestamps.push(now);

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

// Chat Messages
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
    
    if (username === loggedInUsername) {
        messageElement.classList.add("sent");
        messageElement.style.backgroundColor = "#31737A"; 
        messageElement.style.color = "white";
        messageWrapper.style.justifyContent = "flex-end";
    } else {
        messageElement.classList.add("received");
        messageElement.style.backgroundColor = "#E0E0E0";
        messageElement.style.color = "black";
        messageWrapper.style.justifyContent = "flex-start";
    }

    const isImageTag = message.includes("<img");
    messageElement.innerHTML = isImageTag ? `${message}` : `${username}: ${message}`;

    if (message.includes("https://") && (message.includes(".png") || message.includes(".jpg") || message.includes(".jpeg") || message.includes(".gif"))) {
        const img = document.createElement("img");
        img.src = message.match(/https?:\/\/[^\s]+/)[0];
        img.alt = "Image";
        img.style.maxWidth = "200px";
        img.style.borderRadius = "10px";
        img.style.marginTop = "5px";
        messageElement.appendChild(document.createElement("br"));
        messageElement.appendChild(img);
    }
    
    messageWrapper.appendChild(timestampElement);
    messageWrapper.appendChild(messageElement);
    chat.appendChild(messageWrapper);

    chat.scrollTop = chat.scrollHeight; 
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

chatRef.on("child_added", (snapshot) => {
    const data = snapshot.val();
    displayMessage(data.username, data.message);
});

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

//File Upload 
const attachBtn = document.querySelector(".attach-btn");
const fileInput = document.getElementById("file-input");

attachBtn.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["image/png", "image/jpeg", "image/gif", "application/pdf", "text/plain"];
    const maxSizeMB = 10;

    if (!allowedTypes.includes(file.type)) {
        alert("Only images, PDFs, and text files are allowed.");
        return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
        alert("File is too large. Max 10MB allowed.");
        return;
    }

    const username = await getCurrentUsername();
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = storage.ref().child(`uploads/${username}/${fileName}`);

    try {
        console.log("Uploading file:", file.name);
        const snapshot = await storageRef.put(file);
        console.log("Upload complete!");

        const downloadURL = await snapshot.ref.getDownloadURL();
        console.log("File URL:", downloadURL);

        let message;
        if (file.type.startsWith("image/")) {
            message = `<img src="${downloadURL}" alt="${file.name}" style="max-width: 200px; border-radius: 10px;" />`;
        } else {
            message = `<a href="${downloadURL}" target="_blank">${file.name}</a>`;
        }

        const refToUse = privateChatRef || chatRef;
        refToUse.push({
            username: username,
            message: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        fileInput.value = "";
    } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload file.");
    }
});

// Emoji Picker
const emojiBtn = document.getElementById("emoji-btn");
const emojiPicker = document.getElementById("emoji-picker");
const messageInputBox = document.getElementById("message-input");

emojiBtn.addEventListener("click", () => {
    emojiPicker.style.display = (emojiPicker.style.display === "none") ? "block" : "none";
});

emojiPicker.addEventListener("emoji-click", (event) => {
    const emoji = event.detail.unicode;
    messageInputBox.value += emoji;
    emojiPicker.style.display = "none";
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
