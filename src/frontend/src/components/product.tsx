import { Product } from "@shared/types/product";
import { Button } from "./ui/button";
import { Link } from "@tanstack/react-router";
import { AddProductToCardButton } from "./cart";
import { ReactNode } from "react";

export function ProductCard({
  product,
  children,
  showAdminEdit,
}: {
  product: Product;
  children?: ReactNode;
  showAdminEdit?: boolean;
  editHref?: string;
}) {
  return (
    <div className="relative rounded-lg border bg-card text-card-foreground shadow-xs p-6 space-y-2">
      {showAdminEdit && (
        <Button
          variant="ghost"
          size="icon"
          asChild
          className="absolute right-3 top-3 h-8 w-8 rounded-full"
        >
          <Link
            to="/products/id/$productId/edit"
            params={{ productId: product.id }}
          >
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

export function ProductDetails({ product }: { product: Product }) {
  return (
    <>
      <div className="pt-4">
        <h1 className="text-6xl font-bold">
          {product.name} | ${product.price}
        </h1>
        <p className="text-lg text-muted-foreground">{product.description}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button asChild>
            <Link to="/checkout">Buy Now</Link>
          </Button>
          <AddProductToCardButton product={product} />
        </div>

        <div className="pt-8 product-body">
          <div dangerouslySetInnerHTML={{ __html: product.body.html }}></div>
        </div>
      </div>
    </>
  );
}
