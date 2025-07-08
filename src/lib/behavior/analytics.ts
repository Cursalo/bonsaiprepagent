/**
 * Behavior Analytics - Revolutionary system for understanding and predicting student behavior
 * This system monitors student interactions to predict when help is needed and optimize learning
 */

import { createClient } from '@/lib/supabase/client';

export interface BehaviorPattern {
  userId: string;
  sessionId: string;
  timestamp: Date;
  
  // Interaction patterns
  mouseMovements: number;
  keystrokes: number;
  scrolls: number;
  clicks: number;
  
  // Timing patterns
  timeOnQuestion: number;
  timeInactive: number;
  averageResponseTime: number;
  
  // Focus patterns
  windowFocusChanges: number;
  platformSwitches: number;
  
  // Performance patterns
  questionAttempts: number;
  correctAnswers: number;
  helpRequests: number;
  
  // Emotional indicators
  frustrationLevel: number; // 0-1 calculated score
  confidenceLevel: number; // 0-1 calculated score
  engagementLevel: number; // 0-1 calculated score
}

export interface PredictionResult {
  needsHelp: boolean;
  confidence: number;
  suggestedAction: 'wait' | 'offer_hint' | 'provide_encouragement' | 'suggest_break';
  timeUntilIntervention: number; // seconds
  reasoning: string[];
}

export interface StudentProfile {
  userId: string;
  learningPatterns: LearningPattern[];
  struggleIndicators: StruggleIndicator[];
  optimalConditions: OptimalCondition[];
  personalizedThresholds: PersonalizedThresholds;
}

export interface LearningPattern {
  pattern: string;
  frequency: number;
  effectiveness: number;
  conditions: string[];
}

export interface StruggleIndicator {
  indicator: string;
  threshold: number;
  accuracy: number;
  falsePositiveRate: number;
}

export interface OptimalCondition {
  condition: string;
  performance_boost: number;
  evidence_strength: number;
}

export interface PersonalizedThresholds {
  frustration_threshold: number;
  help_offer_timing: number;
  break_suggestion_timing: number;
  encouragement_frequency: number;
}

export class BehaviorAnalytics {
  private supabase = createClient();
  private studentProfiles: Map<string, StudentProfile> = new Map();
  private activePatterns: Map<string, BehaviorPattern[]> = new Map();

  constructor() {
    this.initializeAnalytics();
  }

  /**
   * Initialize the analytics system
   */
  private async initializeAnalytics() {
    // Load existing student profiles
    await this.loadStudentProfiles();
    
    // Start real-time behavior monitoring
    this.startBehaviorMonitoring();
  }

  /**
   * Track a new behavior pattern
   */
  async trackBehavior(pattern: BehaviorPattern): Promise<void> {
    try {
      // Store the pattern
      if (!this.activePatterns.has(pattern.userId)) {
        this.activePatterns.set(pattern.userId, []);
      }
      this.activePatterns.get(pattern.userId)!.push(pattern);

      // Update emotional indicators
      await this.updateEmotionalIndicators(pattern);

      // Store in database for long-term analysis
      await this.storeBehaviorPattern(pattern);

      // Trigger prediction if enough data
      if (this.activePatterns.get(pattern.userId)!.length >= 5) {
        await this.predictAndAct(pattern.userId);
      }
    } catch (error) {
      console.error('Failed to track behavior:', error);
    }
  }

  /**
   * Predict if student needs help and suggest action
   */
  async predictStudentNeeds(userId: string): Promise<PredictionResult> {
    try {
      const recentPatterns = this.getRecentPatterns(userId, 10);
      const studentProfile = await this.getStudentProfile(userId);
      
      if (recentPatterns.length === 0) {
        return {
          needsHelp: false,
          confidence: 0,
          suggestedAction: 'wait',
          timeUntilIntervention: 0,
          reasoning: ['Insufficient data']
        };
      }

      const currentPattern = recentPatterns[recentPatterns.length - 1];
      const prediction = await this.analyzeNeedForHelp(currentPattern, recentPatterns, studentProfile);
      
      return prediction;
    } catch (error) {
      console.error('Failed to predict student needs:', error);
      return {
        needsHelp: false,
        confidence: 0,
        suggestedAction: 'wait',
        timeUntilIntervention: 0,
        reasoning: ['Prediction failed']
      };
    }
  }

