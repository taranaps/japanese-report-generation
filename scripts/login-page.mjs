
// Import the necessary functions from Firebase SDK
import { auth } from "./firebaseConfig.mjs";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js";  // Use the same version for auth
const passwordInput = document.getElementById('password');
  const togglePassword = document.getElementById('toggle-password');

  togglePassword.addEventListener('click', function() {
    // Toggle password visibility
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;

    // Toggle icon between showing and hiding password
    this.textContent = type === 'password' ? '👁️‍🗨️': '👁️'  ;
  });

  document.getElementById("login-btn").addEventListener("click", function () {
  console.log("login clicked");
  
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
                //   alert(errorMessage);
                  break;
              case 'auth/user-not-found':
                  errorMessage = "No account found with this email. Please sign up.";
                //   alert(errorMessage);
                  break;
              case 'auth/invalid-email':
                  errorMessage = "Invalid email format.";
                //   alert(errorMessage);
                  break;
              case 'auth/too-many-requests':
                  errorMessage = "Too many login attempts. Please try again later.";
                //   alert(errorMessage);
                  break;
              default:
                  errorMessage = "Login failed. Please try again.";
                //   alert(errorMessage);
          }

          // Display the error message
          document.getElementById("error-message").innerText = errorMessage;
          // console.error("Error logging in:", errorMessage);
      });
});
