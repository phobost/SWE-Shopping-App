import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuthContext } from "@/helpers/authContext";

import "./index.css";
import { ProductDetails } from "@/components/product";
import { Button } from "@/components/ui/button";
import { CircleArrowLeftIcon, SquarePen } from "lucide-react";

export const Route = createFileRoute("/products/id/$productId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const context = useAuthContext();
  const { product } = Route.useRouteContext();
  const isAdmin = context.isAdmin();

  return (
    <>
      <div className="flex gap-4">
        <Button variant="secondary" asChild>
          <Link to="/products" className="ga">
            <CircleArrowLeftIcon />
            <p className="pl-2">Back to shop</p>
          </Link>
        </Button>
        {isAdmin ? (
          <Button variant="destructive" asChild>
            <Link
              to="/products/id/$productId/edit"
              params={{ productId: product.id }}
            >
              <SquarePen />
              <p className="pl-2">Edit</p>
            </Link>
          </Button>
        ) : (
          ""
        )}
      </div>
      <ProductDetails product={product} />
    </>
  );
}
