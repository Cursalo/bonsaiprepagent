-- Bonsai SAT Tutor - Complete Database Schema
-- This migration creates all tables needed for the production SaaS platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- USER PROFILES AND AUTHENTICATION
-- =============================================

-- User profiles table (extends auth.users)
CREATE TABLE public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Academic info
    grade_level INTEGER CHECK (grade_level BETWEEN 9 AND 12),
    target_score INTEGER CHECK (target_score BETWEEN 400 AND 1600),
    test_date DATE,
    school_name TEXT,
    
    -- Preferences
    preferred_study_time INTEGER DEFAULT 30, -- minutes
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}',
    privacy_settings JSONB DEFAULT '{"show_progress": true, "show_achievements": true}',
    
    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_step INTEGER DEFAULT 0
);

-- =============================================
-- SUBSCRIPTION MANAGEMENT
-- =============================================

-- Subscription tiers
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'pro', 'enterprise');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'incomplete', 'trialing');

-- Subscriptions table
CREATE TABLE public.subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Stripe integration
    stripe_customer_id TEXT UNIQUE,
    stripe_subscription_id TEXT UNIQUE,
    stripe_price_id TEXT,
    
    -- Subscription details
    tier subscription_tier NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    trial_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    
    -- Usage tracking
    daily_ai_interactions_used INTEGER DEFAULT 0,
    daily_ai_interactions_limit INTEGER NOT NULL,
    monthly_study_minutes INTEGER DEFAULT 0,
    features_enabled JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking for rate limiting
CREATE TABLE public.usage_tracking (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE NOT NULL,
    
    -- Date tracking
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Usage metrics
    ai_interactions_count INTEGER DEFAULT 0,
    study_minutes INTEGER DEFAULT 0,
    questions_attempted INTEGER DEFAULT 0,
    voice_commands_used INTEGER DEFAULT 0,
    
    -- Constraints
    UNIQUE(user_id, date)
);

-- =============================================
-- BONSAI AI AND PROGRESS TRACKING
-- =============================================

-- Bonsai growth stages
CREATE TYPE bonsai_growth_stage AS ENUM ('seed', 'sprout', 'sapling', 'young_tree', 'mature_tree', 'ancient_tree', 'wisdom_tree');
CREATE TYPE bonsai_visual_size AS ENUM ('small', 'medium', 'large');
CREATE TYPE bonsai_animation_type AS ENUM ('gentle', 'moderate', 'dynamic');

-- Bonsai states for each user
CREATE TABLE public.bonsai_states (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Level and Experience
    level INTEGER DEFAULT 1 CHECK (level >= 1),
    experience INTEGER DEFAULT 0 CHECK (experience >= 0),
    experience_to_next INTEGER DEFAULT 100,
    total_experience INTEGER DEFAULT 0,
    
    -- Growth and Appearance
    growth_stage bonsai_growth_stage DEFAULT 'seed',
    trunk_color TEXT DEFAULT '#8B4513',
    leaf_color TEXT DEFAULT '#22c55e',
    flower_color TEXT DEFAULT '#ec4899',
    size bonsai_visual_size DEFAULT 'medium',
    animation bonsai_animation_type DEFAULT 'gentle',
    effects JSONB DEFAULT '["particles"]',
    
    -- Unlocked Features
    unlocked_features JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Achievements system
CREATE TYPE achievement_category AS ENUM ('progress', 'consistency', 'mastery', 'social', 'special');
CREATE TYPE achievement_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

CREATE TABLE public.achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category achievement_category NOT NULL,
    rarity achievement_rarity NOT NULL,
    
    -- Requirements
    requirements JSONB NOT NULL, -- Conditions to unlock
    experience_reward INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- User achievements (many-to-many)
CREATE TABLE public.user_achievements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, achievement_id)
);

-- =============================================
-- STUDY SESSIONS AND PROGRESS
-- =============================================

-- Study session types
CREATE TYPE session_type AS ENUM ('practice', 'test', 'review', 'focus');
CREATE TYPE session_status AS ENUM ('active', 'paused', 'completed', 'abandoned');
CREATE TYPE sat_subject AS ENUM ('math', 'reading', 'writing');
CREATE TYPE question_difficulty AS ENUM ('easy', 'medium', 'hard');

-- Study sessions
CREATE TABLE public.study_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Session details
    session_type session_type NOT NULL,
    status session_status DEFAULT 'active',
    platform TEXT DEFAULT 'web', -- 'web', 'extension', 'desktop', 'mobile'
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    target_duration_minutes INTEGER,
    actual_duration_minutes INTEGER,
    
    -- Progress metrics
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    bonsai_interactions INTEGER DEFAULT 0,
    experience_gained INTEGER DEFAULT 0,
    
    -- Subject breakdown
    subjects_data JSONB DEFAULT '{}', -- Per-subject performance
    
    -- Context
    detected_platform TEXT, -- 'khan_academy', 'bluebook', 'other'
    session_notes TEXT
);

