import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, updateProfile, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";

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

const newUsername = document.getElementById("newUsername");
const saveUsername = document.getElementById("saveUsername");
const backBtn = document.getElementById("backBtn");

let currentUser = null;

// Vérifie si l'utilisateur est connecté
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    currentUser = user;
  }
});

// Changer pseudo
saveUsername.addEventListener("click", () => {
  if (newUsername.value.trim() === "") {
    alert("Pseudo vide !");
    return;
  }
  updateProfile(currentUser, { displayName: newUsername.value })
    .then(() => alert("Pseudo mis à jour !"))
    .catch(err => alert(err.message));
});

// Retour vers home
backBtn.addEventListener("click", () => {
  window.location.href = "home.html";
});
