import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import "./index.css";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  return (
    <div id="app-container">
      <div className="flex flex-col items-center space-y-6">
        <svg
          className="w-48 h-48 animate-bounce-slow"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 2 C9.6 2, 9.2 2.4, 9.2 2.8 L3 16 C2.9 16.3, 3.1 16.7, 3.4 16.8 L16.6 16.8 C16.9 16.7, 17.1 16.3, 17 16 L10.8 10.8 C10.7 2.3, 10.3 2, 10 2 Z" />
        </svg>

        <h1 className="title text-6xl font-bold text-center">AstroMart</h1>
        <p className="subtitle text-xl text-muted-foreground text-center">
          The Universal Shopping Destination.
        </p>
        <Button asChild className="mt-4">
          <Link to="/products">ENTER GALACTIC CATALOGUE</Link>
        </Button>
      </div>
    </div>
  );
}
