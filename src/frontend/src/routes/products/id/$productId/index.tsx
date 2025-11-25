import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { doc, getDoc } from "firebase/firestore";
import { firestore, storage } from "@/helpers/firebaseConfig";
import { Product } from "@shared/types/product";
import { AddProductToCartButton } from "@/components/cart"; // fixed import
import { ref, listAll, getDownloadURL } from "firebase/storage";

// Helper to fetch first image from Firebase Storage
async function getFirstProductImage(productId: string): Promise<string | null> {
  try {
    const folderRef = ref(storage, `products/${productId}`);
    const list = await listAll(folderRef);
    if (!list.items.length) return null;
    return await getDownloadURL(list.items[0]);
  } catch (error) {
    console.error("Error fetching product image:", error);
    return null;
  }
}

export const Route = createFileRoute("/products/id/$productId/")({
  loader: async ({ params }) => {
    if (!params.productId) throw new Error("Product ID missing");

    const productRef = doc(firestore, "products", params.productId);
    const productSnapshot = await getDoc(productRef);

    if (!productSnapshot.exists()) throw new Error("Product not found");

    const data = productSnapshot.data();

    // Fetch first image from storage
    const firstImage = await getFirstProductImage(productSnapshot.id);

    const product: Product = {
      id: productSnapshot.id,
      name: data?.name || "",
      price: data?.price || 0,
      description: data?.description || "",
      quantityInStock: data?.quantityInStock || 0,
      isAvailable: data?.isAvailable ?? true, // required property
      images: firstImage ? [firstImage] : [], // attach first image
    };

    return { product };
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

  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      <Button variant="outline" asChild>
        <Link to="/">← Back to shop</Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-[1fr,1.5fr] items-start">
        {/* First image only */}
        <div className="w-full h-64 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-muted-foreground">No Image</span>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">
            {product.name} | ${product.price}
          </h1>
          <p className="text-lg text-muted-foreground">{product.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/checkout">Buy Now</Link>
            </Button>
            <AddProductToCartButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
