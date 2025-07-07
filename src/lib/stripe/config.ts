// Stripe temporarily disabled for deployment
export const stripe = null;

// Subscription tier configuration
export const SUBSCRIPTION_TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: null,
    features: {
      aiInteractionsPerDay: 5,
      voiceCommands: false,
      advancedAnalytics: false,
      prioritySupport: false,
      customBonsai: false,
      spiralQuestions: false,
      performancePredictions: false,
      studyPlanning: false,
      offlineMode: false,
    },
    limits: {
      dailyAiInteractions: 5,
      monthlyStudyMinutes: 300, // 5 hours
      savedQuestions: 50,
      practiceTests: 1,
    }
  },
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 19.99,
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
    features: {
      aiInteractionsPerDay: 50,
      voiceCommands: true,
      advancedAnalytics: true,
      prioritySupport: false,
      customBonsai: true,
      spiralQuestions: true,
      performancePredictions: true,
      studyPlanning: true,
      offlineMode: false,
    },
    limits: {
      dailyAiInteractions: 50,
      monthlyStudyMinutes: 3000, // 50 hours
      savedQuestions: 500,
      practiceTests: 10,
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 39.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    features: {
      aiInteractionsPerDay: -1, // unlimited
      voiceCommands: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customBonsai: true,
      spiralQuestions: true,
      performancePredictions: true,
      studyPlanning: true,
      offlineMode: true,
    },
    limits: {
      dailyAiInteractions: -1, // unlimited
      monthlyStudyMinutes: -1, // unlimited
      savedQuestions: -1, // unlimited
      practiceTests: -1, // unlimited
    }
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    features: {
      aiInteractionsPerDay: -1, // unlimited
      voiceCommands: true,
      advancedAnalytics: true,
      prioritySupport: true,
      customBonsai: true,
      spiralQuestions: true,
      performancePredictions: true,
      studyPlanning: true,
      offlineMode: true,
      whiteLabel: true,
      apiAccess: true,
      customIntegrations: true,
      dedicatedSupport: true,
    },
    limits: {
      dailyAiInteractions: -1, // unlimited
      monthlyStudyMinutes: -1, // unlimited
      savedQuestions: -1, // unlimited
      practiceTests: -1, // unlimited
      users: 100, // per organization
    }
  }
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// Stripe webhook events we handle
export const STRIPE_WEBHOOK_EVENTS = [
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
  'invoice.payment_succeeded',
  'invoice.payment_failed',
  'customer.created',
  'customer.updated',
  'payment_method.attached',
] as const;

// Helper functions
export function getSubscriptionTier(priceId: string | null): SubscriptionTier {
  if (!priceId) return 'free';
  
  for (const [tier, config] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (config.priceId === priceId) {
      return tier as SubscriptionTier;
    }
  }
  
  return 'free';
}

export function getTierFeatures(tier: SubscriptionTier) {
  return SUBSCRIPTION_TIERS[tier].features;
}

export function getTierLimits(tier: SubscriptionTier) {
  return SUBSCRIPTION_TIERS[tier].limits;
}

export function canUseFeature(userTier: SubscriptionTier, feature: keyof typeof SUBSCRIPTION_TIERS.free.features): boolean {
  return Boolean(SUBSCRIPTION_TIERS[userTier].features[feature]);
}

export function checkUsageLimit(
  userTier: SubscriptionTier, 
  limitType: keyof typeof SUBSCRIPTION_TIERS.free.limits, 
  currentUsage: number
): boolean {
  const limit = SUBSCRIPTION_TIERS[userTier].limits[limitType];
  return limit === -1 || currentUsage < limit;
}