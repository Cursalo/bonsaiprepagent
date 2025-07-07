import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface AdminAnalyticsQuery {
  dateRange?: {
    start: string;
    end: string;
  };
  metrics?: string[];
  granularity?: 'day' | 'week' | 'month';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dateRangeParam = searchParams.get('dateRange');
    const metricsParam = searchParams.get('metrics');
    const granularity = (searchParams.get('granularity') as 'day' | 'week' | 'month') || 'day';

    // Parse date range
    let dateRange = {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      end: new Date().toISOString().split('T')[0], // today
    };

    if (dateRangeParam) {
      try {
        dateRange = JSON.parse(dateRangeParam);
      } catch (e) {
        console.error('Invalid date range format:', e);
      }
    }

    // Parse requested metrics
    const requestedMetrics = metricsParam ? metricsParam.split(',') : [
      'users',
      'usage',
      'revenue',
      'ai_interactions',
      'performance',
      'achievements',
    ];

    const analytics: any = {
      dateRange,
      granularity,
      timestamp: new Date().toISOString(),
    };

    // Fetch different analytics based on requested metrics
    for (const metric of requestedMetrics) {
      switch (metric) {
        case 'users':
          analytics.users = await getUserAnalytics(dateRange);
          break;
        case 'usage':
          analytics.usage = await getUsageAnalytics(dateRange);
          break;
        case 'revenue':
          analytics.revenue = await getRevenueAnalytics(dateRange);
          break;
        case 'ai_interactions':
          analytics.aiInteractions = await getAIInteractionAnalytics(dateRange);
          break;
        case 'performance':
          analytics.performance = await getPerformanceAnalytics(dateRange);
          break;
        case 'achievements':
          analytics.achievements = await getAchievementAnalytics(dateRange);
          break;
        case 'system_health':
          analytics.systemHealth = await getSystemHealthMetrics();
          break;
      }
    }

    return NextResponse.json({
      success: true,
      analytics,
    });

  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

async function getUserAnalytics(dateRange: { start: string; end: string }) {
  try {
    // Total users
    const { count: totalUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    // New users in date range
    const { count: newUsers } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    // Active users (users with AI interactions in the period)
    const { count: activeUsers } = await supabase
      .from('ai_interactions')
      .select('user_id', { count: 'exact', head: true })
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    // Users by subscription tier
    const { data: subscriptionBreakdown } = await supabase
      .from('subscriptions')
      .select('tier')
      .eq('status', 'active');

    const tierCounts = subscriptionBreakdown?.reduce((acc, sub) => {
      acc[sub.tier] = (acc[sub.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // User growth over time
    const { data: userGrowth } = await supabase
      .from('user_profiles')
      .select('created_at')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)
      .order('created_at');

    const growthByDay = userGrowth?.reduce((acc, user) => {
      const date = user.created_at.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    return {
      totalUsers: totalUsers || 0,
      newUsers: newUsers || 0,
      activeUsers: activeUsers || 0,
      subscriptionBreakdown: tierCounts,
      growthByDay,
      retentionRate: activeUsers && totalUsers ? Math.round((activeUsers / totalUsers) * 100) : 0,
    };

  } catch (error) {
    console.error('Error fetching user analytics:', error);
    return null;
  }
}

async function getUsageAnalytics(dateRange: { start: string; end: string }) {
  try {
    // AI interactions
    const { count: totalInteractions } = await supabase
      .from('ai_interactions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    // Study sessions
    const { count: totalSessions } = await supabase
      .from('practice_sessions')
      .select('*', { count: 'exact', head: true })
      .gte('started_at', dateRange.start)
      .lte('started_at', dateRange.end);

    // Question attempts
    const { count: totalQuestions } = await supabase
      .from('user_answers')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    // Usage by platform
    const { data: platformUsage } = await supabase
      .from('ai_interactions')
      .select('request_context')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    const platformCounts = platformUsage?.reduce((acc, interaction) => {
      try {
        const context = JSON.parse(interaction.request_context || '{}');
        const platform = context.detectedPlatform || 'unknown';
        acc[platform] = (acc[platform] || 0) + 1;
      } catch (e) {
        acc.unknown = (acc.unknown || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    // Average session duration
    const { data: sessionDurations } = await supabase
      .from('practice_sessions')
      .select('time_spent')
      .not('time_spent', 'is', null)
      .gte('started_at', dateRange.start)
      .lte('started_at', dateRange.end);

    const avgSessionDuration = sessionDurations?.length 
      ? Math.round(sessionDurations.reduce((sum, s) => sum + (s.time_spent || 0), 0) / sessionDurations.length)
      : 0;

    return {
      totalInteractions: totalInteractions || 0,
      totalSessions: totalSessions || 0,
      totalQuestions: totalQuestions || 0,
      platformUsage: platformCounts,
      avgSessionDuration,
      avgInteractionsPerUser: totalInteractions && totalSessions 
        ? Math.round(totalInteractions / totalSessions * 100) / 100 
        : 0,
    };

  } catch (error) {
    console.error('Error fetching usage analytics:', error);
    return null;
  }
}

async function getRevenueAnalytics(dateRange: { start: string; end: string }) {
  try {
    // Active subscriptions by tier
    const { data: activeSubscriptions } = await supabase
      .from('subscriptions')
      .select('tier, stripe_price_id, current_period_start, current_period_end')
      .eq('status', 'active');

    // Calculate MRR by tier
    const tierPrices = {
      free: 0,
      basic: 19.99,
      pro: 39.99,
      enterprise: 299,
    };

    let totalMRR = 0;
    const revenueByTier: Record<string, { count: number; revenue: number }> = {};

    activeSubscriptions?.forEach(sub => {
      const tier = sub.tier as keyof typeof tierPrices;
      const price = tierPrices[tier] || 0;
      
      if (!revenueByTier[tier]) {
        revenueByTier[tier] = { count: 0, revenue: 0 };
      }
      
      revenueByTier[tier].count++;
      revenueByTier[tier].revenue += price;
      totalMRR += price;
    });

    const totalARR = totalMRR * 12;

    // New subscriptions in period
    const { count: newSubscriptions } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)
      .neq('tier', 'free');

    // Subscription growth over time
    const { data: subscriptionGrowth } = await supabase
      .from('subscriptions')
      .select('created_at, tier')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)
      .neq('tier', 'free')
      .order('created_at');

    const growthByDay = subscriptionGrowth?.reduce((acc, sub) => {
      const date = sub.created_at.split('T')[0];
      if (!acc[date]) acc[date] = { count: 0, revenue: 0 };
      acc[date].count++;
      acc[date].revenue += tierPrices[sub.tier as keyof typeof tierPrices] || 0;
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>) || {};

    return {
      totalMRR,
      totalARR,
      newSubscriptions: newSubscriptions || 0,
      revenueByTier,
      growthByDay,
      averageRevenuePerUser: activeSubscriptions?.length 
        ? Math.round((totalMRR / activeSubscriptions.length) * 100) / 100 
        : 0,
    };

  } catch (error) {
    console.error('Error fetching revenue analytics:', error);
    return null;
  }
}

async function getAIInteractionAnalytics(dateRange: { start: string; end: string }) {
  try {
    // Interactions by provider
    const { data: providerData } = await supabase
      .from('ai_interactions')
      .select('ai_provider')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    const providerCounts = providerData?.reduce((acc, interaction) => {
      acc[interaction.ai_provider] = (acc[interaction.ai_provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Interactions by assistance type
    const { data: assistanceData } = await supabase
      .from('ai_interactions')
      .select('assistance_type')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    const assistanceTypeCounts = assistanceData?.reduce((acc, interaction) => {
      acc[interaction.assistance_type] = (acc[interaction.assistance_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Average response time and confidence
    const { data: performanceData } = await supabase
      .from('ai_interactions')
      .select('response_time_ms, confidence_score, tokens_used')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    const avgResponseTime = performanceData?.length
      ? Math.round(performanceData.reduce((sum, p) => sum + (p.response_time_ms || 0), 0) / performanceData.length)
      : 0;

    const avgConfidence = performanceData?.length
      ? Math.round(performanceData.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / performanceData.length * 100) / 100
      : 0;

    const avgTokensUsed = performanceData?.length
      ? Math.round(performanceData.reduce((sum, p) => sum + (p.tokens_used || 0), 0) / performanceData.length)
      : 0;

    // User feedback ratings
    const { data: feedbackData } = await supabase
      .from('ai_interactions')
      .select('user_rating, user_helpful')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)
      .not('user_rating', 'is', null);

    const avgRating = feedbackData?.length
      ? Math.round(feedbackData.reduce((sum, f) => sum + (f.user_rating || 0), 0) / feedbackData.length * 100) / 100
      : 0;

    const helpfulPercentage = feedbackData?.length
      ? Math.round(feedbackData.filter(f => f.user_helpful).length / feedbackData.length * 100)
      : 0;

    return {
      providerDistribution: providerCounts,
      assistanceTypeDistribution: assistanceTypeCounts,
      performance: {
        avgResponseTime,
        avgConfidence,
        avgTokensUsed,
      },
      userFeedback: {
        avgRating,
        helpfulPercentage,
        totalRatings: feedbackData?.length || 0,
      },
    };

  } catch (error) {
    console.error('Error fetching AI interaction analytics:', error);
    return null;
  }
}

async function getPerformanceAnalytics(dateRange: { start: string; end: string }) {
  try {
    // User performance metrics
    const { data: performanceData } = await supabase
      .from('practice_sessions')
      .select('correct_answers, total_questions, time_spent, user_id')
      .gte('started_at', dateRange.start)
      .lte('started_at', dateRange.end)
      .not('completed_at', 'is', null);

    const totalSessions = performanceData?.length || 0;
    const avgAccuracy = performanceData?.length
      ? Math.round(performanceData.reduce((sum, p) => {
          const accuracy = p.total_questions > 0 ? (p.correct_answers / p.total_questions) : 0;
          return sum + accuracy;
        }, 0) / performanceData.length * 100)
      : 0;

    // Subject performance breakdown
    const { data: subjectData } = await supabase
      .from('user_answers')
      .select('is_correct, question_id, questions(domain)')
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end);

    const subjectPerformance = subjectData?.reduce((acc, answer) => {
      const domain = answer.questions?.domain || 'unknown';
      if (!acc[domain]) {
        acc[domain] = { correct: 0, total: 0 };
      }
      acc[domain].total++;
      if (answer.is_correct) acc[domain].correct++;
      return acc;
    }, {} as Record<string, { correct: number; total: number }>) || {};

    // Convert to percentages
    const subjectAccuracy = Object.entries(subjectPerformance).reduce((acc, [subject, data]) => {
      acc[subject] = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalSessions,
      avgAccuracy,
      subjectAccuracy,
      improvementTrend: await calculateImprovementTrend(dateRange),
    };

  } catch (error) {
    console.error('Error fetching performance analytics:', error);
    return null;
  }
}

async function calculateImprovementTrend(dateRange: { start: string; end: string }) {
  try {
    // Get performance over time to calculate trend
    const { data: trendData } = await supabase
      .from('practice_sessions')
      .select('started_at, correct_answers, total_questions')
      .gte('started_at', dateRange.start)
      .lte('started_at', dateRange.end)
      .not('completed_at', 'is', null)
      .order('started_at');

    if (!trendData || trendData.length < 2) return 0;

    // Group by week and calculate average accuracy
    const weeklyAccuracy: Record<string, { correct: number; total: number }> = {};
    
    trendData.forEach(session => {
      const week = getWeekStart(new Date(session.started_at));
      if (!weeklyAccuracy[week]) {
        weeklyAccuracy[week] = { correct: 0, total: 0 };
      }
      weeklyAccuracy[week].correct += session.correct_answers || 0;
      weeklyAccuracy[week].total += session.total_questions || 0;
    });

    const weeks = Object.keys(weeklyAccuracy).sort();
    if (weeks.length < 2) return 0;

    const firstWeekAccuracy = weeklyAccuracy[weeks[0]].total > 0 
      ? weeklyAccuracy[weeks[0]].correct / weeklyAccuracy[weeks[0]].total 
      : 0;

    const lastWeekAccuracy = weeklyAccuracy[weeks[weeks.length - 1]].total > 0
      ? weeklyAccuracy[weeks[weeks.length - 1]].correct / weeklyAccuracy[weeks[weeks.length - 1]].total
      : 0;

    return Math.round((lastWeekAccuracy - firstWeekAccuracy) * 100);

  } catch (error) {
    console.error('Error calculating improvement trend:', error);
    return 0;
  }
}

function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff)).toISOString().split('T')[0];
}

async function getAchievementAnalytics(dateRange: { start: string; end: string }) {
  try {
    // Total achievements unlocked in period
    const { count: achievementsUnlocked } = await supabase
      .from('user_achievements')
      .select('*', { count: 'exact', head: true })
      .gte('unlocked_at', dateRange.start)
      .lte('unlocked_at', dateRange.end);

    // Most popular achievements
    const { data: popularAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id, achievements(name)')
      .gte('unlocked_at', dateRange.start)
      .lte('unlocked_at', dateRange.end);

    const achievementCounts = popularAchievements?.reduce((acc, ua) => {
      const name = ua.achievements?.name || 'Unknown';
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Average Bonsai level
    const { data: bonsaiLevels } = await supabase
      .from('bonsai_states')
      .select('level');

    const avgLevel = bonsaiLevels?.length
      ? Math.round(bonsaiLevels.reduce((sum, b) => sum + b.level, 0) / bonsaiLevels.length * 100) / 100
      : 0;

    return {
      achievementsUnlocked: achievementsUnlocked || 0,
      popularAchievements: achievementCounts,
      avgBonsaiLevel: avgLevel,
    };

  } catch (error) {
    console.error('Error fetching achievement analytics:', error);
    return null;
  }
}

async function getSystemHealthMetrics() {
  try {
    // Error rates from logs (simplified)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // AI interaction success rate
    const { count: totalInteractions } = await supabase
      .from('ai_interactions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', oneHourAgo.toISOString());

    // Database response time (estimated)
    const startTime = Date.now();
    await supabase.from('user_profiles').select('id').limit(1);
    const dbResponseTime = Date.now() - startTime;

    return {
      uptime: 99.9, // This would be calculated from monitoring service
      dbResponseTime,
      totalInteractionsLastHour: totalInteractions || 0,
      errorRate: 0.1, // This would be calculated from error logs
      activeConnections: 45, // This would come from connection pool metrics
    };

  } catch (error) {
    console.error('Error fetching system health metrics:', error);
    return {
      uptime: 0,
      dbResponseTime: 0,
      totalInteractionsLastHour: 0,
      errorRate: 100,
      activeConnections: 0,
    };
  }
}