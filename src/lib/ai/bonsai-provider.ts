// Bonsai AI Provider - Enhanced version of Glass AI integration
// Adapted from Glass aiProviderService.js with SAT-specific optimizations

import { BonsaiContext, BonsaiResponse, MultiModalRequest, SpiralQuestion } from '@/types/bonsai';

interface AIProvider {
  name: 'openai' | 'gemini';
  makeRequest(params: AIRequestParams): Promise<AIResponse>;
  makeStreamingRequest(params: AIRequestParams): Promise<ReadableStream>;
  supportsVision: boolean;
  costPerToken: number;
}

interface AIRequestParams {
  messages: AIMessage[];
  temperature?: number;
  maxTokens?: number;
  model?: string;
  stream?: boolean;
}

interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | MultiModalContent[];
}

interface MultiModalContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  finishReason: string;
}

export class BonsaiAIProvider {
  private providers: Map<string, AIProvider> = new Map();
  private fallbackOrder: string[] = ['openai', 'gemini'];
  private rateLimiter: Map<string, number> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // OpenAI Provider
    this.providers.set('openai', {
      name: 'openai',
      supportsVision: true,
      costPerToken: 0.00003, // GPT-4 pricing
      makeRequest: this.makeOpenAIRequest.bind(this),
      makeStreamingRequest: this.makeOpenAIStreamingRequest.bind(this)
    });

