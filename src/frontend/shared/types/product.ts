export interface Product {
  uid: string;
  name: string;
  price: number;
  description: string;
  quantityInStock: number;
  base64Image: string | null;
}
