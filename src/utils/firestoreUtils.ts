import { db } from "../lib/firebase";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { User } from "firebase/auth";

// Générer un pseudo depuis l'email si aucun displayName
const getUserNameFromEmail = (email: string) => email.split("@")[0];

// Ajouter ou mettre à jour un utilisateur dans Firestore
export const addUserToFirestore = async (user: User, name?: string) => {
  try {
    if (!user.email) {
      console.error("Utilisateur sans email détecté !");
      return;
    }

    const userDocRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userDocRef);

    const displayName = name || user.displayName || getUserNameFromEmail(user.email);

    if (userSnapshot.exists()) {
      // Ne pas écraser le displayName existant si présent
      const existingDisplayName = userSnapshot.data().displayName || displayName;

      await setDoc(
        userDocRef,
        {
          email: user.email,
          lastUpdated: new Date(),
          displayName: existingDisplayName,
        },
        { merge: true }
      );
    } else {
      await setDoc(userDocRef, {
        displayName,
        email: user.email,
        createdAt: new Date(),
      });
      console.log("Nouvel utilisateur ajouté :", displayName);
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout/mise à jour de l'utilisateur à Firestore :", error);
  }
};

// Récupérer le displayName depuis Firestore
export const getUserName = async (uid: string) => {
  try {
    const userDoc = doc(db, "users", uid);
    const userSnapshot = await getDoc(userDoc);
    if (userSnapshot.exists()) {
      const displayName = userSnapshot.data().displayName || "";
      return displayName;
    }
    return "";
  } catch (error) {
    console.error("Erreur lors de la récupération du nom :", error);
    return "";
  }
};
