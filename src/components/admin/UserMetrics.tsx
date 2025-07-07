'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, UserPlus, UserCheck, Crown } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

interface UserMetricsProps {
  data: any;
  loading: boolean;
}

const TIER_COLORS = {
  free: '#94a3b8',
  basic: '#3b82f6',
  pro: '#8b5cf6',
  enterprise: '#f59e0b',
};

export function UserMetrics({ data, loading }: UserMetricsProps) {
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
            <Users className="w-5 h-5" />
            User Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No user data available</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const growthData = Object.entries(data.growthByDay || {}).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: count,
  }));

  const subscriptionData = Object.entries(data.subscriptionBreakdown || {}).map(([tier, count]) => ({
    name: tier.charAt(0).toUpperCase() + tier.slice(1),
    value: count,
    color: TIER_COLORS[tier as keyof typeof TIER_COLORS] || '#6b7280',
  }));

  const retentionPercentage = data.retentionRate || 0;
  const retentionColor = retentionPercentage > 70 ? 'text-green-600' : retentionPercentage > 40 ? 'text-yellow-600' : 'text-red-600';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          User Analytics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <UserPlus className="w-6 h-6 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{data.newUsers || 0}</div>
            <div className="text-sm text-blue-600">New Users</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <UserCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{data.activeUsers || 0}</div>
            <div className="text-sm text-green-600">Active Users</div>
          </div>
        </div>

        {/* User Retention */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">User Retention</span>
            <span className={`text-sm font-semibold ${retentionColor}`}>
              {retentionPercentage}%
            </span>
          </div>
          <Progress value={retentionPercentage} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">
            Percentage of total users who were active this period
          </p>
        </div>

        {/* User Growth Chart */}
        {growthData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">User Growth</h4>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip 
                    labelFormatter={(label) => `Date: ${label}`}
                    formatter={(value) => [value, 'New Users']}
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Subscription Breakdown */}
        {subscriptionData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Subscription Tiers</h4>
            <div className="flex items-center justify-between">
              <div className="h-24 w-24">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={subscriptionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={40}
                      dataKey="value"
                    >
                      {subscriptionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [value, 'Users']}
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 ml-4 space-y-2">
                {subscriptionData.map((tier) => (
                  <div key={tier.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tier.color }}
                      />
                      <span className="text-sm">{tier.name}</span>
                      {tier.name === 'Enterprise' && (
                        <Crown className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    <Badge variant="secondary">{tier.value}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {data.totalUsers || 0}
              </div>
              <div className="text-xs text-gray-500">Total Users</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">
                {((data.activeUsers || 0) / (data.totalUsers || 1) * 100).toFixed(1)}%
              </div>
              <div className="text-xs text-gray-500">Activity Rate</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}