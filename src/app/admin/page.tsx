'use client';

import { useEffect, useState } from 'react';
import { AnalyticsOverview } from '@/components/admin/AnalyticsOverview';
import { UserMetrics } from '@/components/admin/UserMetrics';
import { RevenueMetrics } from '@/components/admin/RevenueMetrics';
import { AIMetrics } from '@/components/admin/AIMetrics';
import { SystemHealth } from '@/components/admin/SystemHealth';
import { DateRangePicker } from '@/components/admin/DateRangePicker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface DateRange {
  start: string;
  end: string;
}

interface AdminAnalytics {
  users?: any;
  usage?: any;
  revenue?: any;
  aiInteractions?: any;
  performance?: any;
  achievements?: any;
  systemHealth?: any;
  dateRange: DateRange;
  granularity: 'day' | 'week' | 'month';
  timestamp: string;
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        dateRange: JSON.stringify(dateRange),
        granularity,
        metrics: 'users,usage,revenue,ai_interactions,performance,achievements,system_health',
      });

      const response = await fetch(`/api/admin/analytics?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch analytics');
      }

      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, granularity]);

  const handleRefresh = () => {
    fetchAnalytics();
    toast.success('Analytics refreshed');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Monitor platform performance and user engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            granularity={granularity}
            onGranularityChange={setGranularity}
          />
          <Button
            onClick={handleRefresh}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading && !analytics ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        analytics && (
          <>
            {/* Overview Cards */}
            <AnalyticsOverview analytics={analytics} loading={loading} />

            {/* Main Metrics Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <UserMetrics data={analytics.users} loading={loading} />
              <RevenueMetrics data={analytics.revenue} loading={loading} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <AIMetrics data={analytics.aiInteractions} loading={loading} />
              <SystemHealth data={analytics.systemHealth} loading={loading} />
            </div>

            {/* Last Updated */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Last updated: {new Date(analytics.timestamp).toLocaleString()}</span>
                  <span>
                    Data range: {new Date(analytics.dateRange.start).toLocaleDateString()} - {new Date(analytics.dateRange.end).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </>
        )
      )}
    </div>
  );
}