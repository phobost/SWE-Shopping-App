import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { columns } from "../../src/components/ui/columns.tsx";
import { DataTable } from "../../src/components/ui/data-table.tsx";
import { useCartContext } from "../helpers/cart/context.tsx";
import { Input } from "@/components/ui/input";
import React, { useState } from "react";
import { runTransaction, Timestamp } from "firebase/firestore";
import { useAuthContext } from "@/helpers/authContext.tsx";
import type { Discount } from "@shared/types/discount";
import { getDiscount } from "../helpers/discount/util";
import { toast } from "sonner";
import { createOrderProvider } from "@/helpers/orders/util.ts";
import { OrderProduct } from "@shared/types/order.ts";
import { useProducts } from "@/helpers/product/context.tsx";
import { firestore } from "@/helpers/firebaseConfig.ts";
import { Product } from "@shared/types/product.ts";

export const Route = createFileRoute("/checkout")({
  component: CheckoutWithOrderProvider,
  beforeLoad: ({ context }) => {
    if (!context.auth.user) {
      throw redirect({ to: "/" });
    }
    return createOrderProvider(context.auth.user.uid);
  },
});

function CheckoutWithOrderProvider() {
  const { provider: Provider } = Route.useRouteContext();

  return (
    <Provider>
      <Checkout />
    </Provider>
  );
}

interface DiscountInputProps {
  discountCode: string;
  setDiscountCode: React.Dispatch<React.SetStateAction<string>>;
  handleApplyDiscount: () => Promise<void>;
  isApplying: boolean;
}

function DiscountInput({
  discountCode,
  setDiscountCode,
  handleApplyDiscount,
  isApplying,
}: DiscountInputProps) {
  return (
    <div className="flex w-full max-w-sm items-center gap-2">
      <Input
        type="text"
        placeholder="Discount Code"
        value={discountCode}
        onChange={(e) => setDiscountCode(e.target.value)}
        disabled={isApplying}
      />
      <Button
        type="submit"
        variant="outline"
        onClick={handleApplyDiscount}
        disabled={isApplying || discountCode.trim() === ""}
      >
        {isApplying ? "Applying..." : "Apply"}
      </Button>
    </div>
  );
}
interface PaymentFormProps {
  totalAmount: number;
  cartEmpty: boolean;
  onPlaceOrder: () => Promise<void>;
  isProcessing: boolean;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}
const initialCardDetails = {
  cardNumber: "",
  cardName: "",
  expiry: "",
  cvc: "",
};

function PaymentForm({
  totalAmount,
  cartEmpty,
  onPlaceOrder,
  isProcessing,
  setIsProcessing,
}: PaymentFormProps) {
  const [cardDetails, setCardDetails] = useState(initialCardDetails);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartEmpty || totalAmount <= 0) return;

    setIsProcessing(true);
    try {
      await onPlaceOrder();
      setCardDetails(initialCardDetails);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const isFormValid =
    Object.values(cardDetails).every((field) => field.trim() !== "") &&
    !isProcessing;

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-xs p-6 space-y-6">
      <h2 className="text-xl font-semibold">Payment Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="cardNumber"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Card Number
          </label>
          <Input
            id="cardNumber"
            name="cardNumber"
            type="text"
            placeholder="0000 0000 0000 0000"
            value={cardDetails.cardNumber}
            onChange={handleChange}
            maxLength={19}
            disabled={isProcessing}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="cardName"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Name on Card
          </label>
          <Input
            id="cardName"
            name="cardName"
            type="text"
            placeholder="Cardholder Name"
            value={cardDetails.cardName}
            onChange={handleChange}
            disabled={isProcessing}
          />
        </div>

        <div className="flex gap-4">
          <div className="space-y-2 w-1/2">
            <label
              htmlFor="expiry"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Expiry Date (MM/YY)
            </label>
            <Input
              id="expiry"
              name="expiry"
              type="text"
              placeholder="MM/YY"
              value={cardDetails.expiry}
              onChange={handleChange}
              maxLength={5}
              disabled={isProcessing}
            />
          </div>
          <div className="space-y-2 w-1/2">
            <label
              htmlFor="cvc"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              CVC
            </label>
            <Input
              id="cvc"
              name="cvc"
              type="text"
              placeholder="123"
              value={cardDetails.cvc}
              onChange={handleChange}
              maxLength={4}
              disabled={isProcessing}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={!isFormValid || totalAmount <= 0}
        >
          {isProcessing
            ? "Processing..."
            : `Pay $${totalAmount.toFixed(2)} & Place Order`}
        </Button>
      </form>
    </div>
  );
}

