import { createClient } from '@/lib/supabase/client';
import { SUBSCRIPTION_TIERS, type SubscriptionTier } from '@/lib/stripe/config';

export interface FeatureGate {
  feature: string;
  tier: SubscriptionTier;
  enabled: boolean;
  limit?: number;
  used?: number;
  resetPeriod?: 'daily' | 'monthly' | 'never';
}

export interface UserFeatureAccess {
  tier: SubscriptionTier;
  features: Record<string, FeatureGate>;
  limits: Record<string, {
    limit: number;
    used: number;
    remaining: number;
    resetDate?: Date;
  }>;
}

export class FeatureGatingService {
  private static supabase = createClient();

  /**
   * Get user's current subscription tier and feature access
   */
  static async getUserFeatureAccess(userId: string): Promise<UserFeatureAccess> {
    try {
      // Get user's current subscription
      const { data: subscription } = await this.supabase
        .from('subscriptions')
        .select('tier, status, current_period_start, current_period_end')
        .eq('user_id', userId)
        .eq('status', 'active')
        .single();

      const userTier: SubscriptionTier = subscription?.tier || 'free';
      const tierConfig = SUBSCRIPTION_TIERS[userTier];

      // Get current usage
      const usage = await this.getCurrentUsage(userId);

      // Build feature access object
      const features: Record<string, FeatureGate> = {};
      const limits: Record<string, any> = {};

      // Process each feature
      Object.entries(tierConfig.features).forEach(([feature, enabled]) => {
        features[feature] = {
          feature,
          tier: userTier,
          enabled: enabled as boolean,
        };
      });

      // Process limits
      Object.entries(tierConfig.limits).forEach(([limitType, limit]) => {
        const used = usage[limitType] || 0;
        limits[limitType] = {
          limit,
          used,
          remaining: Math.max(0, limit - used),
          resetDate: this.getResetDate(limitType, subscription?.current_period_start),
        };
      });

      return {
        tier: userTier,
        features,
        limits,
      };
    } catch (error) {
      console.error('Error getting user feature access:', error);
      // Return free tier defaults on error
      return this.getFreeUserAccess();
    }
  }

  /**
   * Check if user has access to a specific feature
   */
  static async hasFeatureAccess(
    userId: string,
    feature: string
  ): Promise<{ hasAccess: boolean; reason?: string }> {
    const access = await this.getUserFeatureAccess(userId);
    const featureGate = access.features[feature];

    if (!featureGate) {
      return { hasAccess: false, reason: 'Feature not found' };
    }

    if (!featureGate.enabled) {
      return {
        hasAccess: false,
        reason: `Feature requires ${this.getRequiredTierForFeature(feature)} tier or higher`,
      };
    }

    return { hasAccess: true };
  }

  /**
   * Check if user is within usage limits for a specific limit type
   */
  static async checkUsageLimit(
    userId: string,
    limitType: string,
    requestedAmount: number = 1
  ): Promise<{ allowed: boolean; remaining: number; resetDate?: Date; reason?: string }> {
    const access = await this.getUserFeatureAccess(userId);
    const limit = access.limits[limitType];

    if (!limit) {
      return { allowed: false, remaining: 0, reason: 'Limit type not found' };
    }

    const wouldExceed = limit.used + requestedAmount > limit.limit;

    if (wouldExceed) {
      return {
        allowed: false,
        remaining: limit.remaining,
        resetDate: limit.resetDate,
        reason: `Usage limit exceeded. ${limit.remaining} remaining until ${limit.resetDate?.toLocaleDateString()}`,
      };
    }

    return {
      allowed: true,
      remaining: limit.remaining - requestedAmount,
      resetDate: limit.resetDate,
    };
  }

  /**
   * Increment usage for a specific limit type
   */
  static async incrementUsage(
    userId: string,
    limitType: string,
    amount: number = 1
  ): Promise<{ success: boolean; newUsage: number; remaining: number }> {
    try {
      const access = await this.getUserFeatureAccess(userId);
      const limit = access.limits[limitType];

      if (!limit) {
        throw new Error('Limit type not found');
      }

      // Get current date for proper period tracking
      const now = new Date();
      const periodStart = this.getPeriodStart(limitType, now);

      // Update or create usage record
      const { data, error } = await this.supabase
        .from('user_usage')
        .upsert(
          {
            user_id: userId,
            limit_type: limitType,
            usage_count: limit.used + amount,
            period_start: periodStart.toISOString(),
            updated_at: now.toISOString(),
          },
          {
            onConflict: 'user_id,limit_type,period_start',
          }
        )
        .select()
        .single();

      if (error) throw error;

      const newUsage = data.usage_count;
      const remaining = Math.max(0, limit.limit - newUsage);

      return {
        success: true,
        newUsage,
        remaining,
      };
    } catch (error) {
      console.error('Error incrementing usage:', error);
      return {
        success: false,
        newUsage: 0,
        remaining: 0,
      };
    }
  }

