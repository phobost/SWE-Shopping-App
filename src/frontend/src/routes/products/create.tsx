import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/products/create")({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAdmin()) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/products/create"!</div>;
}
