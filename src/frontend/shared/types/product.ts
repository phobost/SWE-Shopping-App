export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  quantityInStock: number;
  body: {
    markdown: string;
    html: string;
  };
  base64Image: string | null;
}
