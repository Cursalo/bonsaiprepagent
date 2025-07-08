/**
 * Advanced AI Service for Desktop App
 * Integrates with web API and provides advanced analysis
 */

const axios = require('axios');
const EventEmitter = require('events');

class AdvancedAIService extends EventEmitter {
  constructor(store) {
    super();
    this.store = store;
    this.webApiUrl = 'http://localhost:3000/api'; // Local web app API
    this.fallbackToOpenAI = true;
    this.requestQueue = [];
    this.isProcessing = false;
  }

  async initialize() {
    console.log('🤖 Initializing Advanced AI Service...');
    
    // Test connection to web API
    try {
      await this.testWebApiConnection();
      console.log('✅ Connected to web API');
    } catch (error) {
      console.log('⚠️ Web API not available, using fallback mode');
    }
  }

  async testWebApiConnection() {
    const response = await axios.get(`${this.webApiUrl}/health`, {
      timeout: 5000
    });
    return response.status === 200;
  }

  async advancedChat(messages, assistanceType, context, screenshot, behaviorMetrics) {
    const requestData = {
      messages,
      assistanceType,
      context: {
        ...context,
        desktop: true,
        platform: process.platform,
        timestamp: Date.now()
      },
      screenshot,
      behaviorMetrics
    };

    try {
      // Try web API first for advanced features
      const response = await axios.post(`${this.webApiUrl}/ai/advanced-chat`, requestData, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        this.emit('response-received', {
          type: 'advanced',
          response: response.data
        });
        return response.data;
      }
    } catch (error) {
      console.log('Web API failed, falling back to local AI:', error.message);
    }

    // Fallback to local OpenAI
    if (this.fallbackToOpenAI) {
      return await this.localChat(messages, assistanceType, context);
    }

    throw new Error('AI service unavailable');
  }

  async localChat(messages, assistanceType, context) {
    const apiKey = this.store.get('settings.apiKey');
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Enhanced system prompts based on context
    const systemPrompt = this.buildAdvancedSystemPrompt(assistanceType, context);
    
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 1000,
        temperature: 0.7,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const aiResponse = {
        success: true,
        response: response.data.choices[0].message.content,
        type: assistanceType,
        confidence: 0.8,
        fallback: true,
        suggestions: this.generateSuggestions(assistanceType),
        metadata: {
          model: 'gpt-4o-mini',
          tokens: response.data.usage?.total_tokens || 0,
          timestamp: Date.now()
        }
      };

      this.emit('response-received', {
        type: 'local',
        response: aiResponse
      });

      return aiResponse;

    } catch (error) {
      console.error('Local AI failed:', error);
      throw new Error(`AI request failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  buildAdvancedSystemPrompt(assistanceType, context) {
    let basePrompt = `You are Bonsai, an advanced SAT tutoring AI assistant running as a desktop application. You have Glass-inspired contextual awareness and can see what the student is working on.`;

    // Add context awareness
    if (context.behaviorMetrics) {
      const metrics = context.behaviorMetrics;
      basePrompt += `\n\nCurrent session context:`;
      
      if (metrics.strugglingIndicators && metrics.strugglingIndicators.length > 0) {
        basePrompt += `\n- Student showing struggle patterns: ${metrics.strugglingIndicators.map(s => s.type).join(', ')}`;
      }
      
      if (metrics.questionsDetected > 0) {
        basePrompt += `\n- SAT questions detected on screen: ${metrics.questionsDetected}`;
      }
      
      if (metrics.sessionDuration > 300000) { // 5 minutes
        basePrompt += `\n- Extended session duration: ${Math.round(metrics.sessionDuration / 60000)} minutes`;
      }
      
      if (metrics.helpRequests === 0 && metrics.questionsDetected > 0) {
        basePrompt += `\n- Student hasn't asked for help despite questions being present`;
      }
    }

    // Add assistance type specific guidance
    switch (assistanceType) {
      case 'proactive':
        basePrompt += `\n\nYou are proactively offering help because behavioral patterns suggest the student might be struggling. Be gentle, encouraging, and non-intrusive. Ask if they'd like a hint or explanation rather than assuming they need help.`;
        break;
      case 'hint':
        basePrompt += `\n\nProvide a subtle hint that guides thinking without giving away the answer. Use the Socratic method - ask leading questions that help them discover the solution.`;
        break;
      case 'explanation':
        basePrompt += `\n\nExplain the underlying concept clearly with examples. Focus on building understanding, not just solving this specific problem.`;
        break;
      case 'solution':
        basePrompt += `\n\nProvide a complete step-by-step solution with clear reasoning for each step. Explain why each step is necessary and how it connects to the overall strategy.`;
        break;
      case 'practice':
        basePrompt += `\n\nGenerate similar practice problems that test the same concept but with different scenarios. Include brief explanations of how to approach each one.`;
        break;
      default:
        basePrompt += `\n\nHelp the student understand and learn. Adapt your response style to their apparent needs and comfort level.`;
    }

