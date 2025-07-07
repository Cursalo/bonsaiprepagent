// Utility functions for the Bonsai browser extension

import { STORAGE_KEYS, ERROR_TYPES } from './constants.js';

/**
 * DOM utilities
 */
export const DOM = {
  /**
   * Create an element with attributes and children
   */
  createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'className') {
        element.className = value;
      } else if (key === 'style' && typeof value === 'object') {
        Object.assign(element.style, value);
      } else if (key.startsWith('data-')) {
        element.setAttribute(key, value);
      } else {
        element[key] = value;
      }
    });
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        element.appendChild(child);
      }
    });
    
    return element;
  },

  /**
   * Find element using multiple selectors
   */
  findElement(selectors, parent = document) {
    for (const selector of selectors) {
      const element = parent.querySelector(selector);
      if (element) return element;
    }
    return null;
  },

  /**
   * Wait for element to appear in DOM
   */
  waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) {
        resolve(element);
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        const element = document.querySelector(selector);
        if (element) {
          obs.disconnect();
          resolve(element);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  },

  /**
   * Check if element is visible
   */
  isVisible(element) {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && 
           rect.top >= 0 && rect.left >= 0 &&
           rect.bottom <= window.innerHeight &&
           rect.right <= window.innerWidth;
  },

  /**
   * Get element position relative to viewport
   */
  getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
      width: rect.width,
      height: rect.height
    };
  }
};

/**
 * Storage utilities
 */
export const Storage = {
  /**
   * Get data from extension storage
   */
  async get(key) {
    try {
      const result = await chrome.storage.local.get(key);
      return result[key];
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },

  /**
   * Set data in extension storage
   */
  async set(key, value) {
    try {
      await chrome.storage.local.set({ [key]: value });
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },

  /**
   * Remove data from extension storage
   */
  async remove(key) {
    try {
      await chrome.storage.local.remove(key);
      return true;
    } catch (error) {
      console.error('Storage remove error:', error);
      return false;
    }
  },

  /**
   * Clear all extension storage
   */
  async clear() {
    try {
      await chrome.storage.local.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }
};

/**
 * Message passing utilities
 */
export const Messaging = {
  /**
   * Send message to background script
   */
  async sendToBackground(message) {
    try {
      const response = await chrome.runtime.sendMessage(message);
      return response;
    } catch (error) {
      console.error('Message to background failed:', error);
      throw error;
    }
  },

  /**
   * Send message to content script
   */
  async sendToContent(tabId, message) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, message);
      return response;
    } catch (error) {
      console.error('Message to content script failed:', error);
      throw error;
    }
  },

  /**
   * Listen for messages
   */
  onMessage(callback) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      const result = callback(message, sender);
      if (result instanceof Promise) {
        result.then(sendResponse).catch(err => {
          console.error('Message handler error:', err);
          sendResponse({ error: err.message });
        });
        return true; // Indicates async response
      } else {
        sendResponse(result);
      }
    });
  }
};

/**
 * Animation utilities
 */
export const Animation = {
  /**
   * Fade in element
   */
  fadeIn(element, duration = 300) {
    element.style.opacity = '0';
    element.style.transition = `opacity ${duration}ms ease-out`;
    
    requestAnimationFrame(() => {
      element.style.opacity = '1';
    });
  },

  /**
   * Fade out element
   */
  fadeOut(element, duration = 300) {
    element.style.transition = `opacity ${duration}ms ease-out`;
    element.style.opacity = '0';
    
    setTimeout(() => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    }, duration);
  },

  /**
   * Slide in from direction
   */
  slideIn(element, direction = 'right', duration = 300) {
    const transforms = {
      right: 'translateX(100%)',
      left: 'translateX(-100%)',
      top: 'translateY(-100%)',
      bottom: 'translateY(100%)'
    };

    element.style.transform = transforms[direction];
    element.style.transition = `transform ${duration}ms ease-out`;
    
    requestAnimationFrame(() => {
      element.style.transform = 'translateX(0) translateY(0)';
    });
  },

  /**
   * Bounce animation
   */
  bounce(element) {
    element.style.animation = 'bonsai-bounce 0.5s ease-out';
    setTimeout(() => {
      element.style.animation = '';
    }, 500);
  },

  /**
   * Pulse animation
   */
  pulse(element, infinite = false) {
    element.style.animation = `bonsai-pulse 2s ease-in-out ${infinite ? 'infinite' : '1'}`;
    if (!infinite) {
      setTimeout(() => {
        element.style.animation = '';
      }, 2000);
    }
  }
};

/**
 * Position utilities
 */
