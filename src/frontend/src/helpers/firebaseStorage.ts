import { ref, listAll, getDownloadURL } from "firebase/storage";
import { storage } from "@/helpers/firebaseConfig";

export async function getProductImages(productId: string): Promise<string[]> {
  try {
    const productRef = ref(storage, `products/${productId}`);
    const list = await listAll(productRef);

    const urls = await Promise.all(
      list.items.map((item) => getDownloadURL(item)),
    );

    return urls;
  } catch (error) {
    console.error("Error fetching product images:", error);
    return [];
  }
}
