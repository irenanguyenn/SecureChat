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

// XSS protection helpers
function sanitizeInput(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
}

function escapeHTML(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
}

function isValidUsername(username) {
    const regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9]{3,10}$/;  
    const lowerUsername = username.toLowerCase();
    return regex.test(username) && lowerUsername !== "admin";
}

function isValidURL(url) {
    try {
        const parsed = new URL(url);
        return ["http:", "https:"].includes(parsed.protocol);
    } catch (_) {
        return false;
    }
}

function containsDangerousTags(input) {
    const sanitized = input.toLowerCase().replace(/\s+/g, "");
    const pattern = /<(script|img|iframe|object|embed|link|style|svg|base|meta|form|input|button)|on\w+=|javascript:|data:text\/html|<\s*\/\s*script>/gi;
    return pattern.test(sanitized);
}

async function getCurrentUsername() {
    let username = sessionStorage.getItem("loggedInUsername");

    if (!username) {
        const user = firebase.auth().currentUser;

        // Defensive null check
        if (!user || !user.uid) {
            console.warn("getCurrentUsername() called with no authenticated user.");
            return "Unknown";
        }

        const userRef = db.ref("users/" + user.uid + "/public");
        const snapshot = await userRef.once("value");
        const userData = snapshot.val();
        username = userData?.username || "Unknown";  // <-- No const here!

        sessionStorage.setItem("loggedInUsername", username);
        console.log("Username stored in sessionStorage:", username);
    }

    return username;
}

// Add Friend
async function addFriend() {
    try {
        const inputEl = document.getElementById("add-user-input");
        const usernameToAdd = sanitizeInput(inputEl.value.trim());

        console.log("User input:", usernameToAdd);

        if (!usernameToAdd) {
            alert("Please enter a username.");
            return;
        }

        if (!isValidUsername(usernameToAdd) || containsDangerousTags(usernameToAdd)) {
            alert("Invalid username format.");
            return;
        }

        const currentUsername = await getCurrentUsername();
        console.log("Current user:", currentUsername);

        if (usernameToAdd.toLowerCase() === currentUsername.toLowerCase()) {
            alert("You cannot add yourself.");
            return;
        }

        const friendRef = db.ref(`friends/${currentUsername}/${usernameToAdd}`);
        const isFriendSnap = await friendRef.once("value");
        if (isFriendSnap.exists()) {
            alert("You are already friends with this user.");
            return;
        }

        const sentRequestRef = db.ref(`friendRequests/${usernameToAdd}/${currentUsername}`);
        const pendingSentSnap = await sentRequestRef.once("value");
        if (pendingSentSnap.exists()) {
            alert("Friend request already sent and pending.");
            return;
        }

        const receivedRequestRef = db.ref(`friendRequests/${currentUsername}/${usernameToAdd}`);
        const receivedSnap = await receivedRequestRef.once("value");
        if (receivedSnap.exists()) {
            alert(`${usernameToAdd} has already sent you a request. Accept it instead.`);
            return;
        }

        const usersRef = db.ref("users");
        const query = usersRef.orderByChild("public/username").equalTo(usernameToAdd);
        const snapshot = await query.once("value");

        if (snapshot.exists()) {
            const requestRef = db.ref(`friendRequests/${usernameToAdd}/${currentUsername}`);
            await requestRef.set(true);
            alert(`Friend request sent to ${usernameToAdd}`);
        } else {
            alert("User not found.");
        }

        inputEl.value = "";

    } catch (err) {
        console.error("Error in addFriend():", err);
        alert("Something went wrong while adding a friend. Check the console.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("add-user-btn");
    const input = document.getElementById("add-user-input");

    if (addBtn) {
        addBtn.addEventListener("click", addFriend);
    }

    if (input) {
        input.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                addFriend();
            }
        });
    }
});

  
// Load Friend Requests
const loadFriendRequests = () => {
    const currentUsername = sessionStorage.getItem("username");
    
    if (!currentUsername) {
        console.error("No username in sessionStorage. Cannot load friend requests.");
        return;
    }

    console.log("Loading friend requests for:", currentUsername);
    const friendRequestsRef = db.ref("friendRequests/" + currentUsername);

    friendRequestsRef.once("value")
        .then(snapshot => {
            console.log("Friend requests snapshot for", currentUsername, ":", snapshot.val());

            const friendRequestsContainer = document.getElementById("friend-requests");
            friendRequestsContainer.innerHTML = ""; // Clear existing

            if (snapshot.exists()) {
                snapshot.forEach(childSnapshot => {
                    const fromUser = childSnapshot.key;
                    console.log("Request from:", fromUser);
            
                    // Create wrapper div
                    const requestElement = document.createElement("div");
                    requestElement.style.display = "flex";
                    requestElement.style.justifyContent = "space-between";
                    requestElement.style.alignItems = "center";
                    requestElement.style.marginBottom = "8px";
            
                    // Username text
                    const nameSpan = document.createElement("span");
                    nameSpan.textContent = fromUser;
                    requestElement.appendChild(nameSpan);
            
                    // Button container
                    const btnContainer = document.createElement("div");
            
                    const acceptBtn = document.createElement("button");
                    acceptBtn.textContent = "✔";
                    acceptBtn.style.color = "white";
                    acceptBtn.style.border = "none";
                    acceptBtn.style.marginRight = "5px";
                    acceptBtn.style.cursor = "pointer";
                    acceptBtn.onclick = () => acceptFriendRequest(fromUser);
                    acceptBtn.dataset.username = fromUser; 
                    acceptBtn.onclick = acceptFriendRequest; 
            
                    const declineBtn = document.createElement("button");
                    declineBtn.textContent = "✖";
                    declineBtn.style.color = "red";
                    declineBtn.style.border = "none";
                    declineBtn.style.cursor = "pointer";
                    declineBtn.onclick = () => declineFriendRequest(fromUser);
                    declineBtn.dataset.username = fromUser; 
                    declineBtn.onclick = declineFriendRequest; 
            
                    btnContainer.appendChild(acceptBtn);
                    btnContainer.appendChild(declineBtn);
                    requestElement.appendChild(btnContainer);
            
                    friendRequestsContainer.appendChild(requestElement);
                });
            } else {
                friendRequestsContainer.textContent = "";
            }
        })
        .catch(error => {
            console.error("Error loading friend requests:", error);
        });
};

