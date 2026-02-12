
import * as firebaseApp from "firebase/app";
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * ------------------------------------------------------------------
 * 🔑 CONFIGURATION FIREBASE
 * ------------------------------------------------------------------
 * Si tu laisses "COLLER_ICI_...", l'application passera automatiquement
 * en MODE DÉMO (stockage local sur ton navigateur uniquement).
 */

const firebaseConfig = {
  apiKey: "AIzaSyAI_5gxKVAIDCNjQM8Y1D0A5C0011npsN0",
  authDomain: "mon-premier-appart.firebaseapp.com",
  projectId: "mon-premier-appart",
  storageBucket: "mon-premier-appart.firebasestorage.app",
  messagingSenderId: "141334938049",
  appId: "1:141334938049:web:99cb9bcd2d4066430c6f40",
  measurementId: "G-LKCPQ3ELZS"
};

// Vérifie si la configuration est valide
export const isFirebaseConfigured = !firebaseConfig.apiKey.includes("AIzaSyAI_5gxKVAIDCNjQM8Y1D0A5C0011npsN0");

let app;
let auth: any = null;
let db: any = null;
let googleProvider: any = null;
let emailProvider: any = null;

if (isFirebaseConfigured) {
  try {
    // Initialisation de Firebase (Singleton)
    app = firebaseApp.getApps().length === 0 ? firebaseApp.initializeApp(firebaseConfig) : firebaseApp.getApps()[0];
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    emailProvider = new EmailAuthProvider();
  } catch (error) {
    console.error("Erreur d'initialisation Firebase:", error);
    console.warn("Passage forcé en mode local.");
  }
} else {
  console.log("⚠️ Firebase non configuré : Passage en mode DÉMO LOCAL (localStorage).");
}

export { auth, db, googleProvider, emailProvider };
    