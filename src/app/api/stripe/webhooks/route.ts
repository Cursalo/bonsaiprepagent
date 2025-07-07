import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe, STRIPE_WEBHOOK_EVENTS } from '@/lib/stripe/config';
import { StripeService } from '@/lib/stripe/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing STRIPE_WEBHOOK_SECRET');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    console.log(`Received Stripe webhook: ${event.type}`);

    // Handle the event
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          await StripeService.handleSubscriptionCreated(event.data.object);
          break;

        case 'customer.subscription.updated':
          await StripeService.handleSubscriptionUpdated(event.data.object);
          break;

        case 'customer.subscription.deleted':
          await StripeService.handleSubscriptionDeleted(event.data.object);
          break;

        case 'invoice.payment_succeeded':
          await StripeService.handlePaymentSucceeded(event.data.object);
          break;

        case 'invoice.payment_failed':
          await StripeService.handlePaymentFailed(event.data.object);
          break;

        case 'customer.created':
          console.log('Customer created:', event.data.object.id);
          break;

        case 'customer.updated':
          console.log('Customer updated:', event.data.object.id);
          break;

        case 'payment_method.attached':
          console.log('Payment method attached:', event.data.object.id);
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return NextResponse.json({ received: true });
    } catch (error) {
      console.error(`Error handling webhook ${event.type}:`, error);
      return NextResponse.json(
        { error: 'Webhook handler failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}