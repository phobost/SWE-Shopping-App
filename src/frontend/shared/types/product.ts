export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  quantityInStock: number;
  base64Image: string | null;
}
