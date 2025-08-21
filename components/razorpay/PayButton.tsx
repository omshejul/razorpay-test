"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface PayButtonProps {
  amount: number; // still used for button label
  planId?: string;
  planName?: string;
  onSuccess?: (info: { valid: boolean; order?: unknown }) => void;
}

export default function PayButton({
  amount,
  planId,
  planName,
  onSuccess,
}: PayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { data: session } = useSession();

  async function handlePay() {
    try {
      setLoading(true);

      // 1) ask server to create an order using trusted server-side pricing
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          userEmail: session?.user?.email || null,
        }),
      });

      if (!orderRes.ok) throw new Error("order failed");
      const order = await orderRes.json(); // { id, amount, currency, ... }

      // 2) open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount, // from server (paise)
        currency: order.currency,
        name: planName || "Your Store",
        description: planName ? `${planName} subscription` : "Order payment",
        order_id: order.id,
        prefill: {
          name: session?.user?.name || "User",
          email: session?.user?.email || undefined,
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // 3) verify signature on server
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const data = await verifyRes.json();
          if (data.valid) {
            setCompleted(true);
            onSuccess?.(data);
          }
          alert(data.valid ? "Payment verified" : "Verification failed");
        },
      };

      const rzp = new (window as { Razorpay: typeof window.Razorpay }).Razorpay(
        options
      );
      rzp.on("payment.failed", (e: unknown) => {
        console.error(e);
        alert("Payment failed");
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      onClick={handlePay}
      disabled={loading || completed}
      variant="default"
      size="lg"
    >
      {completed ? "Purchased" : loading ? "Processing..." : `Pay ₹${amount}`}
    </Button>
  );
}