  /**
   * Get upgrade suggestions for features user doesn't have access to
   */
  static getUpgradeSuggestion(currentTier: SubscriptionTier, feature: string): {
    requiredTier: SubscriptionTier;
    benefits: string[];
    price: number;
  } | null {
    const requiredTier = this.getRequiredTierForFeature(feature);
    
    if (!requiredTier || currentTier === requiredTier) {
      return null;
    }

    const tierConfig = SUBSCRIPTION_TIERS[requiredTier];
    const currentConfig = SUBSCRIPTION_TIERS[currentTier];

    // Find benefits of upgrading
    const benefits: string[] = [];
    
    // Compare features
    Object.entries(tierConfig.features).forEach(([feat, enabled]) => {
      if (enabled && !currentConfig.features[feat as keyof typeof currentConfig.features]) {
        benefits.push(this.getFeatureDisplayName(feat));
      }
    });

    // Compare limits
    Object.entries(tierConfig.limits).forEach(([limitType, limit]) => {
      const currentLimit = currentConfig.limits[limitType as keyof typeof currentConfig.limits];
      if (limit > currentLimit) {
        benefits.push(`${this.getLimitDisplayName(limitType)}: ${limit} (vs ${currentLimit})`);
      }
    });

    return {
      requiredTier,
      benefits,
      price: tierConfig.price,
    };
  }

  /**
   * Private helper methods
   */
  private static async getCurrentUsage(userId: string): Promise<Record<string, number>> {
    try {
      const now = new Date();
      const usage: Record<string, number> = {};

      // Get daily limits
      const dailyStart = this.getPeriodStart('daily', now);
      const { data: dailyUsage } = await this.supabase
        .from('user_usage')
        .select('limit_type, usage_count')
        .eq('user_id', userId)
        .gte('period_start', dailyStart.toISOString());

      dailyUsage?.forEach(record => {
        if (record.limit_type.includes('daily') || record.limit_type.includes('Day')) {
          usage[record.limit_type] = record.usage_count;
        }
      });

      // Get monthly limits
      const monthlyStart = this.getPeriodStart('monthly', now);
      const { data: monthlyUsage } = await this.supabase
        .from('user_usage')
        .select('limit_type, usage_count')
        .eq('user_id', userId)
        .gte('period_start', monthlyStart.toISOString());

      monthlyUsage?.forEach(record => {
        if (record.limit_type.includes('monthly') || record.limit_type.includes('Month')) {
          usage[record.limit_type] = record.usage_count;
        }
      });

      return usage;
    } catch (error) {
      console.error('Error getting current usage:', error);
      return {};
    }
  }

  private static getFreeUserAccess(): UserFeatureAccess {
    const freeConfig = SUBSCRIPTION_TIERS.free;
    const features: Record<string, FeatureGate> = {};
    const limits: Record<string, any> = {};

    Object.entries(freeConfig.features).forEach(([feature, enabled]) => {
      features[feature] = {
        feature,
        tier: 'free',
        enabled: enabled as boolean,
      };
    });

    Object.entries(freeConfig.limits).forEach(([limitType, limit]) => {
      limits[limitType] = {
        limit,
        used: 0,
        remaining: limit,
      };
    });

    return { tier: 'free', features, limits };
  }

  private static getRequiredTierForFeature(feature: string): SubscriptionTier {
    const tiers: SubscriptionTier[] = ['free', 'basic', 'pro', 'enterprise'];
    
    for (const tier of tiers) {
      const config = SUBSCRIPTION_TIERS[tier];
      if (config.features[feature as keyof typeof config.features]) {
        return tier;
      }
    }
    
    return 'enterprise'; // Default to highest tier
  }

  private static getPeriodStart(limitType: string, date: Date): Date {
    if (limitType.includes('daily') || limitType.includes('Day')) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    
    if (limitType.includes('monthly') || limitType.includes('Month')) {
      return new Date(date.getFullYear(), date.getMonth(), 1);
    }
    
    // Default to daily
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private static getResetDate(limitType: string, periodStart?: string): Date | undefined {
    if (!periodStart) return undefined;
    
    const start = new Date(periodStart);
    
    if (limitType.includes('daily') || limitType.includes('Day')) {
      const reset = new Date(start);
      reset.setDate(reset.getDate() + 1);
      return reset;
    }
    
    if (limitType.includes('monthly') || limitType.includes('Month')) {
      const reset = new Date(start);
      reset.setMonth(reset.getMonth() + 1);
      return reset;
    }
    
    return undefined;
  }

  private static getFeatureDisplayName(feature: string): string {
    const displayNames: Record<string, string> = {
      voiceCommands: 'Voice Commands',
      advancedAnalytics: 'Advanced Analytics',
      prioritySupport: 'Priority Support',
      customBranding: 'Custom Branding',
      apiAccess: 'API Access',
      bulkOperations: 'Bulk Operations',
      advancedIntegrations: 'Advanced Integrations',
      whiteLabeling: 'White Labeling',
      customDomains: 'Custom Domains',
      ssoIntegration: 'SSO Integration',
      advancedReporting: 'Advanced Reporting',
      customFields: 'Custom Fields',
      auditLogs: 'Audit Logs',
    };
    
    return displayNames[feature] || feature;
  }

  private static getLimitDisplayName(limitType: string): string {
    const displayNames: Record<string, string> = {
      dailyAiInteractions: 'Daily AI Interactions',
      monthlyStudyMinutes: 'Monthly Study Minutes',
      savedQuestions: 'Saved Questions',
      practiceTests: 'Practice Tests',
      customQuestions: 'Custom Questions',
      teamMembers: 'Team Members',
      storageGb: 'Storage (GB)',
      apiCallsPerMonth: 'API Calls per Month',
    };
    
    return displayNames[limitType] || limitType;
  }
}