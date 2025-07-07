// Glass-inspired context detection for SAT platforms

import { PLATFORMS, detectPlatform, MESSAGE_TYPES } from './constants.js';
import { DOM, Performance, Validation, ErrorHandler } from './utils.js';
import apiClient from './api-client.js';

class BonsaiContextDetector {
  constructor() {
    this.platform = null;
    this.isMonitoring = false;
    this.observers = [];
    this.lastContext = null;
    this.contextCallbacks = [];
    
    // Debounced functions for performance
    this.debouncedAnalyze = Performance.debounce(this.analyzeContext.bind(this), 500);
    this.debouncedNotify = Performance.debounce(this.notifyContextChange.bind(this), 300);
  }

  /**
   * Initialize context detection
   */
  async initialize() {
    try {
      this.platform = detectPlatform();
      
      if (!this.platform) {
        console.log('Bonsai: Platform not supported for context detection');
        return false;
      }

      console.log(`Bonsai: Initializing context detection for ${this.platform.name}`);
      
      // Set up DOM monitoring
      this.setupDOMObserver();
      this.setupURLObserver();
      this.setupKeyboardShortcuts();
      
      // Initial context analysis
      await this.analyzeContext();
      
      this.isMonitoring = true;
      return true;
    } catch (error) {
      await ErrorHandler.handleError(error, 'context_detector_init');
      return false;
    }
  }

  /**
   * Set up DOM mutation observer
   */
  setupDOMObserver() {
    const observer = new MutationObserver((mutations) => {
      let shouldAnalyze = false;
      
      mutations.forEach((mutation) => {
        // Check if new content was added
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Look for question-related elements
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const questionSelectors = this.platform.selectors.question;
              if (questionSelectors.some(selector => 
                node.matches && node.matches(selector) || 
                node.querySelector && node.querySelector(selector)
              )) {
                shouldAnalyze = true;
                break;
              }
            }
          }
        }
        
        // Check if content was modified
        if (mutation.type === 'characterData' || 
            (mutation.type === 'attributes' && 
             ['class', 'data-testid', 'id'].includes(mutation.attributeName))) {
          shouldAnalyze = true;
        }
      });
      
