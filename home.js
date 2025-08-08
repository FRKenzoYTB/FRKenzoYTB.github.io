// home.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

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

// Initialisation Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const welcomeMsg = document.getElementById("welcomeMsg");
const diamondCount = document.getElementById("diamondCount");
const logoutBtn = document.getElementById("logoutBtn");
const settingsBtn = document.getElementById("settingsBtn");

// Vérifie si l'utilisateur est connecté
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    // Affiche son pseudo ou email
    welcomeMsg.textContent = `Bienvenue ${user.displayName || user.email} !`;

    // Récupère les diamants depuis Firebase Realtime Database
    const userRef = ref(db, "users/" + user.uid + "/diamonds");
    get(userRef).then(snapshot => {
      if (snapshot.exists()) {
        diamondCount.textContent = snapshot.val();
      } else {
        diamondCount.textContent = "0";
      }
    });
  }
});

// Déconnexion
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  });
});

// Bouton paramètres
settingsBtn.addEventListener("click", () => {
  window.location.href = "settings.html";
});

