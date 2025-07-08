/**
 * Response Optimizer - Revolutionary AI system for generating optimal tutoring responses
 * This system analyzes the question, student state, and context to generate the most effective response
 */

import { OpenAI } from 'openai';
import { QuestionAnalysis, StudentState } from './advanced-question-analyzer';

export interface ResponseContext {
  questionAnalysis: QuestionAnalysis;
  studentState: StudentState;
  behaviorMetrics: BehaviorMetrics;
  requestType: 'help' | 'hint' | 'explanation' | 'check_answer' | 'spiral_question';
  urgency: 'low' | 'medium' | 'high'; // Based on frustration level
}

export interface BehaviorMetrics {
  timeOnQuestion: number;
  attemptsCount: number;
  frustrationLevel: number;
  confidenceLevel: number;
  attentionLevel: number;
}

export interface OptimizedResponse {
  content: string;
  responseType: 'hint' | 'explanation' | 'encouragement' | 'redirect' | 'spiral_question';
  confidence: number;
  adaptationReason: string;
  followUpSuggestions: string[];
  estimatedHelpfulness: number;
  visualAids?: VisualAid[];
  interactiveElements?: InteractiveElement[];
}

export interface VisualAid {
  type: 'diagram' | 'graph' | 'equation' | 'step_visualization';
  content: string;
  description: string;
}

export interface InteractiveElement {
  type: 'quiz' | 'practice_problem' | 'concept_check' | 'reflection_prompt';
  content: string;
  expectedResponse: string;
}

export class ResponseOptimizer {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  /**
   * Generate the optimal response based on comprehensive analysis
   */
  async generateOptimalResponse(context: ResponseContext): Promise<OptimizedResponse> {
    try {
      // Step 1: Determine optimal response strategy
      const strategy = this.determineResponseStrategy(context);
      
      // Step 2: Generate multiple response candidates
      const candidates = await this.generateResponseCandidates(context, strategy);
      
      // Step 3: Evaluate and select the best response
      const selectedResponse = await this.selectBestResponse(candidates, context);
      
      // Step 4: Add adaptive enhancements
      const enhancedResponse = await this.addAdaptiveEnhancements(selectedResponse, context);
      
      return enhancedResponse;
    } catch (error) {
      console.error('Response optimization failed:', error);
      throw new Error('Failed to generate optimal response');
    }
  }

  /**
   * Determine the optimal response strategy based on student state and context
   */
  private determineResponseStrategy(context: ResponseContext): ResponseStrategy {
    const { questionAnalysis, studentState, behaviorMetrics } = context;

    // Analyze student's current state
    const frustrationLevel = behaviorMetrics.frustrationLevel;
    const confidenceLevel = behaviorMetrics.confidenceLevel;
    const knowledgeLevel = studentState.knowledgeLevel[questionAnalysis.topic] || 0.5;
    const learningStyle = studentState.learningStyle;

    // Determine strategy based on multiple factors
    let responseType: 'hint' | 'explanation' | 'encouragement' | 'redirect' | 'spiral_question';
    let depth: 'surface' | 'moderate' | 'deep';
    let tone: 'encouraging' | 'neutral' | 'challenging';

    // Response type logic
    if (frustrationLevel > 0.7) {
      responseType = 'encouragement';
      depth = 'surface';
      tone = 'encouraging';
    } else if (knowledgeLevel < 0.3) {
      responseType = 'explanation';
      depth = 'deep';
      tone = 'encouraging';
    } else if (context.requestType === 'hint' || confidenceLevel > 0.6) {
      responseType = 'hint';
      depth = 'surface';
      tone = 'neutral';
    } else {
      responseType = 'explanation';
      depth = 'moderate';
      tone = 'neutral';
    }

    // Adapt for learning style
    const visualElements = learningStyle === 'visual';
    const stepByStep = learningStyle === 'analytical';
    const practical = learningStyle === 'practical';

    return {
      responseType,
      depth,
      tone,
      visualElements,
      stepByStep,
      practical,
      urgency: context.urgency
    };
  }