// Accept Friend Request
async function acceptFriendRequest(event) {
    const button = event.currentTarget;
    const senderUsername = button.dataset.username;
    const currentUsername = await getCurrentUsername();

    if (!currentUsername || !senderUsername) {
        console.error("Missing username information.");
        return;
    }

    try {
        const updates = {};
        // First: update irena's friends list
        await db.ref(`friends/${currentUsername}/${senderUsername}`).set(true);

        // Then: update sender's friends list
        await db.ref(`friends/${senderUsername}/${currentUsername}`).set(true);

        // Then: delete the friend request entries
        await db.ref(`friendRequests/${currentUsername}/${senderUsername}`).remove();

        await db.ref().update(updates);
        console.log(`Friend request from ${senderUsername} accepted.`);
        await loadFriendRequests();
        await loadFriends();
    } catch (error) {
        console.error("Error accepting friend request:", error);
    }
}

// Decline Friend Request
async function declineFriendRequest(event) {
    const button = event.currentTarget;
    const senderUsername = button.dataset.username;
    const currentUsername = await getCurrentUsername();

    if (!currentUsername || !senderUsername) {
        console.error("Missing username information.");
        return;
    }

    try {
        const updates = {};

        // Remove friend request (receiver side)
        updates[`friendRequests/${currentUsername}/${senderUsername}`] = null;

        // Remove friend request sent (sender side)
        updates[`friendRequestSent/${senderUsername}/${currentUsername}`] = null;

        await db.ref().update(updates);
        console.log(`Friend request from ${senderUsername} declined.`);
        await loadFriendRequests();
        await loadFriends();
    } catch (error) {
        console.error("Error declining friend request:", error);
    }
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
    const username = await getCurrentUsername();
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
    const user = firebase.auth().currentUser;
    if (!user) {
        console.warn("setupHeartbeat(): no authenticated user");
        return;
    }

    const snapshot = await db.ref("users/" + user.uid + "/public").once("value");
    const userData = snapshot.val();
    const username = userData?.username;

    if (!username) {
        console.warn("setupHeartbeat(): username missing in public profile");
        return;
    }

    const statusRef = db.ref(`status/${username}`);
    const systemMsgRef = db.ref("systemMessages");

    await statusRef.set({ state: "online", lastSeen: firebase.database.ServerValue.TIMESTAMP });

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

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        const userRef = db.ref("users/" + user.uid + "/public/username");
        userRef.once("value").then(snapshot => {
            const username = snapshot.val();
            if (username) {
                sessionStorage.setItem("username", username);
                console.log("Username stored in sessionStorage:", username);

                loadFriendRequests();
                loadFriends();
                setupHeartbeat();
            } else {
                console.error("Username not found in database.");
            }
        });
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

    let message = messageInputBox.value.trim();
    if (!message) return;

    // Reject malicious message content
    if (containsDangerousTags(message)) {
        alert("Invalid Input: Message contains potentially dangerous content.");
        return;
    }

    // Apply formatting
    switch (currentFormat) {
        case "bold":
            message = `<b>${escapeHTML(message)}</b>`;
            break;
        case "italic":
            message = `<i>${escapeHTML(message)}</i>`;
            break;
        case "normal":
        default:
            message = escapeHTML(message);
            break;
    }

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

    messageInputBox.value = "";
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
    if (isImageTag) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = message;
    
        const img = tempDiv.querySelector("img");
        if (img && img.src.startsWith("https://")) {
            messageElement.appendChild(img);
        } else {
            messageElement.textContent = "[Blocked potentially unsafe content]";
        }   
    } else {
        messageElement.textContent = escapeHTML(username) + ": " + escapeHTML(message);
    }    

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

    if (containsDangerousTags(file.name)) {
        alert("Invalid file name: potentially dangerous content detected.");
        return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
        alert("File is too large. Max 10MB allowed.");
        return;
    }

    const user = firebase.auth().currentUser;
    if (!user) {
        alert("User not authenticated.");
        return;
    }

    const username = sessionStorage.getItem("username"); 
    const uid = user.uid;
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const storageRef = storage.ref().child(`uploads/${uid}/${fileName}`);

    try {
        console.log("Uploading file:", file.name);
        const snapshot = await storageRef.put(file);
        console.log("Upload complete!");

        const downloadURL = await snapshot.ref.getDownloadURL();
        console.log("File URL:", downloadURL);

        const sanitizedName = file.name.replace(/[<>&"'`]/g, "");

        let message;
        if (file.type.startsWith("image/")) {
            message = `<img src="${downloadURL}" alt="${sanitizedName}" style="max-width: 200px; border-radius: 10px;" />`;
        } else {
            message = `<a href="${downloadURL}" target="_blank">${sanitizedName}</a>`;
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

const emojiBtn = document.getElementById("emoji-btn");
const emojiPicker = document.getElementById("emoji-picker");
const messageInputBox = document.getElementById("message-input");
const formatButtons = document.querySelectorAll(".format-btn");
let currentFormat = "normal";

formatButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        currentFormat = btn.dataset.format;
    });
});

// Link button logic

const linkBtn = document.querySelector(".link-btn");

if (linkBtn && messageInputBox) {
    linkBtn.addEventListener("click", () => {
        const url = prompt("Enter URL (https://...)");

        if (url && isValidURL(url)) {
            const safeURL = escapeHTML(url);
            const linkHTML = `<a href="${safeURL}" target="_blank" rel="noopener noreferrer">${safeURL}</a>`;
            messageInputBox.value += linkHTML;
        } else {
            alert("Invalid URL");
        }
    });
}

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
        
            try {
                if (disconnectMsgRef) {
                    await disconnectMsgRef.onDisconnect().cancel();
                }
        
                await statusRef.set({
                    state: "offline",
                    lastSeen: firebase.database.ServerValue.TIMESTAMP
                });
            } catch (error) {
                console.warn("Failed to update status:", error.message);
                // Still proceed with logout even if status fails
            }
        
            firebase.auth().signOut().then(() => {
                console.log("User logged out.");
                window.location.href = "index.html";
            }).catch((error) => {
                console.error("Logout failed:", error);
            });
        });        
    }
});
