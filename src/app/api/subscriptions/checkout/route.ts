import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { StripeService } from '@/lib/stripe/service';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe/config';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, successUrl, cancelUrl } = await request.json();

    // Validate input
    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate price ID
    const validPriceIds = Object.values(SUBSCRIPTION_TIERS)
      .map(tier => tier.priceId)
      .filter(Boolean);

    if (!validPriceIds.includes(priceId)) {
      return NextResponse.json(
        { error: 'Invalid price ID' },
        { status: 400 }
      );
    }

    // Get user data
    const { data: user, error: userError } = await supabase
      .from('user_profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get or create customer
    const customerId = await StripeService.createCustomer(
      userId,
      user.email,
      user.full_name
    );

    // Create checkout session
    const session = await StripeService.createCheckoutSession({
      userId,
      priceId,
      successUrl: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancelUrl: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      customerId,
    });

    return NextResponse.json({ sessionUrl: session.url });
  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}