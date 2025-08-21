export {};

declare global {
  type RazorpayHandlerResponse = {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_subscription_id?: string;
    razorpay_signature: string;
  };

  type RazorpayOptions = {
    key: string;
    amount?: number;
    currency?: string;
    name?: string;
    description?: string;
    image?: string;
    order_id?: string;
    subscription_id?: string;
    prefill?: { name?: string; email?: string; contact?: string };
    notes?: Record<string, string>;
    theme?: { color?: string };
    handler?: (res: RazorpayHandlerResponse) => void;
  };

  interface RazorpayInstance {
    open: () => void;
    on: (event: string, cb: (res: unknown) => void) => void;
  }

  interface RazorpayConstructor {
    new (options: RazorpayOptions): RazorpayInstance;
  }

  interface Window {
    Razorpay: RazorpayConstructor;
  }
}
