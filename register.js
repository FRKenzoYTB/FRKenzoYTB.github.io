// register.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-database.js";

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

const btn = document.getElementById("registerBtn");
btn.addEventListener("click", () => {
  const pseudo = document.getElementById("pseudo").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!pseudo || !email || !password) {
    alert("Tous les champs sont requis !");
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      return updateProfile(user, { displayName: pseudo }).then(() => {
        return set(ref(db, 'users/' + user.uid), {
          pseudo: pseudo,
          email: email,
          diamonds: 0
        });
      });
    })
    .then(() => {
      alert("Inscription réussie ! Tu peux maintenant te connecter.");
      window.location.href = "login.html";
    })
    .catch((error) => {
      alert("Erreur : " + error.message);
    });
});
