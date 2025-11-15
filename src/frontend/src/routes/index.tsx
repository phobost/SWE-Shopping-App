import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useAuthContext } from "@/helpers/authContext";
import type { ReactNode } from "react";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const { user } = useAuthContext();
  const isAdmin = !!user; // TODO: replace with real admin check when available

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center space-y-4">
        <h1 className="text-8xl font-bold tracking-tight">
          🚀 Blast Off to Savings!
        </h1>
        <p className="text-2xl text-muted-foreground max-w-2xl mx-auto">
          Explore the cosmos of cool stuff! We've got the galaxy's beat deals on
          Moon Rocks, Alien Snacks, and genuine Stardust.
        </p>
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
                to="/products/$productId"
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
                to="/products/$productId"
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
                to="/products/$productId"
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
                to="/products/$productId"
                params={{ productId: "plutos-pet-plushle" }}
              >
                Details
              </Link>
            </Button>
          </div>
        </ProductCard>
      </div>

      <div className="mt-16 text-center">
        {!user ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Ready to get started?</h2>
            <div className="space-x-4">
              <Button asChild>
                <Link to="/signin">Sign In</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/signup">Create Account</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              Where the deals are truly out of this world!
            </h2>
            <Button asChild>
              <Link to="/settings">Go to Settings</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

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
