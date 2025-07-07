import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FeatureGatingService } from '@/lib/subscription/feature-gating';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe/config';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get comprehensive user feature access
    const userAccess = await FeatureGatingService.getUserFeatureAccess(user.id);

    // Get subscription details
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    // Get tier configuration for comparison
    const tierConfig = SUBSCRIPTION_TIERS[userAccess.tier];

    // Get usage history for the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: usageHistory } = await supabase
      .from('user_usage')
      .select('*')
      .eq('user_id', user.id)
      .gte('period_start', sevenDaysAgo.toISOString())
      .order('period_start', { ascending: false });

    return NextResponse.json({
      tier: userAccess.tier,
      features: userAccess.features,
      limits: userAccess.limits,
      subscription: {
        id: subscription?.id,
        status: subscription?.status || 'inactive',
        currentPeriodStart: subscription?.current_period_start,
        currentPeriodEnd: subscription?.current_period_end,
        stripeCustomerId: subscription?.stripe_customer_id,
        stripeSubscriptionId: subscription?.stripe_subscription_id,
      },
      tierInfo: {
        name: tierConfig.name,
        price: tierConfig.price,
        description: tierConfig.description,
        features: Object.entries(tierConfig.features)
          .filter(([, enabled]) => enabled)
          .map(([feature]) => feature),
        limits: tierConfig.limits,
      },
      usageHistory: usageHistory || [],
      upgradeOptions: getUpgradeOptions(userAccess.tier),
    });

  } catch (error) {
    console.error('User access API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getUpgradeOptions(currentTier: string) {
  const tierHierarchy = ['free', 'basic', 'pro', 'enterprise'];
  const currentIndex = tierHierarchy.indexOf(currentTier);
  
  if (currentIndex === -1 || currentIndex === tierHierarchy.length - 1) {
    return [];
  }
  
  return tierHierarchy.slice(currentIndex + 1).map(tier => {
    const config = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
    return {
      tier,
      name: config.name,
      price: config.price,
      description: config.description,
      priceId: config.priceId,
      features: Object.entries(config.features)
        .filter(([, enabled]) => enabled)
        .map(([feature]) => feature),
      benefits: getBenefitsVsPreviousTier(tier, currentTier),
    };
  });
}

function getBenefitsVsPreviousTier(targetTier: string, currentTier: string) {
  const targetConfig = SUBSCRIPTION_TIERS[targetTier as keyof typeof SUBSCRIPTION_TIERS];
  const currentConfig = SUBSCRIPTION_TIERS[currentTier as keyof typeof SUBSCRIPTION_TIERS];
  
  const benefits: string[] = [];
  
  // Compare features
  Object.entries(targetConfig.features).forEach(([feature, enabled]) => {
    if (enabled && !currentConfig.features[feature as keyof typeof currentConfig.features]) {
      benefits.push(`${feature.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
    }
  });
  
  // Compare limits
  Object.entries(targetConfig.limits).forEach(([limitType, limit]) => {
    const currentLimit = currentConfig.limits[limitType as keyof typeof currentConfig.limits];
    if (limit > currentLimit) {
      const increase = limit === -1 ? 'unlimited' : `${limit}x`;
      benefits.push(`${limitType.replace(/([A-Z])/g, ' $1').toLowerCase()}: ${increase}`);
    }
  });
  
  return benefits;
}