import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  loader: ({ context }) => {
    if (!context.user?.isAdmin) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/admin/"!</div>;
}
