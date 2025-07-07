import { OpenAIService, type ChatMessage, type AIResponse } from './openai';
// import { GeminiService } from './gemini'; // Temporarily disabled
import { createClient } from '@supabase/supabase-js';
// import { StripeService } from '@/lib/stripe/service'; // Temporarily disabled

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type AIProvider = 'openai'; // | 'gemini'; // Gemini temporarily disabled

export interface AIInteractionContext {
  userId: string;
  sessionId?: string;
  subject?: 'math' | 'reading' | 'writing';
  difficulty?: 'easy' | 'medium' | 'hard';
  questionType?: string;
  userLevel?: number;
  previousInteractions?: number;
  voiceInput?: boolean;
  voiceIntent?: string;
  screenContext?: any;
  detectedPlatform?: string;
}

export interface BonsaiAIResponse extends AIResponse {
  provider: AIProvider;
  experienceGained: number;
  levelUpOccurred: boolean;
  usageRemaining?: {
    daily: number;
    unlimited: boolean;
  };
}

export class BonsaiAIService {
  /**
   * Main entry point for Bonsai AI interactions
   */
  static async chat(
    messages: ChatMessage[],
    assistanceType: AIResponse['assistanceType'],
    context: AIInteractionContext
  ): Promise<BonsaiAIResponse> {
    try {
      // 1. Check user permissions and usage limits
      await this.checkUserPermissions(context.userId, assistanceType);

      // 2. Auto-analyze question context if not provided
      if (!context.subject && messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        const analysis = await this.analyzeQuestionContext(
          lastMessage.content,
          lastMessage.images?.[0]
        );
        context = { ...context, ...analysis };
      }

      // 3. Get user's Bonsai state for personalization
      const bonsaiState = await this.getBonsaiState(context.userId);
      context.userLevel = this.calculateUserLevel(bonsaiState);
      context.previousInteractions = await this.getPreviousInteractionsCount(context.userId);

      // 4. Select optimal AI provider
      const provider = await this.selectProvider(context, assistanceType);

      // 5. Generate AI response
      const aiResponse = await this.generateAIResponse(
        provider,
        messages,
        assistanceType,
        context
      );

      // 6. Calculate experience gain and level progression
      const experienceGained = this.calculateExperienceGain(
        assistanceType,
        aiResponse.confidence,
        context.difficulty || 'medium'
      );

      const levelUpOccurred = await this.updateBonsaiProgress(
        context.userId,
        experienceGained
      );

      // 7. Log interaction in database
      const interactionId = await this.logInteraction(
        context,
        messages[messages.length - 1],
        aiResponse,
        provider,
        experienceGained,
        levelUpOccurred
      );

      // 8. Save spiral questions if generated
      if (aiResponse.spiralQuestions?.length) {
        await this.saveSpiralQuestions(interactionId, aiResponse.spiralQuestions);
      }

      // 9. Update usage tracking
      await this.updateUsageTracking(context.userId);

      // 10. Get remaining usage for response
      const usageRemaining = await this.getRemainingUsage(context.userId);

      return {
        ...aiResponse,
        provider,
        experienceGained,
        levelUpOccurred,
        usageRemaining,
      };
    } catch (error) {
      console.error('Bonsai AI Service error:', error);
      throw error;
    }
  }

  /**
   * Check if user can make AI requests
   */
  private static async checkUserPermissions(
    userId: string,
    assistanceType: string
  ): Promise<void> {
    // Check feature access
    // const canUseAI = await StripeService.canUserUseFeature(userId, 'aiInteractionsPerDay'); // Temporarily disabled
    const canUseAI = { allowed: true };
    if (!canUseAI) {
      throw new Error('AI tutoring not available on your current plan');
    }

    // Check usage limits
    // const withinLimits = await StripeService.checkUsageLimit(userId, 'dailyAiInteractions'); // Temporarily disabled
    const withinLimits = { allowed: true };
    if (!withinLimits) {
      throw new Error('Daily AI interaction limit reached. Upgrade your plan for more interactions.');
    }

    // Check voice commands if applicable
    if (assistanceType === 'voice_command') {
      // const canUseVoice = await StripeService.canUserUseFeature(userId, 'voiceCommands'); // Temporarily disabled
      const canUseVoice = { allowed: true };
      if (!canUseVoice) {
        throw new Error('Voice commands not available on your current plan');
      }
    }
  }

