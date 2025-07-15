// Replace these with your actual Firebase project config
// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAO_cP2BioOr4ngtGRAswpsYRQMb9XN9NQ",
  authDomain: "aivant-7cd95.firebaseapp.com",
  projectId: "aivant-7cd95",
  appId: "1:1031348846512:web:ff4dc6e13013521516a075"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);




