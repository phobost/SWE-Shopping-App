/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FIREBASE_USE_EMULATORS?: string;
  readonly VITE_FIREBASE_EMULATOR_HOST?: string;
  readonly VITE_FIREBASE_AUTH_EMULATOR_PORT?: string;
  readonly VITE_FIREBASE_FIRESTORE_EMULATOR_PORT?: string;
  readonly VITE_FIREBASE_STORAGE_EMULATOR_PORT?: string;
  readonly VITE_FIREBASE_FUNCTIONS_EMULATOR_PORT?: string;
  readonly VITE_PUBLIC_FIREBASE_API_KEY?: string;
  readonly VITE_PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
  readonly VITE_PUBLIC_FIREBASE_PROJECT_ID?: string;
  readonly VITE_PUBLIC_FIREBASE_STORAGE_BUCKET?: string;
  readonly VITE_PUBLIC_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_PUBLIC_FIREBASE_APP_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
