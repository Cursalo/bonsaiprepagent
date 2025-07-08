-- Advanced AI Features Migration
-- This migration adds tables and columns to support the revolutionary AI features

-- =============================================
-- BEHAVIOR ANALYTICS TABLES
-- =============================================

-- Behavior patterns tracking
CREATE TABLE public.behavior_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.study_sessions(id) ON DELETE CASCADE NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Interaction patterns
    mouse_movements INTEGER DEFAULT 0,
    keystrokes INTEGER DEFAULT 0,
    scrolls INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    
    -- Timing patterns
    time_on_question INTEGER DEFAULT 0, -- seconds
    time_inactive INTEGER DEFAULT 0, -- seconds
    average_response_time INTEGER DEFAULT 0, -- seconds
    
    -- Focus patterns
    window_focus_changes INTEGER DEFAULT 0,
    platform_switches INTEGER DEFAULT 0,
    
    -- Performance patterns
    question_attempts INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    help_requests INTEGER DEFAULT 0,
    
    -- Emotional indicators (calculated scores 0-1)
    frustration_level REAL DEFAULT 0 CHECK (frustration_level BETWEEN 0 AND 1),
    confidence_level REAL DEFAULT 0.5 CHECK (confidence_level BETWEEN 0 AND 1),
    engagement_level REAL DEFAULT 0.5 CHECK (engagement_level BETWEEN 0 AND 1),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student behavior profiles for personalized assistance
CREATE TABLE public.student_behavior_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    
    -- Learning patterns (JSON array of pattern objects)
    learning_patterns JSONB DEFAULT '[]'::jsonb,
    
    -- Struggle indicators (JSON array of indicator objects)
    struggle_indicators JSONB DEFAULT '[]'::jsonb,
    
    -- Optimal conditions (JSON array of condition objects)
    optimal_conditions JSONB DEFAULT '[]'::jsonb,
    
    -- Personalized thresholds (JSON object)
    personalized_thresholds JSONB DEFAULT '{
        "frustration_threshold": 0.6,
        "help_offer_timing": 120,
        "break_suggestion_timing": 600,
        "encouragement_frequency": 0.3
    }'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Intervention triggers for proactive assistance
CREATE TABLE public.intervention_triggers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    suggested_action TEXT NOT NULL CHECK (suggested_action IN ('wait', 'offer_hint', 'provide_encouragement', 'suggest_break')),
    confidence REAL NOT NULL CHECK (confidence BETWEEN 0 AND 1),
    reasoning JSONB DEFAULT '[]'::jsonb, -- Array of reasoning strings
    
    -- Intervention status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'delivered', 'accepted', 'dismissed')),
    delivered_at TIMESTAMPTZ,
    user_response TEXT CHECK (user_response IN ('accepted', 'dismissed', 'postponed')),
    
    triggered_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ADVANCED QUESTION ANALYSIS
-- =============================================

-- Question analysis results
CREATE TABLE public.question_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.study_sessions(id) ON DELETE CASCADE,
    
    -- Question data
    question_screenshot TEXT, -- Base64 encoded image
    question_text TEXT,
    platform_detected TEXT,
    
    -- Analysis results
    subject TEXT CHECK (subject IN ('math', 'reading', 'writing')),
    topic TEXT NOT NULL,
    subtopics JSONB DEFAULT '[]'::jsonb,
    difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
    question_type TEXT NOT NULL,
    
    -- Detailed analysis
    concepts JSONB DEFAULT '[]'::jsonb, -- Array of concept strings
    common_mistakes JSONB DEFAULT '[]'::jsonb, -- Array of mistake strings
    required_knowledge JSONB DEFAULT '[]'::jsonb, -- Array of knowledge areas
    estimated_solve_time INTEGER, -- seconds
    confidence REAL CHECK (confidence BETWEEN 0 AND 1),
    
    -- Visual elements
    visual_elements JSONB DEFAULT '[]'::jsonb, -- Array of visual element objects
    
    analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student knowledge tracking
CREATE TABLE public.student_knowledge (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    
    topic TEXT NOT NULL,
    mastery_level REAL DEFAULT 0.5 CHECK (mastery_level BETWEEN 0 AND 1),
    
    -- Learning style indicators
    learning_style TEXT CHECK (learning_style IN ('visual', 'analytical', 'intuitive', 'practical')),
    preferred_explanation_style TEXT CHECK (preferred_explanation_style IN ('concise', 'detailed', 'step-by-step')),
    
    -- Performance data
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    avg_response_time INTEGER DEFAULT 0, -- seconds
    help_frequency REAL DEFAULT 0, -- percentage of questions needing help
    
    last_practiced_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, topic)
);

