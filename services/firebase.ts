
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * ATTENTION : Tu dois remplacer ces valeurs par celles de TA console Firebase :
 * 1. Va sur https://console.firebase.google.com/
 * 2. Crée un projet
 * 3. Ajoute une "App Web"
 * 4. Copie les clés dans un fichier .env.local à la racine du projet
 * 
 * Note: Avec Vite, les variables d'environnement doivent commencer par VITE_
 * Exemple: VITE_FIREBASE_API_KEY=votre_clé
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSy_REMPLACE_MOI_DANS_LA_CONSOLE", 
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "ton-projet.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "ton-projet",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ton-projet.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:12345:web:abcde"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const emailProvider = new EmailAuthProvider();
