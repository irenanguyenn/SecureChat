let websocket;

// Function to switch to the login form
function showLogin() {
    document.querySelector('.login-container').classList.remove('hidden');
    document.querySelector('.register-container').classList.add('hidden');
}

// Function to switch to the register form
function showRegister() {
    document.querySelector('.register-container').classList.remove('hidden');
    document.querySelector('.login-container').classList.add('hidden');
}

// Ensure event listeners for login/register toggling
document.addEventListener("DOMContentLoaded", () => {
    document.querySelector('a[href="#"]').addEventListener("click", showRegister);
});

// Function to handle user authentication (Login or Register)
async function authenticate(action) {
    let username = document.getElementById(`${action}-username`).value.trim();
    let password = document.getElementById(`${action}-password`).value.trim();

    if (!username || !password) {
        alert("Please fill in all fields.");
        return;
    }

    const response = await fetch(`http://localhost:5000/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    if (result.success) {
        if (action === "register") {
            alert("Registration successful! You can now log in.");
            showLogin();
        } else {
            localStorage.setItem("authToken", result.token);
            alert("Login successful! Redirecting...");
            setTimeout(() => {
                window.location.href = "gc.html"; 
            }, 1000);
        }
    } else {
        alert(result.message || "Authentication failed.");
    }
}

// Connect WebSocket with JWT authentication
function connectWebSocket() {
    const token = localStorage.getItem("authToken");
    if (!token) {
        alert("Unauthorized! Please log in first.");
        window.location.href = "login.html";
        return;
    }

    websocket = new WebSocket(`wss://192.168.12.244:8765/?token=${token}`);

    websocket.onopen = () => {
        console.log("Connected securely to WebSocket server");
    };

    websocket.onmessage = (event) => {
        console.log("Received message:", event.data);
    };

    websocket.onclose = () => {
        console.log("Disconnected from WebSocket server");
    };
}

// Initial WebSocket connection for authentication
websocket = new WebSocket('wss://192.168.12.244:8765');

websocket.onopen = () => {
    console.log('Connected to the authentication server');
};

websocket.onmessage = (event) => {
    const response = event.data;
    console.log("Server response:", response);

    if (response === "Authentication successful!") {
        alert("Login successful! Redirecting...");
        localStorage.setItem("loggedInUser", document.getElementById('login-username').value);
        setTimeout(() => {
            window.location.href = "gc.html"; 
        }, 1000);
    } else if (response === "Registration successful! Please log in.") {
        alert("Registration successful! You can now log in.");
        showLogin();
    } else {
        alert(response);
    }
};

websocket.onclose = () => {
    console.log('Disconnected from the server');
};

// Ensure authentication works on page load
document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("gc.html")) {
        connectWebSocket(); 
    }
});
