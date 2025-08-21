import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { getRazorpayPlanId, PLAN_NAMES, type PlanId } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { planId, userEmail } = (await req.json()) as {
      planId: PlanId;
      userEmail?: string | null;
    };

    if (!planId || !["basic", "pro", "premium"].includes(planId)) {
      return NextResponse.json({ error: "invalid plan" }, { status: 400 });
    }

    const razorpayPlanId = getRazorpayPlanId(planId);
    if (!razorpayPlanId) {
      return NextResponse.json(
        {
          error: "plan_not_configured",
          hint: `Set RAZORPAY_PLAN_ID_${planId.toUpperCase()}`,
        },
        { status: 400 }
      );
    }

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Optional: resolve Supabase user id for reference
    let userId: string | undefined;
    if (userEmail) {
      const { data: userData } = await supabase.auth.admin.listUsers();
      const user = userData.users?.find((u) => u.email === userEmail);
      userId = user?.id;
    }

    const sub = await razorpay.subscriptions.create({
      plan_id: razorpayPlanId,
      customer_notify: 1,
      total_count: 12, // 12 months
      notes: {
        planId,
        planName: PLAN_NAMES[planId],
        userEmail: userEmail ?? "",
        userId: userId ?? "",
      },
    });

    return NextResponse.json(sub, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
