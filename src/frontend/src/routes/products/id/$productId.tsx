import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { doc, getDoc } from "firebase/firestore";
import { firestore } from "@/helpers/firebaseConfig";
import { Product } from "@shared/types/product";
import { AddProductToCardButton } from "@/components/cart";

export const Route = createFileRoute("/products/id/$productId")({
  loader: async ({ params }) => {
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
  component: ProductDetails,
  errorComponent: () => (
    <div className="container mx-auto px-4 py-16 space-y-4">
      <h1 className="text-3xl font-bold">Product not found</h1>
      <p className="text-muted-foreground">
        We couldn&apos;t find that item in this quadrant of the galaxy.
      </p>
      <Button asChild>
        <Link to="/">Back to shop</Link>
      </Button>
    </div>
  ),
});

function ProductDetails() {
  const { product } = Route.useLoaderData();
  const isAvailable = product.isAvailable !== false;

  // TODO: Include the image of the product
  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      <Button variant="outline" asChild>
        <Link to="/">← Back to shop</Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-[1fr,1.5fr] items-start">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">
            {product.name} | ${product.price}
          </h1>
          <p className="text-lg text-muted-foreground">{product.description}</p>

          {isAvailable ? (
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/checkout">Buy Now</Link>
              </Button>
              <AddProductToCardButton product={product} />
            </div>
          ) : (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground">
                This product is no longer available for purchase.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
