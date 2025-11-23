import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { DISCOUNT_COLLECTION_NAME } from "./constants";
import { Discount } from "@shared/types/discount";
import { firestore } from "../firebaseConfig";

const getDiscountRef = (code: string) => {
  const docRef = doc(firestore, DISCOUNT_COLLECTION_NAME, code);
  return docRef;
};

export const setDiscount = async (discount: Discount) => {
  await setDoc(getDiscountRef(discount.id), discount);
};

export const deleteDiscount = async (id: string) => {
  await deleteDoc(getDiscountRef(id));
};

export const getDiscount = async (id: string) => {
  const ref = getDiscountRef(id);
  const docRef = await getDoc(ref);
  if (docRef.exists() && docRef.id != id) {
    throw new Error(
      `The document id for the discount code '${id}' did not match, id was '${docRef.id}' expected '${id}'`,
    );
  }
  return docRef.data();
};
