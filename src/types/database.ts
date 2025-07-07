export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
          subscription_tier: 'free' | 'basic' | 'pro' | 'enterprise'
          subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing'
          trial_ends_at: string | null
          bonsai_level: number
          bonsai_experience: number
          study_streak: number
          last_study_date: string | null
          target_sat_score: number | null
          test_date: string | null
          preferences: Json
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
          subscription_tier?: 'free' | 'basic' | 'pro' | 'enterprise'
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          trial_ends_at?: string | null
          bonsai_level?: number
          bonsai_experience?: number
          study_streak?: number
          last_study_date?: string | null
          target_sat_score?: number | null
          test_date?: string | null
          preferences?: Json
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
          subscription_tier?: 'free' | 'basic' | 'pro' | 'enterprise'
          subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing'
          trial_ends_at?: string | null
          bonsai_level?: number
          bonsai_experience?: number
          study_streak?: number
          last_study_date?: string | null
          target_sat_score?: number | null
          test_date?: string | null
          preferences?: Json
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          stripe_customer_id: string
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          tier: 'free' | 'basic' | 'pro' | 'enterprise'
          current_period_start: string | null
          current_period_end: string | null
          trial_start: string | null
          trial_end: string | null
          canceled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          stripe_customer_id: string
          status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          tier: 'free' | 'basic' | 'pro' | 'enterprise'
          current_period_start?: string | null
          current_period_end?: string | null
          trial_start?: string | null
          trial_end?: string | null
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string | null
          stripe_customer_id?: string
          status?: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
          tier?: 'free' | 'basic' | 'pro' | 'enterprise'
          current_period_start?: string | null
          current_period_end?: string | null
          trial_start?: string | null
          trial_end?: string | null
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          started_at: string
          ended_at: string | null
          duration_minutes: number | null
          questions_attempted: number
          questions_correct: number
          bonsai_interactions: number
          experience_gained: number
          session_type: 'practice' | 'test' | 'review' | 'focus'
          platform: 'web' | 'extension' | 'desktop' | 'mobile'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          started_at?: string
          ended_at?: string | null
          duration_minutes?: number | null
          questions_attempted?: number
          questions_correct?: number
          bonsai_interactions?: number
          experience_gained?: number
          session_type?: 'practice' | 'test' | 'review' | 'focus'
          platform?: 'web' | 'extension' | 'desktop' | 'mobile'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          started_at?: string
          ended_at?: string | null
          duration_minutes?: number | null
          questions_attempted?: number
          questions_correct?: number
          bonsai_interactions?: number
          experience_gained?: number
          session_type?: 'practice' | 'test' | 'review' | 'focus'
          platform?: 'web' | 'extension' | 'desktop' | 'mobile'
          created_at?: string
        }
      }
      bonsai_interactions: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          question_context: string | null
          question_type: 'math' | 'reading' | 'writing'
          difficulty_level: 'easy' | 'medium' | 'hard'
          assistance_type: 'hint' | 'explanation' | 'spiral_question' | 'full_solution'
          ai_provider: 'openai' | 'gemini'
          request_text: string
          response_text: string
          response_time_ms: number | null
          user_rating: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          question_context?: string | null
          question_type: 'math' | 'reading' | 'writing'
          difficulty_level: 'easy' | 'medium' | 'hard'
          assistance_type: 'hint' | 'explanation' | 'spiral_question' | 'full_solution'
          ai_provider: 'openai' | 'gemini'
          request_text: string
          response_text: string
          response_time_ms?: number | null
          user_rating?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          session_id?: string | null
          question_context?: string | null
          question_type?: 'math' | 'reading' | 'writing'
          difficulty_level?: 'easy' | 'medium' | 'hard'
          assistance_type?: 'hint' | 'explanation' | 'spiral_question' | 'full_solution'
          ai_provider?: 'openai' | 'gemini'
          request_text?: string
          response_text?: string
          response_time_ms?: number | null
          user_rating?: number | null
          created_at?: string
        }
      }
      usage_events: {
        Row: {
          id: string
          user_id: string
          event_type: string
          quantity: number
          tier_at_time: 'free' | 'basic' | 'pro' | 'enterprise'
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          quantity?: number
          tier_at_time: 'free' | 'basic' | 'pro' | 'enterprise'
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          quantity?: number
          tier_at_time?: 'free' | 'basic' | 'pro' | 'enterprise'
          metadata?: Json
          created_at?: string
        }
      }
      admin_config: {
        Row: {
          id: string
          key: string
          value_encrypted: string | null
          description: string | null
          updated_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value_encrypted?: string | null
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value_encrypted?: string | null
          description?: string | null
          updated_by?: string | null
          updated_at?: string
        }
      }
      feature_flags: {
        Row: {
          id: string
          name: string
          enabled: boolean
          rollout_percentage: number
          conditions: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          enabled?: boolean
          rollout_percentage?: number
          conditions?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          enabled?: boolean
          rollout_percentage?: number
          conditions?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'basic' | 'pro' | 'enterprise'
      subscription_status: 'active' | 'canceled' | 'past_due' | 'trialing'
      question_type: 'math' | 'reading' | 'writing'
      difficulty_level: 'easy' | 'medium' | 'hard'
      assistance_type: 'hint' | 'explanation' | 'spiral_question' | 'full_solution'
      ai_provider: 'openai' | 'gemini'
      session_type: 'practice' | 'test' | 'review' | 'focus'
      platform_type: 'web' | 'extension' | 'desktop' | 'mobile'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}