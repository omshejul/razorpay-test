import posthog from "posthog-js";

// Event names enum for consistency
export enum AnalyticsEvents {
  PAYMENT_INITIATED = "payment_initiated",
  PAYMENT_COMPLETED = "payment_completed",
  PAYMENT_FAILED = "payment_failed",
  SUBSCRIPTION_STARTED = "subscription_started",
  USER_SIGNED_IN = "user_signed_in",
  USER_SIGNED_OUT = "user_signed_out",
}

// Properties interface for type safety
export interface AnalyticsProperties {
  [key: string]: string | number | boolean | null | undefined;
}

export const trackEvent = (
  event: AnalyticsEvents | string,
  properties?: AnalyticsProperties
) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${event}`, properties);
  }
  posthog.capture(event, properties);
};

export const identifyUser = (
  userId: string,
  properties?: AnalyticsProperties
) => {
  posthog.identify(userId, properties);
};

export const resetAnalytics = () => {
  posthog.reset();
};
