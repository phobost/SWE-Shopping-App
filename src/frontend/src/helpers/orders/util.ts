import { createFirestoreContext } from "../firestoreContext";
import { COLLECTION_NAMES } from "@shared/constants";
import { Order } from "@shared/types/order";
import { callables, firestore } from "../firebaseConfig";
import {
  addDoc,
  collection,
  collectionGroup,
  doc,
  getDocs,
  setDoc,
} from "@firebase/firestore";
import { PartialKeys } from "@tanstack/react-table";
import { User } from "firebase/auth";

export const createOrderProvider = (userId: string) => {
  return createFirestoreContext<Order>(COLLECTION_NAMES.orders(userId));
};

export type UserOrder = Order & {
  userIdentifier: string;
};

export const getAllUserOrders = async (user: User): Promise<UserOrder[]> => {
  const snapshot = await getDocs(
    collection(firestore, COLLECTION_NAMES.orders(user.uid)),
  );

  const orders = snapshot.docs.map(async (doc) => {
    const order = {
      id: doc.id,
      ...doc.data(),
    } as Order;

    const userIdentifier = user.email || `(Unknown Identifier) ${user.uid}`;

    return { ...order, userIdentifier } as UserOrder;
  });

  return await Promise.all(orders);
};

export const getAllOrders = async (): Promise<UserOrder[]> => {
  const snapshot = await getDocs(collectionGroup(firestore, "orders"));

  const orders = snapshot.docs.map(async (doc) => {
    const order = {
      id: doc.id,
      ...doc.data(),
    } as Order;

    const user = (await callables.getUser({ userId: order.userId })).data;
    const userIdentifier = user.email || `(Unknown Identifier) ${user.uid}`;

    return { ...order, userIdentifier } as UserOrder;
  });

  return await Promise.all(orders);
};

export const getOrderRef = (userId: string, orderId: string) => {
  return doc(firestore, COLLECTION_NAMES.orders(userId), orderId);
};

export const createOrder = async (userId: string, order: Omit<Order, "id">) => {
  const id = (
    await addDoc(collection(firestore, COLLECTION_NAMES.orders(userId)), order)
  ).id;
  return {
    ...order,
    id,
  } as Order;
};

export const setOrder = async (
  order: Order | PartialKeys<Order, "id">,
): Promise<Order> => {
  if (order.id) {
    const { id, ...itemWithoutId } = order as Order;
    await setDoc(getOrderRef(order.userId, id), itemWithoutId);
  } else {
    order = await createOrder(order.userId, order);
  }
  return order as Order;
};
