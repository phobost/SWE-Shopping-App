import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/products-admin")({
  component: ProductsAdmin,
});

function ProductsAdmin() {
  // Later: load real products and allow editing
  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold">Product Settings</h1>

      <p className="text-muted-foreground max-w-xl">
        Here&apos;s where admins can edit your cosmic inventory. For now, this
        is just a placeholder screen.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminProductCard name="Genuine Moon Rock" price="$20.00" />
        <AdminProductCard name="Coende Crunch Alden" price="$5.49" />
        <AdminProductCard name="Bottle of Stardust" price="$29.99" />
        <AdminProductCard name="Pluto's Pet Plushle" price="$12.00" />
      </div>
    </div>
  );
}

function AdminProductCard({ name, price }: { name: string; price: string }) {
  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-xs p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold">{name}</h2>
          <p className="text-sm text-muted-foreground">{price}</p>
        </div>
        <span className="text-xs rounded-full border px-2 py-1">Draft UI</span>
      </div>

      <div className="space-y-2 text-sm text-muted-foreground">
        <p>• Later: edit name, price, description</p>
        <p>• Hook into Firestore or your DB</p>
        <p>• Save / cancel controls</p>
      </div>
    </div>
  );
}
