'use client';

import { useState, useEffect, useCallback } from 'react';
import { useFeatureGate } from '@/middleware/feature-gate';
import { toast } from 'sonner';

interface UseSubscriptionReturn {
  // User access info
  userAccess: any;
  loading: boolean;
  error: string | null;
  
  // Feature checking
  hasFeature: (feature: string) => boolean;
  checkFeature: (feature: string) => Promise<{ hasAccess: boolean; reason?: string; upgrade?: any }>;
  
  // Usage limits
  checkLimit: (limitType: string, amount?: number) => Promise<{ allowed: boolean; remaining: number; reason?: string }>;
  incrementUsage: (limitType: string, amount?: number) => Promise<{ success: boolean; remaining: number }>;
  
  // Subscription management
  upgradeRequired: (feature: string) => { required: boolean; tier?: string; price?: number; benefits?: string[] };
  
  // Real-time updates
  refreshAccess: () => Promise<void>;
}

export function useSubscription(): UseSubscriptionReturn {
  const [userAccess, setUserAccess] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { checkFeature, checkLimit, getUserAccess } = useFeatureGate();

  // Fetch user access data
  const fetchUserAccess = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const access = await getUserAccess();
      setUserAccess(access);
    } catch (err: any) {
      setError(err.message || 'Failed to load subscription data');
      console.error('Error fetching user access:', err);
    } finally {
      setLoading(false);
    }
  }, [getUserAccess]);

  // Initialize on mount
  useEffect(() => {
    fetchUserAccess();
  }, [fetchUserAccess]);

  // Check if user has a specific feature
  const hasFeature = useCallback((feature: string): boolean => {
    if (!userAccess) return false;
    return userAccess.features?.[feature]?.enabled || false;
  }, [userAccess]);

  // Increment usage for a limit type
  const incrementUsage = useCallback(async (limitType: string, amount: number = 1) => {
    try {
      const response = await fetch('/api/subscription/increment-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limitType, amount }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to increment usage');
      }

      // Refresh user access to get updated usage
      await fetchUserAccess();

      return {
        success: result.success,
        remaining: result.remaining,
      };
    } catch (error: any) {
      console.error('Error incrementing usage:', error);
      return {
        success: false,
        remaining: 0,
      };
    }
  }, [fetchUserAccess]);

  // Check if upgrade is required for a feature
  const upgradeRequired = useCallback((feature: string) => {
    if (!userAccess) {
      return { required: true };
    }

    const hasAccess = hasFeature(feature);
    if (hasAccess) {
      return { required: false };
    }

    // Find upgrade option from user access data
    const upgradeOption = userAccess.upgradeOptions?.find((option: any) => 
      option.features.includes(feature)
    );

    return {
      required: true,
      tier: upgradeOption?.tier,
      price: upgradeOption?.price,
      benefits: upgradeOption?.benefits,
    };
  }, [userAccess, hasFeature]);

  // Refresh access data
  const refreshAccess = useCallback(async () => {
    await fetchUserAccess();
  }, [fetchUserAccess]);

  return {
    userAccess,
    loading,
    error,
    hasFeature,
    checkFeature,
    checkLimit,
    incrementUsage,
    upgradeRequired,
    refreshAccess,
  };
}

// Hook for specific feature gating with UI feedback
export function useFeatureWithFeedback(feature: string) {
  const { hasFeature, upgradeRequired, checkFeature } = useSubscription();
  const [checking, setChecking] = useState(false);

  const checkFeatureWithFeedback = useCallback(async () => {
    setChecking(true);
    try {
      const result = await checkFeature(feature);
      
      if (!result.hasAccess) {
        const upgrade = upgradeRequired(feature);
        if (upgrade.required) {
          toast.error(
            `This feature requires ${upgrade.tier || 'a higher'} tier. Upgrade for $${upgrade.price || 'X'}/month to unlock.`,
            {
              action: {
                label: 'Upgrade',
                onClick: () => window.location.href = '/subscription',
              },
            }
          );
        } else {
          toast.error(result.reason || 'Feature not available');
        }
      }

      return result.hasAccess;
    } catch (error) {
      toast.error('Failed to check feature access');
      return false;
    } finally {
      setChecking(false);
    }
  }, [feature, checkFeature, upgradeRequired]);

  return {
    hasAccess: hasFeature(feature),
    checkWithFeedback: checkFeatureWithFeedback,
    checking,
    upgradeInfo: upgradeRequired(feature),
  };
}

