import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import {
  getAuth,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import {
  getDatabase,
  ref,
  get,
  onValue,
  push,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzSzAc3Fz18PdgumpGY3_s2K42v2MzYK0",
  authDomain: "message-957c6.firebaseapp.com",
  databaseURL:
    "https://message-957c6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "message-957c6",
  storageBucket: "message-957c6.firebasestorage.app",
  messagingSenderId: "518720941529",
  appId: "1:518720941529:web:7c6b444ef9ac0b0d127dc8",
  measurementId: "G-GW0GKGQ9EP",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const pseudoUser = document.getElementById("pseudoUser");
const diamantCount = document.getElementById("diamantCount");
const logoutBtn = document.getElementById("logoutBtn");
const settingsBtn = document.getElementById("settingsBtn");

const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendChatBtn = document.getElementById("sendChatBtn");

const transactionsList = document.getElementById("transactionsList");
const enterprisesList = document.getElementById("enterprisesList");

let currentUser = null;
let currentServerId = null;
let chatRef = null;

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

// Accès page paramètres
settingsBtn.addEventListener("click", () => {
  window.location.href = "settings.html";
});

// Connexion / état utilisateur
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    currentUser = user;
    pseudoUser.textContent = user.displayName || "Utilisateur";

    // Charger diamants
    const diamondRef = ref(db, "users/" + user.uid + "/diamonds");
    get(diamondRef).then((snapshot) => {
      if (snapshot.exists()) {
        diamantCount.textContent = snapshot.val();
      } else {
        diamantCount.textContent = "0";
      }
    });

    // Charger transactions globales
    loadTransactions();

    // Par défaut, charger le premier serveur
    if (window.servers && window.servers.length > 0) {
      loadServer(window.servers[0].id, window.servers[0].name);
    }
  }
});

// Envoi message chat
sendChatBtn.addEventListener("click", () => {
  sendMessage();
});
chatInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") sendMessage();
});

function sendMessage() {
  if (!currentServerId || !currentUser) return;
  const msg = chatInput.value.trim();
  if (!msg) return;

  const newMsgRef = push(ref(db, `servers/${currentServerId}/chat`));
  newMsgRef
    .set({
      user: currentUser.displayName || "Utilisateur",
      text: msg,
      timestamp: serverTimestamp(),
    })
    .then(() => {
      chatInput.value = "";
    })
    .catch((e) => alert("Erreur en envoyant le message : " + e.message));
}

function loadServer(serverId, serverName) {
  currentServerId = serverId;

  // Afficher noms serveur dans UI
  document.getElementById("currentServerName").textContent = serverName;
  document.getElementById("currentServerNameShop").textContent = serverName;

  // Charger chat serveur
  if (chatRef) {
    // Désabonner l'ancien chat
    chatRef.off();
  }

  chatMessages.innerHTML = "<i>Chargement des messages...</i>";

  chatRef = ref(db, `servers/${serverId}/chat`);
  onValue(
    chatRef,
    (snapshot) => {
      chatMessages.innerHTML = "";
      if (!snapshot.exists()) {
        chatMessages.textContent = "Aucun message pour l'instant.";
        return;
      }
      const msgs = snapshot.val();
      // msgs est un objet avec clés push firebase
      const sortedKeys = Object.keys(msgs).sort((a, b) => {
        if (!msgs[a].timestamp) return -1;
        if (!msgs[b].timestamp) return 1;
        return msgs[a].timestamp - msgs[b].timestamp;
      });

      sortedKeys.forEach((key) => {
        const m = msgs[key];
        const div = document.createElement("div");
        let time = "";
        if (m.timestamp) {
          const d = new Date(m.timestamp);
          time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }
        div.textContent = `[${time}] ${m.user}: ${m.text}`;
        chatMessages.appendChild(div);
      });

      // Scroll bas
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },
    (err) => {
      chatMessages.innerHTML = "Erreur chargement chat : " + err.message;
    }
  );

  // Charger entreprises du shop serveur
  loadEnterprises(serverId);
}

function loadEnterprises(serverId) {
  enterprisesList.innerHTML = "<i>Chargement des entreprises...</i>";
  const entRef = ref(db, `servers/${serverId}/shop/enterprises`);
  get(entRef)
    .then((snapshot) => {
      if (!snapshot.exists()) {
        enterprisesList.innerHTML = "Aucune entreprise disponible.";
        return;
      }
      const enterprises = snapshot.val();
      enterprisesList.innerHTML = "";
      Object.entries(enterprises).forEach(([id, ent]) => {
        const div = document.createElement("div");
        div.style.marginBottom = "10px";
        div.style.padding = "8px";
        div.style.background = "#184d81";
        div.style.borderRadius = "6px";

        div.innerHTML = `<strong>${ent.name || "Entreprise inconnue"}</strong><br/>
          Articles: ${ent.articles ? Object.keys(ent.articles).length : 0}`;
        enterprisesList.appendChild(div);
      });
    })
    .catch((e) => {
      enterprisesList.innerHTML = "Erreur chargement entreprises: " + e.message;
    });
}

function loadTransactions() {
  transactionsList.innerHTML = "<i>Chargement...</i>";
  const transRef = ref(db, "transactions");
  onValue(
    transRef,
    (snapshot) => {
      transactionsList.innerHTML = "";
      if (!snapshot.exists()) {
        transactionsList.textContent = "Aucune transaction récente.";
        return;
      }
      const transactions = snapshot.val();

      // Trier par timestamp décroissant si possible
      const sortedKeys = Object.keys(transactions).sort((a, b) => {
        if (!transactions[a].timestamp) return 1;
        if (!transactions[b].timestamp) return -1;
        return transactions[b].timestamp - transactions[a].timestamp;
      });

      sortedKeys.forEach((key) => {
        const t = transactions[key];
        const div = document.createElement("div");

        // Exemple formatage transaction :  
        // [-10 Diamants] Vous avez acheté "Steak" sur "Serveurtropcool"
        // [+3 Diamants] "Lucas" vous a acheté 3 steak sur le serveur "nomduserv"

        let text = "";
        if (t.type === "achat") {
          if (t.userId === currentUser.uid) {
            text = `[-${t.amount} Diamants] Vous avez acheté "${t.item}" sur "${t.serverName}"`;
          } else {
            text = `[+${t.amount} Diamants] "${t.userName || "Quelqu'un"}" vous a acheté ${t.itemCount || 1} ${t.item} sur le serveur "${t.serverName}"`;
          }
        } else {
          // autre type transaction
          text = JSON.stringify(t);
        }

        div.textContent = text;
        transactionsList.appendChild(div);
      });
    },
    (err) => {
      transactionsList.innerHTML = "Erreur chargement transactions : " + err.message;
    }
  );
}

// Permet à home.js d'être appelé par le script dans home.html pour charger serveur depuis boutons
window.loadServer = loadServer;
