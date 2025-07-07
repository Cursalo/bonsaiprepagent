import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  images?: string[]; // base64 encoded images
}

export interface AIResponse {
  content: string;
  tokensUsed: number;
  responseTimeMs: number;
  confidence: number;
  assistanceType: 'hint' | 'explanation' | 'spiral_question' | 'full_solution';
  spiralQuestions?: {
    question: string;
    type: 'concept_check' | 'application' | 'extension';
    difficulty: 'easier' | 'same' | 'harder';
    expectedAnswer: string;
    explanation: string;
  }[];
}

// SAT-specific system prompts for different assistance types
const SAT_SYSTEM_PROMPTS = {
  hint: `You are Bonsai, a Glass-inspired AI tutor specializing in SAT preparation. Your role is to provide subtle hints that guide students toward the correct answer without giving it away directly.

Guidelines:
- Provide gentle nudges, not direct answers
- Ask leading questions that help students think through the problem
- Reference specific SAT test-taking strategies
- Keep responses concise and encouraging
- Use the 🌱 emoji occasionally to maintain your Bonsai identity
- Focus on the thinking process, not just the answer`,

  explanation: `You are Bonsai, a Glass-inspired AI tutor specializing in SAT preparation. Your role is to provide clear, comprehensive explanations that help students understand both the solution and the underlying concepts.

Guidelines:
- Break down complex problems into digestible steps
- Explain the reasoning behind each step
- Connect to broader SAT concepts and strategies
- Include common mistakes students make
- Provide memory aids or tricks when applicable
- Use the 🌱 emoji occasionally to maintain your Bonsai identity
- End with a brief summary of key takeaways`,

  spiral_question: `You are Bonsai, a Glass-inspired AI tutor specializing in SAT preparation. Your role is to create follow-up questions that reinforce learning and test understanding at different difficulty levels.

Guidelines:
- Create 2-3 related questions that build on the original concept
- Vary difficulty: one easier, one similar, one harder
- Focus on the same underlying skill or concept
- Provide clear explanations for each question
- Make questions realistic to SAT format and style
- Use the 🌱 emoji occasionally to maintain your Bonsai identity`,

  full_solution: `You are Bonsai, a Glass-inspired AI tutor specializing in SAT preparation. Your role is to provide complete, step-by-step solutions while maintaining an educational focus.

Guidelines:
- Show every step of the solution process
- Explain the reasoning behind each decision
- Highlight key SAT strategies used
- Point out potential pitfalls or alternative approaches
- Connect to similar question types
- Use the 🌱 emoji occasionally to maintain your Bonsai identity
- Include a brief summary of the strategy used`
};

export class OpenAIService {
  /**
   * Generate AI response for SAT tutoring
   */
  static async generateResponse(
    messages: ChatMessage[],
    assistanceType: AIResponse['assistanceType'],
    context?: {
      subject?: 'math' | 'reading' | 'writing';
      difficulty?: 'easy' | 'medium' | 'hard';
      questionType?: string;
      userLevel?: number;
      previousInteractions?: number;
    }
  ): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      // Build context-aware system prompt
      const systemPrompt = this.buildSystemPrompt(assistanceType, context);
      
