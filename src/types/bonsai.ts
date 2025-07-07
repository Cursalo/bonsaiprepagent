// Core Bonsai Types - Adapted from Glass Architecture
export interface BonsaiContext {
  questionText?: string;
  questionType: 'math' | 'reading' | 'writing';
  difficulty: 'easy' | 'medium' | 'hard';
  platform: 'bluebook' | 'khan_academy' | 'web' | 'other';
  screenContext?: ScreenContext;
  timestamp: Date;
}

export interface ScreenContext {
  text: string;
  images: string[];
  url: string;
  pageTitle: string;
  elementContext?: ElementContext;
}

export interface ElementContext {
  questionElement?: HTMLElement;
  choicesElements?: HTMLElement[];
  imageElements?: HTMLImageElement[];
  mathElements?: HTMLElement[];
}

// SAT Question Analysis (inspired by Glass's structured analysis)
export interface SATQuestionAnalysis {
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  concepts: string[];
  commonMistakes: string[];
  hints: string[];
  estimatedTimeMinutes: number;
  prerequisites: string[];
}

// Bonsai AI Response Structure
export interface BonsaiResponse {
  response: string;
  assistanceType: 'hint' | 'explanation' | 'spiral_question' | 'full_solution';
  experienceGained: number;
  levelUp: boolean;
  usageCount: number;
  remainingUsage: number;
  followUpQuestions?: string[];
  metadata: {
    aiProvider: 'openai' | 'gemini';
    model: string;
    responseTimeMs: number;
    tokensUsed: number;
    confidence: number;
  };
  spiralQuestions?: SpiralQuestion[];
}

// Spiral Questions for reinforcement learning
export interface SpiralQuestion {
  id: string;
  question: string;
  type: 'concept_check' | 'application' | 'extension';
  difficulty: 'easier' | 'same' | 'harder';
  expectedAnswer: string;
  explanation: string;
}

// Bonsai Growth System
export interface BonsaiState {
  level: number;
  experience: number;
  experienceToNext: number;
  totalExperience: number;
  growthStage: BonsaiGrowthStage;
  unlockedFeatures: string[];
  achievements: Achievement[];
  visualStyle: BonsaiVisualStyle;
}

export type BonsaiGrowthStage = 
  | 'seed' 
  | 'sprout' 
  | 'sapling' 
  | 'young_tree' 
  | 'mature_tree' 
  | 'ancient_tree'
  | 'wisdom_tree';

export interface BonsaiVisualStyle {
  trunkColor: string;
  leafColor: string;
  flowerColor?: string;
  size: 'small' | 'medium' | 'large';
  animation: 'gentle' | 'moderate' | 'dynamic';
  effects: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  category: 'progress' | 'consistency' | 'mastery' | 'social' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// Voice Interaction Types
export interface VoiceConfig {
  wakeWord: string;
  language: string;
  voiceEnabled: boolean;
  noiseReduction: boolean;
  confidenceThreshold: number;
}

export interface VoiceInteraction {
  id: string;
  transcription: string;
  confidence: number;
  intent: VoiceIntent;
  response: string;
  audioResponseUrl?: string;
  timestamp: Date;
}

export type VoiceIntent = 
  | 'help_request'
  | 'hint_request'
  | 'explanation_request'
  | 'question_clarification'
  | 'progress_check'
  | 'bonsai_chat'
  | 'unknown';

// Study Session Management
export interface StudySession {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  targetDurationMinutes: number;
  actualDurationMinutes?: number;
  sessionType: 'practice' | 'test' | 'review' | 'focus';
  platform: 'web' | 'extension' | 'desktop' | 'mobile';
  questionsAttempted: number;
  questionsCorrect: number;
  bonsaiInteractions: number;
  experienceGained: number;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  subjects: SubjectPerformance[];
}

export interface SubjectPerformance {
  subject: 'math' | 'reading' | 'writing';
  questionsAttempted: number;
  questionsCorrect: number;
  averageTimePerQuestion: number;
  topicsEncountered: string[];
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
  };
}

// Progress Tracking
export interface ProgressMetrics {
  overallProgress: OverallProgress;
  subjectBreakdown: Record<string, SubjectProgress>;
  weeklyProgress: WeeklyProgress[];
  goalTracking: GoalTracking;
  streakData: StreakData;
  predictions: PerformancePredictions;
}

export interface OverallProgress {
  totalStudyTimeMinutes: number;
  totalQuestionsAttempted: number;
  overallAccuracy: number;
  currentStreak: number;
  longestStreak: number;
  bonsaiLevel: number;
  experience: number;
  improvementTrend: number; // -1 to 1
}

export interface SubjectProgress {
  questionsAttempted: number;
  accuracy: number;
  timeSpentMinutes: number;
  improvementTrend: number;
  masteredTopics: string[];
  strugglingTopics: string[];
  averageTimePerQuestion: number;
}

