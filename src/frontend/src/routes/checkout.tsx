import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { columns } from "../../src/components/ui/columns.tsx";
import { DataTable } from "../../src/components/ui/data-table.tsx";
import { useCartContext } from "../helpers/cart/context.tsx";
import { Input } from "@/components/ui/input"
import React, { useState } from 'react';
import { collection, query, where, getDocs, Firestore } from "firebase/firestore";
import { firestore } from "../helpers/firebaseConfig.ts";

export const Route = createFileRoute("/checkout")({ component: Checkout });

interface DiscountDocument {
    id: string;
    percentage: number;
}

interface DiscountInputProps {
    discountCode: string;
    setDiscountCode: React.Dispatch<React.SetStateAction<string>>;
    handleApplyDiscount: () => Promise<void>;
    isApplying: boolean;
}

function DiscountInput({ discountCode, setDiscountCode, handleApplyDiscount, isApplying }: DiscountInputProps) {
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
                disabled={isApplying || discountCode.trim() === ''}
            >
                {isApplying ? 'Applying...' : 'Apply'}
            </Button>
        </div>
    )
}

function Checkout() {
  // Later we can wire this to real cart state or URL params
  const { cartProducts } = useCartContext();

  const cartSubtotal = cartProducts.reduce(
    (total, product) => total + product.price * product.cartQuantity,
    0,
  );

  const cartTax = cartSubtotal * 0.0825; //

  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0); 
  const [discountMessage, setDiscountMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyDiscount = async () => {
    setIsApplying(true);
    setDiscountMessage('');
    setAppliedDiscount(0);

      try {
            const codesRef = collection(firestore, "discounts");
            const q = query(codesRef, where("id", "==", discountCode.trim().toLowerCase()));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setDiscountMessage("Error: Invalid or expired discount code.");
                setAppliedDiscount(0);
            } else {
                const discountDoc = querySnapshot.docs[0].data() as DiscountDocument;
                const discountPercentageInteger = discountDoc.percentage;
                const calculatedDiscountAmount = cartSubtotal * (discountPercentageInteger * 0.01);
                const percentValue = discountPercentageInteger.toFixed(0);
                
                setAppliedDiscount(calculatedDiscountAmount);
                setDiscountMessage(`Success! ${percentValue}% discount applied (saves $${calculatedDiscountAmount.toFixed(2)}).`);
            }
        } catch (error) {
            console.error("Error applying discount:", error);
            setDiscountMessage("An unexpected error occurred. Please try again.");
            setAppliedDiscount(0);
        } finally {
            setIsApplying(false);
        }
    };



  const finalCartTotal = cartSubtotal + cartTax - appliedDiscount;

  const isEmpty = cartProducts.length === 0;


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
                <p className={`text-sm text-right ${appliedDiscount > 0 ? 'text-green-600' : 'text-red-600'}`}>
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
                <span className="font-semibold">${finalCartTotal.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
        <Button className="w-full" disabled={cartProducts.length === 0}>
          Complete Purchase (coming soon! Needs planning for processing payment)
        </Button>
      </div>
      <Button variant="outline" asChild>
        <Link to="/">Back to shop</Link>
      </Button>

    </div>
  );
}
