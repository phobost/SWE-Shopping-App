import { ProductCard, ProductPurchaseButtons } from "@/components/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthContext } from "@/helpers/authContext";
import { useProducts } from "@/helpers/product/context";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, ArrowUpDown, PlusCircleIcon } from "lucide-react";
import React, { useState } from "react";

export const Route = createFileRoute("/products/")({
  component: RouteComponent,
});

enum SortOrder {
  Ascending,
  Descending,
}

const invertSortOrder = (sort: SortOrder | undefined): SortOrder => {
  if (sort == SortOrder.Descending) {
    return SortOrder.Ascending;
  }
  return SortOrder.Descending;
};

const SortArrow = ({ sort }: { sort: SortOrder | undefined }) => {
  switch (sort) {
    case SortOrder.Ascending:
      return <ArrowUp className="ml-2 h-4 w-4" />;
    case SortOrder.Descending:
      return <ArrowDown className="ml-2 h-4 w-4" />;
    default:
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
  }
};

function RouteComponent() {
  const context = useAuthContext();
  const isAdmin = context.isAdmin();
  const { data, loading, error } = useProducts();
  const [search, setSearch] = useState("");
  const [sortPrice, setPriceSort] = React.useState<SortOrder | undefined>(
    undefined,
  );
  const [sortQuantity, setQuantitySort] = React.useState<SortOrder | undefined>(
    undefined,
  );

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  let filteredProducts = data.filter(
    (product) =>
      (product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())) &&
      (product.isAvailable || isAdmin),
  );

  if (sortPrice !== undefined) {
    if (sortPrice === SortOrder.Ascending) {
      filteredProducts = filteredProducts.sort((a, b) => a.price - b.price);
    } else {
      filteredProducts = filteredProducts.sort((a, b) => b.price - a.price);
    }
  }
  if (sortQuantity !== undefined) {
    if (sortQuantity === SortOrder.Ascending) {
      filteredProducts = filteredProducts.sort(
        (a, b) => a.quantityInStock - b.quantityInStock,
      );
    } else {
      filteredProducts = filteredProducts.sort(
        (a, b) => b.quantityInStock - a.quantityInStock,
      );
    }
  }

  console.log(filteredProducts.map((v) => v.price));

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
          <div className="flex flex-row gap-2 text-center">
            <Button
              className="w-50"
              variant="outline"
              onClick={() => {
                setPriceSort(invertSortOrder(sortPrice));
                setQuantitySort(undefined);
              }}
            >
              <SortArrow sort={sortPrice} />
              Price
            </Button>
            <Button
              className="w-50"
              variant="outline"
              onClick={() => {
                setQuantitySort(invertSortOrder(sortQuantity));
                setPriceSort(undefined);
              }}
            >
              <SortArrow sort={sortQuantity} />
              Availability
            </Button>
          </div>
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
