// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBWxzAPXQEWy9Eld6EbVfYI1RIMJfglDeQ",
    authDomain: "smooth-state-453618-p4.firebaseapp.com",
    databaseURL: "https://smooth-state-453618-p4-default-rtdb.firebaseio.com",
    projectId: "smooth-state-453618-p4",
    storageBucket: "smooth-state-453618-p4.appspot.com",
    messagingSenderId: "386881722135",
    appId: "1:386881722135:web:6a99d55fa4a890268d4952",
    measurementId: "G-S81WYQY8ZX"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.database();

// Sanitize user input to prevent XSS
function sanitizeInput(input) {
    const div = document.createElement("div");
    div.textContent = input;
    return div.innerHTML;
}

// Escape output before rendering it into the DOM
function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

// Validate email format
function isValidEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

// Validate username format
function isValidUsername(username) {
    const regex = /^(?=.*[a-zA-Z])[a-zA-Z0-9]{3,10}$/;  
    const lowerUsername = username.toLowerCase();
    return regex.test(username) && lowerUsername !== "admin";
}

function isStrongPassword(password) {
    const regex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    return regex.test(password);
}

function containsDangerousTags(input) {
    const sanitized = input.toLowerCase().replace(/\s+/g, "");
    const pattern = /<(script|img|iframe|object|embed|link|style|svg|base|meta|form|input|button)|on\w+=|javascript:|data:text\/html|<\s*\/\s*script>/gi;
    return pattern.test(sanitized);
}

// Toggle between Login and Register
document.addEventListener("DOMContentLoaded", () => {
    const showRegisterLink = document.getElementById("show-register");
    const showLoginLink = document.getElementById("show-login");
    const loginContainer = document.querySelector(".login-container");
    const registerContainer = document.querySelector(".register-container");

    if (showRegisterLink && showLoginLink && loginContainer && registerContainer) {
        showRegisterLink.addEventListener("click", (e) => {
            e.preventDefault();
            loginContainer.classList.add("hidden");
            registerContainer.classList.remove("hidden");
        });

        showLoginLink.addEventListener("click", (e) => {
            e.preventDefault();
            registerContainer.classList.add("hidden");
            loginContainer.classList.remove("hidden");
        });
    }
});

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User logged in: ", user);
    } else {
        console.log("User logged out");
    }
});

// Registration Form
const registerForm = document.querySelector('#register-form');

if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
      
        const email = sanitizeInput(registerForm['register-email'].value.trim());
        const username = sanitizeInput(registerForm['register-username'].value.trim().toLowerCase());
        const password = registerForm['register-password'].value.trim();
        const confirmPassword = registerForm['confirm-password'].value.trim();
      
        if (!isValidUsername(username)) {
          alert("Username must be 3–10 characters long, use only letters/numbers, and not be 'admin'.");
          return;
        }
        
        if (containsDangerousTags(username)) {
            alert("Invalid username format.");
            return;
        }
        
        if (!isStrongPassword(password)) {
          alert("Password must be at least 8 characters long, include a number and an uppercase letter.");
          return;
        }
      
        if (confirmPassword !== password) {
          alert("Passwords do not match.");
          return;
        }
      
        const usernameTaken = await checkIfUsernameExists(username);
        if (usernameTaken) {
          alert("Username already taken. Choose a different one.");
          return;
        }
      
        try {
          const cred = await auth.createUserWithEmailAndPassword(email, password);
          const userRef = db.ref("users/" + cred.user.uid);
          const usernameRef = db.ref("usernames/" + username);
      
          await usernameRef.set(true);
          await userRef.child("public").set({ username });
          await userRef.child("private").set({ email });
      
          sessionStorage.setItem("loggedInUsername", escapeHTML(username));
          console.log("Registered and stored username:", username);
      
          registerForm.reset();
          location.href = "/gc.html";
        } catch (error) {
          console.error("Registration error:", error.message);
          alert("Error: " + error.message);
        }
      });
}

// Login Form
const loginForm = document.querySelector('#login-form');
let loginAttempts = 0;
let lastFailedAttemptTime = null;
const MAX_ATTEMPTS = 3;
const COOLDOWN_MS = 10000; 

if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
    
        const now = Date.now();
    
        if (loginAttempts >= MAX_ATTEMPTS && lastFailedAttemptTime && (now - lastFailedAttemptTime < COOLDOWN_MS)) {
            const waitTime = Math.ceil((COOLDOWN_MS - (now - lastFailedAttemptTime)) / 1000);
            alert(`Too many failed attempts. Please wait ${waitTime} more seconds.`);
            return;
        }
    
        const email = sanitizeInput(loginForm['login-email'].value);
        const password = loginForm['login-password'].value;
        
        if (containsDangerousTags(email) || containsDangerousTags(password)) {
            alert("Invalid login input: potentially dangerous content.");
            return;
        }
        
        auth.signInWithEmailAndPassword(email, password).then(async (cred) => {
            loginAttempts = 0;
            lastFailedAttemptTime = null;
    
            const userRef = db.ref("users/" + cred.user.uid + "/public");
            const snapshot = await userRef.once("value");            
            const userData = snapshot.val();
    
            if (userData && userData.username) {
                sessionStorage.setItem("loggedInUsername", escapeHTML(userData.username));                
                console.log("Stored username in sessionStorage:", userData.username);                
            } else {
                console.error("No username found in database.");
            }
    
            loginForm.reset();
            location.href = "/gc.html"; 
        }).catch((error) => {
            console.error("Firebase Authentication Error:", error.message);
            
            loginAttempts++;
            lastFailedAttemptTime = Date.now();
    
            if (loginAttempts >= MAX_ATTEMPTS) {
                alert("Too many failed attempts. Please wait 10 seconds before trying again.");
            } else {
                alert("Email or password is incorrect.");
            }
        });
    });
}

firebase.auth().onAuthStateChanged(user => {
    if (user) {
        console.log("AUTH UID:", user.uid);
        db.ref("users/" + user.uid).once("value").then(snapshot => {
            console.log("Fetched user data:", snapshot.val());
        });
    }
});

// Checks if username exists
async function checkIfUsernameExists(username) {
    const usernameRef = db.ref("usernames/" + username);
    const snapshot = await usernameRef.get();
    return snapshot.exists();
  }  

// Logout
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            auth.signOut().then(() => {
                console.log("User logged out.");
                window.location.href = "index.html";
            }).catch((error) => {
                console.error("Logout failed:", error);
            });
        });
    }
});
