
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

/**
 * ATTENTION : Tu dois remplacer ces valeurs par celles de TA console Firebase :
 * 1. Va sur https://console.firebase.google.com/
 * 2. Crée un projet
 * 3. Ajoute une "App Web"
 * 4. Copie les clés ici
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSy_REMPLACE_MOI_DANS_LA_CONSOLE", 
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "ton-projet.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "ton-projet",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "ton-projet.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.FIREBASE_APP_ID || "1:12345:web:abcde"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const emailProvider = new EmailAuthProvider();
