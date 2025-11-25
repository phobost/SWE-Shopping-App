export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  isAvailable: boolean;
  quantityInStock: number;
  salePercentage: number;
  body: {
    markdown: string;
    html: string;
  };
}