      // Prepare messages for OpenAI
      const openaiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        }))
      ];

      // Add image support for math problems
      if (messages.some(m => m.images?.length)) {
        // Handle images for vision model
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.images?.length) {
          openaiMessages[openaiMessages.length - 1] = {
            role: lastMessage.role,
            content: [
              { type: 'text', text: lastMessage.content },
              ...lastMessage.images.map(image => ({
                type: 'image_url' as const,
                image_url: { url: `data:image/jpeg;base64,${image}` }
              }))
            ] as any
          };
        }
      }

      const response = await openai.chat.completions.create({
        model: messages.some(m => m.images?.length) ? 'gpt-4-vision-preview' : 'gpt-4-turbo-preview',
        messages: openaiMessages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
      });

      const responseTimeMs = Date.now() - startTime;
      const content = response.choices[0]?.message?.content || '';
      const tokensUsed = response.usage?.total_tokens || 0;

      // Calculate confidence based on response quality
      const confidence = this.calculateConfidence(content, assistanceType, tokensUsed);

      // Generate spiral questions if requested
      let spiralQuestions;
      if (assistanceType === 'spiral_question') {
        spiralQuestions = await this.generateSpiralQuestions(content, context);
      }

      return {
        content,
        tokensUsed,
        responseTimeMs,
        confidence,
        assistanceType,
        spiralQuestions,
      };
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  /**
   * Build context-aware system prompt
   */
  private static buildSystemPrompt(
    assistanceType: AIResponse['assistanceType'],
    context?: any
  ): string {
    let prompt = SAT_SYSTEM_PROMPTS[assistanceType];

    if (context) {
      prompt += '\n\nAdditional Context:\n';
      
      if (context.subject) {
        prompt += `- Subject: ${context.subject.toUpperCase()}\n`;
      }
      
      if (context.difficulty) {
        prompt += `- Difficulty Level: ${context.difficulty}\n`;
      }
      
      if (context.userLevel) {
        prompt += `- Student Level: ${context.userLevel}/100 (adjust complexity accordingly)\n`;
      }
      
      if (context.previousInteractions) {
        prompt += `- Previous Interactions: ${context.previousInteractions} (consider student's progress)\n`;
      }

      // Subject-specific guidance
      if (context.subject === 'math') {
        prompt += `
Math-Specific Guidelines:
- Show mathematical reasoning step-by-step
- Use proper mathematical notation
- Reference relevant formulas and concepts
- Highlight calculator vs. no-calculator strategies`;
      } else if (context.subject === 'reading') {
        prompt += `
Reading-Specific Guidelines:
- Reference specific parts of the passage
- Explain how to identify key information
- Discuss context clues and inference strategies
- Focus on evidence-based reasoning`;
      } else if (context.subject === 'writing') {
        prompt += `
Writing-Specific Guidelines:
- Explain grammar rules and conventions
- Discuss sentence structure and clarity
- Highlight revision strategies
- Focus on rhetorical effectiveness`;
      }
    }

    return prompt;
  }

  /**
   * Calculate confidence score based on response quality
   */
  private static calculateConfidence(
    content: string,
    assistanceType: string,
    tokensUsed: number
  ): number {
    let confidence = 0.8; // Base confidence

    // Adjust based on content length and detail
    if (content.length > 200) confidence += 0.1;
    if (content.length < 50) confidence -= 0.2;

    // Adjust based on assistance type
    if (assistanceType === 'hint' && content.length > 300) confidence -= 0.1;
    if (assistanceType === 'full_solution' && content.length < 200) confidence -= 0.2;

    // Adjust based on token usage efficiency
    if (tokensUsed < 100) confidence -= 0.1;
    if (tokensUsed > 800) confidence -= 0.1;

    // Check for mathematical expressions (indicates detailed math help)
    if (/\$.*\$|\\\(.*\\\)/.test(content)) confidence += 0.1;

    // Check for structured formatting
    if (/\d+\.|•|-/.test(content)) confidence += 0.05;

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Generate spiral questions for reinforcement
   */
  private static async generateSpiralQuestions(
    originalResponse: string,
    context?: any
  ): Promise<AIResponse['spiralQuestions']> {
    try {
      const spiralPrompt = `Based on this SAT tutoring response, create 3 follow-up questions that reinforce the same concept:

Original Response: ${originalResponse}

Create questions with:
1. One EASIER question (concept_check) - tests basic understanding
2. One SAME difficulty question (application) - applies the concept similarly  
3. One HARDER question (extension) - extends or combines concepts

Format as JSON array with objects containing:
- question: the question text
- type: "concept_check", "application", or "extension"
- difficulty: "easier", "same", or "harder"
- expectedAnswer: the correct answer
- explanation: brief explanation of the solution

Make questions SAT-realistic and properly formatted.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: spiralPrompt }],
        temperature: 0.8,
        max_tokens: 800,
      });

      const content = response.choices[0]?.message?.content || '';
      
      // Try to parse JSON response
      try {
        return JSON.parse(content);
      } catch {
        // Fallback if JSON parsing fails
        return [];
      }
    } catch (error) {
      console.error('Error generating spiral questions:', error);
      return [];
    }
  }

  /**
   * Analyze question context from image or text
   */
  static async analyzeQuestionContext(
    questionText?: string,
    questionImage?: string
  ): Promise<{
    subject: 'math' | 'reading' | 'writing';
    difficulty: 'easy' | 'medium' | 'hard';
    topics: string[];
    questionType: string;
  }> {
    try {
      const analysisPrompt = `Analyze this SAT question and return a JSON object with:
- subject: "math", "reading", or "writing"
- difficulty: "easy", "medium", or "hard"
- topics: array of specific topics/concepts (max 3)
- questionType: specific question type (e.g., "linear equations", "main idea", "grammar")

${questionText ? `Question Text: ${questionText}` : ''}
${questionImage ? 'Image provided' : ''}

Return only valid JSON.`;

      const messages = [];
      if (questionImage) {
        messages.push({
          role: 'user' as const,
          content: [
            { type: 'text', text: analysisPrompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${questionImage}` } }
          ]
        });
      } else {
        messages.push({ role: 'user' as const, content: analysisPrompt });
      }

      const response = await openai.chat.completions.create({
        model: questionImage ? 'gpt-4-vision-preview' : 'gpt-4-turbo-preview',
        messages,
        temperature: 0.3,
        max_tokens: 200,
      });

      const content = response.choices[0]?.message?.content || '';
      return JSON.parse(content);
    } catch (error) {
      console.error('Error analyzing question context:', error);
      // Return default analysis
      return {
        subject: 'math',
        difficulty: 'medium',
        topics: ['general'],
        questionType: 'multiple_choice',
      };
    }
  }
}