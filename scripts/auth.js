// auth.js
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";
import { auth } from './firebaseConfig.mjs';

function checkAuth() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            console.log("No user is signed in, redirecting to login.");
            window.location.href = "/index.html"; // Redirect to login page
        } else {
            console.log("User is signed in:", user);
        }
    });
}

function logout() {
    signOut(auth).then(() => {
        console.log("User signed out, redirecting to login.");
        window.location.href = "/index.html"; // Redirect to login page after logout
    }).catch((error) => {
        console.error("Error signing out:", error);
    });
}

export { checkAuth, logout };
