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

        const email = registerForm['register-email'].value;
        const username = registerForm['register-username'].value.trim().toLowerCase();
        const password = registerForm['register-password'].value;
        const confirmPassword = registerForm['confirm-password'].value;

        if (confirmPassword !== password) {
            alert("Passwords do not match!");
            return;
        }

        const usernameExists = await checkIfUsernameExists(username);
        if (usernameExists) {
            alert("Username already taken. Please choose a different one.");
            return;
        }

        auth.createUserWithEmailAndPassword(email, password)
        .then(async (cred) => {
            const userRef = db.ref('users/' + cred.user.uid);
        
            userRef.set({
                username: username,
                email: email
            })
            .then(() => {
                console.log("User successfully stored in database.");
            })
            .catch((error) => {
                console.error("Error storing user in database:", error);
            });
        
            console.log("User registered and saved in Firebase:", { uid: cred.user.uid, username, email });
        
            sessionStorage.setItem("loggedInUsername", username);
            console.log("Stored username in sessionStorage (Register):", username);            
            registerForm.reset();
            location.href = "/gc.html";
        })
        .catch((error) => {
            alert("Error: " + error.message);
        });
    });
}

// Login Form
const loginForm = document.querySelector('#login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = loginForm['login-email'].value;
        const password = loginForm['login-password'].value;

        auth.signInWithEmailAndPassword(email, password).then(async (cred) => {
            const userRef = db.ref("users/" + cred.user.uid);
            const snapshot = await userRef.once("value");
            const userData = snapshot.val();
        
            if (userData && userData.username) {
                sessionStorage.setItem("loggedInUsername", userData.username);
                console.log("Stored username in sessionStorage:", userData.username);                
            } else {
                console.error("No username found in database.");
            }
        
            loginForm.reset();
            location.href = "/gc.html"; 
        }).catch((error) => {
            console.error("Firebase Authentication Error:", error.message);
            alert(error.message);
        });        
    });
}

// Checks if username exists
async function checkIfUsernameExists(username) {
    const usersRef = db.ref('users');
    const snapshot = await usersRef.orderByChild('username').equalTo(username).once('value');
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
