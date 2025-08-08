import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const pseudoUser = document.getElementById("pseudoUser");
const diamantCount = document.getElementById("diamantCount");
const logoutBtn = document.getElementById("logoutBtn");
const settingsBtn = document.getElementById("settingsBtn");

// Chat elements
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const messages = document.getElementById("messages");

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    currentUser = user;
    pseudoUser.textContent = user.displayName || "Utilisateur";

    // Récupérer diamants depuis la BDD
    const diamondRef = ref(db, "users/" + user.uid + "/diamonds");
    get(diamondRef).then(snapshot => {
      if (snapshot.exists()) {
        diamantCount.textContent = snapshot.val();
      } else {
        diamantCount.textContent = "0";
      }
    });
  }
});

// Déconnexion
logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => {
      alert("Erreur lors de la déconnexion : " + error.message);
    });
});

// Aller à la page paramètres
settingsBtn.addEventListener("click", () => {
  window.location.href = "settings.html";
});

// Chat basique - ajout local seulement (tu peux remplacer par un vrai chat Firebase si tu veux)
sendBtn.addEventListener("click", () => {
  const msg = chatInput.value.trim();
  if (msg === "") return;
  const msgElem = document.createElement("div");
  msgElem.textContent = `${pseudoUser.textContent} : ${msg}`;
  messages.appendChild(msgElem);
  chatInput.value = "";
  messages.scrollTop = messages.scrollHeight;
});
