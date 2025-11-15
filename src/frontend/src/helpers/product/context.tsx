import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, getDocs, onSnapshot, query } from "firebase/firestore";
import { firestore } from "../firebaseConfig";

export interface Product {
  uid: string;
  name: string;
  price: number;
  description: string;
  quantityInStock: number;
  base64Image: string | null;
}

interface ProductsContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(
  undefined,
);

interface ProductsProviderProps {
  children: React.ReactNode;
}

export const ProductsProvider: React.FC<ProductsProviderProps> = ({
  children,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const productsCollection = collection(firestore, "products");
      const productsSnapshot = await getDocs(productsCollection);

      const productsList: Product[] = productsSnapshot.docs.map(
        (doc) =>
          ({
            uid: doc.id,
            ...doc.data(),
          }) as Product,
      );

      setProducts(productsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Option 1: Load once on mount
    // loadProducts();

    // Option 2: Real-time updates with onSnapshot (recommended)
    const productsCollection = collection(firestore, "products");
    const q = query(productsCollection);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const productsList: Product[] = snapshot.docs.map(
          (doc) =>
            ({
              uid: doc.id,
              ...doc.data(),
            }) as Product,
        );

        setProducts(productsList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
        console.error("Error in products snapshot:", err);
      },
    );

    return () => unsubscribe();
  }, []);

  const refreshProducts = async () => {
    await loadProducts();
  };

  const value: ProductsContextType = {
    products,
    loading,
    error,
    refreshProducts,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider");
  }
  return context;
};
