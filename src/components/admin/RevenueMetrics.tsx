'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DollarSign, TrendingUp, CreditCard, AlertCircle, Zap } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface RevenueMetricsProps {
  data: any;
  loading: boolean;
}

const TIER_COLORS = {
  free: '#94a3b8',
  basic: '#3b82f6',
  pro: '#8b5cf6',
  enterprise: '#f59e0b',
};

const TIER_PRICES = {
  free: 0,
  basic: 19.99,
  pro: 39.99,
  enterprise: 299,
};

export function RevenueMetrics({ data, loading }: RevenueMetricsProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Revenue Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No revenue data available</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate metrics
  const totalMRR = data.totalMRR || 0;
  const totalARR = data.totalARR || 0;
  const arpu = data.averageRevenuePerUser || 0;
  const newSubscriptions = data.newSubscriptions || 0;

  // Prepare chart data
  const revenueGrowthData = Object.entries(data.growthByDay || {}).map(([date, info]: [string, any]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: info.revenue || 0,
    subscriptions: info.count || 0,
  }));

  const tierRevenueData = Object.entries(data.revenueByTier || {}).map(([tier, info]: [string, any]) => ({
    tier: tier.charAt(0).toUpperCase() + tier.slice(1),
    count: info.count || 0,
    revenue: info.revenue || 0,
    color: TIER_COLORS[tier as keyof typeof TIER_COLORS] || '#6b7280',
  }));

  // Calculate growth percentage
  const growthPercentage = revenueGrowthData.length > 1
    ? ((revenueGrowthData[revenueGrowthData.length - 1].revenue - revenueGrowthData[0].revenue) / revenueGrowthData[0].revenue) * 100
    : 0;

  const growthTrend = growthPercentage > 0 ? 'up' : growthPercentage < 0 ? 'down' : 'neutral';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Revenue Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Revenue Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">
              ${totalMRR.toLocaleString()}
            </div>
            <div className="text-sm text-green-600">Monthly Revenue</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">
              ${totalARR.toLocaleString()}
            </div>
            <div className="text-sm text-blue-600">Annual Revenue</div>
          </div>
        </div>

        {/* ARPU and Growth */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Average Revenue Per User</span>
            <span className="text-sm font-semibold">${arpu.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">New Subscriptions</span>
            <Badge variant="secondary">{newSubscriptions}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Revenue Growth</span>
            <span className={cn(
              'text-sm font-semibold flex items-center gap-1',
              growthTrend === 'up' ? 'text-green-600' : 
              growthTrend === 'down' ? 'text-red-600' : 'text-gray-600'
            )}>
              {growthTrend === 'up' ? '↗' : growthTrend === 'down' ? '↘' : '→'}
              {Math.abs(growthPercentage).toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Revenue Growth Chart */}
        {revenueGrowthData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Revenue Trend</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueGrowthData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip 
                    labelFormatter={(label) => `Date: ${label}`}
                    formatter={(value: any, name: string) => [
                      name === 'revenue' ? `$${value.toFixed(2)}` : value, 
                      name === 'revenue' ? 'Revenue' : 'Subscriptions'
                    ]}
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#10b981" 
                    fillOpacity={1} 
                    fill="url(#revenueGradient)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Revenue by Tier */}
        {tierRevenueData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Revenue by Tier</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tierRevenueData}>
                  <XAxis 
                    dataKey="tier" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      name === 'revenue' ? `$${value.toFixed(2)}` : value,
                      name === 'revenue' ? 'Revenue' : 'Users'
                    ]}
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>
                    {tierRevenueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {tierRevenueData.map((tier) => (
                <div key={tier.tier} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: tier.color }}
                    />
                    <span>{tier.tier}</span>
                  </div>
                  <span className="font-medium">{tier.count} users</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Revenue Health Indicators */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium mb-3">Revenue Health</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Churn Rate</span>
              </div>
              <Badge variant={data.churnRate > 5 ? 'destructive' : 'secondary'}>
                {data.churnRate || 0}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Upgrade Rate</span>
              </div>
              <Badge variant="secondary">
                {data.upgradeRate || 0}%
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Failed Payments</span>
              </div>
              <Badge variant={data.failedPayments > 0 ? 'destructive' : 'secondary'}>
                {data.failedPayments || 0}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}