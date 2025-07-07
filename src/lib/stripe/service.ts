import { stripe, SUBSCRIPTION_TIERS, getSubscriptionTier, type SubscriptionTier } from './config';
import { supabase } from '@/lib/supabase/client';
import { createClient } from '@supabase/supabase-js';

// Admin client for server-side operations
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export class StripeService {
  /**
   * Create a Stripe customer and store in database
   */
  static async createCustomer(userId: string, email: string, name?: string) {
    try {
      // Check if customer already exists
      const { data: existingSubscription } = await adminSupabase
        .from('subscriptions')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single();

      if (existingSubscription?.stripe_customer_id) {
        return existingSubscription.stripe_customer_id;
      }

      // Create Stripe customer
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
        },
      });

      // Update subscription record with customer ID
      await adminSupabase
        .from('subscriptions')
        .update({ stripe_customer_id: customer.id })
        .eq('user_id', userId);

      return customer.id;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw new Error('Failed to create customer');
    }
  }

  /**
   * Create a checkout session for subscription
   */
  static async createCheckoutSession({
    userId,
    priceId,
    successUrl,
    cancelUrl,
    customerId,
  }: {
    userId: string;
    priceId: string;
    successUrl: string;
    cancelUrl: string;
    customerId?: string;
  }) {
    try {
      // Get or create customer
      if (!customerId) {
        const { data: userProfile } = await adminSupabase
          .from('user_profiles')
          .select('email, full_name')
          .eq('id', userId)
          .single();

        if (!userProfile) {
          throw new Error('User not found');
        }

        customerId = await this.createCustomer(userId, userProfile.email, userProfile.full_name);
      }

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          userId,
        },
        subscription_data: {
          metadata: {
            userId,
          },
          trial_period_days: 7, // 7-day free trial
        },
        allow_promotion_codes: true,
      });

      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Create a billing portal session
   */
  static async createBillingPortalSession(customerId: string, returnUrl: string) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return session;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw new Error('Failed to create billing portal session');
    }
  }

  /**
   * Handle subscription created webhook
   */
  static async handleSubscriptionCreated(subscription: any) {
    try {
      const userId = subscription.metadata.userId;
      const customerId = subscription.customer;
      const priceId = subscription.items.data[0]?.price.id;
      const tier = getSubscriptionTier(priceId);

      await adminSupabase
        .from('subscriptions')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          stripe_price_id: priceId,
          tier,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          cancel_at_period_end: subscription.cancel_at_period_end,
          daily_ai_interactions_limit: SUBSCRIPTION_TIERS[tier].limits.dailyAiInteractions,
          features_enabled: Object.keys(SUBSCRIPTION_TIERS[tier].features).filter(
            key => SUBSCRIPTION_TIERS[tier].features[key as keyof typeof SUBSCRIPTION_TIERS[typeof tier]['features']]
          ),
        })
        .eq('user_id', userId);

      // Reset daily usage
      await this.resetDailyUsage(userId);

      console.log(`Subscription created for user ${userId}, tier: ${tier}`);
    } catch (error) {
      console.error('Error handling subscription created:', error);
      throw error;
    }
  }

  /**
   * Handle subscription updated webhook
   */
  static async handleSubscriptionUpdated(subscription: any) {
    try {
      const userId = subscription.metadata.userId;
      const priceId = subscription.items.data[0]?.price.id;
      const tier = getSubscriptionTier(priceId);

      await adminSupabase
        .from('subscriptions')
        .update({
          stripe_price_id: priceId,
          tier,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          cancel_at_period_end: subscription.cancel_at_period_end,
          daily_ai_interactions_limit: SUBSCRIPTION_TIERS[tier].limits.dailyAiInteractions,
          features_enabled: Object.keys(SUBSCRIPTION_TIERS[tier].features).filter(
            key => SUBSCRIPTION_TIERS[tier].features[key as keyof typeof SUBSCRIPTION_TIERS[typeof tier]['features']]
          ),
        })
        .eq('stripe_subscription_id', subscription.id);

      console.log(`Subscription updated for user ${userId}, tier: ${tier}`);
    } catch (error) {
      console.error('Error handling subscription updated:', error);
      throw error;
    }
  }

  /**
   * Handle subscription deleted webhook
   */
  static async handleSubscriptionDeleted(subscription: any) {
    try {
      const userId = subscription.metadata.userId;

      // Downgrade to free tier
      await adminSupabase
        .from('subscriptions')
        .update({
          tier: 'free',
          status: 'canceled',
          stripe_subscription_id: null,
          stripe_price_id: null,
          daily_ai_interactions_limit: SUBSCRIPTION_TIERS.free.limits.dailyAiInteractions,
          features_enabled: Object.keys(SUBSCRIPTION_TIERS.free.features).filter(
            key => SUBSCRIPTION_TIERS.free.features[key as keyof typeof SUBSCRIPTION_TIERS['free']['features']]
          ),
        })
        .eq('stripe_subscription_id', subscription.id);

      console.log(`Subscription canceled for user ${userId}, downgraded to free`);
    } catch (error) {
      console.error('Error handling subscription deleted:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment webhook
   */
  static async handlePaymentSucceeded(invoice: any) {
    try {
      const subscriptionId = invoice.subscription;
      
      if (subscriptionId) {
        // Update subscription status to active
        await adminSupabase
          .from('subscriptions')
          .update({ status: 'active' })
          .eq('stripe_subscription_id', subscriptionId);

        console.log(`Payment succeeded for subscription ${subscriptionId}`);
      }
    } catch (error) {
      console.error('Error handling payment succeeded:', error);
      throw error;
    }
  }

  /**
   * Handle failed payment webhook
   */
  static async handlePaymentFailed(invoice: any) {
    try {
      const subscriptionId = invoice.subscription;
      
      if (subscriptionId) {
        // Update subscription status to past_due
        await adminSupabase
          .from('subscriptions')
          .update({ status: 'past_due' })
          .eq('stripe_subscription_id', subscriptionId);

        console.log(`Payment failed for subscription ${subscriptionId}`);
      }
    } catch (error) {
      console.error('Error handling payment failed:', error);
      throw error;
    }
  }

  /**
   * Get user's current subscription
   */
  static async getUserSubscription(userId: string) {
    try {
      const { data } = await adminSupabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .single();

      return data;
    } catch (error) {
      console.error('Error getting user subscription:', error);
      return null;
    }
  }

  /**
   * Check if user can use a feature
   */
  static async canUserUseFeature(userId: string, feature: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) return false;

      const tier = subscription.tier as SubscriptionTier;
      const features = SUBSCRIPTION_TIERS[tier].features;
      
      return features[feature as keyof typeof features] === true;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  /**
   * Check usage limits
   */
  static async checkUsageLimit(userId: string, limitType: string): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription(userId);
      if (!subscription) return false;

      const tier = subscription.tier as SubscriptionTier;
      const limits = SUBSCRIPTION_TIERS[tier].limits;
      const limit = limits[limitType as keyof typeof limits];

      if (limit === -1) return true; // unlimited

      // Get current usage for today
      const today = new Date().toISOString().split('T')[0];
      const { data: usage } = await adminSupabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('date', today)
        .single();

      if (!usage) return true; // no usage yet

      switch (limitType) {
        case 'dailyAiInteractions':
          return usage.ai_interactions_count < limit;
        case 'monthlyStudyMinutes':
          // Implementation would need to sum up monthly usage
          return true; // simplified for now
        default:
          return true;
      }
    } catch (error) {
      console.error('Error checking usage limit:', error);
      return false;
    }
  }

  /**
   * Increment usage counter
   */
  static async incrementUsage(userId: string, usageType: string, amount: number = 1) {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: subscription } = await adminSupabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!subscription) return;

      // Upsert usage record
      await adminSupabase
        .from('usage_tracking')
        .upsert({
          user_id: userId,
          subscription_id: subscription.id,
          date: today,
          [`${usageType}_count`]: amount,
        }, {
          onConflict: 'user_id,date',
          update: [`${usageType}_count`],
        });

    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  }

  /**
   * Reset daily usage (called by cron job)
   */
  static async resetDailyUsage(userId?: string) {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (userId) {
        // Reset for specific user
        await adminSupabase
          .from('usage_tracking')
          .delete()
          .eq('user_id', userId)
          .eq('date', yesterdayStr);
      } else {
        // Reset for all users (daily cleanup)
        await adminSupabase
          .from('usage_tracking')
          .delete()
          .eq('date', yesterdayStr);
      }
    } catch (error) {
      console.error('Error resetting daily usage:', error);
    }
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(subscriptionId: string, immediate: boolean = false) {
    try {
      if (immediate) {
        await stripe.subscriptions.cancel(subscriptionId);
      } else {
        await stripe.subscriptions.update(subscriptionId, {
          cancel_at_period_end: true,
        });
      }
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Resume subscription
   */
  static async resumeSubscription(subscriptionId: string) {
    try {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: false,
      });
    } catch (error) {
      console.error('Error resuming subscription:', error);
      throw new Error('Failed to resume subscription');
    }
  }
}