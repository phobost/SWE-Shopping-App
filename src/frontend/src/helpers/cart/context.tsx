import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from "react";
import { doc, setDoc, onSnapshot } from "firebase/firestore";
import { firestore } from "../firebaseConfig";
import { useAuthContext } from "../authContext";
import { useProducts } from "../product/context";
import type { CartItem } from "@shared/types/cart";
import type { Product } from "@shared/types/product";

export interface CartProduct extends Product {
  cartQuantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  cartProducts: CartProduct[];
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getCartTotal: () => number;
  getCartItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartContextProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuthContext();
  const { data } = useProducts(); // Reuse products from context
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCartItems([]);
      return;
    }

    const cartRef = doc(firestore, "carts", user.uid);
    const unsubscribe = onSnapshot(cartRef, (doc) => {
      if (doc.exists()) {
        setCartItems(doc.data().items || []);
      } else {
        setCartItems([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const cartProducts = useMemo((): CartProduct[] => {
    return cartItems
      .map((item) => {
        const product = data.find((p) => p.id === item.productId);
        if (!product) return null;

        return {
          ...product,
          cartQuantity: item.quantity,
        };
      })
      .filter((item): item is CartProduct => item !== null);
  }, [cartItems, data]);

  const addToCart = async (productId: string, quantity = 1) => {
    if (!user) throw new Error("You must be logged in");

    // Find the product to check stock
    const product = data.find((p) => p.id === productId);

    if (!product) {
      throw new Error("Product not found");
    }

    // Check current quantity in cart
    const existingItem = cartItems.find((item) => item.productId === productId);
    const currentCartQuantity = existingItem ? existingItem.quantity : 0;
    const newTotalQuantity = currentCartQuantity + quantity;

    // Validate against available stock
    if (newTotalQuantity > product.quantityInStock) {
      throw new Error(
        `Cannot add ${quantity} items. ${product.quantityInStock} in stock, ${currentCartQuantity} in cart.`,
      );
    }

    const cartRef = doc(firestore, "carts", user.uid);
    const newItems = existingItem
      ? cartItems.map((item) =>
          item.productId === productId
            ? { ...item, quantity: newTotalQuantity }
            : item,
        )
      : [...cartItems, { productId, quantity, addedAt: new Date() }];

    await setDoc(cartRef, {
      userId: user.uid,
      items: newItems,
      updatedAt: new Date(),
    });
  };

  const removeFromCart = async (productId: string) => {
    if (!user) throw new Error("User must be logged in");

    const cartRef = doc(firestore, "carts", user.uid);
    const newItems = cartItems.filter((item) => item.productId !== productId);

    await setDoc(cartRef, {
      userId: user.uid,
      items: newItems,
      updatedAt: new Date(),
    });
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) throw new Error("User must be logged in");

    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    // Find the product to check stock
    const product = data.find((p) => p.id === productId);

    if (!product) {
      throw new Error("Product not found");
    }

    // Validate against available stock
    if (quantity > product.quantityInStock) {
      throw new Error(
        `Cannot set quantity to ${quantity}. Only ${product.quantityInStock} available in stock`,
      );
    }

    const cartRef = doc(firestore, "carts", user.uid);
    const newItems = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity } : item,
    );

    await setDoc(cartRef, {
      userId: user.uid,
      items: newItems,
      updatedAt: new Date(),
    });
  };

  const clearCart = async () => {
    if (!user) throw new Error("User must be logged in");

    const cartRef = doc(firestore, "carts", user.uid);
    await setDoc(cartRef, {
      userId: user.uid,
      items: [],
      updatedAt: new Date(),
    });
  };

  const getCartTotal = () => {
    const subtotal = cartProducts.reduce(
      (total, product) => total + product.price * product.cartQuantity,
      0,
    );

    const tax = subtotal * 0.0825;
    const totalWithTax = subtotal + tax;

    return totalWithTax;
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartProducts,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