  /**
   * Select optimal AI provider based on context
   */
  private static async selectProvider(
    context: AIInteractionContext,
    assistanceType: string
  ): Promise<AIProvider> {
    // Provider selection logic based on:
    // 1. Feature flags
    // 2. User preferences
    // 3. Context (e.g., images prefer GPT-4 Vision)
    // 4. Load balancing
    // 5. Error rates

    // Check if images are present - prefer OpenAI for vision
    if (context.screenContext?.images?.length) {
      return 'openai';
    }

    // Check feature flags for provider preferences
    const { data: flags } = await adminSupabase
      .from('feature_flags')
      .select('*')
      .in('name', ['prefer_openai', 'prefer_gemini', 'load_balance_ai'])
      .eq('enabled', true);

    const flagMap = flags?.reduce((acc, flag) => {
      acc[flag.name] = flag;
      return acc;
    }, {} as any) || {};

    // Temporarily using only OpenAI for deployment
    return 'openai';
  }

  /**
   * Generate AI response with fallback
   */
  private static async generateAIResponse(
    provider: AIProvider,
    messages: ChatMessage[],
    assistanceType: AIResponse['assistanceType'],
    context: AIInteractionContext
  ): Promise<AIResponse> {
    try {
      // Only using OpenAI for now
      return await OpenAIService.generateResponse(messages, assistanceType, context);
    } catch (error) {
      console.error('OpenAI failed:', error);
      throw new Error('AI service temporarily unavailable. Please try again.');
    }
  }

  /**
   * Analyze question context
   */
  private static async analyzeQuestionContext(
    questionText: string,
    questionImage?: string
  ): Promise<Partial<AIInteractionContext>> {
    try {
      // Use OpenAI for all analysis (text and vision)
      return await OpenAIService.analyzeQuestionContext(questionText, questionImage);
    } catch (error) {
      console.error('Question analysis failed:', error);
      return {
        subject: 'math',
        difficulty: 'medium',
      };
    }
  }

  /**
   * Get user's Bonsai state
   */
  private static async getBonsaiState(userId: string) {
    const { data } = await adminSupabase
      .from('bonsai_states')
      .select('*')
      .eq('user_id', userId)
      .single();

    return data;
  }

  /**
   * Calculate user level from Bonsai state
   */
  private static calculateUserLevel(bonsaiState: any): number {
    if (!bonsaiState) return 1;
    return bonsaiState.level || 1;
  }

  /**
   * Get count of previous interactions
   */
  private static async getPreviousInteractionsCount(userId: string): Promise<number> {
    const { count } = await adminSupabase
      .from('ai_interactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return count || 0;
  }

  /**
   * Calculate experience gain
   */
  private static calculateExperienceGain(
    assistanceType: string,
    confidence: number,
    difficulty: string
  ): number {
    const baseExperience = {
      hint: 5,
      explanation: 10,
      spiral_question: 15,
      full_solution: 8,
    }[assistanceType] || 5;

    const difficultyMultiplier = {
      easy: 1.0,
      medium: 1.2,
      hard: 1.5,
    }[difficulty] || 1.0;

    const confidenceMultiplier = 0.5 + (confidence * 0.5); // 0.5 to 1.0

    return Math.round(baseExperience * difficultyMultiplier * confidenceMultiplier);
  }

  /**
   * Update Bonsai progress and check for level up
   */
  private static async updateBonsaiProgress(
    userId: string,
    experienceGained: number
  ): Promise<boolean> {
    const { data: bonsaiState } = await adminSupabase
      .from('bonsai_states')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!bonsaiState) return false;

    const newExperience = bonsaiState.experience + experienceGained;
    const newTotalExperience = bonsaiState.total_experience + experienceGained;
    
    let newLevel = bonsaiState.level;
    let newExperienceToNext = bonsaiState.experience_to_next;
    let levelUpOccurred = false;

    // Check for level up
    if (newExperience >= bonsaiState.experience_to_next) {
      newLevel += 1;
      newExperienceToNext = this.calculateExperienceToNext(newLevel);
      levelUpOccurred = true;

      // Update growth stage based on level
      const newGrowthStage = this.getGrowthStageForLevel(newLevel);
      
      await adminSupabase
        .from('bonsai_states')
        .update({
          level: newLevel,
          experience: 0,
          experience_to_next: newExperienceToNext,
          total_experience: newTotalExperience,
          growth_stage: newGrowthStage,
        })
        .eq('user_id', userId);
    } else {
      await adminSupabase
        .from('bonsai_states')
        .update({
          experience: newExperience,
          total_experience: newTotalExperience,
        })
        .eq('user_id', userId);
    }

    return levelUpOccurred;
  }

