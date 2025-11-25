import { ProductCard, ProductPurchaseButtons } from "@/components/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [sortBy, setSortBy] = useState<string>("none");

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  let filteredProducts = data.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) &&
      (product.isAvailable || isAdmin),
  );

  // Apply sorting based on selected option
  switch (sortBy) {
    case "price-asc":
      filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
      break;
    case "availability":
      // Available products first (isAvailable !== false), then unavailable
      filteredProducts = filteredProducts.sort((a, b) => {
        const aAvailable = a.isAvailable !== false ? 1 : 0;
        const bAvailable = b.isAvailable !== false ? 1 : 0;
        return bAvailable - aAvailable;
      });
      break;
    default:
      // No sorting
      break;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-4">
        <h1 className="text-8xl font-bold tracking-tight">Products</h1>

        <div className="max-w-md mx-auto mt-6 flex flex-col justify-center items-center gap-2">
          <Input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort Options</SelectLabel>
                <SelectItem value="none">No sorting</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="availability">Availability</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        {isAdmin ? (
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
        ) : (
          ""
        )}
      </div>

      <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {filteredProducts.map((product) => (
          <ProductCard
            product={product}
            key={product.id}
            showAdminEdit={isAdmin}
          >
            <div className="flex flex-wrap gap-2">
              <ProductPurchaseButtons product={product} />
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
