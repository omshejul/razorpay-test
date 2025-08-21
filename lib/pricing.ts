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
