import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FeatureGatingService } from '@/lib/subscription/feature-gating';

export async function POST(request: NextRequest) {
  try {
    const { limitType, amount = 1 } = await request.json();

    if (!limitType) {
      return NextResponse.json(
        { error: 'Limit type parameter is required' },
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

    // Check usage limit
    const limitCheck = await FeatureGatingService.checkUsageLimit(
      user.id,
      limitType,
      amount
    );

    let upgrade = null;
    if (!limitCheck.allowed) {
      const userAccess = await FeatureGatingService.getUserFeatureAccess(user.id);
      upgrade = FeatureGatingService.getUpgradeSuggestion(userAccess.tier, limitType);
    }

    return NextResponse.json({
      allowed: limitCheck.allowed,
      remaining: limitCheck.remaining,
      resetDate: limitCheck.resetDate,
      reason: limitCheck.reason,
      upgrade,
    });

  } catch (error) {
    console.error('Check limit API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}