  /**
   * Advanced analysis to determine if student needs help
   */
  private async analyzeNeedForHelp(
    current: BehaviorPattern, 
    recent: BehaviorPattern[], 
    profile: StudentProfile
  ): Promise<PredictionResult> {
    const indicators = this.calculateStruggleIndicators(current, recent);
    const trends = this.analyzeBehaviorTrends(recent);
    const personalizedFactors = this.applyPersonalizedFactors(indicators, profile);

    // Calculate probability of needing help
    let helpProbability = 0;
    const reasoning: string[] = [];

    // Time-based indicators
    if (current.timeOnQuestion > profile.personalizedThresholds.help_offer_timing) {
      helpProbability += 0.3;
      reasoning.push(`Extended time on question (${current.timeOnQuestion}s)`);
    }

    // Frustration indicators
    if (current.frustrationLevel > profile.personalizedThresholds.frustration_threshold) {
      helpProbability += 0.4;
      reasoning.push(`High frustration level (${current.frustrationLevel.toFixed(2)})`);
    }

    // Performance indicators
    const recentAccuracy = this.calculateRecentAccuracy(recent);
    if (recentAccuracy < 0.4) {
      helpProbability += 0.2;
      reasoning.push(`Low recent accuracy (${(recentAccuracy * 100).toFixed(1)}%)`);
    }

    // Behavioral indicators
    if (current.helpRequests > 2 && current.timeOnQuestion > 60) {
      helpProbability += 0.3;
      reasoning.push('Multiple help requests on same question');
    }

    // Engagement indicators
    if (current.engagementLevel < 0.3) {
      helpProbability += 0.2;
      reasoning.push(`Low engagement level (${current.engagementLevel.toFixed(2)})`);
    }

    // Trending indicators
    if (trends.frustrationTrend > 0.2) {
      helpProbability += 0.15;
      reasoning.push('Increasing frustration trend');
    }

    // Apply personalized adjustments
    helpProbability *= personalizedFactors;

    // Determine action based on probability and context
    let suggestedAction: 'wait' | 'offer_hint' | 'provide_encouragement' | 'suggest_break';
    let timeUntilIntervention = 0;

    if (helpProbability > 0.8) {
      suggestedAction = current.frustrationLevel > 0.7 ? 'suggest_break' : 'offer_hint';
      timeUntilIntervention = 0;
    } else if (helpProbability > 0.6) {
      suggestedAction = 'provide_encouragement';
      timeUntilIntervention = 10;
    } else if (helpProbability > 0.4) {
      suggestedAction = 'offer_hint';
      timeUntilIntervention = 30;
    } else {
      suggestedAction = 'wait';
      timeUntilIntervention = 60;
    }

    return {
      needsHelp: helpProbability > 0.5,
      confidence: this.calculatePredictionConfidence(indicators, recent.length),
      suggestedAction,
      timeUntilIntervention,
      reasoning
    };
  }

  /**
   * Calculate struggle indicators from behavior patterns
   */
  private calculateStruggleIndicators(current: BehaviorPattern, recent: BehaviorPattern[]): any {
    return {
      timeStagnation: current.timeOnQuestion / Math.max(...recent.map(p => p.timeOnQuestion)) || 1,
      activityLevel: (current.mouseMovements + current.keystrokes) / recent.length,
      attentionSpan: current.windowFocusChanges / (current.timeOnQuestion / 60), // focus changes per minute
      responsePattern: current.averageResponseTime / this.calculateAverageResponseTime(recent),
      performanceDecline: this.calculatePerformanceDecline(recent)
    };
  }

  /**
   * Analyze behavior trends over time
   */
  private analyzeBehaviorTrends(patterns: BehaviorPattern[]): any {
    if (patterns.length < 3) return { frustrationTrend: 0, performanceTrend: 0, engagementTrend: 0 };

    const recent = patterns.slice(-3);
    const older = patterns.slice(-6, -3);

    return {
      frustrationTrend: this.calculateTrend(recent.map(p => p.frustrationLevel), older.map(p => p.frustrationLevel)),
      performanceTrend: this.calculateTrend(recent.map(p => p.correctAnswers), older.map(p => p.correctAnswers)),
      engagementTrend: this.calculateTrend(recent.map(p => p.engagementLevel), older.map(p => p.engagementLevel))
    };
  }

  /**
   * Apply personalized factors based on student profile
   */
  private applyPersonalizedFactors(indicators: any, profile: StudentProfile): number {
    let factor = 1.0;

    // Adjust based on known learning patterns
    profile.learningPatterns.forEach(pattern => {
      if (pattern.pattern === 'needs_frequent_encouragement' && indicators.performanceDecline > 0.2) {
        factor *= 1.2;
      }
      if (pattern.pattern === 'works_better_with_breaks' && indicators.timeStagnation > 2) {
        factor *= 1.3;
      }
    });

    // Adjust based on struggle indicators
    profile.struggleIndicators.forEach(indicator => {
      if (indicators[indicator.indicator] > indicator.threshold) {
        factor *= (1 + indicator.accuracy);
      }
    });

    return Math.min(factor, 2.0); // Cap at 2x multiplier
  }

