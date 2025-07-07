// API client for communicating with Bonsai SAT Prep backend

import { API_ENDPOINTS, ERROR_TYPES, MESSAGE_TYPES } from './constants.js';
import { Storage, ErrorHandler } from './utils.js';

class BonsaiAPIClient {
  constructor() {
    this.baseURL = API_ENDPOINTS.base;
    this.authToken = null;
    this.initialized = false;
  }

  /**
   * Initialize the API client
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      // Get stored auth token
      this.authToken = await Storage.get('auth_token');
      this.initialized = true;
    } catch (error) {
      await ErrorHandler.handleError(error, 'API client initialization');
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
}

// Create singleton instance
const apiClient = new BonsaiAPIClient();

// Initialize on import
apiClient.initialize().catch(error => {
  console.error('Failed to initialize API client:', error);
});

export default apiClient;