-- Individual question attempts within sessions
CREATE TABLE public.question_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES public.study_sessions(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Question details
    subject sat_subject NOT NULL,
    topic TEXT,
    difficulty question_difficulty,
    question_hash TEXT, -- Hash of question content for tracking
    
    -- Attempt details
    is_correct BOOLEAN,
    time_spent_seconds INTEGER,
    hints_used INTEGER DEFAULT 0,
    ai_assistance_used BOOLEAN DEFAULT FALSE,
    
    -- Context
    platform_detected TEXT,
    attempted_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- AI INTERACTIONS AND CHAT
-- =============================================

-- AI providers and models
CREATE TYPE ai_provider AS ENUM ('openai', 'gemini');
CREATE TYPE assistance_type AS ENUM ('hint', 'explanation', 'spiral_question', 'full_solution');
CREATE TYPE voice_intent AS ENUM ('help_request', 'hint_request', 'explanation_request', 'question_clarification', 'progress_check', 'bonsai_chat', 'unknown');

-- AI interactions log
CREATE TABLE public.ai_interactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.study_sessions(id) ON DELETE SET NULL,
    
    -- Request details
    request_text TEXT NOT NULL,
    request_images JSONB, -- Array of image data
    request_context JSONB, -- Screen context, detected question, etc.
    voice_input BOOLEAN DEFAULT FALSE,
    voice_intent voice_intent,
    
    -- AI Response
    ai_provider ai_provider NOT NULL,
    model_used TEXT NOT NULL,
    assistance_type assistance_type NOT NULL,
    response_text TEXT NOT NULL,
    response_time_ms INTEGER,
    tokens_used INTEGER,
    confidence_score REAL CHECK (confidence_score BETWEEN 0 AND 1),
    
    -- Experience and gamification
    experience_gained INTEGER DEFAULT 0,
    level_up_occurred BOOLEAN DEFAULT FALSE,
    
    -- User feedback
    user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
    user_helpful BOOLEAN,
    user_comment TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spiral questions for reinforcement learning
CREATE TABLE public.spiral_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    interaction_id UUID REFERENCES public.ai_interactions(id) ON DELETE CASCADE NOT NULL,
    
    -- Question details
    question_text TEXT NOT NULL,
    question_type TEXT CHECK (question_type IN ('concept_check', 'application', 'extension')),
    difficulty_relative TEXT CHECK (difficulty_relative IN ('easier', 'same', 'harder')),
    expected_answer TEXT NOT NULL,
    explanation TEXT NOT NULL,
    
    -- User response
    user_answer TEXT,
    is_correct BOOLEAN,
    answered_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PROGRESS ANALYTICS
-- =============================================

-- Weekly progress snapshots
CREATE TABLE public.weekly_progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Week identification
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    
    -- Metrics
    study_minutes INTEGER DEFAULT 0,
    questions_attempted INTEGER DEFAULT 0,
    accuracy_percentage REAL DEFAULT 0,
    streak_days INTEGER DEFAULT 0,
    bonsai_interactions INTEGER DEFAULT 0,
    experience_gained INTEGER DEFAULT 0,
    
    -- Subject breakdown
    math_accuracy REAL DEFAULT 0,
    reading_accuracy REAL DEFAULT 0,
    writing_accuracy REAL DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_start)
);

-- Performance predictions and analytics
CREATE TABLE public.performance_predictions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    -- Score predictions
    current_estimated_score INTEGER CHECK (current_estimated_score BETWEEN 400 AND 1600),
    confidence_percentage REAL CHECK (confidence_percentage BETWEEN 0 AND 100),
    prediction_factors JSONB, -- What influences the prediction
    
    -- Recommendations
    recommended_focus_areas JSONB, -- Array of topics to focus on
    recommended_daily_minutes INTEGER,
    
    -- Time to goal
    days_to_goal_optimistic INTEGER,
    days_to_goal_realistic INTEGER,
    days_to_goal_conservative INTEGER,
    
    -- Metadata
    calculated_at TIMESTAMPTZ DEFAULT NOW(),
    model_version TEXT DEFAULT '1.0'
);

-- =============================================
-- ADMIN AND ANALYTICS
-- =============================================

