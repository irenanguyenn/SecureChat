import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getDatabase, ref, set } from "firebase/database";

// Your web app's Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBWxzAPXQEWy9Eld6EbVfYI1RIMJfglDeQ",
  authDomain: "smooth-state-453618-p4.firebaseapp.com",
  databaseURL: "https://smooth-state-453618-p4-default-rtdb.firebaseio.com",
  projectId: "smooth-state-453618-p4",
  storageBucket: "smooth-state-453618-p4.firebasestorage.app",
  messagingSenderId: "386881722135",
  appId: "1:386881722135:web:6a99d55fa4a890268d4952",
  measurementId: "G-S81WYQY8ZX"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
firebase.analytics();

const auth = getAuth(app);
const database = getDatabase(app);

export { auth, database, createUserWithEmailAndPassword, signInWithEmailAndPassword, ref, set };