export interface WeeklyProgress {
  weekStart: Date;
  studyMinutes: number;
  questionsAttempted: number;
  accuracy: number;
  streakDays: number;
  bonsaiInteractions: number;
}

export interface GoalTracking {
  targetScore: number;
  projectedScore: number;
  confidenceInterval: [number, number];
  daysUntilTest: number;
  onTrack: boolean;
  recommendedDailyMinutes: number;
  progressPercentage: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  streakStartDate?: Date;
  lastStudyDate?: Date;
  streakMilestones: StreakMilestone[];
}

export interface StreakMilestone {
  days: number;
  achieved: boolean;
  achievedDate?: Date;
  reward: string;
}

export interface PerformancePredictions {
  scoreProjection: {
    currentEstimate: number;
    confidence: number;
    factors: string[];
  };
  recommendedFocusAreas: string[];
  timeToGoal: {
    optimistic: number; // days
    realistic: number;
    conservative: number;
  };
}

// Subscription and Usage Types
export interface SubscriptionTier {
  id: 'free' | 'basic' | 'pro' | 'enterprise';
  name: string;
  price: number;
  interval: 'month' | 'year' | null;
  features: SubscriptionFeatures;
}

export interface SubscriptionFeatures {
  dailyAIInteractions: number; // -1 for unlimited
  studySessionsPerDay: number; // -1 for unlimited
  maxSessionMinutes: number; // -1 for unlimited
  bonsaiMaxLevel: number; // -1 for unlimited
  voiceCommands: boolean;
  browserExtension: boolean;
  desktopApp: boolean;
  prioritySupport: boolean;
  analytics: 'basic' | 'standard' | 'advanced';
  exportFeatures: boolean;
  spiralQuestions: boolean;
  predictiveModeling: boolean;
  customBonsaiStyling: boolean;
}

export interface UsageMetrics {
  currentPeriod: {
    bonsaiInteractions: number;
    studyMinutes: number;
    sessionsCount: number;
    periodStart: Date;
    periodEnd: Date;
  };
  limits: SubscriptionFeatures;
  warningsEnabled: boolean;
  usageAlerts: UsageAlert[];
}

export interface UsageAlert {
  type: 'approaching_limit' | 'limit_reached' | 'grace_period';
  metric: string;
  currentUsage: number;
  limit: number;
  message: string;
  actionRequired: boolean;
}

// Real-time Communication Types
export interface WebSocketMessage {
  type: 'bonsai_growth' | 'session_update' | 'usage_alert' | 'achievement_unlocked';
  data: any;
  timestamp: Date;
  userId: string;
}

export interface BonsaiGrowthUpdate {
  userId: string;
  oldLevel: number;
  newLevel: number;
  experienceGained: number;
  newAchievements: Achievement[];
  unlockedFeatures: string[];
}

// Error Handling
export interface BonsaiError {
  code: string;
  message: string;
  details?: string;
  timestamp: Date;
  userId?: string;
  context?: BonsaiContext;
  retryable: boolean;
}

// Glass-inspired Context Awareness
export interface ContextAwareness {
  isActive: boolean;
  detectedPlatform: 'bluebook' | 'khan_academy' | 'other';
  currentQuestion?: SATQuestionAnalysis;
  studentStruggleDetected: boolean;
  assistanceRecommendation: 'wait' | 'offer_hint' | 'provide_help' | 'intervene';
  confidenceLevel: number;
}

// Multi-modal AI Integration
export interface MultiModalRequest {
  text: string;
  images?: ImageData[];
  audio?: AudioData;
  context: BonsaiContext;
  previousInteractions: BonsaiInteraction[];
}

export interface ImageData {
  base64: string;
  mimeType: string;
  description?: string;
  boundingBoxes?: BoundingBox[];
}

export interface AudioData {
  base64: string;
  mimeType: string;
  duration: number;
  transcription?: string;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

export interface BonsaiInteraction {
  id: string;
  timestamp: Date;
  request: MultiModalRequest;
  response: BonsaiResponse;
  userFeedback?: UserFeedback;
}

export interface UserFeedback {
  rating: 1 | 2 | 3 | 4 | 5;
  helpful: boolean;
  comment?: string;
  timestamp: Date;
}

// Admin and Analytics Types
export interface AdminAnalytics {
  userMetrics: {
    totalUsers: number;
    activeUsers30d: number;
    newSignups30d: number;
    churnRate30d: number;
  };
  usageMetrics: {
    totalBonsaiInteractions: number;
    avgInteractionsPerUser: number;
    totalStudyMinutes: number;
    avgSessionDuration: number;
  };
  revenueMetrics: {
    mrr: number;
    arr: number;
    averageRevenuePerUser: number;
    ltvToCacRatio: number;
  };
  subscriptionBreakdown: Record<string, number>;
}

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  rolloutPercentage: number;
  conditions: {
    subscriptionTiers?: string[];
    userSegments?: string[];
    betaTesters?: boolean;
  };
}

// Export all types for easy importing
export * from './database';