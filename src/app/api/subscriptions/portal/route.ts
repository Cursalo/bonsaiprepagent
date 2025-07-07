import { NextRequest, NextResponse } from 'next/server';
import { StripeService } from '@/lib/stripe/service';

export async function POST(request: NextRequest) {
  try {
    const { userId, returnUrl } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing user ID' },
        { status: 400 }
      );
    }

    // Get user's subscription
    const subscription = await StripeService.getUserSubscription(userId);
    
    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 404 }
      );
    }

    // Create billing portal session
    const session = await StripeService.createBillingPortalSession(
      subscription.stripe_customer_id,
      returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings`
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Billing portal session error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    );
  }
}