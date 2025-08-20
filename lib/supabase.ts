import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Database types
export interface WebhookEvent {
  id?: string;
  event_type: string;
  event_id: string;
  payload: unknown;
  signature: string;
  verified: boolean;
  processed: boolean;
  created_at?: string;
}

export interface PaymentOrder {
  id?: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  amount: number;
  currency: string;
  status: "pending" | "captured" | "failed" | "refunded";
  user_id?: string;
  receipt: string;
  created_at?: string;
  updated_at?: string;
}
