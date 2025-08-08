import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";

// Après avoir créé l'utilisateur avec createUserWithEmailAndPassword
createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    // Mettre à jour le profil avec le pseudo
    updateProfile(userCredential.user, {
      displayName: pseudo
    }).then(() => {
      // Profil mis à jour, tu peux rediriger ou autre
    });
  })
  .catch((error) => {
    // Gestion erreur
  });
