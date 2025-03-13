// filepath: c:\Users\lilyt\OneDrive\Desktop\SecureChatBeta-main\js\auth.js
import { getDatabase, ref, set, get, child } from "firebase/database";
import { database } from "./firebase.js";

async function authenticate(action) {
    const username = document.getElementById(`${action}-username`).value;
    const password = document.getElementById(`${action}-password`).value;
    const confirmPassword = action === 'register' ? document.getElementById('confirm-password').value : null;

    if (action === 'register' && password !== confirmPassword) {
        document.getElementById('error-message').style.display = 'block';
        return;
    }

    const dbRef = ref(database);
    if (action === 'register') {
        const userSnapshot = await get(child(dbRef, `users/${username}`));
        if (userSnapshot.exists()) {
            alert("Username already exists");
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await set(ref(database, `users/${username}`), {
            username: username,
            password: hashedPassword
        });
        alert("Registration successful! Please log in.");
    } else if (action === 'login') {
        const userSnapshot = await get(child(dbRef, `users/${username}`));
        if (!userSnapshot.exists()) {
            alert("User not found");
            return;
        }

        const userData = userSnapshot.val();
        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (isPasswordCorrect) {
            alert("Authentication successful!");
            window.location.href = '/chat.html';
        } else {
            alert("Invalid credentials");
        }
    }
}