import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { supabase, type PaymentOrder } from "@/lib/supabase";
import { getPlanPricePaise, PLAN_NAMES, type PlanId } from "@/lib/pricing";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

    // Determine effective user identity
    type BasicUser = { email?: string | null };
    type BasicSession = { user?: BasicUser | null };
    const session = (await getServerSession(
      authOptions
    )) as BasicSession | null;
    const effectiveEmail = session?.user?.email ?? userEmail ?? null;

    // Resolve user UUID if we have an email
    let userId: string | undefined;
    if (effectiveEmail) {
      const { data: userData } = await supabase.auth.admin.listUsers();
      const user = userData.users?.find((u) => u.email === effectiveEmail);
      userId = user?.id;
    }

    // Enforce single active subscription per user
    if (userId || effectiveEmail) {
      const { data: existingByUser } = userId
        ? await supabase
            .from("subscriptions")
            .select("id")
            .eq("user_id", userId)
            .eq("status", "active")
            .limit(1)
        : { data: null };

      const { data: existingByEmail } =
        !existingByUser?.length && effectiveEmail
          ? await supabase
              .from("subscriptions")
              .select("id")
              .eq("email", effectiveEmail)
              .eq("status", "active")
              .limit(1)
          : { data: null };

      if (
        (existingByUser && existingByUser.length > 0) ||
        (existingByEmail && existingByEmail.length > 0)
      ) {
        return NextResponse.json(
          { error: "already_subscribed" },
          { status: 409 }
        );
      }
    }

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
      email: effectiveEmail ?? null,
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
