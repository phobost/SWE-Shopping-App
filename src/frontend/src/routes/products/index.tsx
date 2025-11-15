import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/helpers/authContext";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ReactNode } from "react";

export const Route = createFileRoute("/products/")({
  component: RouteComponent,
});

function ProductCard({
  title,
  description,
  icon,
  children,
  showAdminEdit,
  editHref,
}: {
  title: string;
  description: string;
  icon: string;
  children?: ReactNode;
  showAdminEdit?: boolean;
  editHref?: string;
}) {
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
      <div className="text-3xl">{icon}</div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
      {children && <div className="pt-4">{children}</div>}
    </div>
  );
}

function RouteComponent() {
  const { user } = useAuthContext();
  const isAdmin = !!user; // TODO: replace with real admin check when available

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-4">
        <h1 className="text-8xl font-bold tracking-tight">Products</h1>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <ProductCard
          title="Genuine Moon Rock ($20.00)"
          description="Straight from the see of Tranquility. certifiec authentic."
          icon="🌑"
          showAdminEdit={isAdmin}
          editHref="/products-admin"
        >
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/checkout">Add to Cart</Link>
            </Button>
            <Button asChild>
              <Link to="/checkout">Buy Now</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link
                to="/products/id/$productId"
                params={{ productId: "moon-rock" }}
              >
                Details
              </Link>
            </Button>
          </div>
        </ProductCard>
        <ProductCard
          title="Coende Crunch Alden ($5.49)"
          description="Snacks Toste like chicken... if chioken were neon grean and crunchy."
          icon="👽"
          showAdminEdit={isAdmin}
          editHref="/products-admin"
        >
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/checkout">Add to Cart</Link>
            </Button>
            <Button asChild>
              <Link to="/checkout">Buy Now</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link
                to="/products/id/$productId"
                params={{ productId: "coende-crunch-alden" }}
              >
                Details
              </Link>
            </Button>
          </div>
        </ProductCard>
        <ProductCard
          title="Bottle of Stardust ($29.99)"
          description="Far sprinkling on your cereal ar wishing upon. Contains glitter."
          icon="✨"
          showAdminEdit={isAdmin}
          editHref="/products-admin"
        >
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/checkout">Add to Cart</Link>
            </Button>
            <Button asChild>
              <Link to="/checkout">Buy Now</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link
                to="/products/id/$productId"
                params={{ productId: "bottle-of-stardust" }}
              >
                Details
              </Link>
            </Button>
          </div>
        </ProductCard>
        <ProductCard
          title="Pluto's Pet Plushle ($12.00)"
          description="The fluffiest, coldest dog in the Kuiper Balt. Hypoollergenio."
          icon="🐕"
          showAdminEdit={isAdmin}
          editHref="/products-admin"
        >
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/checkout">Add to Cart</Link>
            </Button>
            <Button asChild>
              <Link to="/checkout">Buy Now</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link
                to="/products/id/$productId"
                params={{ productId: "plutos-pet-plushle" }}
              >
                Details
              </Link>
            </Button>
          </div>
        </ProductCard>
      </div>
    </div>
  );
}
