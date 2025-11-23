import { Product } from "@shared/types/product";
import { createFirestoreContext } from "../firestoreContext";

const { provider, useContext } = createFirestoreContext<Product>("products");

export const ProductsProvider = provider;

// eslint-disable-next-line react-refresh/only-export-components
export const useProducts = useContext;