// Hook for usage limits with UI feedback
export function useLimitWithFeedback(limitType: string) {
  const { userAccess, checkLimit, incrementUsage } = useSubscription();
  const [checking, setChecking] = useState(false);
  const [incrementing, setIncrementing] = useState(false);

  const currentLimit = userAccess?.limits?.[limitType];

  const checkLimitWithFeedback = useCallback(async (amount: number = 1) => {
    setChecking(true);
    try {
      const result = await checkLimit(limitType, amount);
      
      if (!result.allowed) {
        toast.error(
          result.reason || 'Usage limit exceeded',
          {
            description: result.resetDate 
              ? `Resets on ${new Date(result.resetDate).toLocaleDateString()}`
              : 'Consider upgrading for higher limits',
            action: {
              label: 'Upgrade',
              onClick: () => window.location.href = '/subscription',
            },
          }
        );
      }

      return result.allowed;
    } catch (error) {
      toast.error('Failed to check usage limit');
      return false;
    } finally {
      setChecking(false);
    }
  }, [limitType, checkLimit]);

  const incrementWithFeedback = useCallback(async (amount: number = 1) => {
    setIncrementing(true);
    try {
      const result = await incrementUsage(limitType, amount);
      
      if (!result.success) {
        toast.error('Failed to update usage');
      } else if (result.remaining <= 5 && result.remaining > 0) {
        // Warning when approaching limit
        toast.warning(
          `You have ${result.remaining} ${limitType.replace(/([A-Z])/g, ' $1').toLowerCase()} remaining this period`,
          {
            action: {
              label: 'Upgrade',
              onClick: () => window.location.href = '/subscription',
            },
          }
        );
      }

      return result.success;
    } catch (error) {
      toast.error('Failed to update usage');
      return false;
    } finally {
      setIncrementing(false);
    }
  }, [limitType, incrementUsage]);

  return {
    limit: currentLimit,
    checkWithFeedback: checkLimitWithFeedback,
    incrementWithFeedback,
    checking,
    incrementing,
    isNearLimit: currentLimit ? (currentLimit.remaining / currentLimit.limit) < 0.2 : false,
    isUnlimited: currentLimit?.limit === -1,
  };
}

// Hook for tracking AI interactions specifically
export function useAIInteractionLimits() {
  const dailyLimit = useLimitWithFeedback('dailyAiInteractions');
  const monthlyLimit = useLimitWithFeedback('monthlyStudyMinutes');
  
  const canMakeInteraction = useCallback(async () => {
    return await dailyLimit.checkWithFeedback(1);
  }, [dailyLimit]);

  const recordInteraction = useCallback(async (studyMinutes: number = 0) => {
    const interactionSuccess = await dailyLimit.incrementWithFeedback(1);
    let minutesSuccess = true;
    
    if (studyMinutes > 0) {
      minutesSuccess = await monthlyLimit.incrementWithFeedback(studyMinutes);
    }
    
    return interactionSuccess && minutesSuccess;
  }, [dailyLimit, monthlyLimit]);

  return {
    dailyInteractions: dailyLimit,
    monthlyMinutes: monthlyLimit,
    canMakeInteraction,
    recordInteraction,
    isLimited: !dailyLimit.isUnlimited || !monthlyLimit.isUnlimited,
  };
}