export const Position = {
  /**
   * Get smart position for bubble based on page content
   */
  getSmartPosition(element, pageContent) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const elementRect = element.getBoundingClientRect();
    
    // Default position
    let position = { right: 20, bottom: 20 };
    
    // Avoid overlapping with question content
    const questionElements = document.querySelectorAll('[class*="question"], [class*="exercise"]');
    const rightSideOccupied = Array.from(questionElements).some(el => {
      const rect = el.getBoundingClientRect();
      return rect.right > viewportWidth * 0.7;
    });
    
    if (rightSideOccupied) {
      position = { left: 20, bottom: 20 };
    }
    
    // Adjust for mobile
    if (viewportWidth < 768) {
      position = { right: 10, bottom: 10 };
    }
    
    return position;
  },

  /**
   * Check if position is within viewport
   */
  isValidPosition(position, elementSize) {
    const { width, height } = elementSize;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (position.left !== undefined) {
      return position.left + width <= viewportWidth;
    }
    
    if (position.right !== undefined) {
      return position.right + width <= viewportWidth;
    }
    
    if (position.top !== undefined) {
      return position.top + height <= viewportHeight;
    }
    
    if (position.bottom !== undefined) {
      return position.bottom + height <= viewportHeight;
    }
    
    return true;
  }
};

/**
 * Error handling utilities
 */
export const ErrorHandler = {
  /**
   * Create standardized error object
   */
  createError(type, message, details = {}) {
    return {
      type,
      message,
      details,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  },

  /**
   * Log error to background script
   */
  async logError(error) {
    try {
      await Messaging.sendToBackground({
        type: 'LOG_ERROR',
        error: this.createError(error.type || ERROR_TYPES.PLATFORM_ERROR, error.message, error.details)
      });
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  },

  /**
   * Handle and report error
   */
  async handleError(error, context = '') {
    console.error(`Bonsai Extension Error [${context}]:`, error);
    
    const errorObj = error instanceof Error 
      ? this.createError(ERROR_TYPES.PLATFORM_ERROR, error.message, { context, stack: error.stack })
      : this.createError(error.type || ERROR_TYPES.PLATFORM_ERROR, error.message || 'Unknown error', { context, ...error.details });
    
    await this.logError(errorObj);
    
    // Show user-friendly error message if needed
    if (error.showToUser) {
      this.showUserError(error.message);
    }
  },

  /**
   * Show error message to user
   */
  showUserError(message) {
    // Create a temporary notification
    const notification = DOM.createElement('div', {
      className: 'bonsai-error-notification',
      style: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: '#fee2e2',
        color: '#dc2626',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #fecaca',
        fontSize: '14px',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '300px',
        zIndex: 10001,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
      }
    }, [message]);
    
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
      Animation.fadeOut(notification);
    }, 5000);
  }
};

/**
 * Performance utilities
 */
export const Performance = {
  /**
   * Debounce function calls
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func.apply(this, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function calls
   */
  throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Measure function execution time
   */
  measureTime(name, func) {
    return async function(...args) {
      const start = performance.now();
      const result = await func.apply(this, args);
      const end = performance.now();
      console.log(`${name} took ${end - start} milliseconds`);
      return result;
    };
  }
};

/**
 * Validation utilities
 */
export const Validation = {
  /**
   * Check if string contains SAT-related content
   */
  isSATContent(text) {
    const satKeywords = [
      'SAT', 'College Board', 'standardized test',
      'reading comprehension', 'math section', 'writing section',
      'multiple choice', 'grid-in', 'passage', 'calculator',
      'no calculator', 'evidence', 'best supported'
    ];
    
    const lowerText = text.toLowerCase();
    return satKeywords.some(keyword => lowerText.includes(keyword.toLowerCase()));
  },

  /**
   * Validate question text
   */
  isValidQuestion(text) {
    if (!text || text.trim().length < 10) return false;
    
    // Check for question indicators
    const questionIndicators = ['?', 'which', 'what', 'how', 'why', 'when', 'where', 'choose', 'select'];
    const lowerText = text.toLowerCase();
    
    return questionIndicators.some(indicator => lowerText.includes(indicator));
  },

  /**
   * Check if URL is supported platform
   */
  isSupportedPlatform(url) {
    const supportedDomains = [
      'khanacademy.org',
      'collegeboard.org',
      'satsuite.collegeboard.org'
    ];
    
    return supportedDomains.some(domain => url.includes(domain));
  }
};

/**
 * Browser detection utilities
 */
export const Browser = {
  /**
   * Detect browser type
   */
  getBrowserType() {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) return 'chrome';
    if (userAgent.includes('Firefox')) return 'firefox';
    if (userAgent.includes('Safari')) return 'safari';
    if (userAgent.includes('Edge')) return 'edge';
    
    return 'unknown';
  },

  /**
   * Check if extension APIs are available
   */
  checkExtensionAPI() {
    return {
      chrome: typeof chrome !== 'undefined' && chrome.runtime,
      storage: typeof chrome !== 'undefined' && chrome.storage,
      tabs: typeof chrome !== 'undefined' && chrome.tabs,
      scripting: typeof chrome !== 'undefined' && chrome.scripting
    };
  },

  /**
   * Get viewport dimensions
   */
  getViewportSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      isMobile: window.innerWidth < 768,
      isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
      isDesktop: window.innerWidth >= 1024
    };
  }
};