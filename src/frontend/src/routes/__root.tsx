import {
  Link,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { AuthContext, useAuthContext } from "../helpers/authContext";
import { Toaster } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserNav } from "@/components/user-nav";
import { Cart } from "@/components/cart";

import "./__root.css";

interface RouterCtx {
  auth: AuthContext;
}

export const Route = createRootRouteWithContext<RouterCtx>()({
  component: RootComponent,
});

function RootComponent() {
  const { user, isAdmin } = useAuthContext();

  return (
    <>
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex gap-2 text-lg items-center">
          <Link
            to="/"
            activeProps={{ className: "font-bold" }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>
          <Link to="/products" activeProps={{ className: "font-bold" }}>
            Products
          </Link>
          <Link to="/orders" activeProps={{ className: "font-bold" }}>
            Orders
          </Link>
          {(() => {
            if (isAdmin()) {
              return (
                <Link
                  to="/admin/discounts"
                  activeProps={{ className: "font-bold" }}
                >
                  Discounts
                </Link>
              );
            }
          })()}
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            {user ? (
              <UserNav />
            ) : (
              <Link to="/signin" activeProps={{ className: "font-bold" }}>
                Sign In
              </Link>
            )}
            <Cart />
          </div>
        </div>
      </div>
      <div id="inner-app">
        <Outlet />
      </div>
      <Toaster richColors />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