  /**
   * Calculate experience needed for next level
   */
  private static calculateExperienceToNext(level: number): number {
    return Math.floor(100 * Math.pow(1.1, level - 1));
  }

  /**
   * Get growth stage for level
   */
  private static getGrowthStageForLevel(level: number): string {
    if (level < 5) return 'seed';
    if (level < 10) return 'sprout';
    if (level < 20) return 'sapling';
    if (level < 35) return 'young_tree';
    if (level < 50) return 'mature_tree';
    if (level < 75) return 'ancient_tree';
    return 'wisdom_tree';
  }

  /**
   * Log interaction in database
   */
  private static async logInteraction(
    context: AIInteractionContext,
    userMessage: ChatMessage,
    aiResponse: AIResponse,
    provider: AIProvider,
    experienceGained: number,
    levelUpOccurred: boolean
  ): Promise<string> {
    const { data } = await adminSupabase
      .from('ai_interactions')
      .insert({
        user_id: context.userId,
        session_id: context.sessionId,
        request_text: userMessage.content,
        request_images: userMessage.images ? JSON.stringify(userMessage.images) : null,
        request_context: JSON.stringify({
          subject: context.subject,
          difficulty: context.difficulty,
          questionType: context.questionType,
          detectedPlatform: context.detectedPlatform,
          screenContext: context.screenContext,
        }),
        voice_input: context.voiceInput || false,
        voice_intent: context.voiceIntent || null,
        ai_provider: provider,
        model_used: 'gpt-4-turbo', // Only using OpenAI for now
        assistance_type: aiResponse.assistanceType,
        response_text: aiResponse.content,
        response_time_ms: aiResponse.responseTimeMs,
        tokens_used: aiResponse.tokensUsed,
        confidence_score: aiResponse.confidence,
        experience_gained: experienceGained,
        level_up_occurred: levelUpOccurred,
      })
      .select('id')
      .single();

    return data?.id;
  }

  /**
   * Save spiral questions
   */
  private static async saveSpiralQuestions(
    interactionId: string,
    spiralQuestions: any[]
  ): Promise<void> {
    for (const question of spiralQuestions) {
      await adminSupabase
        .from('spiral_questions')
        .insert({
          interaction_id: interactionId,
          question_text: question.question,
          question_type: question.type,
          difficulty_relative: question.difficulty,
          expected_answer: question.expectedAnswer,
          explanation: question.explanation,
        });
    }
  }

  /**
   * Update usage tracking
   */
  private static async updateUsageTracking(userId: string): Promise<void> {
    // await StripeService.incrementUsage(userId, 'ai_interactions', 1); // Temporarily disabled
  }

  /**
   * Get remaining usage for user
   */
  private static async getRemainingUsage(userId: string) {
    // const subscription = await StripeService.getUserSubscription(userId); // Temporarily disabled
    const subscription = { tier: 'free', remaining: { ai_interactions: 100 }, daily_ai_interactions_limit: 5 };
    if (!subscription) {
      return { daily: 0, unlimited: false };
    }

    const dailyLimit = subscription.daily_ai_interactions_limit;
    if (dailyLimit === -1) {
      return { daily: -1, unlimited: true };
    }

    // Get today's usage
    const today = new Date().toISOString().split('T')[0];
    const { data: usage } = await adminSupabase
      .from('usage_tracking')
      .select('ai_interactions_count')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    const used = usage?.ai_interactions_count || 0;
    const remaining = Math.max(0, dailyLimit - used);

    return { daily: remaining, unlimited: false };
  }

  /**
   * Get user's conversation history
   */
  static async getConversationHistory(
    userId: string,
    sessionId?: string,
    limit: number = 10
  ): Promise<ChatMessage[]> {
    let query = adminSupabase
      .from('ai_interactions')
      .select('request_text, response_text, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit * 2); // Get more to account for request/response pairs

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    const { data: interactions } = await query;

    if (!interactions) return [];

    const messages: ChatMessage[] = [];
    
    for (const interaction of interactions.reverse()) {
      messages.push({
        role: 'user',
        content: interaction.request_text,
      });
      messages.push({
        role: 'assistant',
        content: interaction.response_text,
      });
    }

    return messages.slice(-limit);
  }

  /**
   * Handle voice input with speech recognition
   */
  static async processVoiceInput(
    audioBlob: Blob,
    context: AIInteractionContext
  ): Promise<string> {
    // This would integrate with browser's speech recognition or a service like Whisper
    // For now, return a placeholder
    throw new Error('Voice processing not yet implemented');
  }
}