import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { COLLECTION_NAMES } from "@shared/constants";
import { firestore } from "../firebaseConfig";
import { Product } from "@shared/types/product";

export const getProductRef = (id: string) => {
  return doc(firestore, COLLECTION_NAMES.products, id);
};

export const setProduct = async (product: Product) => {
  const { id, ...itemWithoutId } = product;
  await setDoc(getProductRef(id), itemWithoutId);
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
