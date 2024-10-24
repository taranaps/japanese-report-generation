
// Import the necessary functions from Firebase SDK
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'; // Use the same version for auth

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