  /**
   * Update emotional indicators based on behavior
   */
  private async updateEmotionalIndicators(pattern: BehaviorPattern): Promise<void> {
    // Calculate frustration level based on multiple factors
    let frustration = 0;
    
    // Time-based frustration
    if (pattern.timeOnQuestion > 120) frustration += 0.3;
    if (pattern.timeOnQuestion > 300) frustration += 0.4;
    
    // Performance-based frustration
    if (pattern.questionAttempts > 3 && pattern.correctAnswers === 0) frustration += 0.4;
    
    // Activity-based frustration (too much or too little activity)
    const activityScore = (pattern.mouseMovements + pattern.keystrokes) / Math.max(pattern.timeOnQuestion / 10, 1);
    if (activityScore > 50 || activityScore < 2) frustration += 0.2;
    
    // Help-seeking frustration
    if (pattern.helpRequests > 2) frustration += 0.3;

    pattern.frustrationLevel = Math.min(frustration, 1.0);

    // Calculate confidence level
    let confidence = 0.5; // Base confidence
    
    // Performance-based confidence
    if (pattern.correctAnswers > pattern.questionAttempts * 0.8) confidence += 0.3;
    if (pattern.correctAnswers < pattern.questionAttempts * 0.3) confidence -= 0.4;
    
    // Time-based confidence (quick correct answers boost confidence)
    if (pattern.averageResponseTime < 30 && pattern.correctAnswers > 0) confidence += 0.2;
    
    // Help-seeking behavior (low help requests with good performance = high confidence)
    if (pattern.helpRequests === 0 && pattern.correctAnswers > 0) confidence += 0.2;

    pattern.confidenceLevel = Math.max(0, Math.min(confidence, 1.0));

    // Calculate engagement level
    let engagement = 0.5; // Base engagement
    
    // Activity-based engagement
    const normalizedActivity = Math.min(activityScore / 20, 1);
    engagement += normalizedActivity * 0.3;
    
    // Focus-based engagement (fewer focus changes = higher engagement)
    const focusScore = Math.max(0, 1 - (pattern.windowFocusChanges / 10));
    engagement += focusScore * 0.2;
    
    // Progress-based engagement
    if (pattern.correctAnswers > 0) engagement += 0.3;

    pattern.engagementLevel = Math.max(0, Math.min(engagement, 1.0));
  }

  /**
   * Get or create student profile
   */
  private async getStudentProfile(userId: string): Promise<StudentProfile> {
    if (this.studentProfiles.has(userId)) {
      return this.studentProfiles.get(userId)!;
    }

    // Load from database or create new profile
    const profile = await this.loadOrCreateProfile(userId);
    this.studentProfiles.set(userId, profile);
    return profile;
  }

  /**
   * Load existing student profiles from database
   */
  private async loadStudentProfiles(): Promise<void> {
    try {
      const { data: profiles } = await this.supabase
        .from('student_behavior_profiles')
        .select('*');

      if (profiles) {
        profiles.forEach(profile => {
          this.studentProfiles.set(profile.user_id, this.deserializeProfile(profile));
        });
      }
    } catch (error) {
      console.error('Failed to load student profiles:', error);
    }
  }

  /**
   * Load or create a student profile
   */
  private async loadOrCreateProfile(userId: string): Promise<StudentProfile> {
    try {
      const { data: profile } = await this.supabase
        .from('student_behavior_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profile) {
        return this.deserializeProfile(profile);
      } else {
        return this.createDefaultProfile(userId);
      }
    } catch (error) {
      console.error('Failed to load profile, creating default:', error);
      return this.createDefaultProfile(userId);
    }
  }

  /**
   * Create a default student profile
   */
  private createDefaultProfile(userId: string): StudentProfile {
    return {
      userId,
      learningPatterns: [],
      struggleIndicators: [
        { indicator: 'timeStagnation', threshold: 2.0, accuracy: 0.7, falsePositiveRate: 0.2 },
        { indicator: 'performanceDecline', threshold: 0.3, accuracy: 0.8, falsePositiveRate: 0.15 },
        { indicator: 'attentionSpan', threshold: 0.5, accuracy: 0.6, falsePositiveRate: 0.3 }
      ],
      optimalConditions: [],
      personalizedThresholds: {
        frustration_threshold: 0.6,
        help_offer_timing: 120,
        break_suggestion_timing: 600,
        encouragement_frequency: 0.3
      }
    };
  }

