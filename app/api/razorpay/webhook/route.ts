import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

/**
 * Handles Razorpay webhook events with signature verification
 * @param req - NextRequest containing the webhook payload and signature
 * @returns NextResponse indicating webhook processing status
 */
export async function POST(req: NextRequest) {
  const payload = await req.text(); // raw body
  const signature = req.headers.get("x-razorpay-signature") || "";

  // Generate expected signature using HMAC SHA256
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(payload)
    .digest("hex");

  // Verify webhook signature to ensure authenticity
  if (expected !== signature) {
    return NextResponse.json(
      { ok: false, reason: "bad signature" },
      { status: 400 }
    );
  }

  // Parse the verified webhook payload
  const event = JSON.parse(payload);

  // handle events you care about
  // if (event.event === "payment.captured") { ... }

  return NextResponse.json({ ok: true });
}
