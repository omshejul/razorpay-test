export type PlanId = "basic" | "pro" | "premium";

export const PLAN_PRICES_INR: Record<PlanId, number> = {
  basic: 299,
  pro: 499,
  premium: 999,
};

export const PLAN_NAMES: Record<PlanId, string> = {
  basic: "Basic",
  pro: "Pro",
  premium: "Premium",
};

export function getPlanPricePaise(planId: PlanId): number {
  return PLAN_PRICES_INR[planId] * 100;
}

// Mapping to Razorpay plan IDs for recurring subscriptions
// Set these in your environment (.env):
// RAZORPAY_PLAN_ID_BASIC, RAZORPAY_PLAN_ID_PRO, RAZORPAY_PLAN_ID_PREMIUM
export const PLAN_RAZORPAY_PLAN_IDS: Partial<Record<PlanId, string>> = {
  basic: process.env.RAZORPAY_PLAN_ID_BASIC,
  pro: process.env.RAZORPAY_PLAN_ID_PRO,
  premium: process.env.RAZORPAY_PLAN_ID_PREMIUM,
};

export function getRazorpayPlanId(planId: PlanId): string | null {
  const id = PLAN_RAZORPAY_PLAN_IDS[planId];
  return id ?? null;
}
