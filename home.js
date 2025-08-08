// home.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzSzAc3Fz18PdgumpGY3_s2K42v2MzYK0",
  authDomain: "message-957c6.firebaseapp.com",
  databaseURL: "https://message-957c6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "message-957c6",
  storageBucket: "message-957c6.firebasestorage.app",
  messagingSenderId: "518720941529",
  appId: "1:518720941529:web:7c6b444ef9ac0b0d127dc8",
  measurementId: "G-GW0GKGQ9EP"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const logoutBtn = document.getElementById("logoutBtn");

// Si pas connecté, on redirige vers login
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    // On peut afficher un message ou les infos utilisateur ici
    document.getElementById("welcomeMsg").textContent = `Bienvenue ${user.displayName || user.email} !`;
  }
});

// Déconnexion
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
});
