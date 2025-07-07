import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ChatMessage, AIResponse } from './openai';

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

export class GeminiService {
  /**
   * Generate AI response using Gemini for SAT tutoring
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
      if (!genAI) {
        throw new Error('Gemini API key not configured');
      }

      // Choose model based on whether images are present
      const hasImages = messages.some(m => m.images?.length);
      const model = genAI.getGenerativeModel({ 
        model: hasImages ? 'gemini-pro-vision' : 'gemini-pro' 
      });

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(assistanceType, context);
      
      // Format conversation for Gemini
      const conversationHistory = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Get the last message (current user input)
      const lastMessage = messages[messages.length - 1];
      
      // Start chat with history
      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: 'I understand. I am Bonsai, your SAT tutor. I will help you with SAT preparation using the guidelines you\'ve provided. How can I assist you today? 🌱' }] },
          ...conversationHistory,
        ],
      });

      // Prepare the current message
      let messageParts = [{ text: lastMessage.content }];
      
      // Add images if present
      if (hasImages && lastMessage.images?.length) {
        messageParts = [
          { text: lastMessage.content },
          ...lastMessage.images.map(image => ({
            text: '',
            inlineData: {
              mimeType: 'image/jpeg',
              data: image,
            },
          })),
        ];
      }

      // Send message and get response
      const result = await chat.sendMessage(messageParts);
      const response = await result.response;
      const content = response.text();

      const responseTimeMs = Date.now() - startTime;
      
      // Estimate token usage (Gemini doesn't provide exact counts)
      const tokensUsed = this.estimateTokenUsage(
        messages.map(m => m.content).join(' ') + content
      );

      // Calculate confidence
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
      console.error('Gemini API error:', error);
      throw new Error('Failed to generate AI response with Gemini');
    }
  }

  /**
   * Build system prompt for Gemini
   */
  private static buildSystemPrompt(
    assistanceType: AIResponse['assistanceType'],
    context?: any
  ): string {
    const basePrompt = `You are Bonsai, a Glass-inspired AI tutor specializing in SAT preparation. You have a calm, encouraging personality and help students learn through guided discovery.

Your core identity:
- You are represented by a growing virtual Bonsai tree that evolves as students progress
- You provide contextual, real-time assistance inspired by Glass technology
- You adapt your responses based on the student's level and needs
- You use the 🌱 emoji occasionally to maintain your identity
- You are patient, supportive, and focused on building understanding

Response Type: ${assistanceType.toUpperCase()}`;

    const typeSpecificPrompts = {
      hint: `
Your role: Provide gentle guidance without giving direct answers
- Ask leading questions that help students think through problems
- Offer strategic hints about SAT test-taking approaches
- Encourage students to work through the reasoning process
- Keep responses concise but thoughtful`,

      explanation: `
Your role: Provide clear, comprehensive explanations
- Break down complex problems into understandable steps
- Explain the reasoning behind each step
- Connect concepts to broader SAT strategies
- Highlight common mistakes and how to avoid them
- Include memory aids or useful tricks`,

      spiral_question: `
Your role: Create reinforcement questions that build understanding
- Generate 2-3 related questions at different difficulty levels
- Focus on the same core concept or skill
- Make questions realistic to SAT format
- Provide clear explanations for each question
- Help students see patterns and connections`,

      full_solution: `
Your role: Provide complete step-by-step solutions
- Show every step of the problem-solving process
- Explain the reasoning behind each decision
- Highlight key SAT strategies being used
- Point out alternative approaches when relevant
- Summarize the main strategy or concept`
    };

    let prompt = basePrompt + '\n' + typeSpecificPrompts[assistanceType];

    if (context) {
      prompt += '\n\nContext for this interaction:';
      
      if (context.subject) {
        prompt += `\n- Subject: ${context.subject.toUpperCase()}`;
      }
      
      if (context.difficulty) {
        prompt += `\n- Difficulty: ${context.difficulty}`;
      }
      
      if (context.userLevel) {
        prompt += `\n- Student Level: ${context.userLevel}/100 (adjust your language and complexity accordingly)`;
      }
      
      if (context.previousInteractions) {
        prompt += `\n- Previous interactions: ${context.previousInteractions} (consider the student's familiarity with your style)`;
      }

      // Add subject-specific guidelines
      const subjectGuidelines = {
        math: `
Math-specific approach:
- Show mathematical reasoning clearly
- Use proper notation and formatting
- Reference formulas and theorems when relevant
- Distinguish between calculator and no-calculator strategies
- Focus on conceptual understanding, not just procedures`,

        reading: `
Reading-specific approach:
- Reference specific parts of passages
- Explain how to locate and interpret evidence
- Discuss inference and analysis strategies
- Focus on author's purpose and text structure
- Emphasize close reading techniques`,

        writing: `
Writing-specific approach:
- Explain grammar rules and conventions clearly
- Discuss sentence structure and clarity
- Focus on rhetorical effectiveness
- Highlight revision and editing strategies
- Connect to principles of good writing`
      };

      if (context.subject && subjectGuidelines[context.subject]) {
        prompt += '\n' + subjectGuidelines[context.subject];
      }
    }

    prompt += '\n\nRemember: You are helping students build confidence and mastery. Be encouraging and focus on the learning process, not just the right answer.';

    return prompt;
  }

