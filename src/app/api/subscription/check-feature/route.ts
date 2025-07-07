import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FeatureGatingService } from '@/lib/subscription/feature-gating';

export async function POST(request: NextRequest) {
  try {
    const { feature } = await request.json();

    if (!feature) {
      return NextResponse.json(
        { error: 'Feature parameter is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check feature access
    const featureAccess = await FeatureGatingService.hasFeatureAccess(
      user.id,
      feature
    );

    let upgrade = null;
    if (!featureAccess.hasAccess) {
      const userAccess = await FeatureGatingService.getUserFeatureAccess(user.id);
      upgrade = FeatureGatingService.getUpgradeSuggestion(userAccess.tier, feature);
    }

    return NextResponse.json({
      hasAccess: featureAccess.hasAccess,
      reason: featureAccess.reason,
      upgrade,
    });

  } catch (error) {
    console.error('Check feature API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}