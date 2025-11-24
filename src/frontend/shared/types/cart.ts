import { Product } from "./product";

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}

export interface CartProduct extends Product {
  cartQuantity: number;
}

export interface UserCart {
  userId: string;
  items: CartItem[];
  updatedAt: Date;
}
