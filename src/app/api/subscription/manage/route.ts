import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe/server';
import { SUBSCRIPTION_TIERS } from '@/lib/stripe/config';

interface SubscriptionUpdateRequest {
  action: 'upgrade' | 'downgrade' | 'cancel' | 'reactivate';
  targetTier?: string;
  priceId?: string;
  cancelAtPeriodEnd?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { action, targetTier, priceId, cancelAtPeriodEnd }: SubscriptionUpdateRequest = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action parameter is required' },
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

    // Get current subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    let result;
    switch (action) {
      case 'upgrade':
      case 'downgrade':
        if (!targetTier || !priceId) {
          return NextResponse.json(
            { error: 'Target tier and price ID are required for tier changes' },
            { status: 400 }
          );
        }
        result = await handleTierChange(subscription, targetTier, priceId);
        break;
      
      case 'cancel':
        result = await handleCancellation(subscription, cancelAtPeriodEnd || false);
        break;
      
      case 'reactivate':
        result = await handleReactivation(subscription);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Update subscription in database
    const { data: updatedSubscription, error: updateError } = await supabase
      .from('subscriptions')
      .update(result.updates)
      .eq('id', subscription.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating subscription in database:', updateError);
      return NextResponse.json(
        { error: 'Failed to update subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
      message: result.message,
      stripeResponse: result.stripeResponse,
    });

  } catch (error) {
    console.error('Subscription management API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleTierChange(subscription: any, targetTier: string, priceId: string) {
  try {
    // Validate target tier
    const tierConfig = SUBSCRIPTION_TIERS[targetTier as keyof typeof SUBSCRIPTION_TIERS];
    if (!tierConfig) {
      return {
        success: false,
        error: 'Invalid target tier',
      };
    }

    // Update Stripe subscription
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        items: [
          {
            id: subscription.stripe_subscription_item_id,
            price: priceId,
          },
        ],
        proration_behavior: 'create_prorations',
      }
    );

    const isUpgrade = tierConfig.price > SUBSCRIPTION_TIERS[subscription.tier as keyof typeof SUBSCRIPTION_TIERS].price;
    const action = isUpgrade ? 'upgrade' : 'downgrade';

    return {
      success: true,
      message: `Successfully ${action}d to ${tierConfig.name}`,
      updates: {
        tier: targetTier,
        stripe_price_id: priceId,
        current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      },
      stripeResponse: {
        subscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        currentPeriodEnd: stripeSubscription.current_period_end,
      },
    };
  } catch (error: any) {
    console.error('Error changing subscription tier:', error);
    return {
      success: false,
      error: error.message || 'Failed to change subscription tier',
    };
  }
}

async function handleCancellation(subscription: any, cancelAtPeriodEnd: boolean) {
  try {
    // Cancel Stripe subscription
    let stripeSubscription;
    if (cancelAtPeriodEnd) {
      stripeSubscription = await stripe.subscriptions.update(
        subscription.stripe_subscription_id,
        {
          cancel_at_period_end: true,
        }
      );
    } else {
      stripeSubscription = await stripe.subscriptions.cancel(
        subscription.stripe_subscription_id
      );
    }

    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (!cancelAtPeriodEnd) {
      updates.status = 'canceled';
      updates.canceled_at = new Date().toISOString();
    } else {
      updates.cancel_at_period_end = true;
    }

    return {
      success: true,
      message: cancelAtPeriodEnd 
        ? 'Subscription will be canceled at the end of the billing period'
        : 'Subscription canceled immediately',
      updates,
      stripeResponse: {
        subscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
    };
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel subscription',
    };
  }
}

async function handleReactivation(subscription: any) {
  try {
    // Reactivate Stripe subscription
    const stripeSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: false,
      }
    );

    return {
      success: true,
      message: 'Subscription reactivated successfully',
      updates: {
        cancel_at_period_end: false,
        updated_at: new Date().toISOString(),
      },
      stripeResponse: {
        subscriptionId: stripeSubscription.id,
        status: stripeSubscription.status,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
      },
    };
  } catch (error: any) {
    console.error('Error reactivating subscription:', error);
    return {
      success: false,
      error: error.message || 'Failed to reactivate subscription',
    };
  }
}

// GET endpoint to retrieve subscription management options
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

    // Get current subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const currentTier = subscription?.tier || 'free';
    const currentConfig = SUBSCRIPTION_TIERS[currentTier as keyof typeof SUBSCRIPTION_TIERS];

    // Get available actions based on current state
    const availableActions = [];

    if (subscription?.status === 'active') {
      // Can upgrade, downgrade, or cancel
      const tierHierarchy = ['free', 'basic', 'pro', 'enterprise'];
      const currentIndex = tierHierarchy.indexOf(currentTier);

      // Upgrade options
      if (currentIndex < tierHierarchy.length - 1) {
        for (let i = currentIndex + 1; i < tierHierarchy.length; i++) {
          const tier = tierHierarchy[i];
          const config = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
          availableActions.push({
            action: 'upgrade',
            tier,
            name: config.name,
            price: config.price,
            priceId: config.priceId,
            description: `Upgrade to ${config.name} for ${config.price > 0 ? `$${config.price}/month` : 'free'}`,
          });
        }
      }

      // Downgrade options
      if (currentIndex > 0) {
        for (let i = currentIndex - 1; i >= 0; i--) {
          const tier = tierHierarchy[i];
          const config = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
          availableActions.push({
            action: 'downgrade',
            tier,
            name: config.name,
            price: config.price,
            priceId: config.priceId,
            description: `Downgrade to ${config.name} for ${config.price > 0 ? `$${config.price}/month` : 'free'}`,
          });
        }
      }

      // Cancellation option
      availableActions.push({
        action: 'cancel',
        description: 'Cancel subscription',
        options: [
          {
            type: 'immediate',
            description: 'Cancel immediately',
          },
          {
            type: 'end_of_period',
            description: 'Cancel at end of billing period',
          },
        ],
      });

      // Reactivation option (if cancel_at_period_end is true)
      if (subscription.cancel_at_period_end) {
        availableActions.push({
          action: 'reactivate',
          description: 'Reactivate subscription',
        });
      }
    } else if (subscription?.status === 'canceled' || !subscription) {
      // Can only create new subscription
      const tierHierarchy = ['basic', 'pro', 'enterprise'];
      tierHierarchy.forEach(tier => {
        const config = SUBSCRIPTION_TIERS[tier as keyof typeof SUBSCRIPTION_TIERS];
        availableActions.push({
          action: 'create',
          tier,
          name: config.name,
          price: config.price,
          priceId: config.priceId,
          description: `Subscribe to ${config.name} for $${config.price}/month`,
        });
      });
    }

    return NextResponse.json({
      currentTier,
      currentSubscription: subscription,
      currentPlan: currentConfig,
      availableActions,
    });

  } catch (error) {
    console.error('Get subscription management options error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}