    basePrompt += `\n\nKey principles:
- Be encouraging and supportive
- Focus on learning and understanding, not just answers
- Use clear, concise explanations
- Provide examples when helpful
- Build confidence while maintaining academic rigor
- Acknowledge their effort and progress`;

    return basePrompt;
  }

  generateSuggestions(assistanceType) {
    const suggestions = {
      hint: [
        "Would you like me to explain the concept behind this?",
        "Want to try a similar practice problem?",
        "Should I show you the complete solution?"
      ],
      explanation: [
        "Would you like some practice problems on this topic?",
        "Should I break this down into smaller steps?",
        "Want to see how this connects to other SAT topics?"
      ],
      solution: [
        "Would you like to practice similar problems?",
        "Should I explain any of these steps in more detail?",
        "Want to see alternative solution methods?"
      ],
      practice: [
        "Should I explain the approach for any of these?",
        "Would you like hints for these practice problems?",
        "Want more practice problems of the same type?"
      ]
    };

    return suggestions[assistanceType] || [
      "Is there anything specific you'd like me to explain?",
      "Would you like more practice on this topic?",
      "Should I help you with a different type of problem?"
    ];
  }

  async trackBehavior(behaviorData) {
    try {
      // Send to web API for advanced analytics
      await axios.post(`${this.webApiUrl}/ai/track-behavior`, behaviorData, {
        timeout: 5000
      });
    } catch (error) {
      // Store locally if web API is unavailable
      const localBehavior = this.store.get('localBehavior', []);
      localBehavior.push({
        ...behaviorData,
        timestamp: Date.now()
      });
      
      // Keep only last 100 entries
      if (localBehavior.length > 100) {
        localBehavior.shift();
      }
      
      this.store.set('localBehavior', localBehavior);
    }
  }

  async getBehavioralPrediction(userId) {
    try {
      const response = await axios.get(`${this.webApiUrl}/ai/behavior-prediction/${userId}`, {
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      // Local prediction based on stored behavior
      return this.generateLocalPrediction();
    }
  }

  generateLocalPrediction() {
    const localBehavior = this.store.get('localBehavior', []);
    const recentBehavior = localBehavior.filter(
      entry => Date.now() - entry.timestamp < 300000 // Last 5 minutes
    );

    if (recentBehavior.length === 0) {
      return {
        needsHelp: false,
        confidence: 0.1,
        suggestedAction: 'wait',
        timeUntilIntervention: 0,
        reasoning: ['Insufficient local data for prediction']
      };
    }

    // Simple local analysis
    const struggleCount = recentBehavior.filter(
      entry => entry.strugglingIndicators && entry.strugglingIndicators.length > 0
    ).length;

    const needsHelp = struggleCount > recentBehavior.length * 0.3;
    const confidence = Math.min(recentBehavior.length / 10, 0.8);

    return {
      needsHelp,
      confidence,
      suggestedAction: needsHelp ? 'gentle_prompt' : 'wait',
      timeUntilIntervention: needsHelp ? 30000 : 0,
      reasoning: [
        `Local analysis of ${recentBehavior.length} recent behaviors`,
        `Struggle indicators in ${struggleCount} entries`,
        'Limited to local data only'
      ]
    };
  }

  async analyzeScreenshot(screenshot, context = {}) {
    try {
      // Use web API for advanced image analysis
      const response = await axios.post(`${this.webApiUrl}/ai/analyze-screenshot`, {
        screenshot,
        context
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      // Fallback to local analysis
      return this.basicScreenshotAnalysis(screenshot);
    }
  }

  basicScreenshotAnalysis(screenshot) {
    // Basic analysis without advanced AI
    const size = Buffer.byteLength(screenshot, 'base64');
    
    return {
      success: true,
      analysis: {
        hasText: size > 10000, // Rough estimate
        likelyQuestion: false,
        suggestedAction: 'manual_review',
        confidence: 0.3
      },
      fallback: true,
      message: 'Basic analysis only - advanced features require web API connection'
    };
  }

  // Queue management for handling multiple requests
  async queueRequest(requestFn, priority = 'normal') {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        execute: requestFn,
        resolve,
        reject,
        priority,
        timestamp: Date.now()
      });

      this.processQueue();
    });
  }

  async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    // Sort by priority and timestamp
    this.requestQueue.sort((a, b) => {
      if (a.priority === 'high' && b.priority !== 'high') return -1;
      if (b.priority === 'high' && a.priority !== 'high') return 1;
      return a.timestamp - b.timestamp;
    });

    const request = this.requestQueue.shift();

    try {
      const result = await request.execute();
      request.resolve(result);
    } catch (error) {
      request.reject(error);
    } finally {
      this.isProcessing = false;
      // Process next request
      setTimeout(() => this.processQueue(), 100);
    }
  }

  getServiceStatus() {
    return {
      webApiConnected: false, // This would be updated by connection tests
      fallbackAvailable: this.fallbackToOpenAI,
      queueLength: this.requestQueue.length,
      isProcessing: this.isProcessing,
      lastUpdate: Date.now()
    };
  }
}

module.exports = AdvancedAIService;