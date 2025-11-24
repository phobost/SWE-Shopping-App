import { Timestamp } from "firebase/firestore";
import { Discount } from "./discount";
import { Product } from "./product";

export interface OrderProduct extends Pick<Product, "id" | "name" | "price"> {
  quantityOrdered: number;
}

export interface Order {
  id: string;
  total: number;
  userId: string;
  products: OrderProduct[];
  discount: Discount | null;
  timestamp: Timestamp;
}
