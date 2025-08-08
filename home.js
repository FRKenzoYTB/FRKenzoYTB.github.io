// home.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

// Config Firebase
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

// Initialisation
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Sélecteurs
const logoutBtn = document.getElementById("logoutBtn");
const settingsBtn = document.getElementById("settingsBtn");
const pseudoUser = document.getElementById("pseudoUser");
const diamantsUser = document.getElementById("diamantsUser");

// Vérification connexion
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    // Afficher le pseudo
    pseudoUser.textContent = user.displayName || user.email;

    // Charger le nombre de diamants depuis Firebase
    const userDiamantsRef = ref(db, "users/" + user.uid + "/diamants");
    get(userDiamantsRef).then(snapshot => {
      if (snapshot.exists()) {
        diamantsUser.textContent = snapshot.val();
      } else {
        diamantsUser.textContent = 0;
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

// Aller dans les paramètres
settingsBtn.addEventListener("click", () => {
  window.location.href = "settings.html";
});
