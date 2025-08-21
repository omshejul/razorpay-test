import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { supabase, type PaymentOrder } from "@/lib/supabase";
import { getPlanPricePaise, PLAN_NAMES, type PlanId } from "@/lib/pricing";

export const runtime = "nodejs";

type PaymentOrderInsert = PaymentOrder & {
  plan_id?: string | null;
  plan_name?: string | null;
  email?: string | null;
};

/**
 * Creates a new Razorpay order
 * @param req - NextRequest containing order details
 * @returns NextResponse with order data or error
 */
export async function POST(req: NextRequest) {
  try {
    // Extract order details from request body
    const { planId, currency = "INR", receipt, userEmail } = await req.json();

    // Validate plan parameter
    if (!planId || !["basic", "pro", "premium"].includes(planId)) {
      return NextResponse.json({ error: "invalid plan" }, { status: 400 });
    }

    const plan = planId as PlanId;
    const amountInPaise = getPlanPricePaise(plan);
    const planName = PLAN_NAMES[plan];

    // Initialize Razorpay instance with API credentials
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const receiptId = receipt ?? `rcpt_${Date.now()}`;

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt: receiptId,
    });

    // Look up user UUID if email provided
    let userId: string | undefined;
    if (userEmail) {
      const { data: userData } = await supabase.auth.admin.listUsers();
      const user = userData.users?.find((u) => u.email === userEmail);
      userId = user?.id;
    }

    // Save order to database
    const paymentOrder: PaymentOrderInsert = {
      razorpay_order_id: razorpayOrder.id,
      amount: amountInPaise,
      currency,
      status: "pending",
      user_id: userId,
      receipt: receiptId,
      plan_id: plan,
      plan_name: planName,
      email: userEmail ?? null,
    };

    const { error: dbError } = await supabase
      .from("payment_orders")
      .insert(paymentOrder);

    if (dbError) {
      console.error("Failed to save order to database:", dbError);
      // Still return the Razorpay order even if DB save fails
      return NextResponse.json(razorpayOrder, { status: 200 });
    }

    return NextResponse.json(razorpayOrder, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
