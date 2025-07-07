'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Crown,
  Zap,
  Shield,
  Star,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  CreditCard,
  TrendingUp,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface SubscriptionData {
  tier: string;
  features: Record<string, any>;
  limits: Record<string, any>;
  subscription: {
    id?: string;
    status: string;
    currentPeriodStart?: string;
    currentPeriodEnd?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
  };
  tierInfo: {
    name: string;
    price: number;
    description: string;
    features: string[];
    limits: Record<string, number>;
  };
  usageHistory: any[];
  upgradeOptions: Array<{
    tier: string;
    name: string;
    price: number;
    priceId: string;
    description: string;
    features: string[];
    benefits: string[];
  }>;
}

interface ManagementOptions {
  currentTier: string;
  currentSubscription: any;
  currentPlan: any;
  availableActions: Array<{
    action: string;
    tier?: string;
    name?: string;
    price?: number;
    priceId?: string;
    description: string;
    options?: Array<{
      type: string;
      description: string;
    }>;
  }>;
}

const TIER_ICONS = {
  free: Shield,
  basic: Zap,
  pro: Star,
  enterprise: Crown,
};

const TIER_COLORS = {
  free: 'bg-gray-50 border-gray-200',
  basic: 'bg-blue-50 border-blue-200',
  pro: 'bg-purple-50 border-purple-200',
  enterprise: 'bg-amber-50 border-amber-200',
};

