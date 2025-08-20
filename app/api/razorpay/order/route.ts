import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

export const runtime = "nodejs";

/**
 * Creates a new Razorpay order
 * @param req - NextRequest containing order details
 * @returns NextResponse with order data or error
 */
export async function POST(req: NextRequest) {
  try {
    // Extract order details from request body
    const { amount, currency = "INR", receipt } = await req.json();

    // Validate amount parameter
    if (!amount || Number.isNaN(Number(amount))) {
      return NextResponse.json({ error: "amount required" }, { status: 400 });
    }

    // Initialize Razorpay instance with API credentials
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Convert amount to paise and create order
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100), // Convert rupees to paise
      currency,
      receipt: receipt ?? `rcpt_${Date.now()}`, // Generate receipt if not provided
    });

    return NextResponse.json(order, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
