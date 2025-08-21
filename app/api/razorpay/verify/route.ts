import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

interface PaymentOrderRow {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id: string | null;
  amount: number;
  currency: string;
  status: string;
  user_id: string | null;
  email: string | null;
  plan_id: string | null;
  plan_name: string | null;
  receipt: string;
  created_at: string;
  updated_at: string;
}

interface SubscriptionRow {
  id: string;
  user_id: string | null;
  email: string | null;
  plan_id: string;
  plan_name: string;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  status: string;
  started_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Verifies a Razorpay payment signature to ensure payment authenticity
 * @param req - NextRequest containing payment verification details
 * @returns NextResponse with verification status and order info
 */
export async function POST(req: NextRequest) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    await req.json();

  // Validate required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { valid: false, reason: "missing fields" },
      { status: 400 }
    );
  }

  // Create signature verification string
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;

  // Generate expected signature using HMAC SHA256
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  // Verify signature matches expected value
  const valid = expected === razorpay_signature;

  let updatedOrder: PaymentOrderRow | null = null;
  let dbUpdated = false;
  let dbWarning: string | undefined;
  let subscription: SubscriptionRow | null = null;

  if (valid) {
    // Update order status in database and return updated row
    const { data, error: updateError } = await supabase
      .from("payment_orders")
      .update({
        status: "captured",
        razorpay_payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", razorpay_order_id)
      .select(
        "id, razorpay_order_id, razorpay_payment_id, amount, currency, status, user_id, email, plan_id, plan_name, receipt, created_at, updated_at"
      )
      .single<PaymentOrderRow>();

    if (updateError) {
      console.error("Failed to update payment order:", updateError);
      dbWarning = "Payment verified but database update failed";
    } else if (data) {
      updatedOrder = data;
      dbUpdated = true;

      // Enforce single active subscription per user/email before insert
      if (updatedOrder.user_id || updatedOrder.email) {
        const { data: existingByUser } = updatedOrder.user_id
          ? await supabase
              .from("subscriptions")
              .select("id")
              .eq("user_id", updatedOrder.user_id)
              .eq("status", "active")
              .limit(1)
          : { data: null };

        const { data: existingByEmail } =
          !existingByUser?.length && updatedOrder.email
            ? await supabase
                .from("subscriptions")
                .select("id")
                .eq("email", updatedOrder.email)
                .eq("status", "active")
                .limit(1)
            : { data: null };

        if (
          (existingByUser && existingByUser.length > 0) ||
          (existingByEmail && existingByEmail.length > 0)
        ) {
          return NextResponse.json({
            valid,
            order: updatedOrder,
            subscription: null,
            dbUpdated,
            warning: "already_subscribed",
          });
        }
      }

      // Create subscription record
      const { data: sub, error: subError } = await supabase
        .from("subscriptions")
        .insert({
          user_id: updatedOrder.user_id ?? null,
          email: updatedOrder.email ?? null,
          plan_id: updatedOrder.plan_id ?? "one-time",
          plan_name: updatedOrder.plan_name ?? "Manual Plan",
          razorpay_order_id,
          razorpay_payment_id,
          status: "active",
        })
        .select()
        .single<SubscriptionRow>();

      if (subError) {
        console.error("Failed to create subscription:", subError);
      } else {
        subscription = sub;
      }
    }
  }

  return NextResponse.json(
    {
      valid,
      verification: {
        expected,
        provided: razorpay_signature,
        matches: valid,
      },
      order: updatedOrder,
      subscription,
      dbUpdated,
      warning: dbWarning,
    },
    { status: 200 }
  );
}
