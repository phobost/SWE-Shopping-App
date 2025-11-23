import { Product } from "@shared/types/product";
import { firestore } from "./firebaseConfig";
import { collection, doc, getDocs, writeBatch } from "@firebase/firestore";
import { Discount } from "@shared/types/discount";
import { setDiscount } from "./discount/util";

const SEED_PRODUCTS: Omit<Product, "id">[] = [
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

const SEED_DISCOUNTS: Discount[] = [
  {
    id: "code",
    percentage: 5,
  },
  {
    id: "example",
    percentage: 10,
  },
  {
    id: "another",
    percentage: 30,
  },
  {
    id: "last",
    percentage: 45,
  },
];

// @ts-expect-error Just a dev helper to seed firestore emulator with data
async function seed(collectionName: string, items): Promise<void> {
  try {
    const col = collection(firestore, collectionName);
    // Check if snapshot already exists
    const snapshot = await getDocs(col);

    if (!snapshot.empty) {
      console.log(
        `${collectionName} collection already has data. Skipping seed.`,
      );
      return;
    }

    const batch = writeBatch(firestore);

    // @ts-expect-error Don't care that `items` has `any` type
    items.forEach((item) => {
      const productRef = doc(col);
      batch.set(productRef, item);
    });

    await batch.commit();
    console.log(
      `Successfully seeded ${SEED_PRODUCTS.length} items into '${collectionName}' collection`,
    );
  } catch (error) {
    console.error(`Error seeding collection '${collectionName}':`, error);
  }
}

async function seedDiscounts() {
  SEED_DISCOUNTS.forEach(async (discount) => {
    await setDiscount(discount);
  });
  console.log("Finished seeding discounts");
}

export async function seedFirestore() {
  if (import.meta.env.DEV) {
    await seed("products", SEED_PRODUCTS);
    await seedDiscounts();
  }
}
