'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MessageSquare, Cpu, ThumbsUp, Gauge, Brain, Sparkles } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { cn } from '@/lib/utils';

interface AIMetricsProps {
  data: any;
  loading: boolean;
}

const ASSISTANCE_TYPE_COLORS = {
  hint: '#10b981',
  explanation: '#3b82f6',
  spiral_question: '#8b5cf6',
  full_solution: '#f59e0b',
};

const PROVIDER_COLORS = {
  openai: '#10b981',
  gemini: '#3b82f6',
  fallback: '#ef4444',
};

export function AIMetrics({ data, loading }: AIMetricsProps) {
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
            <Brain className="w-5 h-5" />
            AI Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No AI interaction data available</p>
        </CardContent>
      </Card>
    );
  }

  // Performance metrics
  const performance = data.performance || {};
  const avgResponseTime = performance.avgResponseTime || 0;
  const avgConfidence = performance.avgConfidence || 0;
  const avgTokensUsed = performance.avgTokensUsed || 0;

  // User feedback
  const feedback = data.userFeedback || {};
  const avgRating = feedback.avgRating || 0;
  const helpfulPercentage = feedback.helpfulPercentage || 0;
  const totalRatings = feedback.totalRatings || 0;

  // Prepare chart data
  const assistanceTypeData = Object.entries(data.assistanceTypeDistribution || {}).map(
    ([type, count]) => ({
      type: type.replace('_', ' ').split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' '),
      count: count as number,
      color: ASSISTANCE_TYPE_COLORS[type as keyof typeof ASSISTANCE_TYPE_COLORS] || '#6b7280',
    })
  );

  const providerData = Object.entries(data.providerDistribution || {}).map(
    ([provider, count]) => ({
      provider: provider.charAt(0).toUpperCase() + provider.slice(1),
      count: count as number,
      percentage: ((count as number) / Object.values(data.providerDistribution || {}).reduce((sum: number, val) => sum + (val as number), 0)) * 100,
      color: PROVIDER_COLORS[provider as keyof typeof PROVIDER_COLORS] || '#6b7280',
    })
  );

  // Performance radar data
  const performanceRadarData = [
    {
      metric: 'Speed',
      value: Math.max(0, 100 - (avgResponseTime / 30)), // 3000ms = 0, 0ms = 100
      fullMark: 100,
    },
    {
      metric: 'Confidence',
      value: avgConfidence * 100,
      fullMark: 100,
    },
    {
      metric: 'Efficiency',
      value: Math.max(0, 100 - (avgTokensUsed / 20)), // 2000 tokens = 0, 0 tokens = 100
      fullMark: 100,
    },
    {
      metric: 'Satisfaction',
      value: avgRating * 20, // 5 stars = 100
      fullMark: 100,
    },
    {
      metric: 'Helpfulness',
      value: helpfulPercentage,
      fullMark: 100,
    },
  ];

  const getPerformanceColor = (value: number) => {
    if (value >= 80) return 'text-green-600';
    if (value >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getResponseTimeColor = (ms: number) => {
    if (ms < 1000) return 'text-green-600';
    if (ms < 2000) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <Gauge className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className={cn('text-lg font-bold', getResponseTimeColor(avgResponseTime))}>
              {avgResponseTime}ms
            </div>
            <div className="text-xs text-gray-600">Avg Response</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <Sparkles className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className={cn('text-lg font-bold', getPerformanceColor(avgConfidence * 100))}>
              {(avgConfidence * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600">Confidence</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <Cpu className="w-5 h-5 text-purple-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-purple-900">
              {avgTokensUsed}
            </div>
            <div className="text-xs text-gray-600">Avg Tokens</div>
          </div>
        </div>

        {/* User Satisfaction */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">User Satisfaction</span>
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-600">
                {helpfulPercentage}% helpful
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Progress value={avgRating * 20} className="flex-1 h-2" />
            <Badge variant="secondary">{avgRating.toFixed(1)}/5.0</Badge>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Based on {totalRatings} ratings
          </p>
        </div>

        {/* Performance Radar */}
        {performanceRadarData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Performance Overview</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={performanceRadarData}>
                  <PolarGrid 
                    gridType="polygon"
                    radialLines={false}
                    stroke="#e5e7eb"
                  />
                  <PolarAngleAxis 
                    dataKey="metric" 
                    tick={{ fontSize: 11 }}
                    className="text-gray-600"
                  />
                  <PolarRadiusAxis 
                    domain={[0, 100]}
                    tick={false}
                    axisLine={false}
                  />
                  <Radar 
                    name="Performance" 
                    dataKey="value" 
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    formatter={(value: any) => `${value.toFixed(0)}%`}
                    contentStyle={{
                      background: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Assistance Type Distribution */}
        {assistanceTypeData.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3">Assistance Types</h4>
            <div className="space-y-2">
              {assistanceTypeData.map((type) => {
                const percentage = (type.count / assistanceTypeData.reduce((sum, t) => sum + t.count, 0)) * 100;
                return (
                  <div key={type.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{type.type}</span>
                      <span className="text-xs text-gray-500">{type.count} uses</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: type.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Provider Distribution */}
        {providerData.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium mb-3">AI Provider Usage</h4>
            <div className="space-y-2">
              {providerData.map((provider) => (
                <div key={provider.provider} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: provider.color }}
                    />
                    <span className="text-sm font-medium">{provider.provider}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{provider.count}</Badge>
                    <span className="text-xs text-gray-500">
                      ({provider.percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}