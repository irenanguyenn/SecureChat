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

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log("user logged in: ", user);
    } else {
        console.log("user logged out");
    }
});

// Toggle between login and register forms
document.addEventListener("DOMContentLoaded", function () {
    console.log("Auth.js Loaded!");

    const showRegister = document.getElementById("show-register");
    const showLogin = document.getElementById("show-login");
    const loginContainer = document.querySelector(".login-container");
    const registerContainer = document.querySelector(".register-container");

    if (!showRegister || !showLogin) {
        console.error("Elements not found! Check if 'show-register' and 'show-login' exist.");
        return;
    }

    showRegister.addEventListener("click", function (event) {
        event.preventDefault();
        loginContainer.classList.add("hidden");
        registerContainer.classList.remove("hidden");
    });

    showLogin.addEventListener("click", function (event) {
        event.preventDefault();
        registerContainer.classList.add("hidden");
        loginContainer.classList.remove("hidden");
    });
});

// Registration Form
const registerForm = document.querySelector('#register-form');
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = registerForm['register-email'].value;
        const password = registerForm['register-password'].value;
        const confirmPassword = registerForm['confirm-password'].value;

        if (confirmPassword !== password) {
            alert("Please make sure passwords match");
        } else {
            // Create user
            auth.createUserWithEmailAndPassword(email, password).then(cred => {
                registerForm.reset();
                location.href = "/gc.html";
            }).catch((error) => {
                alert("Error: " + error.message);
            });
        }
    });
}

// Login Form
const loginForm = document.querySelector('#login-form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = loginForm['login-email'].value;
        const password = loginForm['login-password'].value;

        auth.signInWithEmailAndPassword(email, password).then(cred => {
            loginForm.reset();
            location.href = "/gc.html";
        }).catch((error) => {
            loginForm.reset();
            alert("Incorrect username or password.");
        });
    });
}

// Log Out
const logout = document.querySelector("#logout");
if (logout) {
    logout.addEventListener('click', (e) => {
        e.preventDefault();

        auth.signOut().then(() => {
            location.href = "/index.html";
        });
    });
}
