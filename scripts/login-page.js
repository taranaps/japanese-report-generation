
// Import the necessary functions from Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js"; // Use the same version for auth

const firebaseConfig = {
    apiKey: "AIzaSyB8jdMlqtR1BnXqhdJnO83F1x0obkUhypM",
    authDomain: "japanese-trainee-report.firebaseapp.com",
    projectId: "japanese-trainee-report",
    storageBucket: "japanese-trainee-report.appspot.com",
    messagingSenderId: "739792835740",
    appId: "1:739792835740:web:4f808e43a8d34a5ecd8959"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);