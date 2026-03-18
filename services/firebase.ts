
import * as firebaseApp from "firebase/app";
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

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

// Vérifie si la configuration Firebase est valide (clé non vide et non placeholder)
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey.length > 0 &&
  !firebaseConfig.apiKey.startsWith("COLLER_ICI") &&
  !firebaseConfig.apiKey.startsWith("your_")
);

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
    
    // Configuration du fournisseur Google avec les scopes nécessaires
    googleProvider = new GoogleAuthProvider();
    googleProvider.addScope('profile');
    googleProvider.addScope('email');
    googleProvider.setCustomParameters({
      prompt: 'select_account' // Force la sélection du compte pour éviter les erreurs
    });
    
    emailProvider = new EmailAuthProvider();

    // --- APP CHECK CONFIGURATION ---
    // Active la protection anti-abus pour sécuriser le backend.
    
    // 1. Activation du mode debug pour le développement local
    if (typeof window !== 'undefined' && (window.location.hostname === "localhost" || window.location.hostname.includes("127.0.0.1"))) {
       // @ts-ignore
       self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
    }

    // 2. Initialisation avec reCAPTCHA Enterprise (Web)
    // NOTE: Vous devez créer une clé de site reCAPTCHA Enterprise dans la console Google Cloud
    // et l'enregistrer dans la console Firebase > App Check > Apps.
    const RECAPTCHA_SITE_KEY = "VOTRE_CLE_RECAPTCHA_ENTERPRISE_ICI"; 
    
    // Ne pas planter l'app si la clé n'est pas encore configurée
    if (RECAPTCHA_SITE_KEY !== "VOTRE_CLE_RECAPTCHA_ENTERPRISE_ICI") {
        initializeAppCheck(app, {
          provider: new ReCaptchaEnterpriseProvider(RECAPTCHA_SITE_KEY),
          isTokenAutoRefreshEnabled: true
        });
        console.log("🛡️ App Check activé");
    } else {
        console.log("ℹ️ App Check non configuré (Clé reCAPTCHA manquante)");
    }

  } catch (error) {
    console.error("Erreur d'initialisation Firebase:", error);
    console.warn("Passage forcé en mode local.");
  }
} else {
  console.log("⚠️ Firebase non configuré : Passage en mode DÉMO LOCAL (localStorage).");
}

export { auth, db, googleProvider, emailProvider };
