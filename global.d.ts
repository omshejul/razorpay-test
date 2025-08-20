export {};

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: { name?: string; email?: string; contact?: string };
  notes?: Record<string, string>;
  theme?: { color?: string };
  handler?: (res: RazorpayHandlerResponse) => void;
};

type RazorpayInstance = new (options: RazorpayOptions) => {
  open: () => void;
  on: (event: string, cb: (res: any) => void) => void;
};

declare global {
  interface Window {
    Razorpay: RazorpayInstance;
  }
}
