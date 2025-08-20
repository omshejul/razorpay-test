# Supabase Setup for Razorpay Integration

## Prerequisites

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Get your project URL and service role key

## Environment Variables

Add these to your `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL commands from `supabase-schema.sql`

## Tables Created

### `payment_orders`

- Stores all payment orders with status tracking
- Links to authenticated users
- Tracks Razorpay order and payment IDs

### `webhook_events`

- Logs all incoming webhook events
- Stores event payload and verification status
- Tracks processing status

## Features

✅ **Complete Webhook Logging** - All events are logged to database  
✅ **Signature Verification** - HMAC SHA256 verification for security  
✅ **Event Processing** - Handles payment.captured, payment.failed, order.paid, refund.processed  
✅ **Database Integration** - Orders and payments tracked in Supabase  
✅ **User Association** - Payments linked to authenticated users  
✅ **Status Tracking** - Real-time payment status updates

## Webhook Events Handled

- `payment.captured` - Payment successfully completed
- `payment.failed` - Payment failed
- `order.paid` - Order marked as paid
- `refund.processed` - Refund processed

## Security

- Row Level Security (RLS) enabled
- Service role for webhook processing
- User can only view their own orders
- Signature verification for all webhooks
