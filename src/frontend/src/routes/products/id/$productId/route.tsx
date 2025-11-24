import { Button } from "@/components/ui/button";
import { firestore } from "@/helpers/firebaseConfig";
import { Product } from "@shared/types/product";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { doc, getDoc } from "firebase/firestore";

export const Route = createFileRoute("/products/id/$productId")({
  beforeLoad: async ({ params }) => {
    const productRef = doc(firestore, "products", params.productId);
    const productSnapshot = await getDoc(productRef);

    if (!productSnapshot.exists()) {
      throw new Error("Product not found");
    }

    return {
      product: {
        id: productSnapshot.id,
        ...productSnapshot.data(),
      } as Product,
    };
  },
  errorComponent: (err) => (
    <div className="container mx-auto px-4 py-16 space-y-4">
      <h1 className="text-3xl font-bold">{err.error.message}</h1>
      <p className="text-muted-foreground">
        We couldn&apos;t find that item in this quadrant of the galaxy.
      </p>
      <Button asChild>
        <Link to="/">Back to shop</Link>
      </Button>
    </div>
  ),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="flex flex-col justify-center items-center pt-12">
      <div className="w-full container p-10">
        <Outlet />
      </div>
    </div>
  );
}