  /**
   * Helper methods
   */
  private getRecentPatterns(userId: string, count: number): BehaviorPattern[] {
    const patterns = this.activePatterns.get(userId) || [];
    return patterns.slice(-count);
  }

  private calculateRecentAccuracy(patterns: BehaviorPattern[]): number {
    const totalQuestions = patterns.reduce((sum, p) => sum + p.questionAttempts, 0);
    const totalCorrect = patterns.reduce((sum, p) => sum + p.correctAnswers, 0);
    return totalQuestions > 0 ? totalCorrect / totalQuestions : 0.5;
  }

  private calculateAverageResponseTime(patterns: BehaviorPattern[]): number {
    const sum = patterns.reduce((sum, p) => sum + p.averageResponseTime, 0);
    return patterns.length > 0 ? sum / patterns.length : 30;
  }

  private calculatePerformanceDecline(patterns: BehaviorPattern[]): number {
    if (patterns.length < 2) return 0;
    const recent = patterns.slice(-3);
    const older = patterns.slice(-6, -3);
    const recentAccuracy = this.calculateRecentAccuracy(recent);
    const olderAccuracy = this.calculateRecentAccuracy(older);
    return Math.max(0, olderAccuracy - recentAccuracy);
  }

  private calculateTrend(recent: number[], older: number[]): number {
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    return recentAvg - olderAvg;
  }

  private calculatePredictionConfidence(indicators: any, dataPoints: number): number {
    let confidence = Math.min(dataPoints / 10, 1); // More data = higher confidence
    
    // Adjust based on indicator consistency
    const indicatorValues = Object.values(indicators) as number[];
    const variance = this.calculateVariance(indicatorValues);
    confidence *= Math.max(0.3, 1 - variance); // Lower variance = higher confidence
    
    return confidence;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  /**
   * Store behavior pattern in database
   */
  private async storeBehaviorPattern(pattern: BehaviorPattern): Promise<void> {
    try {
      await this.supabase
        .from('behavior_patterns')
        .insert({
          user_id: pattern.userId,
          session_id: pattern.sessionId,
          timestamp: pattern.timestamp.toISOString(),
          mouse_movements: pattern.mouseMovements,
          keystrokes: pattern.keystrokes,
          scrolls: pattern.scrolls,
          clicks: pattern.clicks,
          time_on_question: pattern.timeOnQuestion,
          time_inactive: pattern.timeInactive,
          average_response_time: pattern.averageResponseTime,
          window_focus_changes: pattern.windowFocusChanges,
          platform_switches: pattern.platformSwitches,
          question_attempts: pattern.questionAttempts,
          correct_answers: pattern.correctAnswers,
          help_requests: pattern.helpRequests,
          frustration_level: pattern.frustrationLevel,
          confidence_level: pattern.confidenceLevel,
          engagement_level: pattern.engagementLevel
        });
    } catch (error) {
      console.error('Failed to store behavior pattern:', error);
    }
  }

  /**
   * Start real-time behavior monitoring
   */
  private startBehaviorMonitoring(): void {
    // Set up real-time subscriptions for behavior events
    // This would integrate with the desktop app's behavior tracking
  }

  /**
   * Predict and act on student needs
   */
  private async predictAndAct(userId: string): Promise<void> {
    const prediction = await this.predictStudentNeeds(userId);
    
    if (prediction.needsHelp && prediction.confidence > 0.6) {
      // Trigger appropriate intervention
      await this.triggerIntervention(userId, prediction);
    }
  }

  /**
   * Trigger intervention based on prediction
   */
  private async triggerIntervention(userId: string, prediction: PredictionResult): Promise<void> {
    try {
      await this.supabase
        .from('intervention_triggers')
        .insert({
          user_id: userId,
          suggested_action: prediction.suggestedAction,
          confidence: prediction.confidence,
          reasoning: prediction.reasoning,
          triggered_at: new Date().toISOString()
        });

      // Notify the frontend about the suggested intervention
      // This would typically use real-time channels or webhooks
    } catch (error) {
      console.error('Failed to trigger intervention:', error);
    }
  }

  private deserializeProfile(data: any): StudentProfile {
    return {
      userId: data.user_id,
      learningPatterns: JSON.parse(data.learning_patterns || '[]'),
      struggleIndicators: JSON.parse(data.struggle_indicators || '[]'),
      optimalConditions: JSON.parse(data.optimal_conditions || '[]'),
      personalizedThresholds: JSON.parse(data.personalized_thresholds || '{}')
    };
  }
}