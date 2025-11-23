import { Discount } from "@shared/types/discount";
import { createFirestoreContext } from "../firestoreContext";
import { DISCOUNT_COLLECTION_NAME } from "./constants";

const { provider, useContext } = createFirestoreContext<Discount>(
  DISCOUNT_COLLECTION_NAME,
);

export const DiscountsProvider = provider;

// eslint-disable-next-line react-refresh/only-export-components
export const useDiscounts = useContext;
