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
import { Product } from "@/types/product";
import { Icons } from "@/components/icons";

export function Cart() {
  const cartContext = useCartContext();

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
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          {cartContext.cartProducts.length > 0 ? (
            cartContext.cartProducts.map((cartProduct) => (
              <div key={cartProduct.uid} className="flex justify-between mb-2">
                <p className="text-sm font-medium">{cartProduct.name}</p>
                <p className="text-sm text-muted-foreground">
                  ×{cartProduct.cartQuantity}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm font-medium">Cart empty</p>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          <div className="flex justify-between mb-2">
            <p className="font-medium">
              Subtotal: ${cartContext.getCartTotal().toFixed(2)}
            </p>
            <Button
              variant="destructive"
              className="h-6 w-6 p-0"
              onClick={cartContext.clearCart}
            >
              <Icons.trashCan />
            </Button>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/checkout">Checkout</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
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