-- System-wide analytics snapshots
CREATE TABLE public.admin_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Date
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- User metrics
    total_users INTEGER DEFAULT 0,
    active_users_30d INTEGER DEFAULT 0,
    new_signups_30d INTEGER DEFAULT 0,
    churn_rate_30d REAL DEFAULT 0,
    
    -- Usage metrics
    total_ai_interactions INTEGER DEFAULT 0,
    avg_interactions_per_user REAL DEFAULT 0,
    total_study_minutes INTEGER DEFAULT 0,
    avg_session_duration REAL DEFAULT 0,
    
    -- Revenue metrics
    mrr DECIMAL(10,2) DEFAULT 0, -- Monthly Recurring Revenue
    arr DECIMAL(10,2) DEFAULT 0, -- Annual Recurring Revenue
    average_revenue_per_user DECIMAL(10,2) DEFAULT 0,
    ltv_to_cac_ratio REAL DEFAULT 0,
    
    -- Subscription breakdown
    free_users INTEGER DEFAULT 0,
    basic_users INTEGER DEFAULT 0,
    pro_users INTEGER DEFAULT 0,
    enterprise_users INTEGER DEFAULT 0,
    
    -- System health
    avg_response_time_ms REAL DEFAULT 0,
    error_rate_percentage REAL DEFAULT 0,
    uptime_percentage REAL DEFAULT 100,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date)
);

-- Feature flags for A/B testing and rollouts
CREATE TABLE public.feature_flags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    
    -- Flag configuration
    enabled BOOLEAN DEFAULT FALSE,
    rollout_percentage INTEGER DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
    
    -- Targeting conditions
    subscription_tiers JSONB, -- Array of tiers this applies to
    user_segments JSONB, -- Array of user segments
    beta_testers_only BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.user_profiles(id)
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bonsai_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spiral_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_predictions ENABLE ROW LEVEL SECURITY;

-- User can only access their own data
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can view their own subscription" ON public.subscriptions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own usage" ON public.usage_tracking
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own bonsai state" ON public.bonsai_states
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own achievements" ON public.user_achievements
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own sessions" ON public.study_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own attempts" ON public.question_attempts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own interactions" ON public.ai_interactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own progress" ON public.weekly_progress
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own predictions" ON public.performance_predictions
    FOR ALL USING (auth.uid() = user_id);

-- Achievements are publicly readable
CREATE POLICY "Achievements are publicly readable" ON public.achievements
    FOR SELECT USING (true);

-- Feature flags are publicly readable
CREATE POLICY "Feature flags are publicly readable" ON public.feature_flags
    FOR SELECT USING (true);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Updated timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bonsai_states_updated_at BEFORE UPDATE ON public.bonsai_states
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    
    INSERT INTO public.bonsai_states (user_id)
    VALUES (NEW.id);
    
    INSERT INTO public.subscriptions (user_id, tier, daily_ai_interactions_limit)
    VALUES (NEW.id, 'free', 5);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- User profiles
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_created_at ON public.user_profiles(created_at);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);

-- Usage tracking
CREATE INDEX idx_usage_tracking_user_date ON public.usage_tracking(user_id, date);
CREATE INDEX idx_usage_tracking_date ON public.usage_tracking(date);

-- Study sessions
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_started_at ON public.study_sessions(started_at);
CREATE INDEX idx_study_sessions_status ON public.study_sessions(status);

-- AI interactions
CREATE INDEX idx_ai_interactions_user_id ON public.ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_created_at ON public.ai_interactions(created_at);
CREATE INDEX idx_ai_interactions_provider ON public.ai_interactions(ai_provider);

-- Question attempts
CREATE INDEX idx_question_attempts_user_id ON public.question_attempts(user_id);
CREATE INDEX idx_question_attempts_session_id ON public.question_attempts(session_id);
CREATE INDEX idx_question_attempts_subject ON public.question_attempts(subject);

-- Performance
CREATE INDEX idx_weekly_progress_user_week ON public.weekly_progress(user_id, week_start);
CREATE INDEX idx_performance_predictions_user ON public.performance_predictions(user_id);

-- =============================================
-- SEED DATA
-- =============================================

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, category, rarity, requirements, experience_reward) VALUES
('First Steps', 'Complete your first study session', '🌱', 'progress', 'common', '{"sessions_completed": 1}', 50),
('Week Warrior', 'Study for 7 consecutive days', '🔥', 'consistency', 'rare', '{"consecutive_days": 7}', 200),
('Math Master', 'Answer 100 math questions correctly', '🧮', 'mastery', 'epic', '{"math_correct": 100}', 500),
('Voice Commander', 'Use voice commands 50 times', '🎤', 'progress', 'rare', '{"voice_commands": 50}', 150),
('Perfect Score', 'Achieve 100% accuracy in a session', '⭐', 'mastery', 'legendary', '{"perfect_session": 1}', 1000);

-- Insert default feature flags
INSERT INTO public.feature_flags (name, description, enabled, rollout_percentage) VALUES
('voice_commands', 'Enable voice command functionality', true, 100),
('spiral_questions', 'Enable spiral question reinforcement', true, 50),
('predictive_modeling', 'Enable SAT score predictions', false, 0),
('advanced_analytics', 'Enable advanced progress analytics', true, 25),
('social_features', 'Enable social sharing and leaderboards', false, 0);

-- Success message
SELECT 'Bonsai SAT Tutor database schema created successfully!' as message;