import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { COLLECTION_NAMES } from "@shared/constants";
import { firestore } from "../firebaseConfig";
import { Product } from "@shared/types/product";
import { PartialKeys } from "@tanstack/react-table";

export const getProductRef = (id: string) => {
  return doc(firestore, COLLECTION_NAMES.products, id);
};

export const createProduct = async (product: Omit<Product, "id">) => {
  const id = (
    await addDoc(collection(firestore, COLLECTION_NAMES.products), product)
  ).id;
  return {
    ...product,
    id,
  } as Product;
};

export const setProduct = async (
  product: Product | PartialKeys<Product, "id">,
): Promise<Product> => {
  if (product.id) {
    const { id, ...itemWithoutId } = product as Product;
    await setDoc(getProductRef(id), itemWithoutId);
  } else {
    product = await createProduct(product);
  }
  return product as Product;
};

export const deleteDiscount = async (id: string) => {
  await deleteDoc(getProductRef(id));
};

export const getProduct = async (id: string) => {
  const ref = getProductRef(id);
  const docRef = await getDoc(ref);
  if (docRef.exists() && docRef.id != id) {
    throw new Error(
      `The document id for the product '${id}' did not match, id was '${docRef.id}' expected '${id}'`,
    );
  }
  return docRef.data();
};