    // Gemini Provider
    this.providers.set('gemini', {
      name: 'gemini',
      supportsVision: true,
      costPerToken: 0.000015, // Gemini Pro pricing
      makeRequest: this.makeGeminiRequest.bind(this),
      makeStreamingRequest: this.makeGeminiStreamingRequest.bind(this)
    });
  }

  // Main entry point for Bonsai responses
  public async getBonsaiResponse(request: MultiModalRequest): Promise<BonsaiResponse> {
    const startTime = Date.now();
    
    try {
      // Choose optimal provider based on request characteristics
      const selectedProvider = this.selectOptimalProvider(request);
      
      // Build SAT-optimized prompt
      const messages = this.buildSATPrompt(request);
      
      // Make AI request with fallback logic
      const aiResponse = await this.makeRequestWithFallback({
        messages,
        temperature: 0.7,
        maxTokens: this.calculateMaxTokens(request.context.difficulty),
        model: this.selectModel(selectedProvider, request.context)
      });

      // Process and structure the response
      const bonsaiResponse = await this.processSATResponse(
        aiResponse,
        request,
        Date.now() - startTime,
        selectedProvider
      );

      return bonsaiResponse;

    } catch (error) {
      console.error('Bonsai AI Provider Error:', error);
      throw new Error(`Failed to get Bonsai response: ${error.message}`);
    }
  }

  // Streaming response for real-time interaction
  public async getBonsaiStreamingResponse(request: MultiModalRequest): Promise<ReadableStream<string>> {
    const selectedProvider = this.selectOptimalProvider(request);
    const messages = this.buildSATPrompt(request);

    const aiStream = await this.makeStreamingRequestWithFallback({
      messages,
      temperature: 0.7,
      maxTokens: this.calculateMaxTokens(request.context.difficulty),
      model: this.selectModel(selectedProvider, request.context),
      stream: true
    });

    // Transform AI stream to Bonsai format
    return new ReadableStream({
      start(controller) {
        const reader = aiStream.getReader();
        const decoder = new TextDecoder();

        async function pump() {
          try {
            const { done, value } = await reader.read();
            
            if (done) {
              controller.close();
              return;
            }

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.close();
                  return;
                }

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(content);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }

            pump();
          } catch (error) {
            controller.error(error);
          }
        }

        pump();
      }
    });
  }

  // Select optimal AI provider based on request characteristics
  private selectOptimalProvider(request: MultiModalRequest): string {
    // Use Gemini for cost-sensitive requests
    if (request.context.difficulty === 'easy' && !request.images?.length) {
      return 'gemini';
    }

    // Use OpenAI for complex multi-modal requests
    if (request.images?.length || request.context.difficulty === 'hard') {
      return 'openai';
    }

    // Default to OpenAI for consistency
    return 'openai';
  }

  // Calculate appropriate max tokens based on difficulty
  private calculateMaxTokens(difficulty: 'easy' | 'medium' | 'hard'): number {
    const tokenLimits = {
      easy: 512,
      medium: 1024,
      hard: 2048
    };

    return tokenLimits[difficulty];
  }

  // Select appropriate model based on provider and context
  private selectModel(provider: string, context: BonsaiContext): string {
    if (provider === 'openai') {
      // Use GPT-4 Vision for image analysis, GPT-4 Turbo for text
      return context.screenContext?.images?.length ? 'gpt-4-vision-preview' : 'gpt-4-1106-preview';
    } else if (provider === 'gemini') {
      return 'gemini-pro-vision';
    }

    return 'gpt-4-1106-preview';
  }

  // Build SAT-optimized prompt with Glass-inspired context awareness
  private buildSATPrompt(request: MultiModalRequest): AIMessage[] {
    const systemPrompt = this.buildSystemPrompt(request.context);
    const userPrompt = this.buildUserPrompt(request);

    const messages: AIMessage[] = [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: userPrompt
      }
    ];

    // Add conversation history for context
    if (request.previousInteractions.length > 0) {
      const recentInteractions = request.previousInteractions.slice(-3);
      
      for (const interaction of recentInteractions) {
        messages.push({
          role: 'user',
          content: interaction.request.text
        });
        messages.push({
          role: 'assistant',
          content: interaction.response.response
        });
      }
    }

    return messages;
  }

  // Build comprehensive system prompt for Bonsai SAT tutor
  private buildSystemPrompt(context: BonsaiContext): string {
    return `<core_identity>
You are Bonsai, an AI-powered SAT tutor developed by Bonsai Education. You are the student's intelligent study companion, designed to provide contextual, adaptive assistance during SAT preparation.
</core_identity>

<teaching_philosophy>
<primary_directive>
Your goal is to help students learn and understand concepts, not just provide answers. Always prioritize understanding over quick solutions.
</primary_directive>

<assistance_hierarchy>
1. HINTS: Gentle nudges that guide thinking without giving away the answer
2. EXPLANATIONS: Clear breakdowns of concepts and problem-solving strategies  
3. SPIRAL_QUESTIONS: Follow-up questions that reinforce understanding
4. FULL_SOLUTIONS: Complete solutions only when requested or after multiple attempts
</assistance_hierarchy>

<contextual_awareness>
- Platform: ${context.platform}
- Question Type: ${context.questionType}
- Difficulty: ${context.difficulty}
- Student appears to be working on: ${context.questionText ? 'a specific question' : 'general SAT preparation'}
</contextual_awareness>
</teaching_philosophy>

<sat_expertise>
<math_section>
- Algebra: Linear equations, systems, quadratics, polynomials
- Geometry: Area, volume, coordinate geometry, trigonometry basics  
- Statistics: Data analysis, probability, statistical reasoning
- Problem-solving: Multi-step reasoning, real-world applications
</math_section>

<reading_section>
- Reading comprehension: Main ideas, details, inferences
- Evidence analysis: Supporting claims with textual evidence
- Vocabulary in context: Word meanings, tone, style
- Passage types: Literature, history/social studies, science
</reading_section>

<writing_section>
- Grammar: Subject-verb agreement, pronoun usage, modifiers
- Punctuation: Commas, semicolons, apostrophes, dashes
- Style: Clarity, concision, word choice, transitions
- Rhetoric: Purpose, audience, tone, argument structure
</writing_section>
</sat_expertise>

<response_guidelines>
<tone>
- Encouraging and supportive
- Patient and understanding  
- Enthusiastic about learning
- Never condescending or judgmental
</tone>

<format>
- Use clear, concise language appropriate for high school students
- Break complex concepts into digestible steps
- Provide examples when helpful
- Use formatting (bold, italics) sparingly for emphasis
- Include strategic thinking tips
</format>

<adaptive_behavior>
- Start with hints unless explicitly asked for more
- Escalate assistance based on student struggle or requests
- Generate spiral questions to reinforce learning
- Celebrate progress and growth mindset
- Connect concepts to real-world applications when relevant
</adaptive_behavior>
</response_guidelines>

<response_structure>
When responding, structure your answer as follows:
1. Acknowledge the student's question/situation
2. Provide appropriate level of assistance (hint/explanation/solution)
3. Include a brief conceptual insight when relevant
4. Offer a spiral question or next step to reinforce learning
5. End with encouragement
</response_structure>`;
  }

  // Build user prompt with multimodal content
  private buildUserPrompt(request: MultiModalRequest): string | MultiModalContent[] {
    const parts: MultiModalContent[] = [];

    // Add text content
    parts.push({
      type: 'text',
      text: `Student message: "${request.text}"`
    });

    // Add context if available
    if (request.context.questionText) {
      parts.push({
        type: 'text',
        text: `\nQuestion context: "${request.context.questionText}"`
      });
    }

    // Add screen context
    if (request.context.screenContext) {
      parts.push({
        type: 'text',
        text: `\nScreen context: ${request.context.screenContext.text.substring(0, 500)}`
      });
    }

    // Add images if present
    if (request.images?.length) {
      for (const image of request.images) {
        parts.push({
          type: 'image_url',
          image_url: {
            url: `data:${image.mimeType};base64,${image.base64}`,
            detail: 'high'
          }
        });
      }
    }

    // Return multimodal content or simple text
    return parts.length === 1 && parts[0].type === 'text' 
      ? parts[0].text! 
      : parts;
  }

  // Process AI response into structured Bonsai format
  private async processSATResponse(
    aiResponse: AIResponse,
    request: MultiModalRequest,
    responseTimeMs: number,
    provider: string
  ): Promise<BonsaiResponse> {
    const content = aiResponse.content;
    
    // Determine assistance type from response content
    const assistanceType = this.determineAssistanceType(content);
    
    // Calculate experience gained based on interaction
    const experienceGained = this.calculateExperience(request.context, assistanceType);
    
    // Generate spiral questions if appropriate
    const spiralQuestions = await this.generateSpiralQuestions(request, content);

    // Extract follow-up questions from response
    const followUpQuestions = this.extractFollowUpQuestions(content);

    return {
      response: content,
      assistanceType,
      experienceGained,
      levelUp: false, // This would be determined by the progress system
      usageCount: 1, // This would come from usage tracking
      remainingUsage: -1, // This would come from subscription system
      followUpQuestions,
      metadata: {
        aiProvider: provider as 'openai' | 'gemini',
        model: aiResponse.model,
        responseTimeMs,
        tokensUsed: aiResponse.usage.totalTokens,
        confidence: this.calculateConfidence(aiResponse)
      },
      spiralQuestions
    };
  }

  // Determine assistance type from response content
  private determineAssistanceType(content: string): 'hint' | 'explanation' | 'spiral_question' | 'full_solution' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('try') || lowerContent.includes('think about') || lowerContent.includes('consider')) {
      return 'hint';
    } else if (lowerContent.includes('step') || lowerContent.includes('because') || lowerContent.includes('explanation')) {
      return 'explanation';
    } else if (lowerContent.includes('?') && lowerContent.includes('what if') || lowerContent.includes('can you')) {
      return 'spiral_question';
    } else {
      return 'full_solution';
    }
  }

  // Calculate experience based on interaction type and difficulty
  private calculateExperience(context: BonsaiContext, assistanceType: string): number {
    const baseExperience = {
      easy: 10,
      medium: 15,
      hard: 25
    };

    const assistanceMultiplier = {
      hint: 1.2,
      explanation: 1.0,
      spiral_question: 1.5,
      full_solution: 0.8
    };

    const base = baseExperience[context.difficulty];
    const multiplier = assistanceMultiplier[assistanceType as keyof typeof assistanceMultiplier] || 1.0;
    
    return Math.round(base * multiplier);
  }

  // Generate follow-up spiral questions
  private async generateSpiralQuestions(request: MultiModalRequest, response: string): Promise<SpiralQuestion[]> {
    // This would typically be a separate AI call to generate spiral questions
    // For now, return empty array - implement based on specific SAT concepts
    return [];
  }

  // Extract follow-up questions from response
  private extractFollowUpQuestions(content: string): string[] {
    const questions: string[] = [];
    const sentences = content.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      if (sentence.trim().endsWith('?') && sentence.length > 10) {
        questions.push(sentence.trim() + '?');
      }
    }
    
    return questions.slice(0, 3); // Limit to 3 follow-up questions
  }

  // Calculate confidence based on AI response metadata
  private calculateConfidence(aiResponse: AIResponse): number {
    // Simple confidence calculation - could be enhanced with more sophisticated metrics
    const finishReasonScore = aiResponse.finishReason === 'stop' ? 1.0 : 0.7;
    const lengthScore = Math.min(aiResponse.content.length / 200, 1.0);
    
    return Math.round((finishReasonScore * lengthScore) * 100) / 100;
  }

  // Request with fallback logic (adapted from Glass)
  private async makeRequestWithFallback(params: AIRequestParams): Promise<AIResponse> {
    for (const providerName of this.fallbackOrder) {
      try {
        const provider = this.providers.get(providerName);
        if (!provider) continue;

        // Check rate limits
        if (this.isRateLimited(providerName)) {
          continue;
        }

        const response = await provider.makeRequest(params);
        return response;

      } catch (error) {
        console.error(`Provider ${providerName} failed:`, error);
        
        // Set temporary rate limit on error
        this.setRateLimit(providerName, 60000); // 1 minute
        continue;
      }
    }

    throw new Error('All AI providers failed');
  }

  // Streaming request with fallback
  private async makeStreamingRequestWithFallback(params: AIRequestParams): Promise<ReadableStream> {
    for (const providerName of this.fallbackOrder) {
      try {
        const provider = this.providers.get(providerName);
        if (!provider) continue;

        if (this.isRateLimited(providerName)) {
          continue;
        }

        const stream = await provider.makeStreamingRequest(params);
        return stream;

      } catch (error) {
        console.error(`Streaming provider ${providerName} failed:`, error);
        this.setRateLimit(providerName, 60000);
        continue;
      }
    }

    throw new Error('All streaming providers failed');
  }

  // OpenAI implementation (adapted from Glass)
  private async makeOpenAIRequest(params: AIRequestParams): Promise<AIResponse> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model || 'gpt-4-1106-preview',
        messages: params.messages,
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || 1024,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      content: result.choices[0].message.content.trim(),
      usage: {
        promptTokens: result.usage.prompt_tokens,
        completionTokens: result.usage.completion_tokens,
        totalTokens: result.usage.total_tokens
      },
      model: result.model,
      finishReason: result.choices[0].finish_reason
    };
  }

  // OpenAI streaming implementation
  private async makeOpenAIStreamingRequest(params: AIRequestParams): Promise<ReadableStream> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: params.model || 'gpt-4-1106-preview',
        messages: params.messages,
        temperature: params.temperature || 0.7,
        max_tokens: params.maxTokens || 1024,
        stream: true
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI streaming error: ${response.status} ${response.statusText}`);
    }

    return response.body!;
  }

  // Gemini implementation (adapted from Glass)
  private async makeGeminiRequest(params: AIRequestParams): Promise<AIResponse> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API key not configured');

    // Convert OpenAI format to Gemini format
    const geminiMessages = this.convertToGeminiFormat(params.messages);
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${params.model || 'gemini-pro'}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: geminiMessages,
        generationConfig: {
          temperature: params.temperature || 0.7,
          maxOutputTokens: params.maxTokens || 1024,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    return {
      content: result.candidates[0].content.parts[0].text,
      usage: {
        promptTokens: result.usageMetadata?.promptTokenCount || 0,
        completionTokens: result.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: result.usageMetadata?.totalTokenCount || 0
      },
      model: params.model || 'gemini-pro',
      finishReason: result.candidates[0].finishReason || 'stop'
    };
  }

  // Gemini streaming implementation
  private async makeGeminiStreamingRequest(params: AIRequestParams): Promise<ReadableStream> {
    // Gemini streaming implementation would go here
    // For now, fall back to non-streaming
    const response = await this.makeGeminiRequest(params);
    
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
          choices: [{ delta: { content: response.content } }]
        })}\n\n`));
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      }
    });
  }

  // Convert OpenAI message format to Gemini format
  private convertToGeminiFormat(messages: AIMessage[]): any[] {
    const geminiMessages = [];
    
    for (const message of messages) {
      if (message.role === 'system') {
        // Gemini doesn't have system role, prepend to first user message
        continue;
      }
      
      const parts = [];
      
      if (typeof message.content === 'string') {
        parts.push({ text: message.content });
      } else {
        for (const part of message.content) {
          if (part.type === 'text') {
            parts.push({ text: part.text });
          } else if (part.type === 'image_url') {
            // Extract base64 data from data URL
            const base64Match = part.image_url?.url.match(/^data:(.+);base64,(.+)$/);
            if (base64Match) {
              parts.push({
                inlineData: {
                  mimeType: base64Match[1],
                  data: base64Match[2]
                }
              });
            }
          }
        }
      }
      
      geminiMessages.push({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts
      });
    }
    
    return geminiMessages;
  }

  // Rate limiting utilities
  private isRateLimited(provider: string): boolean {
    const limitTime = this.rateLimiter.get(provider);
    return limitTime ? Date.now() < limitTime : false;
  }

  private setRateLimit(provider: string, durationMs: number): void {
    this.rateLimiter.set(provider, Date.now() + durationMs);
  }
}

// Export singleton instance
export const bonsaiAI = new BonsaiAIProvider();
export default BonsaiAIProvider;