import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/checkout")({ component: Checkout });

function Checkout() {
  // Later we can wire this to real cart state or URL params
  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold">Checkout</h1>

      <p className="text-muted-foreground max-w-xl">
        This is your cart &amp; checkout page. For now it&apos;s a placeholder –
        we&apos;ll hook it up to actual cart data next.
      </p>

      <div className="rounded-lg border bg-card text-card-foreground shadow-xs p-6 space-y-4">
        <h2 className="text-xl font-semibold">Order summary</h2>
        <p className="text-sm text-muted-foreground">
          Imagine your Moon Rocks, Alien Snacks, and Stardust all listed here
          with quantities and totals. 🤩
        </p>
        <Button className="w-full" disabled>
          Complete Purchase (coming soon)
        </Button>
      </div>

      <Button variant="outline" asChild>
        <Link to="/">Back to shop</Link>
      </Button>
    </div>
  );
}