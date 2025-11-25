import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { doc, getDoc } from "firebase/firestore";
import { firestore, storage } from "@/helpers/firebaseConfig";
import { Product } from "@shared/types/product";
import { AddProductToCardButton } from "@/components/cart";
import { ref, listAll, getDownloadURL } from "firebase/storage";

// Added: helper function to fetch all images from Storage for a product
async function getProductImages(productId: string): Promise<string[]> {
  try {
    const folderRef = ref(storage, `products/${productId}`);
    const list = await listAll(folderRef);
    const urls = await Promise.all(
      list.items.map((item) => getDownloadURL(item)),
    );
    console.log(urls);
    return urls;
  } catch (error) {
    console.error("Error fetching product images:", error);
    return []; // return empty array if folder doesn't exist or error
  }
}

export const Route = createFileRoute("/products/id/$productId")({
  loader: async ({ params }) => {
    if (!params.productId) throw new Error("Product ID missing");

    const productRef = doc(firestore, "products", params.productId);
    const productSnapshot = await getDoc(productRef);

    if (!productSnapshot.exists()) {
      throw new Error("Product not found");
    }

    const productData = productSnapshot.data();

    // Added: fetch images from Storage dynamically using product ID
    const images = await getProductImages(productSnapshot.id);

    const product: Product = {
      id: productSnapshot.id,
      name: productData?.name || "",
      price: productData?.price || 0,
      description: productData?.description || "",
      quantityInStock: productData?.quantityInStock || 0,
      images, // Added: attach images array to product
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
        {/* Image Carousel */}
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory p-2 rounded-lg bg-muted">
          {product.images.length ? (
            product.images.map((url) => (
              <img
                key={url}
                src={url}
                alt={product.name}
                className="w-64 h-64 object-cover rounded-lg snap-center"
              />
            ))
          ) : (
            <div className="text-center text-muted-foreground">
              No images available
            </div>
          )}
        </div>

        {/* Untouched Product Info */}
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">
            {product.name} | ${product.price}
          </h1>
          <p className="text-lg text-muted-foreground">{product.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/checkout">Buy Now</Link>
            </Button>
            <AddProductToCardButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
}
