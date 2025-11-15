import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/products/id/$productId")({
  component: ProductDetails,
});

const PRODUCT_DATA = {
  "moon-rock": {
    name: "Genuine Moon Rock",
    price: "$20.00",
    emoji: "🌑",
    shortDescription:
      "Straight from the Sea of Tranquility. Certified* authentic (*by us).",
  },
  "coende-crunch-alden": {
    name: "Coende Crunch Alden",
    price: "$5.49",
    emoji: "👽",
    shortDescription:
      "Snacks that taste like chicken... if chicken were neon green and crunchy.",
  },
  "bottle-of-stardust": {
    name: "Bottle of Stardust",
    price: "$29.99",
    emoji: "✨",
    shortDescription:
      "For sprinkling on your cereal or wishing upon. Contains glitter.",
  },
  "plutos-pet-plushle": {
    name: "Pluto's Pet Plushle",
    price: "$12.00",
    emoji: "🐕",
    shortDescription:
      "The fluffiest, coldest dog in the Kuiper Belt. Hypoallergenic*.",
  },
} as const;

function ProductDetails() {
  const { productId } = Route.useParams();

  const product = PRODUCT_DATA[productId as keyof typeof PRODUCT_DATA];

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 space-y-4">
        <h1 className="text-3xl font-bold">Product not found</h1>
        <p className="text-muted-foreground">
          We couldn&apos;t find that item in this quadrant of the galaxy.
        </p>
        <Button asChild>
          <Link to="/">Back to shop</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      <Button variant="outline" asChild>
        <Link to="/">← Back to shop</Link>
      </Button>

      <div className="grid gap-8 md:grid-cols-[1fr,1.5fr] items-start">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-40 w-40 items-center justify-center rounded-full border text-6xl bg-card">
            {product.emoji}
          </div>
          <div className="text-2xl font-semibold">{product.price}</div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-lg text-muted-foreground">
            {product.shortDescription}
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/checkout">Buy Now</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/checkout">Add to Cart</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
