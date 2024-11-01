// firebaseConfig.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCZw5fQgye5zs3fdkNMwbMYik9OpfSRYBg",
    authDomain: "japanese-report-generation.firebaseapp.com",
    projectId: "japanese-report-generation",
    storageBucket: "japanese-report-generation.appspot.com",
    messagingSenderId: "796914325557",
    appId: "1:796914325557:web:e65afd6a7473c181f2f97c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