-- =============================================
-- RESPONSE OPTIMIZATION
-- =============================================

-- Response optimization results
CREATE TABLE public.response_optimization (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interaction_id UUID REFERENCES public.ai_interactions(id) ON DELETE CASCADE NOT NULL,
    
    -- Optimization strategy
    response_strategy JSONB NOT NULL, -- Strategy object with type, depth, tone, etc.
    optimization_reason TEXT,
    
    -- Generated candidates
    response_candidates JSONB DEFAULT '[]'::jsonb, -- Array of candidate objects
    selected_candidate_index INTEGER DEFAULT 0,
    
    -- Effectiveness metrics
    estimated_effectiveness REAL CHECK (estimated_effectiveness BETWEEN 0 AND 1),
    actual_user_rating INTEGER CHECK (actual_user_rating BETWEEN 1 AND 5),
    user_found_helpful BOOLEAN,
    
    -- Follow-up data
    follow_up_suggestions JSONB DEFAULT '[]'::jsonb,
    visual_aids JSONB DEFAULT '[]'::jsonb,
    interactive_elements JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ENHANCED AI INTERACTIONS
-- =============================================

-- Add new columns to existing ai_interactions table
ALTER TABLE public.ai_interactions 
ADD COLUMN IF NOT EXISTS question_analysis_id UUID REFERENCES public.question_analysis(id),
ADD COLUMN IF NOT EXISTS optimization_id UUID REFERENCES public.response_optimization(id),
ADD COLUMN IF NOT EXISTS behavior_context JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS adaptation_reason TEXT,
ADD COLUMN IF NOT EXISTS urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high')) DEFAULT 'medium';

-- =============================================
-- PERFORMANCE AND ANALYTICS
-- =============================================

-- AI performance metrics
CREATE TABLE public.ai_performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Response quality metrics
    avg_response_time_ms REAL DEFAULT 0,
    avg_confidence_score REAL DEFAULT 0,
    success_rate REAL DEFAULT 0, -- percentage of successful responses
    
    -- User satisfaction metrics
    avg_user_rating REAL DEFAULT 0,
    helpful_response_rate REAL DEFAULT 0, -- percentage marked as helpful
    
    -- Provider performance
    openai_requests INTEGER DEFAULT 0,
    openai_success_rate REAL DEFAULT 0,
    gemini_requests INTEGER DEFAULT 0,
    gemini_success_rate REAL DEFAULT 0,
    
    -- Advanced features usage
    optimized_responses INTEGER DEFAULT 0,
    behavior_predictions INTEGER DEFAULT 0,
    proactive_interventions INTEGER DEFAULT 0,
    intervention_success_rate REAL DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date)
);

-- User learning analytics
CREATE TABLE public.user_learning_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE NOT NULL,
    week_start DATE NOT NULL,
    
    -- Learning progress
    topics_practiced JSONB DEFAULT '[]'::jsonb, -- Array of topic strings
    avg_mastery_improvement REAL DEFAULT 0,
    knowledge_graph_updates INTEGER DEFAULT 0,
    
    -- Behavior patterns
    avg_frustration_level REAL DEFAULT 0,
    avg_confidence_level REAL DEFAULT 0,
    avg_engagement_level REAL DEFAULT 0,
    
    -- AI assistance patterns
    proactive_help_accepted INTEGER DEFAULT 0,
    proactive_help_offered INTEGER DEFAULT 0,
    optimal_response_types JSONB DEFAULT '{}'::jsonb, -- Object with response type counts
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, week_start)
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Behavior patterns indexes
CREATE INDEX idx_behavior_patterns_user_timestamp ON public.behavior_patterns(user_id, timestamp);
CREATE INDEX idx_behavior_patterns_session ON public.behavior_patterns(session_id);
CREATE INDEX idx_behavior_patterns_frustration ON public.behavior_patterns(frustration_level) WHERE frustration_level > 0.6;

