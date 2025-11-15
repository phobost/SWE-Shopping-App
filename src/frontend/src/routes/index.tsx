import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { useAuthContext } from "@/helpers/authContext";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const { user } = useAuthContext();

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
        <Button asChild>
          <Link to="/products">See Products</Link>
        </Button>
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
          </div>
        )}
      </div>
    </div>
  );
}
