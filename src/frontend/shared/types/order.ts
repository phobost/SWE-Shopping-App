import { Timestamp } from "firebase/firestore";
import { Discount } from "./discount";
import { Product } from "./product";

export interface OrderProduct
  extends Pick<Product, "id" | "name" | "price" | "salePercentage"> {
  quantityOrdered: number;
}

export enum OrderStatus {
  Pending = "Pending",
  InProgress = "In Progress",
  Shipped = "Shipped",
  Completed = "Completed",
  Cancelled = " Cancelled",
}

export interface Order {
  id: string;
  total: number;
  subtotal: number;
  tax: number;
  userId: string;
  products: OrderProduct[];
  discount: Discount | null;
  timestamp: Timestamp;
  status: OrderStatus;
}
