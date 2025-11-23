import { deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";
import { DISCOUNT_COLLECTION_NAME } from "./constants";
import { Discount } from "@shared/types/discount";
import { firestore } from "../firebaseConfig";

const getDiscountRef = (code: string) => {
  return doc(firestore, DISCOUNT_COLLECTION_NAME, code);
};

export const setDiscount = async (discount: Discount) => {
  await setDoc(getDiscountRef(discount.code), discount);
};

export const deleteDiscount = async (code: string) => {
  await deleteDoc(getDiscountRef(code));
};

export const getDiscount = async (code: string) => {
  return await getDoc(getDiscountRef(code));
};