-- Question analysis indexes
CREATE INDEX idx_question_analysis_user_id ON public.question_analysis(user_id);
CREATE INDEX idx_question_analysis_subject_topic ON public.question_analysis(subject, topic);
CREATE INDEX idx_question_analysis_analyzed_at ON public.question_analysis(analyzed_at);

-- Student knowledge indexes
CREATE INDEX idx_student_knowledge_user_topic ON public.student_knowledge(user_id, topic);
CREATE INDEX idx_student_knowledge_mastery ON public.student_knowledge(mastery_level);
CREATE INDEX idx_student_knowledge_updated_at ON public.student_knowledge(updated_at);

-- Response optimization indexes
CREATE INDEX idx_response_optimization_interaction ON public.response_optimization(interaction_id);
CREATE INDEX idx_response_optimization_effectiveness ON public.response_optimization(estimated_effectiveness);

-- Intervention triggers indexes
CREATE INDEX idx_intervention_triggers_user_status ON public.intervention_triggers(user_id, status);
CREATE INDEX idx_intervention_triggers_triggered_at ON public.intervention_triggers(triggered_at);

-- Performance metrics indexes
CREATE INDEX idx_ai_performance_metrics_date ON public.ai_performance_metrics(date);
CREATE INDEX idx_user_learning_analytics_user_week ON public.user_learning_analytics(user_id, week_start);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on all new tables
ALTER TABLE public.behavior_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_behavior_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervention_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.response_optimization ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_learning_analytics ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can manage their own behavior patterns" ON public.behavior_patterns
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own behavior profile" ON public.student_behavior_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own interventions" ON public.intervention_triggers
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own question analysis" ON public.question_analysis
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own knowledge data" ON public.student_knowledge
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own learning analytics" ON public.user_learning_analytics
    FOR ALL USING (auth.uid() = user_id);

-- Response optimization is accessible through ai_interactions
CREATE POLICY "Users can view response optimization for their interactions" ON public.response_optimization
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.ai_interactions 
            WHERE ai_interactions.id = response_optimization.interaction_id 
            AND ai_interactions.user_id = auth.uid()
        )
    );

-- AI performance metrics are publicly readable for transparency
CREATE POLICY "AI performance metrics are publicly readable" ON public.ai_performance_metrics
    FOR SELECT USING (true);

-- =============================================
-- TRIGGERS AND FUNCTIONS
-- =============================================

-- Update updated_at for behavior profiles
CREATE TRIGGER update_behavior_profiles_updated_at 
    BEFORE UPDATE ON public.student_behavior_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update updated_at for student knowledge
CREATE TRIGGER update_student_knowledge_updated_at 
    BEFORE UPDATE ON public.student_knowledge
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create behavior profile for new users
CREATE OR REPLACE FUNCTION public.create_behavior_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.student_behavior_profiles (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create behavior profile when user profile is created
CREATE TRIGGER on_user_profile_created
    AFTER INSERT ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.create_behavior_profile_for_user();

-- Function to update knowledge levels based on interactions
CREATE OR REPLACE FUNCTION public.update_knowledge_from_interaction()
RETURNS TRIGGER AS $$
BEGIN
    -- Update knowledge level based on interaction success
    INSERT INTO public.student_knowledge (user_id, topic, total_attempts, correct_attempts)
    VALUES (
        NEW.user_id,
        COALESCE((NEW.request_context->>'topic')::text, 'general'),
        1,
        CASE WHEN NEW.user_helpful = true THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id, topic) DO UPDATE SET
        total_attempts = student_knowledge.total_attempts + 1,
        correct_attempts = student_knowledge.correct_attempts + 
            CASE WHEN NEW.user_helpful = true THEN 1 ELSE 0 END,
        mastery_level = LEAST(1.0, GREATEST(0.0, 
            (student_knowledge.correct_attempts + CASE WHEN NEW.user_helpful = true THEN 1 ELSE 0 END)::real / 
            (student_knowledge.total_attempts + 1)::real
        )),
        updated_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update knowledge when interactions are rated
CREATE TRIGGER on_interaction_rated
    AFTER UPDATE OF user_helpful ON public.ai_interactions
    FOR EACH ROW 
    WHEN (OLD.user_helpful IS DISTINCT FROM NEW.user_helpful AND NEW.user_helpful IS NOT NULL)
    EXECUTE FUNCTION public.update_knowledge_from_interaction();

-- Success message
SELECT 'Advanced AI features database schema created successfully!' as message;