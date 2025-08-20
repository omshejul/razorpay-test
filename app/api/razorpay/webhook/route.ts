import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase, type WebhookEvent } from "@/lib/supabase";

export const runtime = "nodejs";

/**
 * Handles Razorpay webhook events with signature verification and logging
 * @param req - NextRequest containing the webhook payload and signature
 * @returns NextResponse indicating webhook processing status
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.text(); // raw body
    const signature = req.headers.get("x-razorpay-signature") || "";
    const eventId = req.headers.get("x-razorpay-event-id") || "";

    // Generate expected signature using HMAC SHA256
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(payload)
      .digest("hex");

    // Verify webhook signature to ensure authenticity
    const signatureValid = expected === signature;

    // Parse the webhook payload
    const event = JSON.parse(payload);
    const eventType = event.event || "unknown";

    // Log webhook event to database
    const webhookEvent: WebhookEvent = {
      event_type: eventType,
      event_id: eventId,
      payload: event,
      signature: signature,
      verified: signatureValid,
      processed: false,
    };

    const { data: loggedEvent, error: logError } = await supabase
      .from("webhook_events")
      .insert(webhookEvent)
      .select()
      .single();

    if (logError) {
      console.error("Failed to log webhook event:", logError);
      return NextResponse.json(
        { ok: false, reason: "failed to log event" },
        { status: 500 }
      );
    }

    // If signature is invalid, log and return error
    if (!signatureValid) {
      console.error("Invalid webhook signature for event:", eventType);
      return NextResponse.json(
        { ok: false, reason: "bad signature" },
        { status: 400 }
      );
    }

    // Process different webhook events
    let processingResult = { success: false, message: "Event not processed" };

    switch (eventType) {
      case "payment.captured":
        processingResult = await handlePaymentCaptured(event);
        break;
      case "payment.failed":
        processingResult = await handlePaymentFailed(event);
        break;
      case "order.paid":
        processingResult = await handleOrderPaid(event);
        break;
      case "refund.processed":
        processingResult = await handleRefundProcessed(event);
        break;
      default:
        processingResult = {
          success: true,
          message: `Event ${eventType} logged but not processed`,
        };
    }

    // Update webhook event as processed
    await supabase
      .from("webhook_events")
      .update({ processed: true })
      .eq("id", loggedEvent.id);

    return NextResponse.json({
      ok: true,
      event: eventType,
      processed: processingResult.success,
      message: processingResult.message,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { ok: false, reason: "internal server error" },
      { status: 500 }
    );
  }
}

// Handle payment captured event
async function handlePaymentCaptured(event: {
  payload: { payment: { id: string; order_id: string } };
}) {
  try {
    const { payment } = event.payload;

    // Update order status in database
    const { error } = await supabase
      .from("payment_orders")
      .update({
        status: "captured",
        razorpay_payment_id: payment.id,
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", payment.order_id);

    if (error) {
      console.error("Failed to update payment order:", error);
      return { success: false, message: "Failed to update order status" };
    }

    return { success: true, message: "Payment captured successfully" };
  } catch (error) {
    console.error("Payment captured processing error:", error);
    return { success: false, message: "Error processing payment captured" };
  }
}

// Handle payment failed event
async function handlePaymentFailed(event: {
  payload: { payment: { order_id: string } };
}) {
  try {
    const { payment } = event.payload;

    // Update order status in database
    const { error } = await supabase
      .from("payment_orders")
      .update({
        status: "failed",
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", payment.order_id);

    if (error) {
      console.error("Failed to update payment order:", error);
      return { success: false, message: "Failed to update order status" };
    }

    return { success: true, message: "Payment failed status updated" };
  } catch (error) {
    console.error("Payment failed processing error:", error);
    return { success: false, message: "Error processing payment failed" };
  }
}

// Handle order paid event
async function handleOrderPaid(event: { payload: { order: { id: string } } }) {
  try {
    const { order } = event.payload;

    // Update order status in database
    const { error } = await supabase
      .from("payment_orders")
      .update({
        status: "captured",
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", order.id);

    if (error) {
      console.error("Failed to update payment order:", error);
      return { success: false, message: "Failed to update order status" };
    }

    return { success: true, message: "Order paid status updated" };
  } catch (error) {
    console.error("Order paid processing error:", error);
    return { success: false, message: "Error processing order paid" };
  }
}

// Handle refund processed event
async function handleRefundProcessed(event: {
  payload: { refund: { order_id: string } };
}) {
  try {
    const { refund } = event.payload;

    // Update order status in database
    const { error } = await supabase
      .from("payment_orders")
      .update({
        status: "refunded",
        updated_at: new Date().toISOString(),
      })
      .eq("razorpay_order_id", refund.order_id);

    if (error) {
      console.error("Failed to update payment order:", error);
      return { success: false, message: "Failed to update order status" };
    }

    return { success: true, message: "Refund processed successfully" };
  } catch (error) {
    console.error("Refund processed error:", error);
    return { success: false, message: "Error processing refund" };
  }
}
