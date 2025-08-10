import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

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

const registerForm = document.getElementById('registerForm');

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const pseudo = document.getElementById('pseudo').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (pseudo.length < 3) {
    alert('Le pseudo doit contenir au moins 3 caractères.');
    return;
  }
  if (password.length < 6) {
    alert('Le mot de passe doit contenir au moins 6 caractères.');
    return;
  }

  try {
    // Création du compte
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Mise à jour du displayName (pseudo)
    await updateProfile(user, { displayName: pseudo });

    // Enregistrement des données dans la base (role et diamonds)
    await set(ref(db, 'users/' + user.uid), {
      displayName: pseudo,
      email: email,
      createdAt: Date.now(),
      role: 'membre',
      diamonds: 20
    });

    alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
    window.location.href = "login.html"; // redirection vers la page login

  } catch (error) {
    alert('Erreur : ' + error.message);
  }
});
