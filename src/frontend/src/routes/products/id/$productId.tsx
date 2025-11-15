import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/products/id/$productId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/products/id/$productId"!</div>;
}