      if (shouldAnalyze) {
        this.debouncedAnalyze();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'data-testid', 'id'],
      characterData: true
    });

    this.observers.push(observer);
  }

  /**
   * Set up URL change observer
   */
  setupURLObserver() {
    let currentURL = window.location.href;
    
    const checkURL = () => {
      if (window.location.href !== currentURL) {
        currentURL = window.location.href;
        console.log('Bonsai: URL changed, re-analyzing context');
        
        // Delay analysis to allow page to load
        setTimeout(() => {
          this.debouncedAnalyze();
        }, 1000);
      }
    };

    // Monitor for navigation events
    window.addEventListener('popstate', checkURL);
    
    // Also monitor for pushstate/replacestate (SPA navigation)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
      originalPushState.apply(history, arguments);
      setTimeout(checkURL, 100);
    };
    
    history.replaceState = function() {
      originalReplaceState.apply(history, arguments);
      setTimeout(checkURL, 100);
    };
  }

  /**
   * Set up keyboard shortcuts
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      // Ctrl/Cmd + Shift + B: Toggle Bonsai
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'B') {
        event.preventDefault();
        this.triggerBonsaiToggle();
      }
      
      // Ctrl/Cmd + Shift + H: Quick help
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'H') {
        event.preventDefault();
        this.triggerQuickHelp();
      }
    });
  }

  /**
   * Analyze current page context
   */
  async analyzeContext() {
    if (!this.platform) return null;

    try {
      const context = await this.extractContext();
      
      // Only notify if context significantly changed
      if (this.hasContextChanged(context)) {
        this.lastContext = context;
        this.debouncedNotify(context);
        
        // Send to backend for analysis
        if (context.question || context.passage) {
          try {
            const analysis = await apiClient.analyzeContext(context);
            context.aiAnalysis = analysis;
          } catch (error) {
            console.warn('Failed to get AI analysis:', error);
          }
        }
      }
      
      return context;
    } catch (error) {
      await ErrorHandler.handleError(error, 'context_analysis');
      return null;
    }
  }

  /**
   * Extract context from current page
   */
  async extractContext() {
    const context = {
      platform: this.platform.name,
      url: window.location.href,
      timestamp: Date.now(),
      subject: null,
      question: null,
      passage: null,
      answerChoices: [],
      userInput: null,
      progress: null,
      metadata: {}
    };

    // Extract question text
    context.question = this.platform.contextExtractors.getQuestionText();
    
    // Extract subject
    context.subject = this.platform.contextExtractors.getSubject();
    
    // Extract passage (for reading questions)
    if (this.platform.contextExtractors.getPassage) {
      context.passage = this.platform.contextExtractors.getPassage();
    }
    
    // Extract answer choices
    context.answerChoices = this.extractAnswerChoices();
    
    // Extract user input
    context.userInput = this.extractUserInput();
    
    // Extract progress information
    context.progress = this.extractProgress();
    
    // Extract additional metadata
    context.metadata = {
      questionType: this.detectQuestionType(context.question),
      difficulty: this.estimateDifficulty(context),
      pageTitle: document.title,
      hasMultipleChoice: context.answerChoices.length > 0,
      hasUserInput: !!context.userInput
    };

    // Validate context
    if (context.question && !Validation.isValidQuestion(context.question)) {
      context.question = null;
    }

    return context;
  }

  /**
   * Extract answer choices
   */
  extractAnswerChoices() {
    const choices = [];
    const selectors = this.platform.selectors.answerChoices;
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        elements.forEach((element, index) => {
          const text = element.textContent.trim();
          if (text && text.length > 0) {
            choices.push({
              index,
              text,
              value: element.value || element.getAttribute('data-value') || text,
              selected: element.checked || element.classList.contains('selected')
            });
          }
        });
        break; // Use first selector that finds results
      }
    }
    
    return choices;
  }

  /**
   * Extract user input
   */
  extractUserInput() {
    const inputs = [];
    const selectors = this.platform.selectors.inputs;
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element.value && element.value.trim()) {
          inputs.push({
            type: element.type || 'text',
            value: element.value.trim(),
            placeholder: element.placeholder
          });
        }
      });
    }
    
    return inputs.length > 0 ? inputs : null;
  }

  /**
   * Extract progress information
   */
  extractProgress() {
    const selectors = this.platform.selectors.progress;
    const progress = {};
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent.trim();
        
        // Look for question numbers (e.g., "Question 5 of 20")
        const questionMatch = text.match(/(?:question|problem)\s*(\d+)\s*(?:of|\/)\s*(\d+)/i);
        if (questionMatch) {
          progress.currentQuestion = parseInt(questionMatch[1]);
          progress.totalQuestions = parseInt(questionMatch[2]);
        }
        
        // Look for percentage progress
        const percentMatch = text.match(/(\d+)%/);
        if (percentMatch) {
          progress.percentage = parseInt(percentMatch[1]);
        }
        
        // Look for time remaining
        const timeMatch = text.match(/(\d+):(\d+)/);
        if (timeMatch) {
          progress.timeRemaining = {
            minutes: parseInt(timeMatch[1]),
            seconds: parseInt(timeMatch[2])
          };
        }
      }
    }
    
    return Object.keys(progress).length > 0 ? progress : null;
  }

  /**
   * Detect question type
   */
  detectQuestionType(questionText) {
    if (!questionText) return 'unknown';
    
    const text = questionText.toLowerCase();
    
    // Multiple choice indicators
    if (text.includes('which of the following') || 
        text.includes('choose the best') ||
        text.includes('select the')) {
      return 'multiple_choice';
    }
    
    // Fill-in-the-blank
    if (text.includes('fill in') || text.includes('complete')) {
      return 'fill_in_blank';
    }
    
    // Math grid-in
    if (text.includes('grid') || text.includes('enter your answer')) {
      return 'grid_in';
    }
    
    // Reading comprehension
    if (text.includes('passage') || text.includes('according to')) {
      return 'reading_comprehension';
    }
    
    // Writing/grammar
    if (text.includes('grammatically correct') || 
        text.includes('best revision') ||
        text.includes('improve')) {
      return 'writing_grammar';
    }
    
    return 'general';
  }

  /**
   * Estimate question difficulty
   */
  estimateDifficulty(context) {
    let score = 0;
    
    // Length-based scoring
    if (context.question) {
      if (context.question.length > 300) score += 2;
      else if (context.question.length > 150) score += 1;
    }
    
    // Passage-based questions are typically harder
    if (context.passage) score += 2;
    
    // Multiple steps indicated by multiple sentences
    if (context.question && context.question.split('.').length > 3) score += 1;
    
    // Complex vocabulary (simplified heuristic)
    if (context.question && /\b\w{10,}\b/.test(context.question)) score += 1;
    
    // Return difficulty level
    if (score >= 4) return 'hard';
    if (score >= 2) return 'medium';
    return 'easy';
  }

  /**
   * Check if context has significantly changed
   */
  hasContextChanged(newContext) {
    if (!this.lastContext) return true;
    
    // Compare key fields
    const keyFields = ['question', 'passage', 'subject'];
    
    for (const field of keyFields) {
      if (newContext[field] !== this.lastContext[field]) {
        return true;
      }
    }
    
    // Compare answer choices count
    if (newContext.answerChoices.length !== this.lastContext.answerChoices.length) {
      return true;
    }
    
    // Compare URL (for navigation)
    if (newContext.url !== this.lastContext.url) {
      return true;
    }
    
    return false;
  }

  /**
   * Notify about context changes
   */
  async notifyContextChange(context) {
    console.log('Bonsai: Context detected:', context);
    
    // Notify callbacks
    this.contextCallbacks.forEach(callback => {
      try {
        callback(context);
      } catch (error) {
        console.error('Context callback error:', error);
      }
    });
    
    // Send to background script
    try {
      chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.CONTEXT_DETECTED,
        context
      });
    } catch (error) {
      console.warn('Failed to send context to background:', error);
    }
    
    // Track context detection
    try {
      await apiClient.trackUsage('context_detected', {
        platform: context.platform,
        subject: context.subject,
        questionType: context.metadata?.questionType,
        hasQuestion: !!context.question
      });
    } catch (error) {
      console.warn('Failed to track context:', error);
    }
  }

  /**
   * Add context change callback
   */
  onContextChange(callback) {
    this.contextCallbacks.push(callback);
  }

  /**
   * Remove context change callback
   */
  offContextChange(callback) {
    const index = this.contextCallbacks.indexOf(callback);
    if (index > -1) {
      this.contextCallbacks.splice(index, 1);
    }
  }

  /**
   * Trigger Bonsai toggle
   */
  triggerBonsaiToggle() {
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.TOGGLE_BUBBLE,
      context: this.lastContext
    });
  }

  /**
   * Trigger quick help
   */
  async triggerQuickHelp() {
    if (!this.lastContext || !this.lastContext.question) {
      console.log('Bonsai: No question context available for quick help');
      return;
    }
    
    try {
      chrome.runtime.sendMessage({
        type: MESSAGE_TYPES.REQUEST_HELP,
        context: this.lastContext,
        quick: true
      });
    } catch (error) {
      await ErrorHandler.handleError(error, 'quick_help_trigger');
    }
  }

  /**
   * Get current context
   */
  getCurrentContext() {
    return this.lastContext;
  }

  /**
   * Force context refresh
   */
  async refreshContext() {
    return await this.analyzeContext();
  }

  /**
   * Stop monitoring
   */
  stop() {
    this.isMonitoring = false;
    
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    // Clear callbacks
    this.contextCallbacks = [];
    
    console.log('Bonsai: Context detection stopped');
  }

  /**
   * Check if currently monitoring
   */
  isActive() {
    return this.isMonitoring;
  }
}

// Create singleton instance
const contextDetector = new BonsaiContextDetector();

// Auto-initialize on supported platforms
if (Validation.isSupportedPlatform(window.location.href)) {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => contextDetector.initialize(), 1000);
    });
  } else {
    setTimeout(() => contextDetector.initialize(), 1000);
  }
}

export default contextDetector;