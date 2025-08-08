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
  set,
  push,
  update,
  serverTimestamp,
  remove,
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAzSzAc3Fz18PdgumpGY3_s2K42v2MzYK0",
  authDomain: "message-957c6.firebaseapp.com",
  databaseURL:
    "https://message-957c6-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "message-957c6",
  storageBucket: "message-957c6.firebasedatabase.app",
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

const serverListDiv = document.getElementById("serverList");
const addServerBtn = document.getElementById("addServerBtn");

let currentUser = null;
let currentServerId = null;
let chatRef = null;
let unsubscribeChat = null;

logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => {
      alert("Erreur lors de la déconnexion : " + error.message);
    });
});

settingsBtn.addEventListener("click", () => {
  window.location.href = "settings.html";
});

sendChatBtn.addEventListener("click", () => {
  sendMessage();
});
chatInput.addEventListener("keyup", (e) => {
  if (e.key === "Enter") sendMessage();
});

addServerBtn.addEventListener("click", async () => {
  const name = prompt("Nom du nouveau serveur ?");
  if (!name || !currentUser) return alert("Nom serveur invalide");

  // Créer serveur dans BDD
  const newServerRef = push(ref(db, "servers"));
  await set(newServerRef, {
    name: name,
    members: { [currentUser.uid]: true },
  });
  alert("Serveur créé, il apparaît dans ta liste.");

  // Recharge la liste des serveurs
  loadUserServers();
});

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
  } else {
    currentUser = user;
    pseudoUser.textContent = user.displayName || "Utilisateur";

    // Charger diamants
    const diamondRef = ref(db, "users/" + user.uid + "/diamonds");
    const snapDiamonds = await get(diamondRef);
    diamantCount.textContent = snapDiamonds.exists() ? snapDiamonds.val() : "0";

    // Charger transactions globales
    loadTransactions();

    // Charger serveurs où user est membre
    loadUserServers();
  }
});

async function loadUserServers() {
  serverListDiv.innerHTML = "Chargement serveurs...";
  if (!currentUser) return;

  const serversRef = ref(db, "servers");
  const snapshot = await get(serversRef);
  if (!snapshot.exists()) {
    serverListDiv.textContent = "Aucun serveur trouvé.";
    return;
  }

  const servers = snapshot.val();
  // Filtrer serveurs où user est membre
  const userServers = Object.entries(servers).filter(
    ([serverId, server]) => server.members && server.members[currentUser.uid]
  );

  if (userServers.length === 0) {
    serverListDiv.innerHTML =
      "Tu n'es membre d'aucun serveur.<br>Utilise le bouton 'Ajouter serveur' pour en créer un.";
    enterprisesList.innerHTML = "";
    chatMessages.innerHTML = "";
    transactionsList.innerHTML = "";
    return;
  }

  // Afficher liste serveurs dans sidebar
  serverListDiv.innerHTML = "";
  userServers.forEach(([serverId, server]) => {
    const div = document.createElement("div");
    div.textContent = server.name;
    div.style.padding = "8px";
    div.style.cursor = "pointer";
    div.style.borderBottom = "1px solid #ccc";

    // Au clic charger serveur
    div.addEventListener("click", () => {
      loadServer(serverId, server.name);
    });

    serverListDiv.appendChild(div);
  });

  // Charger le premier serveur par défaut
  loadServer(userServers[0][0], userServers[0][1].name);
}

function sendMessage() {
  if (!currentServerId || !currentUser) return;
  const msg = chatInput.value.trim();
  if (!msg) return;

  const newMsgRef = push(ref(db, `servers/${currentServerId}/chat`));
  newMsgRef
    .set({
      user: currentUser.displayName || "Utilisateur",
      uid: currentUser.uid,
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

  // Afficher serveur courant dans UI (tu peux adapter dans HTML)
  document.getElementById("currentServerName").textContent = serverName;

  // Charger chat
  if (unsubscribeChat) unsubscribeChat();
  chatMessages.innerHTML = "<i>Chargement messages...</i>";

  const chatRefLocal = ref(db, `servers/${serverId}/chat`);
  unsubscribeChat = onValue(
    chatRefLocal,
    (snapshot) => {
      chatMessages.innerHTML = "";
      if (!snapshot.exists()) {
        chatMessages.textContent = "Aucun message.";
        return;
      }
      const msgs = snapshot.val();
      // Trie messages par timestamp
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
      chatMessages.scrollTop = chatMessages.scrollHeight;
    },
    (err) => {
      chatMessages.innerHTML = "Erreur chargement chat : " + err.message;
    }
  );

  // Charger shop (entreprises + articles)
  loadEnterprises(serverId);
}

async function loadEnterprises(serverId) {
  enterprisesList.innerHTML = "<i>Chargement entreprises...</i>";
  const entRef = ref(db, `servers/${serverId}/shop/enterprises`);
  const snapshot = await get(entRef);
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

    // Pour chaque article (optionnel)
    if (ent.articles) {
      const ul = document.createElement("ul");
      Object.entries(ent.articles).forEach(([aid, art]) => {
        const li = document.createElement("li");
        li.textContent = `${art.name || "Article"} - Prix: ${art.price || "?"}`;
        ul.appendChild(li);
      });
      div.appendChild(ul);
    }

    enterprisesList.appendChild(div);
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

      // Trier par timestamp décroissant
      const sortedKeys = Object.keys(transactions).sort((a, b) => {
        if (!transactions[a].timestamp) return 1;
        if (!transactions[b].timestamp) return -1;
        return transactions[b].timestamp - transactions[a].timestamp;
      });

      sortedKeys.forEach((key) => {
        const t = transactions[key];
        const div = document.createElement("div");

        let text = "";
        if (t.type === "achat") {
          if (t.userId === currentUser.uid) {
            text = `[-${t.amount} Diamants] Vous avez acheté "${t.item}" sur "${t.serverName}"`;
          } else {
            text = `[+${t.amount} Diamants] "${t.userName || "Quelqu'un"}" vous a acheté ${
              t.itemCount || 1
            } ${t.item} sur le serveur "${t.serverName}"`;
          }
        } else {
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

