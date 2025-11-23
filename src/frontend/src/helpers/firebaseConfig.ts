import { initializeApp, getApps } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_PUBLIC_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
export const firebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(firebaseApp);
export const firestore = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);
export const functions = getFunctions(firebaseApp);

if (import.meta.env.DEV || import.meta.env.VITE_FIREBASE_USE_EMULATORS) {
  console.log("Using firebase emulators!");
  const host = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || "127.0.0.1";
  console.log(`Using the firebase emulator host as ${host}`);

  connectAuthEmulator(
    auth,
    `http://${host}:${import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT || 9099}`,
  );
  connectFirestoreEmulator(
    firestore,
    host,
    parseInt(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || "9095"),
  );
  connectStorageEmulator(
    storage,
    host,
    parseInt(import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_PORT || "9199"),
  );
  connectFunctionsEmulator(
    functions,
    "127.0.0.1",
    parseInt(import.meta.env.VITE_FIREBASE_FUNCTIONS_EMULATOR_PORT || "5001"),
  );
}
