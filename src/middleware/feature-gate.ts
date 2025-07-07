import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FeatureGatingService } from '@/lib/subscription/feature-gating';

/**
 * Feature gate middleware for protecting API routes based on subscription tiers
 */
export interface FeatureGateConfig {
  feature?: string;
  limitType?: string;
  amount?: number;
  tier?: 'basic' | 'pro' | 'enterprise';
}

export function withFeatureGate(config: FeatureGateConfig) {
  return function (handler: (req: NextRequest) => Promise<NextResponse>) {
    return async function (req: NextRequest): Promise<NextResponse> {
      try {
        // Get user from request
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        }

        // Check feature access if specified
        if (config.feature) {
          const featureAccess = await FeatureGatingService.hasFeatureAccess(
            user.id,
            config.feature
          );

          if (!featureAccess.hasAccess) {
            const suggestion = await getUpgradeSuggestion(user.id, config.feature);
            return NextResponse.json(
              {
                error: 'Feature not available',
                reason: featureAccess.reason,
                upgrade: suggestion,
              },
              { status: 403 }
            );
          }
        }

        // Check usage limits if specified
        if (config.limitType) {
          const limitCheck = await FeatureGatingService.checkUsageLimit(
            user.id,
            config.limitType,
            config.amount || 1
          );

          if (!limitCheck.allowed) {
            const suggestion = await getUpgradeSuggestion(user.id, config.limitType);
            return NextResponse.json(
              {
                error: 'Usage limit exceeded',
                reason: limitCheck.reason,
                remaining: limitCheck.remaining,
                resetDate: limitCheck.resetDate,
                upgrade: suggestion,
              },
              { status: 429 }
            );
          }

          // Increment usage after successful check
          await FeatureGatingService.incrementUsage(
            user.id,
            config.limitType,
            config.amount || 1
          );
        }

        // Check minimum tier if specified
        if (config.tier) {
          const userAccess = await FeatureGatingService.getUserFeatureAccess(user.id);
          const tierHierarchy = ['free', 'basic', 'pro', 'enterprise'];
          const userTierIndex = tierHierarchy.indexOf(userAccess.tier);
          const requiredTierIndex = tierHierarchy.indexOf(config.tier);

          if (userTierIndex < requiredTierIndex) {
            const suggestion = await getUpgradeSuggestion(user.id, config.tier);
            return NextResponse.json(
              {
                error: 'Insufficient subscription tier',
                reason: `This feature requires ${config.tier} tier or higher`,
                currentTier: userAccess.tier,
                requiredTier: config.tier,
                upgrade: suggestion,
              },
              { status: 403 }
            );
          }
        }

        // All checks passed, proceed with the original handler
        return await handler(req);
      } catch (error) {
        console.error('Feature gate middleware error:', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * React hook for client-side feature gating
 */
export function useFeatureGate() {
  const checkFeature = async (feature: string): Promise<{
    hasAccess: boolean;
    reason?: string;
    upgrade?: any;
  }> => {
    try {
      const response = await fetch('/api/subscription/check-feature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error checking feature access:', error);
      return { hasAccess: false, reason: 'Error checking access' };
    }
  };

  const checkLimit = async (limitType: string, amount: number = 1): Promise<{
    allowed: boolean;
    remaining: number;
    reason?: string;
    upgrade?: any;
  }> => {
    try {
      const response = await fetch('/api/subscription/check-limit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limitType, amount }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return { allowed: false, remaining: 0, reason: 'Error checking limit' };
    }
  };

  const getUserAccess = async () => {
    try {
      const response = await fetch('/api/subscription/user-access');
      return await response.json();
    } catch (error) {
      console.error('Error getting user access:', error);
      return null;
    }
  };

  return {
    checkFeature,
    checkLimit,
    getUserAccess,
  };
}

/**
 * Component wrapper for feature gating
 */
export interface FeatureGateProps {
  feature?: string;
  tier?: 'basic' | 'pro' | 'enterprise';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export function FeatureGate({
  feature,
  tier,
  children,
  fallback,
  showUpgrade = true,
}: FeatureGateProps) {
  const [hasAccess, setHasAccess] = React.useState<boolean | null>(null);
  const [upgradeInfo, setUpgradeInfo] = React.useState<any>(null);
  const { checkFeature, getUserAccess } = useFeatureGate();

  React.useEffect(() => {
    const checkAccess = async () => {
      if (feature) {
        const result = await checkFeature(feature);
        setHasAccess(result.hasAccess);
        if (!result.hasAccess) {
          setUpgradeInfo(result.upgrade);
        }
      } else if (tier) {
        const userAccess = await getUserAccess();
        if (userAccess) {
          const tierHierarchy = ['free', 'basic', 'pro', 'enterprise'];
          const userTierIndex = tierHierarchy.indexOf(userAccess.tier);
          const requiredTierIndex = tierHierarchy.indexOf(tier);
          setHasAccess(userTierIndex >= requiredTierIndex);
        }
      } else {
        setHasAccess(true);
      }
    };

    checkAccess();
  }, [feature, tier, checkFeature, getUserAccess]);

  if (hasAccess === null) {
    // Loading state
    return (
      <div className="animate-pulse bg-gray-200 rounded h-8 w-full"></div>
    );
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgrade && upgradeInfo) {
      return (
        <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
          <div className="flex items-center mb-2">
            <Shield className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="font-semibold text-yellow-800">Upgrade Required</h3>
          </div>
          <p className="text-sm text-yellow-700 mb-3">
            This feature requires {upgradeInfo.requiredTier} tier or higher.
          </p>
          {upgradeInfo.benefits && (
            <ul className="text-sm text-yellow-700 mb-3 list-disc list-inside">
              {upgradeInfo.benefits.slice(0, 3).map((benefit: string, index: number) => (
                <li key={index}>{benefit}</li>
              ))}
            </ul>
          )}
          <Button size="sm" onClick={() => window.location.href = '/subscription'}>
            Upgrade Now - ${upgradeInfo.price}/month
          </Button>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}

// Helper function to get upgrade suggestions
async function getUpgradeSuggestion(userId: string, feature: string) {
  try {
    const userAccess = await FeatureGatingService.getUserFeatureAccess(userId);
    return FeatureGatingService.getUpgradeSuggestion(userAccess.tier, feature);
  } catch (error) {
    console.error('Error getting upgrade suggestion:', error);
    return null;
  }
}

// Import React for the component
import React from 'react';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';