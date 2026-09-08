/**
 * Konfiguracja Firebase — inicjalizacja aplikacji klienckiej.
 *
 * Ta konfiguracja jest bezpieczna do udostępnienia po stronie klienta
 * (NEXT_PUBLIC_*) — Firebase Auth i Firestore korzystają z własnych
 * zasad bezpieczeństwa (Firebase Security Rules).
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  type Auth,
  GoogleAuthProvider,
  GithubAuthProvider,
} from "firebase/auth";
import {
  getFirestore,
  type Firestore,
} from "firebase/firestore";

/** Konfiguracja Firebase z zmiennych środowiskowych */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
} as const;

/** Inicjalizacja aplikacji Firebase (singleton) */
function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

/** Instancja usługi uwierzytelniania Firebase Auth */
export function getFirebaseAuth(): Auth {
  return getAuth(getFirebaseApp());
}

/** Instancja bazy danych Firestore */
export function getFirebaseFirestore(): Firestore {
  return getFirestore(getFirebaseApp());
}

/** Dostawcy logowania społecznościowego */
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

// Dodatkowe ustawienia dostawców
googleProvider.setCustomParameters({ prompt: "select_account" });
githubProvider.setCustomParameters({ prompt: "select_account" });
