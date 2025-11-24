export const TAX_RATE = 8.25;

export const COLLECTION_NAMES = {
  products: () => {
    return "products";
  },
  discounts: () => {
    return "discounts";
  },
  users: () => {
    return "users";
  },
  orders: (userId: string) => {
    return `${COLLECTION_NAMES.users()}/${userId}/orders`;
  },
};

export const DOCUMENT_NAMES = {
  cart: (userId: string) => {
    return `${COLLECTION_NAMES.users()}/${userId}`;
  },
  user: (userId: string) => {
    return `${COLLECTION_NAMES.users()}/${userId}`;
  },
};
