// Import Firebase SDK (via CDN)
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// Config Firebase (remplace par ta config)
const firebaseConfig = {
  apiKey: "TA_API_KEY",
  authDomain: "TON_AUTH_DOMAIN",
  projectId: "TON_PROJECT_ID",
  storageBucket: "TON_STORAGE_BUCKET",
  messagingSenderId: "TON_SENDER_ID",
  appId: "TON_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Helper pour afficher les erreurs
function showError(msg) {
  const errEl = document.getElementById("error");
  if (errEl) errEl.textContent = msg;
}

// Inscription
const registerBtn = document.getElementById("registerBtn");
if (registerBtn) {
  registerBtn.addEventListener("click", () => {
    const pseudo = document.getElementById("pseudo").value.trim();
    const password = document.getElementById("password").value;

    if (!pseudo || !password) {
      showError("Merci de remplir pseudo et mot de passe.");
      return;
    }

    // On crée un faux email pour Firebase, on utilise le pseudo comme identifiant unique + domaine bidon
    const email = pseudo + "@titicraft.fake";

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // On met à jour le displayName avec le pseudo
        updateProfile(userCredential.user, { displayName: pseudo });
        showError("");
        window.location.href = "home.html";
      })
      .catch((error) => {
        showError(error.message);
      });
  });
}

// Connexion
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    const pseudo = document.getElementById("pseudo").value.trim();
    const password = document.getElementById("password").value;

    if (!pseudo || !password) {
      showError("Merci de remplir pseudo et mot de passe.");
      return;
    }

    const email = pseudo + "@titicraft.fake";

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        showError("");
        window.location.href = "home.html";
      })
      .catch((error) => {
        showError(error.message);
      });
  });
}

// Sur la page home.html, afficher le pseudo et gérer déconnexion
if (window.location.pathname.endsWith("home.html")) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      document.getElementById("welcome").textContent = `Bienvenue ${user.displayName} !`;
    } else {
      window.location.href = "index.html";
    }
  });

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      signOut(auth).then(() => {
        window.location.href = "index.html";
      });
    });
  }
}
