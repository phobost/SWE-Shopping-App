import { AddProductToCardButton } from "@/components/cart";
import { ProductCard } from "@/components/product";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/helpers/authContext";
import { useProducts } from "@/helpers/product/context";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PlusCircleIcon } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/products/")({
  component: RouteComponent,
});

function RouteComponent() {
  const context = useAuthContext();
  const isAdmin = context.isAdmin();
  const { data, loading, error } = useProducts();
  const [search, setSearch] = useState("");

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const filteredProducts = data.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-4">
        <h1 className="text-8xl font-bold tracking-tight">Products</h1>

        <div className="max-w-md mx-auto mt-6">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full p-3 border rounded-lg shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="secondary"
          className="text-emerald-100 bg-emerald-600 dark:text-emerald-200 dark:bg-emerald-900"
          asChild
        >
          <Link to="/products/create">
            <PlusCircleIcon />
            <p className="pl-2">New Product</p>
          </Link>
        </Button>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard
            product={product}
            key={product.id}
            showAdminEdit={isAdmin}
          >
            <div className="flex flex-wrap gap-2">
              <AddProductToCardButton product={product} />
              <Button asChild>
                <Link to="/checkout">Buy Now</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link
                  to="/products/id/$productId"
                  params={{ productId: product.id }}
                >
                  Details
                </Link>
              </Button>
            </div>
          </ProductCard>
        ))}
      </div>
    </div>
  );
}