function Checkout() {
  // Later we can wire this to real cart state or URL params
  const { cartProducts, clearCart } = useCartContext();
  const authContext = useAuthContext();
  const user = authContext.user;
  const { useContext } = Route.useRouteContext();
  const orderContext = useContext();
  const productsContext = useProducts();

  const cartSubtotal = cartProducts.reduce(
    (total, product) => total + product.price * product.cartQuantity,
    0,
  );

  const cartTax = cartSubtotal * 0.0825; //

  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState<null | Discount>(null);
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [discountMessage, setDiscountMessage] = useState("");
  const [isApplying, setIsApplying] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const handleApplyDiscount = async () => {
    setIsApplying(true);
    setDiscountMessage("");
    setAppliedDiscount(0);

    try {
      const codes = discountCode.trim().toLowerCase();
      const discountDoc = (await getDiscount(codes)) as Discount | undefined;

      if (!discountDoc || !discountDoc.percentage) {
        setDiscountMessage("Error: Invalid or expired discount code.");
        setAppliedDiscount(0);
        setDiscount(null);
      } else {
        setDiscount(discountDoc);
        const discountPercentageInteger = discountDoc.percentage;
        const calculatedDiscountAmount =
          cartSubtotal * (discountPercentageInteger * 0.01);
        const percentValue = discountPercentageInteger.toFixed(0);

        setAppliedDiscount(calculatedDiscountAmount);
        setDiscountMessage(
          `Success! ${percentValue}% discount applied (saves $${calculatedDiscountAmount.toFixed(2)}).`,
        );
      }
    } catch (error) {
      console.error("Error applying discount:", error);
      setDiscountMessage("An unexpected error occurred. Please try again.");
      setDiscount(null);
      setAppliedDiscount(0);
    } finally {
      setIsApplying(false);
    }
  };

  const finalCartTotal = Math.max(cartSubtotal + cartTax - appliedDiscount, 0);
  const isEmpty = cartProducts.length === 0;

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error(
        "Simply shouldn't be possible, as this page is unreachable if not a user (and thus not add items to cart).",
      );
      return;
    }

    try {
      const orderProducts: OrderProduct[] = cartProducts.map((cProduct) => {
        return {
          id: cProduct.id,
          name: cProduct.name,
          price: cProduct.price,
          quantityOrdered: cProduct.cartQuantity,
        };
      });
      const updatedProducts: Product[] = cartProducts.map((cProduct) => {
        const { cartQuantity, ...rest } = cProduct;
        rest.quantityInStock = rest.quantityInStock - cartQuantity;
        return rest;
      });
      await runTransaction(firestore, async (transaction) => {
        const { created } = orderContext.firestore
          .transact(transaction)
          .create({
            userId: user.uid,
            products: orderProducts,
            discount,
            total: finalCartTotal,
            timestamp: Timestamp.now(),
          });

        const products = productsContext.data.filter((product) =>
          orderProducts.find((orderProduct) => orderProduct.id == product.id),
        );

        const productTransaction =
          productsContext.firestore.transact(transaction);

        updatedProducts.forEach((product) => {
          productTransaction.update(product);
        });

        console.log(">>>", products);
        console.log("Order successfully placed with ID:", created.id);
        toast.success(
          `Order Placed! Total: $${finalCartTotal.toFixed(2)}. Order ID: '${created.id}'`,
        );
        await clearCart();
      });
    } catch (error) {
      console.error("Error processing order:", error);
      throw new Error("Failed to save order details.");
    }
  };

  return (
    <div className="container mx-auto px-4 py-16 space-y-8">
      <h1 className="text-4xl font-bold">Checkout</h1>

      <p className="text-muted-foreground max-w-xl">
        This is your cart &amp; checkout page. Review your order before
        completing the purchase.
      </p>

      <div className="rounded-lg border bg-card text-card-foreground shadow-xs p-6 space-y-4">
        <h2 className="text-xl font-semibold mb-4">Order summary</h2>

        {isEmpty ? (
          <p className="text-sm text-center py-4">Your cart is empty.</p>
        ) : (
          <>
            <DataTable columns={columns} data={cartProducts} />

            <div className="flex justify-end pt-4">
              <DiscountInput
                discountCode={discountCode}
                setDiscountCode={setDiscountCode}
                handleApplyDiscount={handleApplyDiscount}
                isApplying={isApplying}
              />
            </div>
            {discountMessage && (
              <p
                className={`text-sm text-right ${appliedDiscount > 0 ? "text-green-600" : "text-red-600"}`}
              >
                {discountMessage}
              </p>
            )}

            <div className="space-y-2 pt-4 border-t">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Subtotal:</span>
                <span className="font-medium">${cartSubtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="font-medium">Tax:</span>
                <span className="font-medium">${cartTax.toFixed(2)}</span>
              </div>
              {appliedDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount Applied:</span>
                  <span>-${appliedDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="pt-2 border-t flex justify-between items-center text-lg font-bold">
                <span className="font-semibold">Order Total:</span>
                <span className="font-semibold">
                  ${finalCartTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
      {!isEmpty && user && (
        <PaymentForm
          totalAmount={finalCartTotal}
          cartEmpty={isEmpty}
          onPlaceOrder={handlePlaceOrder}
          isProcessing={isProcessingOrder}
          setIsProcessing={setIsProcessingOrder}
        />
      )}
      <Button variant="outline" asChild>
        <Link to="/">Back to shop</Link>
      </Button>
    </div>
  );
}