  /**
   * Generate multiple response candidates for selection
   */
  private async generateResponseCandidates(context: ResponseContext, strategy: ResponseStrategy): Promise<ResponseCandidate[]> {
    const candidates: ResponseCandidate[] = [];

    // Generate 3 different approaches
    const approaches = ['socratic', 'direct', 'guided_discovery'];

    for (const approach of approaches) {
      const prompt = this.buildResponsePrompt(context, strategy, approach);
      const response = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: this.getSystemPrompt(strategy, approach) },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 800
      });

      candidates.push({
        content: response.choices[0].message.content || '',
        approach,
        estimatedEffectiveness: this.estimateEffectiveness(approach, context)
      });
    }

    return candidates;
  }

  /**
   * Build the detailed prompt for response generation
   */
  private buildResponsePrompt(context: ResponseContext, strategy: ResponseStrategy, approach: string): string {
    const { questionAnalysis, studentState, behaviorMetrics } = context;

    return `Generate a ${strategy.responseType} for this SAT question context:

QUESTION ANALYSIS:
- Subject: ${questionAnalysis.subject}
- Topic: ${questionAnalysis.topic}
- Difficulty: ${questionAnalysis.difficulty}
- Key Concepts: ${questionAnalysis.concepts.join(', ')}
- Common Mistakes: ${questionAnalysis.commonMistakes.join(', ')}

STUDENT STATE:
- Knowledge Level in Topic: ${studentState.knowledgeLevel[questionAnalysis.topic] || 'Unknown'}
- Learning Style: ${studentState.learningStyle}
- Current Mood: ${studentState.currentMood}
- Preferred Explanation Style: ${studentState.preferredExplanationStyle}

BEHAVIOR CONTEXT:
- Time on Question: ${behaviorMetrics.timeOnQuestion} seconds
- Frustration Level: ${behaviorMetrics.frustrationLevel}/1.0
- Confidence Level: ${behaviorMetrics.confidenceLevel}/1.0
- Previous Attempts: ${behaviorMetrics.attemptsCount}

RESPONSE REQUIREMENTS:
- Type: ${strategy.responseType}
- Depth: ${strategy.depth}
- Tone: ${strategy.tone}
- Approach: ${approach}
- Include Visual Elements: ${strategy.visualElements}
- Step-by-Step: ${strategy.stepByStep}
- Practical Examples: ${strategy.practical}

Generate a response that is perfectly tailored to this student's current state and needs.`;
  }

  /**
   * Get specialized system prompt for different approaches
   */
  private getSystemPrompt(strategy: ResponseStrategy, approach: string): string {
    const basePrompt = `You are Bonsai, the most intelligent and empathetic SAT tutor ever created. Your responses are perfectly adapted to each student's unique needs, learning style, and current emotional state.`;

    const approachPrompts = {
      socratic: `Use the Socratic method - guide the student to discover the answer through carefully crafted questions. Help them think through the problem step by step.`,
      direct: `Provide clear, direct guidance while being supportive. Explain concepts clearly and help the student understand the path to the solution.`,
      guided_discovery: `Create a learning experience where the student feels like they're discovering the solution with your gentle guidance. Make learning feel natural and intuitive.`
    };

    const strategyPrompts = {
      hint: `Provide subtle guidance that nudges the student in the right direction without giving away the answer.`,
      explanation: `Provide a clear, comprehensive explanation that builds understanding step by step.`,
      encouragement: `Focus on building confidence and reducing frustration while providing gentle guidance.`,
      redirect: `Help the student approach the problem from a different angle or with a different strategy.`,
      spiral_question: `Create a similar but simpler practice question that reinforces the same concept.`
    };

    return `${basePrompt}

${approachPrompts[approach as keyof typeof approachPrompts]}

${strategyPrompts[strategy.responseType as keyof typeof strategyPrompts]}

Always:
- Match the student's learning style and preferences
- Be aware of their emotional state and adapt accordingly
- Build on their existing knowledge
- Prevent common mistakes proactively
- Make learning feel engaging and achievable
- Use encouraging, supportive language`;
  }

  /**
   * Select the best response from candidates
   */
  private async selectBestResponse(candidates: ResponseCandidate[], context: ResponseContext): Promise<ResponseCandidate> {
    // For now, select based on estimated effectiveness
    // In production, this could use A/B testing data or ML models
    let bestCandidate = candidates[0];
    let bestScore = 0;

    for (const candidate of candidates) {
      const score = this.scoreResponse(candidate, context);
      if (score > bestScore) {
        bestScore = score;
        bestCandidate = candidate;
      }
    }

    return bestCandidate;
  }

  /**
   * Score response candidates based on multiple factors
   */
  private scoreResponse(candidate: ResponseCandidate, context: ResponseContext): number {
    let score = candidate.estimatedEffectiveness;

    // Adjust score based on student state
    const { studentState, behaviorMetrics } = context;

    // Bonus for matching learning style
    if (studentState.learningStyle === 'visual' && candidate.content.includes('visualize')) {
      score += 0.1;
    }
    if (studentState.learningStyle === 'analytical' && candidate.content.includes('step')) {
      score += 0.1;
    }

    // Adjust for emotional state
    if (behaviorMetrics.frustrationLevel > 0.7 && candidate.content.includes('encourage')) {
      score += 0.2;
    }

    // Penalty for being too complex when student is struggling
    if (behaviorMetrics.frustrationLevel > 0.5 && candidate.content.length > 500) {
      score -= 0.1;
    }

    return score;
  }

  /**
   * Add adaptive enhancements to the selected response
   */
  private async addAdaptiveEnhancements(response: ResponseCandidate, context: ResponseContext): Promise<OptimizedResponse> {
    const visualAids = await this.generateVisualAids(response, context);
    const interactiveElements = await this.generateInteractiveElements(response, context);
    const followUpSuggestions = this.generateFollowUpSuggestions(context);

    return {
      content: response.content,
      responseType: this.determineResponseType(response.content),
      confidence: this.calculateResponseConfidence(response, context),
      adaptationReason: this.generateAdaptationReason(context),
      followUpSuggestions,
      estimatedHelpfulness: response.estimatedEffectiveness,
      visualAids,
      interactiveElements
    };
  }

  /**
   * Generate visual aids when appropriate
   */
  private async generateVisualAids(response: ResponseCandidate, context: ResponseContext): Promise<VisualAid[]> {
    const aids: VisualAid[] = [];

    // Generate visual aids for math problems
    if (context.questionAnalysis.subject === 'math' && context.studentState.learningStyle === 'visual') {
      if (context.questionAnalysis.visualElements.some(el => el.type === 'equation')) {
        aids.push({
          type: 'equation',
          content: 'Interactive equation visualization',
          description: 'Step-by-step equation solving with visual highlighting'
        });
      }

      if (context.questionAnalysis.topic.includes('graph')) {
        aids.push({
          type: 'graph',
          content: 'Interactive graph visualization',
          description: 'Manipulatable graph to explore the concept'
        });
      }
    }

    return aids;
  }

  /**
   * Generate interactive elements for engagement
   */
  private async generateInteractiveElements(response: ResponseCandidate, context: ResponseContext): Promise<InteractiveElement[]> {
    const elements: InteractiveElement[] = [];

    // Add concept check for explanations
    if (context.requestType === 'explanation') {
      elements.push({
        type: 'concept_check',
        content: 'Quick check: Can you identify the key concept we just discussed?',
        expectedResponse: context.questionAnalysis.concepts[0] || 'main concept'
      });
    }

    // Add practice problem for hints
    if (context.requestType === 'hint' && context.studentState.currentMood === 'confident') {
      elements.push({
        type: 'practice_problem',
        content: 'Try this similar problem to reinforce your understanding',
        expectedResponse: 'practice solution'
      });
    }

    return elements;
  }

  /**
   * Generate follow-up suggestions
   */
  private generateFollowUpSuggestions(context: ResponseContext): string[] {
    const suggestions: string[] = [];

    // Based on student performance
    const knowledgeLevel = context.studentState.knowledgeLevel[context.questionAnalysis.topic] || 0.5;

    if (knowledgeLevel < 0.4) {
      suggestions.push("Would you like me to explain the fundamental concepts for this topic?");
      suggestions.push("Should we try a simpler example first?");
    } else if (knowledgeLevel > 0.7) {
      suggestions.push("Ready for a more challenging problem on this topic?");
      suggestions.push("Would you like to explore advanced applications of this concept?");
    }

    // Based on behavior
    if (context.behaviorMetrics.frustrationLevel > 0.6) {
      suggestions.push("Would you like to take a short break and come back to this?");
      suggestions.push("Should we try a different approach to this problem?");
    }

    return suggestions;
  }

  /**
   * Helper methods
   */
  private estimateEffectiveness(approach: string, context: ResponseContext): number {
    const baseScores = {
      socratic: 0.8,
      direct: 0.7,
      guided_discovery: 0.9
    };

    let score = baseScores[approach as keyof typeof baseScores] || 0.5;

    // Adjust based on student state
    if (context.studentState.learningStyle === 'analytical' && approach === 'socratic') {
      score += 0.1;
    }
    if (context.behaviorMetrics.frustrationLevel > 0.7 && approach === 'direct') {
      score += 0.1;
    }

    return score;
  }

  private determineResponseType(content: string): 'hint' | 'explanation' | 'encouragement' | 'redirect' | 'spiral_question' {
    if (content.includes('try') || content.includes('consider') || content.includes('think about')) {
      return 'hint';
    }
    if (content.includes('step') || content.includes('first') || content.includes('because')) {
      return 'explanation';
    }
    if (content.includes('great') || content.includes('you can') || content.includes('keep going')) {
      return 'encouragement';
    }
    return 'explanation';
  }

  private calculateResponseConfidence(response: ResponseCandidate, context: ResponseContext): number {
    let confidence = response.estimatedEffectiveness;

    // Increase confidence if response matches student preferences
    if (context.studentState.preferredExplanationStyle === 'detailed' && response.content.length > 300) {
      confidence += 0.1;
    }
    if (context.studentState.preferredExplanationStyle === 'concise' && response.content.length < 200) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }

  private generateAdaptationReason(context: ResponseContext): string {
    const reasons: string[] = [];

    if (context.behaviorMetrics.frustrationLevel > 0.6) {
      reasons.push("Adapted for high frustration level");
    }
    if (context.studentState.currentMood === 'struggling') {
      reasons.push("Tailored for struggling student");
    }
    if (context.studentState.learningStyle === 'visual') {
      reasons.push("Enhanced for visual learner");
    }

    return reasons.join('; ') || 'Standard response';
  }
}

// Supporting interfaces
interface ResponseStrategy {
  responseType: 'hint' | 'explanation' | 'encouragement' | 'redirect' | 'spiral_question';
  depth: 'surface' | 'moderate' | 'deep';
  tone: 'encouraging' | 'neutral' | 'challenging';
  visualElements: boolean;
  stepByStep: boolean;
  practical: boolean;
  urgency: 'low' | 'medium' | 'high';
}

interface ResponseCandidate {
  content: string;
  approach: string;
  estimatedEffectiveness: number;
}