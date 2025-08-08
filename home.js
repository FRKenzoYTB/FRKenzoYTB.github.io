import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getDatabase, ref, get, onValue, push, set } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

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

// Transactions container
const transactionsList = document.getElementById("transactionsList");

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
      diamantCount.textContent = snapshot.exists() ? snapshot.val() : "0";
    });

    // Récupérer transactions en temps réel
    const transactionsRef = ref(db, `transactions/${user.uid}`);
    onValue(transactionsRef, (snapshot) => {
      transactionsList.innerHTML = "";
      if (snapshot.exists()) {
        const transactions = snapshot.val();
        for (const id in transactions) {
          const t = transactions[id];
          const div = document.createElement("div");
          if(t.type === "achat") {
            div.textContent = `[-${t.diamants} Diamants] Vous avez acheté "${t.item}" sur "${t.serveur}"`;
          } else if(t.type === "vente") {
            div.textContent = `[+${t.diamants} Diamants] "${t.buyer}" vous a acheté ${t.quantité} ${t.item} sur le serveur "${t.serveur}"`;
          }
          transactionsList.appendChild(div);
        }
      } else {
        transactionsList.textContent = "Aucune transaction.";
      }
    });
  }
});

// Déconnexion
logoutBtn.addEventListener("click", () => {
  signOut(auth).then(() => {
    window.location.href = "login.html";
  }).catch((error) => {
    alert("Erreur lors de la déconnexion : " + error.message);
  });
});

// Aller à la page paramètres
settingsBtn.addEventListener("click", () => {
  window.location.href = "settings.html";
});

// Chat basique local
sendBtn.addEventListener("click", () => {
  const msg = chatInput.value.trim();
  if (msg === "") return;
  const msgElem = document.createElement("div");
  msgElem.textContent = `${pseudoUser.textContent} : ${msg}`;
  messages.appendChild(msgElem);
  chatInput.value = "";
  messages.scrollTop = messages.scrollHeight;
});

/**
 * Exemple fonction pour ajouter une transaction (achat ou vente) dans Firebase
 * @param {string} userId - Id de l'utilisateur concerné
 * @param {object} transactionData - Objet transaction { type, diamants, item, serveur, quantité, buyer (optionnel) }
 */
export function addTransaction(userId, transactionData) {
  const transactionsRef = ref(db, `transactions/${userId}`);
  const newTransactionRef = push(transactionsRef);
  return set(newTransactionRef, transactionData);
}
