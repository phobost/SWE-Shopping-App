import { ProductEditor } from "@/components/product";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/products/create")({
  beforeLoad: async ({ context }) => {
    if (!context.auth.isAdmin()) {
      throw redirect({ to: "/" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col justify-center items-center pt-12">
      <div className="w-full container p-10">
        <ProductEditor />
      </div>
    </div>
  );
}
