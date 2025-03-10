// filepath: c:\Users\lilyt\OneDrive\Desktop\SecureChatBeta-main\js\firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCvF0XcvXzw8xW3TF1OYOiCn80WAxb7sTY",
  authDomain: "chat-9d342.firebaseapp.com",
  databaseURL: "https://chat-9d342-default-rtdb.firebaseio.com",
  projectId: "chat-9d342",
  storageBucket: "chat-9d342.firebasestorage.app",
  messagingSenderId: "622825869821",
  appId: "1:622825869821:web:8f13298a407992794ac994",
  measurementId: "G-Z2L1SC5GLF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const database = getDatabase(app);

export { database };