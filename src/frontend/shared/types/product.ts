export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  isAvailable: boolean;
  quantityInStock: number;
  primaryImageUrl?: string;
  extraImages?: string[];
  salePercentage: number;
  body: {
    markdown: string;
    html: string;
  };
}
