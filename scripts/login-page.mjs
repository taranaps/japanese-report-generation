
// Import the necessary functions from Firebase SDK
import { auth } from "./firebaseConfig.mjs";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";  // Use the same version for auth

document.getElementById("login-button").addEventListener("click", function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
          // alert(userCredential)
              const user = userCredential.user;
              window.location.href = "../pages/home-page.html"
      })
      .catch((error) => {
          // const errorMessage = error.message;
          // document.getElementById("error-message").innerText = errorMessage;
          // console.error("Error logging in:", errorMessage);
          const errorCode = error.code;
          let errorMessage = '';

          // Customize error message based on Firebase authentication error code
          switch (errorCode) {
              case 'auth/wrong-password':
                  errorMessage = "Incorrect password. Please try again.";
                  break;
              case 'auth/user-not-found':
                  errorMessage = "No account found with this email. Please sign up.";
                  break;
              case 'auth/invalid-email':
                  errorMessage = "Invalid email format.";
                  break;
              case 'auth/too-many-requests':
                  errorMessage = "Too many login attempts. Please try again later.";
                  break;
              default:
                  errorMessage = "Login failed. Please try again.";
          }

          // Display the error message
          document.getElementById("error-message").innerText = errorMessage;
          // console.error("Error logging in:", errorMessage);
      });
});
