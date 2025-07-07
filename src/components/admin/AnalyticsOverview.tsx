'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  DollarSign,
  MessageSquare,
  TrendingUp,
  Activity,
  Award,
  Clock,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnalyticsOverviewProps {
  analytics: any;
  loading: boolean;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
  format?: 'number' | 'currency' | 'percentage';
  loading?: boolean;
}

function MetricCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  trend = 'neutral',
  format = 'number',
  loading,
}: MetricCardProps) {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percentage':
        return `${val}%`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '↗';
      case 'down':
        return '↘';
      default:
        return '→';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-100 rounded w-1/2 animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{formatValue(value)}</div>
        {change !== undefined && (
          <div className="flex items-center text-xs mt-1">
            <span className={cn('flex items-center', getTrendColor())}>
              {getTrendIcon()}
              <span className="ml-1">{Math.abs(change)}%</span>
            </span>
            <span className="text-gray-500 ml-1">{changeLabel || 'vs last period'}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function AnalyticsOverview({ analytics, loading }: AnalyticsOverviewProps) {
  const getMetrics = () => {
    if (!analytics) return [];

    return [
      {
        title: 'Total Users',
        value: analytics.users?.totalUsers || 0,
        change: analytics.users?.newUsers 
          ? Math.round((analytics.users.newUsers / (analytics.users.totalUsers - analytics.users.newUsers)) * 100)
          : undefined,
        changeLabel: 'new this period',
        icon: Users,
        trend: (analytics.users?.newUsers > 0 ? 'up' : 'neutral') as 'up' | 'down' | 'neutral',
      },
      {
        title: 'Active Users',
        value: analytics.users?.activeUsers || 0,
        change: analytics.users?.retentionRate,
        changeLabel: 'retention rate',
        icon: Activity,
        trend: ((analytics.users?.retentionRate || 0) > 50 ? 'up' : 'down') as 'up' | 'down' | 'neutral',
        format: 'number' as const,
      },
      {
        title: 'Monthly Revenue',
        value: analytics.revenue?.totalMRR || 0,
        change: analytics.revenue?.newSubscriptions 
          ? Math.round((analytics.revenue.newSubscriptions / Object.values(analytics.revenue.revenueByTier || {}).reduce((sum: number, tier: any) => sum + tier.count, 0)) * 100)
          : undefined,
        changeLabel: 'new subscriptions',
        icon: DollarSign,
        trend: (analytics.revenue?.newSubscriptions > 0 ? 'up' : 'neutral') as 'up' | 'down' | 'neutral',
        format: 'currency' as const,
      },
      {
        title: 'AI Interactions',
        value: analytics.usage?.totalInteractions || 0,
        change: analytics.aiInteractions?.performance?.avgConfidence 
          ? Math.round(analytics.aiInteractions.performance.avgConfidence * 100)
          : undefined,
        changeLabel: 'avg confidence',
        icon: MessageSquare,
        trend: ((analytics.aiInteractions?.performance?.avgConfidence || 0) > 0.8 ? 'up' : 'neutral') as 'up' | 'down' | 'neutral',
      },
      {
        title: 'Study Sessions',
        value: analytics.usage?.totalSessions || 0,
        change: analytics.usage?.avgSessionDuration 
          ? Math.round(analytics.usage.avgSessionDuration / 60)
          : undefined,
        changeLabel: 'avg minutes',
        icon: Clock,
        trend: 'neutral' as 'up' | 'down' | 'neutral',
      },
      {
        title: 'Achievements',
        value: analytics.achievements?.achievementsUnlocked || 0,
        change: analytics.achievements?.avgBonsaiLevel,
        changeLabel: 'avg Bonsai level',
        icon: Award,
        trend: ((analytics.achievements?.avgBonsaiLevel || 0) > 10 ? 'up' : 'neutral') as 'up' | 'down' | 'neutral',
      },
      {
        title: 'Response Time',
        value: analytics.aiInteractions?.performance?.avgResponseTime 
          ? `${Math.round(analytics.aiInteractions.performance.avgResponseTime)}ms`
          : '0ms',
        change: analytics.systemHealth?.dbResponseTime 
          ? Math.round(analytics.systemHealth.dbResponseTime)
          : undefined,
        changeLabel: 'DB response time',
        icon: TrendingUp,
        trend: ((analytics.aiInteractions?.performance?.avgResponseTime || 0) < 2000 ? 'up' : 'down') as 'up' | 'down' | 'neutral',
      },
      {
        title: 'System Health',
        value: analytics.systemHealth?.uptime || 0,
        change: analytics.systemHealth?.errorRate,
        changeLabel: 'error rate',
        icon: Target,
        trend: ((analytics.systemHealth?.uptime || 0) > 99 ? 'up' : 'down') as 'up' | 'down' | 'neutral',
        format: 'percentage' as const,
      },
    ];
  };

  const metrics = getMetrics();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard
          key={index}
          title={metric.title}
          value={metric.value}
          change={metric.change}
          changeLabel={metric.changeLabel}
          icon={metric.icon}
          trend={metric.trend}
          format={metric.format}
          loading={loading}
        />
      ))}
    </div>
  );
}