  /**
   * Estimate token usage for Gemini (approximation)
   */
  private static estimateTokenUsage(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate confidence score
   */
  private static calculateConfidence(
    content: string,
    assistanceType: string,
    tokensUsed: number
  ): number {
    let confidence = 0.75; // Base confidence for Gemini

    // Adjust based on content quality indicators
    if (content.length > 200) confidence += 0.1;
    if (content.length < 50) confidence -= 0.2;

    // Check for structured content
    if (/\d+\.|Step \d+|First,|Next,|Finally,/.test(content)) confidence += 0.1;

    // Check for Bonsai personality indicators
    if (/🌱/.test(content)) confidence += 0.05;

    // Adjust for assistance type appropriateness
    if (assistanceType === 'hint' && content.length > 300) confidence -= 0.1;
    if (assistanceType === 'full_solution' && content.length < 150) confidence -= 0.15;

    // Check for mathematical formatting
    if (assistanceType === 'explanation' && /\*\*|\*|`/.test(content)) confidence += 0.05;

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Generate spiral questions using Gemini
   */
  private static async generateSpiralQuestions(
    originalResponse: string,
    context?: any
  ): Promise<AIResponse['spiralQuestions']> {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const spiralPrompt = `Based on this SAT tutoring response, create exactly 3 follow-up questions that reinforce the same concept:

Original Response: ${originalResponse}

Create questions following this pattern:
1. EASIER question (concept_check) - tests basic understanding of the core concept
2. SAME difficulty question (application) - applies the concept in a similar context
3. HARDER question (extension) - combines or extends the concept

For each question, provide:
- The complete question text (SAT-realistic format)
- The type: "concept_check", "application", or "extension"
- The difficulty: "easier", "same", or "harder"
- The expected answer
- A brief explanation of how to solve it

Format your response as a JSON array like this:
[
  {
    "question": "Question text here...",
    "type": "concept_check",
    "difficulty": "easier",
    "expectedAnswer": "Answer here",
    "explanation": "Brief explanation here"
  },
  ...
]

Return only valid JSON, no additional text.`;

      const result = await model.generateContent(spiralPrompt);
      const response = await result.response;
      const content = response.text();

      // Try to parse JSON response
      try {
        const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('Failed to parse spiral questions JSON:', parseError);
        return [];
      }
    } catch (error) {
      console.error('Error generating spiral questions with Gemini:', error);
      return [];
    }
  }

  /**
   * Analyze question context using Gemini Vision
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
      const model = genAI.getGenerativeModel({ 
        model: questionImage ? 'gemini-pro-vision' : 'gemini-pro' 
      });

      const analysisPrompt = `Analyze this SAT question and determine:
1. Subject area (math, reading, or writing)
2. Difficulty level (easy, medium, or hard)
3. Key topics/concepts covered (maximum 3)
4. Specific question type

${questionText ? `Question Text: ${questionText}` : ''}
${questionImage ? 'An image is provided showing the question.' : ''}

Respond with a JSON object in this exact format:
{
  "subject": "math|reading|writing",
  "difficulty": "easy|medium|hard", 
  "topics": ["topic1", "topic2", "topic3"],
  "questionType": "specific type description"
}

Return only valid JSON, no additional text.`;

      let result;
      if (questionImage) {
        result = await model.generateContent([
          analysisPrompt,
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: questionImage,
            },
          },
        ]);
      } else {
        result = await model.generateContent(analysisPrompt);
      }

      const response = await result.response;
      const content = response.text();

      // Clean and parse JSON
      const cleanedContent = content.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedContent);
    } catch (error) {
      console.error('Error analyzing question context with Gemini:', error);
      // Return sensible defaults
      return {
        subject: 'math',
        difficulty: 'medium',
        topics: ['general'],
        questionType: 'multiple_choice',
      };
    }
  }
}