'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Server,
  Zap,
  AlertCircle,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemHealthProps {
  data: any;
  loading: boolean;
}

interface HealthStatus {
  level: 'healthy' | 'warning' | 'critical';
  message: string;
  color: string;
  icon: React.ComponentType<{ className?: string }>;
}

const getHealthStatus = (data: any): HealthStatus => {
  if (!data) {
    return {
      level: 'critical',
      message: 'No health data available',
      color: 'text-red-600',
      icon: AlertTriangle,
    };
  }

  const { uptime = 0, errorRate = 100, dbResponseTime = 9999 } = data;

  if (uptime < 95 || errorRate > 5 || dbResponseTime > 1000) {
    return {
      level: 'critical',
      message: 'System experiencing issues',
      color: 'text-red-600',
      icon: AlertTriangle,
    };
  }

  if (uptime < 99 || errorRate > 1 || dbResponseTime > 500) {
    return {
      level: 'warning',
      message: 'Minor degradation detected',
      color: 'text-yellow-600',
      icon: AlertCircle,
    };
  }

  return {
    level: 'healthy',
    message: 'All systems operational',
    color: 'text-green-600',
    icon: CheckCircle,
  };
};

const getMetricStatus = (value: number, thresholds: { good: number; warning: number }, isHigherBetter = true) => {
  if (isHigherBetter) {
    if (value >= thresholds.good) return 'good';
    if (value >= thresholds.warning) return 'warning';
    return 'critical';
  } else {
    if (value <= thresholds.good) return 'good';
    if (value <= thresholds.warning) return 'warning';
    return 'critical';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'good':
      return 'text-green-600 bg-green-50';
    case 'warning':
      return 'text-yellow-600 bg-yellow-50';
    case 'critical':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export function SystemHealth({ data, loading }: SystemHealthProps) {
  const [realtimeMetrics, setRealtimeMetrics] = useState(data);
  const healthStatus = getHealthStatus(realtimeMetrics || data);

  // Simulate real-time updates
  useEffect(() => {
    if (!data) return () => {};

    const interval = setInterval(() => {
      setRealtimeMetrics((prev: any) => ({
        ...prev,
        activeConnections: Math.floor(Math.random() * 20) + (prev?.activeConnections || 40),
        dbResponseTime: Math.floor(Math.random() * 100) + (prev?.dbResponseTime || 100),
        totalInteractionsLastHour: Math.floor(Math.random() * 10) + (prev?.totalInteractionsLastHour || 100),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [data]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = realtimeMetrics || data || {};
  const {
    uptime = 0,
    dbResponseTime = 0,
    totalInteractionsLastHour = 0,
    errorRate = 0,
    activeConnections = 0,
  } = metrics;

  const uptimeStatus = getMetricStatus(uptime, { good: 99.9, warning: 99 });
  const dbStatus = getMetricStatus(dbResponseTime, { good: 100, warning: 500 }, false);
  const errorStatus = getMetricStatus(errorRate, { good: 0.1, warning: 1 }, false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          System Health
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Health Status */}
        <Alert className={cn(
          'border-l-4',
          healthStatus.level === 'healthy' && 'border-green-600 bg-green-50',
          healthStatus.level === 'warning' && 'border-yellow-600 bg-yellow-50',
          healthStatus.level === 'critical' && 'border-red-600 bg-red-50'
        )}>
          <healthStatus.icon className={cn('h-4 w-4', healthStatus.color)} />
          <AlertDescription className="ml-2">
            <span className={cn('font-semibold', healthStatus.color)}>
              {healthStatus.message}
            </span>
          </AlertDescription>
        </Alert>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <Badge className={getStatusColor(uptimeStatus)} variant="secondary">
                {uptimeStatus}
              </Badge>
            </div>
            <div className="text-2xl font-bold">{uptime}%</div>
            <div className="text-xs text-gray-500">Uptime</div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Database className="w-4 h-4 text-gray-400" />
              <Badge className={getStatusColor(dbStatus)} variant="secondary">
                {dbStatus}
              </Badge>
            </div>
            <div className="text-2xl font-bold">{dbResponseTime}ms</div>
            <div className="text-xs text-gray-500">DB Response</div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="w-4 h-4 text-gray-400" />
              <Badge className={getStatusColor(errorStatus)} variant="secondary">
                {errorStatus}
              </Badge>
            </div>
            <div className="text-2xl font-bold">{errorRate}%</div>
            <div className="text-xs text-gray-500">Error Rate</div>
          </div>
          <div className="p-3 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Zap className="w-4 h-4 text-gray-400" />
              <TrendingUp className="w-3 h-3 text-green-600" />
            </div>
            <div className="text-2xl font-bold">{activeConnections}</div>
            <div className="text-xs text-gray-500">Active Connections</div>
          </div>
        </div>

        {/* Service Status */}
        <div>
          <h4 className="text-sm font-medium mb-3">Service Status</h4>
          <div className="space-y-2">
            <ServiceStatusItem
              name="API Server"
              status="operational"
              responseTime={dbResponseTime}
              icon={Server}
            />
            <ServiceStatusItem
              name="Database"
              status={dbResponseTime > 1000 ? 'degraded' : 'operational'}
              responseTime={dbResponseTime}
              icon={Database}
            />
            <ServiceStatusItem
              name="AI Services"
              status={errorRate > 5 ? 'degraded' : 'operational'}
              responseTime={Math.floor(dbResponseTime * 1.5)}
              icon={Zap}
            />
            <ServiceStatusItem
              name="Real-time Updates"
              status="operational"
              responseTime={50}
              icon={Activity}
            />
          </div>
        </div>

        {/* Activity Monitor */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Activity Monitor</h4>
            <Badge variant="secondary">
              <Clock className="w-3 h-3 mr-1" />
              Last hour
            </Badge>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">AI Interactions</span>
                <span className="text-sm font-semibold">{totalInteractionsLastHour}</span>
              </div>
              <Progress 
                value={Math.min((totalInteractionsLastHour / 200) * 100, 100)} 
                className="h-1.5" 
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">API Requests</span>
                <span className="text-sm font-semibold">{Math.floor(totalInteractionsLastHour * 2.5)}</span>
              </div>
              <Progress 
                value={Math.min((totalInteractionsLastHour * 2.5 / 500) * 100, 100)} 
                className="h-1.5" 
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm">Database Queries</span>
                <span className="text-sm font-semibold">{Math.floor(totalInteractionsLastHour * 4)}</span>
              </div>
              <Progress 
                value={Math.min((totalInteractionsLastHour * 4 / 800) * 100, 100)} 
                className="h-1.5" 
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ServiceStatusItemProps {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  responseTime: number;
  icon: React.ComponentType<{ className?: string }>;
}

function ServiceStatusItem({ name, status, responseTime, icon: Icon }: ServiceStatusItemProps) {
  const statusConfig = {
    operational: {
      color: 'text-green-600',
      bg: 'bg-green-100',
      indicator: 'bg-green-500',
      label: 'Operational',
    },
    degraded: {
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
      indicator: 'bg-yellow-500',
      label: 'Degraded',
    },
    down: {
      color: 'text-red-600',
      bg: 'bg-red-100',
      indicator: 'bg-red-500',
      label: 'Down',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-gray-400" />
        <span className="text-sm font-medium">{name}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">{responseTime}ms</span>
        <div className="flex items-center gap-1.5">
          <div className={cn('w-2 h-2 rounded-full animate-pulse', config.indicator)} />
          <Badge className={cn(config.bg, config.color)} variant="secondary">
            {config.label}
          </Badge>
        </div>
      </div>
    </div>
  );
}