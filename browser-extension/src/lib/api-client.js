// API client for communicating with Bonsai SAT Prep backend and OpenAI

import { API_ENDPOINTS, ERROR_TYPES, MESSAGE_TYPES } from './constants.js';
import { Storage, ErrorHandler } from './utils.js';

class BonsaiAPIClient {
  constructor() {
    this.baseURL = API_ENDPOINTS.base;
    this.openAIKey = null;
    this.authToken = null;
    this.initialized = false;
  }

  /**
   * Initialize the API client
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Get stored auth token and OpenAI key
      this.authToken = await Storage.get('auth_token');
      this.openAIKey = await this.getOpenAIKey();
      this.initialized = true;
      console.log('Bonsai API Client initialized');
    } catch (error) {
      await ErrorHandler.handleError(error, 'API client initialization');
    }
  }

  /**
   * Get OpenAI API key from backend or settings
   */
  async getOpenAIKey() {
    try {
      // First try to get from backend
      const response = await chrome.runtime.sendMessage({
        action: 'getApiKey'
      });

      if (response.success && response.apiKey) {
        return response.apiKey;
      }

      // Fallback: Check for stored key in Chrome storage
      try {
        const result = await chrome.storage.sync.get(['openai_api_key']);
        if (result.openai_api_key) {
          return result.openai_api_key;
        }
      } catch (storageError) {
        console.warn('Failed to access Chrome storage:', storageError);
      }
      
      // Final fallback - this should be set via extension options
      console.warn('No OpenAI API key found. Please configure in extension settings.');
      return null;
    } catch (error) {
      console.error('Failed to get OpenAI key:', error);
      return null;
    }
  }

