"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface PayButtonProps {
  amount: number; // still used for button label
  planId?: string;
  planName?: string;
  mode?: "one_time" | "recurring";
  onSuccess?: (info: { valid: boolean; order?: unknown }) => void;
}

export default function PayButton({
  amount,
  planId,
  planName,
  mode = "one_time",
  onSuccess,
}: PayButtonProps) {
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const { data: session } = useSession();

  async function handlePay() {
    try {
      setLoading(true);

      type RazorpayOrderResp = { id: string; amount: number; currency: string };
      type RazorpaySubscriptionResp = {
        id: string;
        short_url?: string;
        status?: string;
      };
      let order: RazorpayOrderResp | null = null;
      let subscription: RazorpaySubscriptionResp | null = null;

      if (mode === "recurring") {
        const subRes = await fetch("/api/razorpay/subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId,
            userEmail: session?.user?.email || null,
          }),
        });
        if (!subRes.ok) throw new Error("subscription failed");
        subscription = await subRes.json(); // { id, short_url, ... }
      } else {
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
        order = await orderRes.json(); // { id, amount, currency, ... }
      }

      // 2) open Razorpay Checkout
      let options: RazorpayOptions;
      if (mode === "one_time") {
        if (!order) throw new Error("order missing");
        options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount: order.amount,
          currency: order.currency,
          name: planName || "Your Store",
          description: planName ? `${planName} subscription` : "Order payment",
          order_id: order.id,
          prefill: {
            name: session?.user?.name || "User",
            email: session?.user?.email || undefined,
          },
          handler: async (response) => {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                plan_id: planId,
                plan_name: planName,
                userEmail: session?.user?.email || null,
              }),
            });
            const data = await verifyRes.json();
            if (data.valid) {
              setCompleted(true);
              onSuccess?.(data);
            }
            alert(data.valid ? "Payment verified" : "Verification failed");
          },
        };
      } else {
        if (!subscription) throw new Error("subscription missing");
        options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          name: planName || "Your Store",
          description: planName ? `${planName} subscription` : "Order payment",
          subscription_id: subscription.id,
          prefill: {
            name: session?.user?.name || "User",
            email: session?.user?.email || undefined,
          },
          handler: async (response) => {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                plan_id: planId,
                plan_name: planName,
                userEmail: session?.user?.email || null,
              }),
            });
            const data = await verifyRes.json();
            if (data.valid) {
              setCompleted(true);
              onSuccess?.(data);
            }
            alert(data.valid ? "Payment verified" : "Verification failed");
          },
        };
      }

      const rzp = new window.Razorpay(options);
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
      {completed
        ? "Purchased"
        : loading
        ? "Processing..."
        : mode === "recurring"
        ? `Subscribe ₹${amount}/mo`
        : `Pay ₹${amount}`}
    </Button>
  );
}
