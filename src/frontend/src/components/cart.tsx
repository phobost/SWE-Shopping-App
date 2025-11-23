import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartContext } from "@/helpers/cart/context";
import { useState } from "react";
import { toast } from "sonner";
import { Product } from "@shared/types/product";
import { Icons } from "@/components/icons";

export function Cart() {
  const cartContext = useCartContext();
  const hasItems = cartContext.cartProducts.length > 0;

  // tax + totals
  const TAX_RATE = 0.0825;
  const subtotal = cartContext.getCartTotal(); // items only
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const handleIncrement = async (
    productId: string,
    currentQty: number,
    maxQty: number,
  ) => {
    if (currentQty >= maxQty) {
      toast.error("Cannot add more, out of stock");
      return;
    }
    await cartContext.updateQuantity(productId, currentQty + 1);
  };

  const handleDecrement = async (productId: string, currentQty: number) => {
    await cartContext.updateQuantity(productId, currentQty - 1);
  };

  // remove a single product from the cart
  const handleRemoveItem = async (productId: string) => {
    // if your context has removeFromCart(productId), use that instead
    await cartContext.updateQuantity(productId, 0);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full p-0 overflow-hidden"
        >
          🛒
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          {hasItems ? (
            cartContext.cartProducts.map((cartProduct) => (
              <div key={cartProduct.uid} className="flex justify-between mb-2">
                <p className="text-sm font-medium">{cartProduct.name}</p>

                <div className="flex items-center space-x-1">
                  <Button
                    size="sm"
                    className="h-5 w-5 p-0 text-xs"
                    onClick={() =>
                      handleDecrement(cartProduct.uid, cartProduct.cartQuantity)
                    }
                  >
                    -
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    {cartProduct.cartQuantity}
                  </span>

                  <Button
                    size="sm"
                    className="h-5 w-5 p-0 text-xs"
                    onClick={() =>
                      handleIncrement(
                        cartProduct.uid,
                        cartProduct.cartQuantity,
                        cartProduct.quantityInStock,
                      )
                    }
                    disabled={
                      cartProduct.cartQuantity >= cartProduct.quantityInStock
                    }
                  >
                    +
                  </Button>

                  {/* per-item trash can button */}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-5 w-5 p-0"
                    onClick={() => handleRemoveItem(cartProduct.uid)}
                  >
                    <Icons.trashCan />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm font-medium">Cart empty</p>
          )}
        </DropdownMenuLabel>

        {/* Only show totals + checkout when there are items */}
        {hasItems && (
          <>
            <DropdownMenuSeparator />

            <DropdownMenuLabel>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium">Tax:</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    variant="destructive"
                    className="h-6 w-6 p-0"
                    onClick={cartContext.clearCart}
                  >
                    <Icons.trashCan />
                  </Button>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link to="/checkout">Checkout</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AddProductToCardButton({ product }: { product: Product }) {
  const { addToCart } = useCartContext();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addToCart(product.uid);
      toast.success("Added to cart!", {
        description: product.name,
      });
    } catch (err) {
      toast.error("Failed to add to cart", {
        description:
          err instanceof Error ? err.message : "An unexpected error occurred",
      });
    } finally {
      setAdding(false);
    }
  };

  const isOutOfStock = product.quantityInStock === 0;

  return (
    <Button onClick={handleAddToCart} disabled={adding || isOutOfStock}>
      {adding ? "Adding..." : isOutOfStock ? "Out of Stock" : "Add to Cart"}
    </Button>
  );
}

