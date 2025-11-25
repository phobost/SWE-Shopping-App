export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  isAvailable: boolean;
  quantityInStock: number;

  // Optional rich text body (from old branch)
  body?: {
    markdown: string;
    html: string;
  };

  // Optional base64 image (from old branch)
  base64Image?: string | null;

  // New: multiple images from Firebase Storage
  images?: string[];
}
