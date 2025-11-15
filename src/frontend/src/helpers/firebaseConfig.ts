import { initializeApp, getApps } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { connectStorageEmulator, getStorage } from "firebase/storage";
import { collection, getDocs, writeBatch, doc } from "firebase/firestore";
import { Product } from "@/types/product";

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
}

const SEED_PRODUCTS: Omit<Product, "uid">[] = [
  {
    name: "Genuine Moon Rock",
    price: 20.0,
    description:
      "Straight from the Sea of Tranquility. Certified* authentic (*by us).",
    quantityInStock: 50,
    base64Image: null,
  },
  {
    name: "Coende Crunch Alden",
    price: 5.49,
    quantityInStock: 20,
    description:
      "Snacks that taste like chicken... if chicken were neon green and crunchy.",
    base64Image: null,
  },
  {
    name: "Bottle of Stardust",
    price: 29.99,
    quantityInStock: 8,
    description:
      "For sprinkling on your cereal or wishing upon. Contains glitter.",
    base64Image: null,
  },
  {
    name: "Pluto's Pet Plushle",
    price: 12.0,
    quantityInStock: 7,
    description:
      "The fluffiest, coldest dog in the Kuiper Belt. Hypoallergenic*.",
    base64Image: null,
  },
];

async function seedProducts(): Promise<void> {
  try {
    const productsCollection = collection(firestore, "products");

    // Check if products already exist
    const snapshot = await getDocs(productsCollection);

    if (!snapshot.empty) {
      console.log("Products collection already has data. Skipping seed.");
      return;
    }

    const batch = writeBatch(firestore);

    SEED_PRODUCTS.forEach((product) => {
      const productRef = doc(productsCollection);
      batch.set(productRef, product);
    });

    await batch.commit();
    console.log(`Successfully seeded ${SEED_PRODUCTS.length} products`);
  } catch (error) {
    console.error("Error seeding products:", error);
  }
}

if (import.meta.env.DEV) {
  await seedProducts();
}
