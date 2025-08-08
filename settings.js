import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, updateEmail, updatePassword, updateProfile, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

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
const db = getDatabase(app);

const newUsername = document.getElementById("newUsername");
const newEmail = document.getElementById("newEmail");
const newPassword = document.getElementById("newPassword");
const diamondInput = document.getElementById("diamondInput");

const saveUsername = document.getElementById("saveUsername");
const saveEmail = document.getElementById("saveEmail");
const savePassword = document.getElementById("savePassword");
const saveDiamonds = document.getElementById("saveDiamonds");
const backBtn = document.getElementById("backBtn");

let currentUser = null;

// Vérifie si l'utilisateur est connecté
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    currentUser = user;

    // Récupère le nombre de diamants
    const diamondRef = ref(db, "users/" + user.uid + "/diamonds");
    get(diamondRef).then(snapshot => {
      if (snapshot.exists()) {
        diamondInput.value = snapshot.val();
      } else {
        diamondInput.value = 0;
      }
    });
  }
});

// Changer pseudo
saveUsername.addEventListener("click", () => {
  if (newUsername.value.trim() === "") return alert("Pseudo vide !");
  updateProfile(currentUser, { displayName: newUsername.value })
    .then(() => alert("Pseudo mis à jour !"))
    .catch(err => alert(err.message));
});

// Changer email
saveEmail.addEventListener("click", () => {
  if (newEmail.value.trim() === "") return alert("Email vide !");
  updateEmail(currentUser, newEmail.value)
    .then(() => alert("Email mis à jour !"))
    .catch(err => alert(err.message));
});

// Changer mot de passe
savePassword.addEventListener("click", () => {
  if (newPassword.value.trim() === "") return alert("Mot de passe vide !");
  updatePassword(currentUser, newPassword.value)
    .then(() => alert("Mot de passe mis à jour !"))
    .catch(err => alert(err.message));
});

// Modifier diamants
saveDiamonds.addEventListener("click", () => {
  const value = parseInt(diamondInput.value);
  if (isNaN(value) || value < 0) return alert("Nombre invalide !");
  set(ref(db, "users/" + currentUser.uid + "/diamonds"), value)
    .then(() => alert("Diamants mis à jour !"))
    .catch(err => alert(err.message));
});

// Retour vers home
backBtn.addEventListener("click", () => {
  window.location.href = "home.html";
});
