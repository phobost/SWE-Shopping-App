export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: Date;
}

export interface UserCart {
  userId: string;
  items: CartItem[];
  updatedAt: Date;
}
