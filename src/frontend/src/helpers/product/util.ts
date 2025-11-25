import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";
import { COLLECTION_NAMES } from "@shared/constants";
import { firestore, storage } from "../firebaseConfig";
import { Product } from "@shared/types/product";
import { PartialKeys } from "@tanstack/react-table";
import { ref } from "firebase/storage";

export const getNewProductDoc = () => {
  return doc(collection(firestore, COLLECTION_NAMES.products()));
};

export const getProductStorageRef = (id: string) => {
  return ref(storage, `products/${id}`);
};

export const getProductRef = (id: string) => {
  return doc(firestore, COLLECTION_NAMES.products(), id);
};

export const createProduct = async (product: Omit<Product, "id">) => {
  const id = (
    await addDoc(collection(firestore, COLLECTION_NAMES.products()), product)
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

export const getSalePrice = (
  product: Pick<Product, "price" | "salePercentage">,
) => {
  return product.price - product.price * (product.salePercentage * 0.01);
};
