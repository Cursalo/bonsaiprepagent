-- Create user_usage table for tracking subscription limits
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  limit_type TEXT NOT NULL, -- e.g., 'dailyAiInteractions', 'monthlyStudyMinutes'
  usage_count INTEGER NOT NULL DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one record per user/limit_type/period
  UNIQUE(user_id, limit_type, period_start)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_period_start ON user_usage(period_start);
CREATE INDEX IF NOT EXISTS idx_user_usage_limit_type ON user_usage(limit_type);
CREATE INDEX IF NOT EXISTS idx_user_usage_composite ON user_usage(user_id, limit_type, period_start);

-- Enable RLS
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_usage
CREATE POLICY "Users can view their own usage"
  ON user_usage FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage"
  ON user_usage FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage"
  ON user_usage FOR UPDATE
  USING (auth.uid() = user_id);

-- Create subscription_events table for audit trail
CREATE TABLE IF NOT EXISTS subscription_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'created', 'upgraded', 'downgraded', 'canceled', 'reactivated'
  from_tier TEXT,
  to_tier TEXT,
  stripe_event_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for subscription_events
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_type ON subscription_events(event_type);
CREATE INDEX IF NOT EXISTS idx_subscription_events_created_at ON subscription_events(created_at);

-- Enable RLS for subscription_events
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_events
CREATE POLICY "Users can view their own subscription events"
  ON subscription_events FOR SELECT
  USING (auth.uid() = user_id);

-- Admin policy for subscription_events
CREATE POLICY "Admins can view all subscription events"
  ON subscription_events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Create feature_usage_logs table for detailed tracking
CREATE TABLE IF NOT EXISTS feature_usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  action TEXT NOT NULL, -- 'accessed', 'blocked', 'limit_reached'
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for feature_usage_logs
CREATE INDEX IF NOT EXISTS idx_feature_usage_logs_user_id ON feature_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_feature_usage_logs_feature ON feature_usage_logs(feature_name);
CREATE INDEX IF NOT EXISTS idx_feature_usage_logs_action ON feature_usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_feature_usage_logs_created_at ON feature_usage_logs(created_at);

-- Enable RLS for feature_usage_logs
ALTER TABLE feature_usage_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for feature_usage_logs
CREATE POLICY "Users can view their own feature usage logs"
  ON feature_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert feature usage logs"
  ON feature_usage_logs FOR INSERT
  WITH CHECK (true); -- Allow service role to insert

-- Admin policy for feature_usage_logs
CREATE POLICY "Admins can view all feature usage logs"
  ON feature_usage_logs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Add subscription tier tracking to existing subscriptions table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'cancel_at_period_end') THEN
        ALTER TABLE subscriptions ADD COLUMN cancel_at_period_end BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'canceled_at') THEN
        ALTER TABLE subscriptions ADD COLUMN canceled_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscriptions' AND column_name = 'stripe_subscription_item_id') THEN
        ALTER TABLE subscriptions ADD COLUMN stripe_subscription_item_id TEXT;
    END IF;
END $$;

-- Create function to automatically track subscription events
CREATE OR REPLACE FUNCTION track_subscription_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert subscription event
  INSERT INTO subscription_events (
    user_id,
    subscription_id,
    event_type,
    from_tier,
    to_tier,
    metadata
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.id, OLD.id),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'UPDATE' AND OLD.tier != NEW.tier THEN 
        CASE WHEN NEW.tier IN ('pro', 'enterprise') AND OLD.tier IN ('free', 'basic') THEN 'upgraded'
             WHEN NEW.tier IN ('free', 'basic') AND OLD.tier IN ('pro', 'enterprise') THEN 'downgraded'
             ELSE 'tier_changed'
        END
      WHEN TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status = 'canceled' THEN 'canceled'
      WHEN TG_OP = 'UPDATE' AND OLD.cancel_at_period_end != NEW.cancel_at_period_end THEN
        CASE WHEN NEW.cancel_at_period_end THEN 'cancel_scheduled' ELSE 'reactivated' END
      ELSE 'updated'
    END,
    CASE WHEN TG_OP = 'UPDATE' THEN OLD.tier ELSE NULL END,
    CASE WHEN TG_OP != 'DELETE' THEN NEW.tier ELSE NULL END,
    jsonb_build_object(
      'operation', TG_OP,
      'old_status', CASE WHEN TG_OP = 'UPDATE' THEN OLD.status ELSE NULL END,
      'new_status', CASE WHEN TG_OP != 'DELETE' THEN NEW.status ELSE NULL END
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for subscription changes
DROP TRIGGER IF EXISTS subscription_change_trigger ON subscriptions;
CREATE TRIGGER subscription_change_trigger
  AFTER INSERT OR UPDATE OR DELETE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION track_subscription_change();

-- Create function to reset usage counters
CREATE OR REPLACE FUNCTION reset_usage_counters()
RETURNS void AS $$
BEGIN
  -- Reset daily counters (older than 24 hours)
  DELETE FROM user_usage 
  WHERE limit_type LIKE '%daily%' 
    AND period_start < NOW() - INTERVAL '24 hours';
    
  -- Reset monthly counters (older than 30 days)  
  DELETE FROM user_usage 
  WHERE limit_type LIKE '%monthly%' 
    AND period_start < NOW() - INTERVAL '30 days';
    
  -- Clean up old feature usage logs (older than 90 days)
  DELETE FROM feature_usage_logs
  WHERE created_at < NOW() - INTERVAL '90 days';
    
  -- Clean up old subscription events (older than 2 years)
  DELETE FROM subscription_events
  WHERE created_at < NOW() - INTERVAL '2 years';
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run cleanup (if pg_cron is available)
-- SELECT cron.schedule('usage-cleanup', '0 0 * * *', 'SELECT reset_usage_counters();');

-- Insert some initial usage tracking for existing users
INSERT INTO user_usage (user_id, limit_type, usage_count, period_start)
SELECT 
  up.id,
  'dailyAiInteractions',
  COALESCE(
    (SELECT COUNT(*) FROM ai_interactions 
     WHERE user_id = up.id 
     AND created_at >= CURRENT_DATE), 
    0
  ),
  CURRENT_DATE::timestamp with time zone
FROM user_profiles up
ON CONFLICT (user_id, limit_type, period_start) DO NOTHING;

-- Create views for common usage queries
CREATE OR REPLACE VIEW user_current_usage AS
SELECT 
  u.user_id,
  u.limit_type,
  u.usage_count,
  u.period_start,
  s.tier,
  CASE 
    WHEN u.limit_type = 'dailyAiInteractions' THEN
      CASE s.tier
        WHEN 'free' THEN 5
        WHEN 'basic' THEN 50
        WHEN 'pro' THEN -1 -- unlimited
        WHEN 'enterprise' THEN -1 -- unlimited
        ELSE 5
      END
    WHEN u.limit_type = 'monthlyStudyMinutes' THEN
      CASE s.tier
        WHEN 'free' THEN 300
        WHEN 'basic' THEN 1500
        WHEN 'pro' THEN -1 -- unlimited
        WHEN 'enterprise' THEN -1 -- unlimited
        ELSE 300
      END
    ELSE 0
  END as limit_value
FROM user_usage u
JOIN subscriptions s ON s.user_id = u.user_id AND s.status = 'active'
WHERE u.period_start >= CURRENT_DATE - INTERVAL '1 day';

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON user_usage TO authenticated;
GRANT SELECT ON subscription_events TO authenticated;
GRANT INSERT ON feature_usage_logs TO authenticated;
GRANT SELECT ON user_current_usage TO authenticated;