  /**
   * Make HTTP request with error handling
   */
  async request(endpoint, options = {}) {
    await this.initialize();
    
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
        'X-Extension-Version': chrome.runtime.getManifest().version,
        'X-Platform': this.detectPlatform()
      }
    };

    // Add auth token if available
    if (this.authToken) {
      defaultOptions.headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const requestOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };

    try {
      const response = await fetch(url, requestOptions);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw ErrorHandler.createError(
          ERROR_TYPES.NETWORK_ERROR,
          'Unable to connect to Bonsai servers. Please check your internet connection.',
          { endpoint, showToUser: true }
        );
      }
      
      throw ErrorHandler.createError(
        ERROR_TYPES.NETWORK_ERROR,
        error.message,
        { endpoint, showToUser: true }
      );
    }
  }

  /**
   * Detect current platform
   */
  detectPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes('khanacademy.org')) return 'khan_academy';
    if (hostname.includes('satsuite.collegeboard.org')) return 'bluebook';
    if (hostname.includes('collegeboard.org')) return 'college_board';
    return 'unknown';
  }

  /**
   * Authenticate with the backend
   */
  async authenticate(credentials) {
    try {
      const response = await this.request('/api/auth/extension', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });

      if (response.token) {
        this.authToken = response.token;
        await Storage.set('auth_token', this.authToken);
        await Storage.set('user_data', response.user);
        return response;
      }

      throw new Error('Authentication failed');
    } catch (error) {
      throw ErrorHandler.createError(
        ERROR_TYPES.AUTH_ERROR,
        'Failed to authenticate with Bonsai servers',
        { showToUser: true }
      );
    }
  }

  /**
   * Check authentication status
   */
  async checkAuth() {
    try {
      const response = await this.request('/api/auth/verify', {
        method: 'GET'
      });
      return response.authenticated;
    } catch (error) {
      this.authToken = null;
      await Storage.remove('auth_token');
      return false;
    }
  }

  /**
   * Send chat message to AI
   */
  async sendChatMessage(message, context = {}) {
    try {
      const response = await this.request('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({
          message,
          context: {
            platform: this.detectPlatform(),
            url: window.location.href,
            timestamp: Date.now(),
            ...context
          },
          assistanceType: context.assistanceType || 'explanation',
          source: 'extension'
        })
      });

      // Track usage
      await this.trackUsage('ai_interaction', {
        messageLength: message.length,
        platform: this.detectPlatform()
      });

      return response;
    } catch (error) {
      throw ErrorHandler.createError(
        ERROR_TYPES.NETWORK_ERROR,
        'Failed to get AI response. Please try again.',
        { showToUser: true }
      );
    }
  }

  /**
   * Analyze context for question detection
   */
  async analyzeContext(contextData) {
    try {
      const response = await this.request('/api/glass/analyze-context', {
        method: 'POST',
        body: JSON.stringify({
          context: contextData,
          platform: this.detectPlatform(),
          url: window.location.href,
          timestamp: Date.now()
        })
      });

      return response;
    } catch (error) {
      throw ErrorHandler.createError(
        ERROR_TYPES.CONTEXT_ERROR,
        'Failed to analyze page context',
        { context: 'context_analysis' }
      );
    }
  }

  /**
   * Get user's subscription status and features
   */
  async getSubscriptionStatus() {
    try {
      const response = await this.request('/api/subscription/user-access', {
        method: 'GET'
      });
      return response;
    } catch (error) {
      throw ErrorHandler.createError(
        ERROR_TYPES.NETWORK_ERROR,
        'Failed to check subscription status',
        { context: 'subscription_check' }
      );
    }
  }

  /**
   * Check feature access
   */
  async checkFeatureAccess(feature) {
    try {
      const response = await this.request('/api/subscription/check-feature', {
        method: 'POST',
        body: JSON.stringify({ feature })
      });
      return response;
    } catch (error) {
      throw ErrorHandler.createError(
        ERROR_TYPES.NETWORK_ERROR,
        'Failed to check feature access',
        { context: 'feature_check' }
      );
    }
  }

  /**
   * Track usage for analytics and limits
   */
  async trackUsage(action, metadata = {}) {
    try {
      await this.request('/api/analytics/track', {
        method: 'POST',
        body: JSON.stringify({
          action,
          metadata: {
            platform: this.detectPlatform(),
            url: window.location.href,
            timestamp: Date.now(),
            source: 'extension',
            ...metadata
          }
        })
      });
    } catch (error) {
      // Don't throw for tracking errors, just log them
      console.warn('Failed to track usage:', error);
    }
  }

  /**
   * Update Bonsai progress
   */
  async updateBonsaiProgress(progressData) {
    try {
      const response = await this.request('/api/bonsai/progress', {
        method: 'POST',
        body: JSON.stringify({
          experience: progressData.experience,
          action: progressData.action,
          context: {
            platform: this.detectPlatform(),
            subject: progressData.subject,
            difficulty: progressData.difficulty,
            timestamp: Date.now()
          }
        })
      });
      return response;
    } catch (error) {
      throw ErrorHandler.createError(
        ERROR_TYPES.NETWORK_ERROR,
        'Failed to update Bonsai progress',
        { context: 'bonsai_progress' }
      );
    }
  }

  /**
   * Get Bonsai state
   */
  async getBonsaiState() {
    try {
      const response = await this.request('/api/bonsai/state', {
        method: 'GET'
      });
      return response;
    } catch (error) {
      throw ErrorHandler.createError(
        ERROR_TYPES.NETWORK_ERROR,
        'Failed to get Bonsai state',
        { context: 'bonsai_state' }
      );
    }
  }

  /**
   * Submit feedback
   */
  async submitFeedback(feedback) {
    try {
      const response = await this.request('/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          ...feedback,
          context: {
            platform: this.detectPlatform(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            timestamp: Date.now()
          }
        })
      });
      return response;
    } catch (error) {
      throw ErrorHandler.createError(
        ERROR_TYPES.NETWORK_ERROR,
        'Failed to submit feedback',
        { showToUser: true }
      );
    }
  }

  /**
   * Get platform-specific help
   */
  async getPlatformHelp(platform) {
    try {
      const response = await this.request(`/api/help/${platform}`, {
        method: 'GET'
      });
      return response;
    } catch (error) {
      throw ErrorHandler.createError(
        ERROR_TYPES.NETWORK_ERROR,
        'Failed to get platform help',
        { context: 'platform_help' }
      );
    }
  }

  /**
   * Request quick hint for current question
   */
  async getQuickHint(questionContext) {
    try {
      const response = await this.request('/api/ai/quick-hint', {
        method: 'POST',
        body: JSON.stringify({
          question: questionContext.question,
          subject: questionContext.subject,
          platform: this.detectPlatform(),
          context: questionContext
        })
      });

      await this.trackUsage('quick_hint', {
        subject: questionContext.subject,
        platform: this.detectPlatform()
      });

      return response;
    } catch (error) {
      throw ErrorHandler.createError(
        ERROR_TYPES.NETWORK_ERROR,
        'Failed to get quick hint',
        { showToUser: true }
      );
    }
  }

  /**
   * Report an issue
   */
  async reportIssue(issueData) {
    try {
      const response = await this.request('/api/support/report-issue', {
        method: 'POST',
        body: JSON.stringify({
          ...issueData,
          context: {
            platform: this.detectPlatform(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            extensionVersion: chrome.runtime.getManifest().version,
            timestamp: Date.now()
          }
        })
      });
      return response;
    } catch (error) {
      throw ErrorHandler.createError(
        ERROR_TYPES.NETWORK_ERROR,
        'Failed to report issue',
        { showToUser: true }
      );
    }
  }

  /**
   * Make OpenAI API request for SAT question analysis
   */
  async analyzeQuestionWithAI(questionData, context = {}) {
    try {
      if (!this.openAIKey) {
        throw new Error('OpenAI API key not available');
      }

      const prompt = this.buildSATPrompt(questionData, context);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openAIKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are Bonsai, an expert SAT tutor. Provide helpful, encouraging guidance to help students understand SAT questions without giving away the answer directly. Focus on teaching concepts and problem-solving strategies.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        response: data.choices[0].message.content,
        usage: data.usage
      };

    } catch (error) {
      console.error('OpenAI API error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.generateFallbackResponse(questionData)
      };
    }
  }

  /**
   * Build SAT-specific prompt for AI analysis
   */
  buildSATPrompt(questionData, context) {
    const { subject, type, difficulty, text, choices } = questionData;
    
    let prompt = `Please help me understand this SAT ${subject} question:\n\n`;
    prompt += `Question: ${text}\n\n`;
    
    if (choices && choices.length > 0) {
      prompt += `Answer choices:\n`;
      choices.forEach(choice => {
        prompt += `${choice.label}. ${choice.text}\n`;
      });
      prompt += '\n';
    }

    prompt += `Please provide:\n`;
    prompt += `1. Key concepts being tested\n`;
    prompt += `2. A hint to get me started (don't give the answer)\n`;
    prompt += `3. The general approach or strategy\n`;
    prompt += `4. Common mistakes to avoid\n\n`;
    
    if (context.userLevel) {
      prompt += `Student level: ${context.userLevel}\n`;
    }
    
    prompt += `Please be encouraging and educational rather than just giving the answer.`;
    
    return prompt;
  }

  /**
   * Generate fallback response when AI is unavailable
   */
  generateFallbackResponse(questionData) {
    const { subject, type } = questionData;
    
    const fallbacks = {
      math: {
        'multiple-choice': 'This is a multiple-choice math question. Try breaking it down step by step: 1) Identify what the question is asking, 2) Look for key information, 3) Consider which math concepts apply, 4) Work through the problem systematically.',
        'grid-in': 'This is a student-produced response question. Make sure to: 1) Read carefully what the question asks, 2) Show your work, 3) Double-check your calculations, 4) Enter your answer in the correct format.',
        'default': 'For math questions, start by identifying the key concepts and information given. Work step by step and check your answer.'
      },
      reading: {
        'multiple-choice': 'For reading questions: 1) Read the passage carefully, 2) Identify the main idea, 3) Look for evidence in the text, 4) Eliminate obviously wrong answers, 5) Choose the best supported option.',
        'default': 'Reading comprehension questions require careful analysis of the passage. Look for evidence that supports your answer choice.'
      },
      writing: {
        'multiple-choice': 'For writing questions: 1) Read the sentence in context, 2) Check for grammar, punctuation, and style issues, 3) Consider clarity and conciseness, 4) Choose the most effective option.',
        'default': 'Writing questions test grammar, style, and clarity. Read each option carefully and choose the most effective version.'
      }
    };

    const subjectFallbacks = fallbacks[subject] || {};
    return subjectFallbacks[type] || subjectFallbacks['default'] || 'Take your time to read the question carefully and consider what concepts are being tested.';
  }
}

// Create singleton instance
const apiClient = new BonsaiAPIClient();

// Initialize on import
apiClient.initialize().catch(error => {
  console.error('Failed to initialize API client:', error);
});

export default apiClient;