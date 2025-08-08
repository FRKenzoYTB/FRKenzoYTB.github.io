import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAVBH49lI2pSADqdLtfzhtHv0jYZ9rpqAU",
  authDomain: "entrainement-6d0dc.firebaseapp.com",
  projectId: "entrainement-6d0dc",
  storageBucket: "entrainement-6d0dc.firebasestorage.app",
  messagingSenderId: "332030018688",
  appId: "1:332030018688:web:de2e0c362ed7ca636b5265",
  measurementId: "G-SDV6N2P114"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const form = document.getElementById("signup-form");
const messageDiv = document.getElementById("message");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = form.email.value;
  const password = form.password.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      messageDiv.textContent = `Compte créé avec succès pour ${user.email}`;
      form.reset();
    })
    .catch((error) => {
      messageDiv.textContent = `Erreur: ${error.message}`;
    });
});
