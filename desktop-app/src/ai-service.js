// AI Service for Bonsai SAT Assistant
// Handles OpenAI integration for question analysis and assistance

const OpenAI = require('openai');
const logger = require('./logger');

class AIService {
  constructor(apiKey = null) {
    this.apiKey = apiKey;
    this.openai = null;
    this.isConfigured = false;
    
    if (apiKey) {
      this.configure(apiKey);
    }
  }

  configure(apiKey) {
    try {
      this.apiKey = apiKey;
      this.openai = new OpenAI({
        apiKey: apiKey
      });
      this.isConfigured = true;
      logger.success('AI Service configured with OpenAI API');
    } catch (error) {
      logger.logError('AIService.configure', error);
      this.isConfigured = false;
    }
  }

  async testConnection() {
    if (!this.isConfigured) {
      throw new Error('AI Service not configured with API key');
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-nano',
        messages: [
          { role: 'user', content: 'Hello! Can you help with SAT prep?' }
        ],
        max_tokens: 50
      });

      logger.success('AI Service connection test successful');
      return {
        success: true,
        response: response.choices[0].message.content
      };
    } catch (error) {
      logger.logError('AIService.testConnection', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async analyzeQuestion(questionText, questionData = {}) {
    if (!this.isConfigured) {
      throw new Error('AI Service not configured');
    }

    try {
      logger.info('Analyzing SAT question with AI');

      const systemPrompt = `You are Bonsai, an expert SAT tutor assistant. Your role is to help students understand SAT questions through guidance and explanations, NOT by giving direct answers.

IMPORTANT GUIDELINES:
- Provide hints and explanations that help students think through problems
- Focus on teaching concepts and strategies
- Never give direct answers during practice
- Encourage critical thinking and problem-solving skills
- Be encouraging and supportive
- Keep responses concise but helpful

The student is practicing with: ${questionData.subject || 'Unknown'} questions.`;

      const userPrompt = `Please analyze this SAT question and provide educational guidance:

"${questionText}"

Provide:
1. A brief analysis of what this question is testing
2. Key concepts the student should understand
3. A helpful hint to guide their thinking (without giving the answer)
4. Any relevant SAT strategies`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-nano',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      const aiResponse = response.choices[0].message.content;
      
      logger.success('AI analysis completed');
      
      return {
        success: true,
        analysis: aiResponse,
        questionType: questionData.subject || 'general',
        timestamp: Date.now()
      };

    } catch (error) {
      logger.logError('AIService.analyzeQuestion', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getHint(questionText, questionData = {}) {
    if (!this.isConfigured) {
      throw new Error('AI Service not configured');
    }

    try {
      const systemPrompt = `You are Bonsai, a helpful SAT tutor. Provide a gentle hint that guides the student toward the solution without giving the answer directly. Keep it under 100 words.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-nano',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Give me a hint for this SAT question: "${questionText}"` }
        ],
        max_tokens: 150,
        temperature: 0.6
      });

      return {
        success: true,
        hint: response.choices[0].message.content,
        type: 'hint'
      };

    } catch (error) {
      logger.logError('AIService.getHint', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async explainConcept(questionText, questionData = {}) {
    if (!this.isConfigured) {
      throw new Error('AI Service not configured');
    }

    try {
      const systemPrompt = `You are Bonsai, an expert SAT tutor. Explain the key concepts being tested in this question. Focus on teaching the underlying principles that will help with similar questions. Keep it educational and under 200 words.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-nano',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Explain the concepts being tested in this SAT question: "${questionText}"` }
        ],
        max_tokens: 250,
        temperature: 0.7
      });

      return {
        success: true,
        explanation: response.choices[0].message.content,
        type: 'concept'
      };

    } catch (error) {
      logger.logError('AIService.explainConcept', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async getSolution(questionText, questionData = {}) {
    if (!this.isConfigured) {
      throw new Error('AI Service not configured');
    }

    try {
      const systemPrompt = `You are Bonsai, an expert SAT tutor. Provide a step-by-step solution that teaches the problem-solving process. Focus on methodology and reasoning, not just the final answer. Keep it educational and clear.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-nano',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Provide a step-by-step solution for this SAT question: "${questionText}"` }
        ],
        max_tokens: 400,
        temperature: 0.6
      });

      return {
        success: true,
        solution: response.choices[0].message.content,
        type: 'solution'
      };

    } catch (error) {
      logger.logError('AIService.getSolution', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async generatePracticeQuestions(subject = 'general', difficulty = 'medium', count = 5) {
    if (!this.isConfigured) {
      throw new Error('AI Service not configured');
    }

    try {
      logger.info(`Generating ${count} practice questions for ${subject}`);

      const systemPrompt = `You are Bonsai, an expert SAT question generator. Create authentic SAT-style practice questions that match the official format and difficulty level.`;

      const userPrompt = `Generate ${count} SAT practice questions for ${subject} at ${difficulty} difficulty level. 

Format each question as:
**Question X:** [question text]
**A)** [choice A]
**B)** [choice B]
**C)** [choice C]
**D)** [choice D]

Make sure questions are:
- Authentic SAT style
- Appropriate difficulty level
- Educational and challenging
- Cover key ${subject} concepts`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-nano',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.8
      });

      logger.success(`Generated ${count} practice questions`);

      return {
        success: true,
        questions: response.choices[0].message.content,
        subject,
        difficulty,
        count,
        timestamp: Date.now()
      };

    } catch (error) {
      logger.logError('AIService.generatePracticeQuestions', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get AI recommendations based on performance
  async getStudyRecommendations(performanceData = {}) {
    if (!this.isConfigured) {
      return {
        success: false,
        error: 'AI Service not configured'
      };
    }

    try {
      const systemPrompt = `You are Bonsai, an expert SAT tutor. Based on a student's performance data, provide personalized study recommendations. Be encouraging and specific.`;

      const userPrompt = `Based on this performance data, what should the student focus on?

Performance Summary:
- Questions attempted: ${performanceData.questionsAttempted || 0}
- Help requests: ${performanceData.helpRequests || 0}
- Subjects practiced: ${performanceData.subjects || 'Various'}
- Session duration: ${performanceData.sessionDuration || 'Unknown'}

Provide 3-4 specific study recommendations.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4.1-nano',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 300,
        temperature: 0.7
      });

      return {
        success: true,
        recommendations: response.choices[0].message.content,
        timestamp: Date.now()
      };

    } catch (error) {
      logger.logError('AIService.getStudyRecommendations', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Check if service is ready
  isReady() {
    return this.isConfigured && this.apiKey;
  }

  // Get service status
  getStatus() {
    return {
      configured: this.isConfigured,
      hasApiKey: !!this.apiKey,
      ready: this.isReady()
    };
  }
}

module.exports = AIService;