import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Verifies a Razorpay payment signature to ensure payment authenticity
 * @param req - NextRequest containing payment verification details
 * @returns NextResponse with verification status
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

  if (valid) {
    // Update order status in database
    const { error: updateError } = await supabase
      .from("payment_orders")
      .update({
        status: "captured",
        razorpay_payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", razorpay_order_id);

    if (updateError) {
      console.error("Failed to update payment order:", updateError);
      return NextResponse.json(
        { valid: true, warning: "Payment verified but database update failed" },
        { status: 200 }
      );
    }
  }

  return NextResponse.json({ valid }, { status: 200 });
}
