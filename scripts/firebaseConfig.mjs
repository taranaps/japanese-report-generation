// Import the necessary functions from Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";  // Use the same version for auth
import { getFirestore} from "https://www.gstatic.com/firebasejs/11.0.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCZw5fQgye5zs3fdkNMwbMYik9OpfSRYBg",
  authDomain: "japanese-report-generation.firebaseapp.com",
  projectId: "japanese-report-generation",
  storageBucket: "japanese-report-generation.firebasestorage.app",
  messagingSenderId: "796914325557",
  appId: "1:796914325557:web:e65afd6a7473c181f2f97c"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage=getStorage(app)

// Export the initialized services for use in other modules
export { auth, db,storage };
