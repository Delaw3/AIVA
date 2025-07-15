// js/google-auth.js
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { auth } from "./firebase-config.js";

const provider = new GoogleAuthProvider();

document.getElementById("googleSignInBtn").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      return result.user.getIdToken();
    })
    .then((token) => {
      localStorage.setItem("firebaseToken", token);
      window.location.href = "chat.html"; // Redirect to chat after login
    })
    .catch((error) => {
      console.error("Login error:", error.message);
      alert("Failed to sign in. Please try again.");
    });
});
