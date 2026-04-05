"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/stores/cart-store";
import { loadCashfreeScript } from "@/lib/cashfree-client";
import type {
  CashfreeCheckoutOptions,
  CashfreeCheckoutResult,
} from "@/types/cashfree";

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useUser();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const total = getTotalPrice();

  const handlePayment = async () => {
    if (
      !address.name ||
      !address.phone ||
      !address.line1 ||
      !address.city ||
      !address.state ||
      !address.pincode
    ) {
      alert("Please fill in all required address fields");
      return;
    }

    setIsLoading(true);

    try {
      const loaded = await loadCashfreeScript();
      if (!loaded) {
        alert("Failed to load payment gateway. Please try again.");
        setIsLoading(false);
        return;
      }

      // We read environment safely
      const cashfreeEnv =
        process.env.NEXT_PUBLIC_CASHFREE_ENV === "production"
          ? "production"
          : "sandbox";
      const cashfree = window.Cashfree({
        mode: cashfreeEnv,
      });

      // Fetch checkout order ID mapped for products
      const response = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerPhone: address.phone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const orderData = await response.json();
      const paymentSessionId = orderData.payment_session_id;

      if (!paymentSessionId) {
        throw new Error("Invalid payment session ID");
      }

      const checkoutOptions = {
        paymentSessionId: paymentSessionId,
        redirectTarget: "_modal",
      } satisfies CashfreeCheckoutOptions;

      const result: CashfreeCheckoutResult =
        await cashfree.checkout(checkoutOptions);

      if (result.error) {
        console.error("Payment error:", result.error);
        alert("Payment failed or was cancelled. Please try again.");
        return;
      }

      if (result.paymentDetails) {
        try {
          // Verify payment on backend
          const verifyResponse = await fetch("/api/cashfree/verify-product", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: orderData.order_id,
              items: items.map((item) => ({
                product_id: item.id,
                quantity: item.quantity,
              })),
              shippingAddress: address,
            }),
          });

          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json();
            if (verifyData.verified) {
              clearCart();
              router.push("/orders?success=true");
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } else {
            alert(
              "Payment verification failed from server. Please contact support.",
            );
          }
        } catch (e) {
          console.error(e);
          alert("Verification error.");
        }
        return;
      }

      alert("Payment was not completed. Please try again.");
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    router.push("/cart");
    return null;
  }

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />

          <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
            <h1 className="text-3xl font-serif font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Shipping Address Form */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h2 className="font-serif font-bold text-xl">
                      Shipping Address
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name *</Label>
                        <Input
                          value={address.name}
                          onChange={(e) =>
                            setAddress({ ...address, name: e.target.value })
                          }
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number *</Label>
                        <Input
                          value={address.phone}
                          onChange={(e) =>
                            setAddress({ ...address, phone: e.target.value })
                          }
                          placeholder="+91 XXXXXXXXXX"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Address Line 1 *</Label>
                      <Input
                        value={address.line1}
                        onChange={(e) =>
                          setAddress({ ...address, line1: e.target.value })
                        }
                        placeholder="House/Flat No., Building Name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Address Line 2</Label>
                      <Input
                        value={address.line2}
                        onChange={(e) =>
                          setAddress({ ...address, line2: e.target.value })
                        }
                        placeholder="Street, Landmark (optional)"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>City *</Label>
                        <Input
                          value={address.city}
                          onChange={(e) =>
                            setAddress({ ...address, city: e.target.value })
                          }
                          placeholder="City"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>State *</Label>
                        <Input
                          value={address.state}
                          onChange={(e) =>
                            setAddress({ ...address, state: e.target.value })
                          }
                          placeholder="State"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>PIN Code *</Label>
                        <Input
                          value={address.pincode}
                          onChange={(e) =>
                            setAddress({ ...address, pincode: e.target.value })
                          }
                          placeholder="6 digit PIN"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-serif font-bold text-xl">
                      Order Summary
                    </h3>

                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div
                            className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0"
                            style={{ backgroundImage: `url('${item.image}')` }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {item.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                            <p className="text-sm font-bold text-primary">
                              {item.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₹{total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-green-600">FREE</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        ₹{total.toLocaleString()}
                      </span>
                    </div>

                    <Button
                      className="w-full h-12 text-base font-bold shadow-xl shadow-primary/20"
                      onClick={handlePayment}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin mr-2">
                            progress_activity
                          </span>
                          Processing...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined mr-2">
                            payments
                          </span>
                          Pay ₹{total.toLocaleString()}
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Secured by Cashfree. Your payment information is safe.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  );
}
