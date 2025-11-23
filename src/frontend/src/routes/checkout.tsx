import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { columns } from "../../src/components/ui/columns.tsx";
import { DataTable } from "../../src/components/ui/data-table.tsx";
import { useCartContext } from "../helpers/cart/context.tsx";

export const Route = createFileRoute("/checkout")({ component: Checkout });

function Checkout() {
  // Later we can wire this to real cart state or URL params
  const { cartProducts, getCartTotal } = useCartContext();

  const cartTotal = getCartTotal();

  const cartSubtotal = cartProducts.reduce(
    (total, product) => total + product.price * product.cartQuantity,
    0,
  );

  const cartTax = cartSubtotal * 0.0825; //

  const isEmpty = cartProducts.length === 0;
  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold">Checkout</h1>

      <p className="text-muted-foreground max-w-xl">
        This is your cart &amp; checkout page. Review your order before
        completing the purchase.
      </p>

      <div className="rounded-lg border bg-card text-card-foreground shadow-xs p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Order summary</h2>

        {isEmpty ? (
          <p className="text-sm text-center py-4">Your cart is empty.</p>
        ) : (
          <>
            <DataTable columns={columns} data={cartProducts} />

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Subtotal:</span>
                <span className="font-medium">${cartSubtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="font-medium">Tax:</span>
                <span className="font-medium">${cartTax.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t flex justify-between items-center text-lg font-bold">
                <span className="font-semibold">Order Total:</span>
                <span className="font-semibold">${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
        <Button className="w-full" disabled={cartProducts.length === 0}>
          Complete Purchase (coming soon! Needs planning for processing payment)
        </Button>
      </div>

      <Button variant="outline" asChild>
        <Link to="/">Back to shop</Link>
      </Button>
    </div>
  );
}