export function SubscriptionManager() {
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [managementOptions, setManagementOptions] = useState<ManagementOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSubscriptionData();
    fetchManagementOptions();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/subscription/user-access');
      if (response.ok) {
        const data = await response.json();
        setSubscriptionData(data);
      }
    } catch (error) {
      console.error('Error fetching subscription data:', error);
      toast.error('Failed to load subscription data');
    }
  };

  const fetchManagementOptions = async () => {
    try {
      const response = await fetch('/api/subscription/manage');
      if (response.ok) {
        const data = await response.json();
        setManagementOptions(data);
      }
    } catch (error) {
      console.error('Error fetching management options:', error);
      toast.error('Failed to load management options');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionAction = async (action: any) => {
    setActionLoading(action.action);
    try {
      let endpoint = '/api/subscription/manage';
      let body: any = { action: action.action };

      if (action.action === 'upgrade' || action.action === 'downgrade') {
        body.targetTier = action.tier;
        body.priceId = action.priceId;
      } else if (action.action === 'cancel') {
        body.cancelAtPeriodEnd = action.type === 'end_of_period';
      } else if (action.action === 'create') {
        // Redirect to Stripe Checkout for new subscriptions
        endpoint = '/api/stripe/create-checkout-session';
        body = { priceId: action.priceId, tier: action.tier };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Action failed');
      }

      if (result.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = result.checkoutUrl;
        return;
      }

      toast.success(result.message || 'Action completed successfully');
      await fetchSubscriptionData();
      await fetchManagementOptions();
      setShowConfirmDialog(false);
      setSelectedAction(null);
    } catch (error: any) {
      console.error('Error performing subscription action:', error);
      toast.error(error.message || 'Action failed');
    } finally {
      setActionLoading(null);
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'upgrade':
        return <TrendingUp className="w-4 h-4" />;
      case 'downgrade':
        return <TrendingDown className="w-4 h-4" />;
      case 'cancel':
        return <XCircle className="w-4 h-4" />;
      case 'reactivate':
        return <RefreshCw className="w-4 h-4" />;
      case 'create':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'upgrade':
      case 'create':
        return 'bg-green-600 hover:bg-green-700';
      case 'downgrade':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'cancel':
        return 'bg-red-600 hover:bg-red-700';
      case 'reactivate':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!subscriptionData || !managementOptions) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Unable to load subscription information. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  const TierIcon = TIER_ICONS[subscriptionData.tier as keyof typeof TIER_ICONS] || Shield;

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card className={cn('border-2', TIER_COLORS[subscriptionData.tier as keyof typeof TIER_COLORS])}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TierIcon className="w-8 h-8 text-gray-600" />
              <div>
                <CardTitle className="flex items-center gap-2">
                  {subscriptionData.tierInfo.name}
                  {subscriptionData.tier !== 'free' && (
                    <Badge variant="secondary">
                      ${subscriptionData.tierInfo.price}/month
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>{subscriptionData.tierInfo.description}</CardDescription>
              </div>
            </div>
            <Badge
              variant={subscriptionData.subscription.status === 'active' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {subscriptionData.subscription.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Subscription Period Info */}
          {subscriptionData.subscription.currentPeriodEnd && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>
                Current period ends: {' '}
                {new Date(subscriptionData.subscription.currentPeriodEnd).toLocaleDateString()}
              </span>
            </div>
          )}

          {/* Usage Overview */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Usage This Period</h4>
            {Object.entries(subscriptionData.limits).map(([limitType, limit]: [string, any]) => {
              const percentage = limit.limit === -1 ? 0 : (limit.used / limit.limit) * 100;
              const isUnlimited = limit.limit === -1;
              
              return (
                <div key={limitType} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize">
                      {limitType.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <span className={cn(
                      'font-medium',
                      percentage > 90 && !isUnlimited ? 'text-red-600' : 
                      percentage > 70 && !isUnlimited ? 'text-yellow-600' : 'text-green-600'
                    )}>
                      {isUnlimited ? 'Unlimited' : `${limit.used} / ${limit.limit}`}
                    </span>
                  </div>
                  {!isUnlimited && (
                    <Progress value={percentage} className="h-2" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Features List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Current Features</h4>
            <div className="grid grid-cols-2 gap-2">
              {subscriptionData.tierInfo.features.map((feature) => (
                <div key={feature} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-3 h-3 text-green-600" />
                  <span className="capitalize">
                    {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Actions */}
      {managementOptions.availableActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Manage Subscription</CardTitle>
            <CardDescription>
              Upgrade, downgrade, or manage your subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {managementOptions.availableActions.map((action, index) => (
                <div key={index}>
                  {action.action === 'cancel' && action.options ? (
                    // Cancel with options
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-red-700">Cancel Subscription</h4>
                      {action.options.map((option, optionIndex) => (
                        <Button
                          key={optionIndex}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start border-red-200 text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedAction({ ...action, type: option.type });
                            setShowConfirmDialog(true);
                          }}
                          disabled={actionLoading !== null}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          {option.description}
                        </Button>
                      ))}
                    </div>
                  ) : (
                    // Regular action button
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        'w-full justify-start text-white border-0',
                        getActionColor(action.action)
                      )}
                      onClick={() => {
                        setSelectedAction(action);
                        setShowConfirmDialog(true);
                      }}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === action.action ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        getActionIcon(action.action)
                      )}
                      {action.description}
                      {action.price !== undefined && action.price > 0 && (
                        <Badge variant="secondary" className="ml-auto">
                          ${action.price}/month
                        </Badge>
                      )}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Options */}
      {subscriptionData.upgradeOptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upgrade Options</CardTitle>
            <CardDescription>
              Unlock more features and higher limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {subscriptionData.upgradeOptions.map((option) => {
                const OptionIcon = TIER_ICONS[option.tier as keyof typeof TIER_ICONS] || Star;
                return (
                  <Card key={option.tier} className="relative">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <OptionIcon className="w-5 h-5" />
                        <CardTitle className="text-lg">{option.name}</CardTitle>
                        <Badge variant="outline">${option.price}/month</Badge>
                      </div>
                      <CardDescription>{option.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <h5 className="text-sm font-medium mb-2">New Benefits:</h5>
                        <ul className="text-sm space-y-1">
                          {option.benefits.slice(0, 3).map((benefit, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="capitalize">{benefit}</span>
                            </li>
                          ))}
                          {option.benefits.length > 3 && (
                            <li className="text-gray-500">
                              +{option.benefits.length - 3} more features
                            </li>
                          )}
                        </ul>
                      </div>
                      <Button
                        className="w-full"
                        onClick={() => {
                          setSelectedAction({
                            action: 'upgrade',
                            tier: option.tier,
                            priceId: option.priceId,
                            name: option.name,
                            price: option.price,
                          });
                          setShowConfirmDialog(true);
                        }}
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === 'upgrade' ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <TrendingUp className="w-4 h-4 mr-2" />
                        )}
                        Upgrade to {option.name}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Confirm {selectedAction?.action === 'create' ? 'Subscription' : 'Change'}
            </DialogTitle>
            <DialogDescription>
              {selectedAction && (
                <span>
                  Are you sure you want to {selectedAction.action === 'create' ? 'subscribe to' : selectedAction.action}{' '}
                  {selectedAction.name || selectedAction.description}?
                  {selectedAction.price !== undefined && selectedAction.price > 0 && (
                    <> This will cost ${selectedAction.price}/month.</>
                  )}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowConfirmDialog(false);
                setSelectedAction(null);
              }}
              disabled={actionLoading !== null}
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedAction && handleSubscriptionAction(selectedAction)}
              disabled={actionLoading !== null}
              className={cn(
                selectedAction && getActionColor(selectedAction.action)
              )}
            >
              {actionLoading ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                selectedAction && getActionIcon(selectedAction.action)
              )}
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}