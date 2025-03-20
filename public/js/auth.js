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

// Listen for authentication state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("User logged in: ", user);
    } else {
        console.log("User logged out");
    }
});

// 🟢 REGISTER USER - Store username in Firebase
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

        // Check if username already exists
        const usernameExists = await checkIfUsernameExists(username);
        if (usernameExists) {
            alert("Username already taken. Please choose a different one.");
            return;
        }

        // Register user and store in Firebase
        auth.createUserWithEmailAndPassword(email, password).then(async (cred) => {
            const userRef = db.ref('users/' + cred.user.uid);
            await userRef.set({
                username: username,
                email: email
            });

            console.log("User registered and saved in Firebase:", { uid: cred.user.uid, username, email });

            localStorage.setItem("loggedInUsername", username); // Store username in localStorage
            registerForm.reset();
            location.href = "/gc.html"; // Redirect to chat
        }).catch((error) => {
            alert("Error: " + error.message);
        });
    });
}

// 🟢 LOGIN USER - Retrieve username from Firebase
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
                localStorage.setItem("loggedInUsername", userData.username);
                console.log("Stored username after login:", userData.username);
            } else {
                console.error("No username found in database.");
            }

            loginForm.reset();
            location.href = "/gc.html"; // Redirect to chat
        }).catch((error) => {
            alert("Incorrect username or password.");
        });        
    });
}

// 🔍 Check if username already exists
async function checkIfUsernameExists(username) {
    const usersRef = db.ref('users');
    const snapshot = await usersRef.orderByChild('username').equalTo(username).once('value');
    return snapshot.exists();
}

// 🟢 LOGOUT USER
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
