import { createFirestoreContext } from "../firestoreContext";
import { COLLECTION_NAMES } from "@shared/constants";
import { Order } from "@shared/types/order";

export const createOrderProvider = (userId: string) => {
  return createFirestoreContext<Order>(COLLECTION_NAMES.orders(userId));
};
