import { AddProductToCardButton } from "@/components/cart";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/helpers/authContext";
import { useProducts } from "@/helpers/product/context";
import { Product } from "@shared/types/product";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ReactNode } from "react";

export const Route = createFileRoute("/products/")({
  component: RouteComponent,
});

function ProductCard({
  product,
  children,
  showAdminEdit,
  editHref,
}: {
  product: Product;
  children?: ReactNode;
  showAdminEdit?: boolean;
  editHref?: string;
}) {
  // TODO: Include the image of the product
  return (
    <div className="relative rounded-lg border bg-card text-card-foreground shadow-xs p-6 space-y-2">
      {showAdminEdit && editHref && (
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="absolute right-3 top-3 h-8 w-8 rounded-full"
        >
          <Link to={editHref}>
            <span className="sr-only">Edit product</span>
            ⚙️
          </Link>
        </Button>
      )}
      <h3 className="font-semibold text-lg">
        {product.name} | ${product.price}
      </h3>
      <p className="text-sm text-muted-foreground">{product.description}</p>
      <p className="text-sm">In Stock: {product.quantityInStock}</p>
      {children && <div className="pt-4">{children}</div>}
    </div>
  );
}

function RouteComponent() {
  const context = useAuthContext();
  const isAdmin = context.isAdmin();
  const { data, loading, error } = useProducts();

  if (loading) {
    return <div>Loading products...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-4">
        <h1 className="text-8xl font-bold tracking-tight">Products</h1>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {data.map((product) => (
          <ProductCard
            product={product}
            key={product.id}
            showAdminEdit={isAdmin}
            editHref="/products-admin"
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
