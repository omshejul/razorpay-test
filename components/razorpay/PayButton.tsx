"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function PayButton({ amount }: { amount: number }) {
  const [loading, setLoading] = useState(false);

  async function handlePay() {
    try {
      setLoading(true);

      // 1) ask server to create an order
      const orderRes = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }), // rupees
      });

      if (!orderRes.ok) throw new Error("order failed");
      const order = await orderRes.json(); // { id, amount, currency, ... }

      // 2) open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount, // paise from server
        currency: order.currency,
        name: "Your Store",
        description: "Order payment",
        order_id: order.id,
        prefill: { name: "Om", email: "contact@omshejul.com" },
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
          const { valid } = await verifyRes.json();
          if (valid) {
            alert("Payment verified");
          } else {
            alert("Verification failed");
          }
        },
      };

      const rzp = new window.Razorpay(options as any);
      rzp.on("payment.failed", (e: any) => {
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
      disabled={loading}
      variant="default"
      size="lg"
    >
      {loading ? "Processing..." : `Pay ₹${amount}`}
    </Button>
  );
}
