// Platform-specific configuration and selectors
export const PLATFORMS = {
  KHAN_ACADEMY: {
    domain: 'khanacademy.org',
    name: 'Khan Academy',
    selectors: {
      // Question containers
      question: [
        '[data-test-id="exercise-question-renderer"]',
        '.exercise-card .question',
        '[class*="question-renderer"]',
        '.perseus-widget-container',
        '.exercise-content'
      ],
      
      // Answer choices
      answerChoices: [
        '[data-test-id="radio-choice"]',
        '.perseus-widget-radio .choice',
        '.multiple-choice-item',
        '[role="radio"]',
        '.choice-item'
      ],
      
      // Input fields
      inputs: [
        '[data-test-id="expression-input"]',
        '.perseus-widget-numeric-input input',
        '.perseus-input',
        'input[type="text"]',
        'textarea'
      ],
      
      // Subject identification
      subjectIndicators: [
        '[data-test-id="subject-mastery-goals"]',
        '.unit-header h1',
        '.exercise-header .breadcrumbs',
        '.course-header h1',
        '.skill-progress-bar'
      ],
      
      // Progress indicators
      progress: [
        '[data-test-id="skill-progress"]',
        '.energy-points-badge',
        '.mastery-progress',
        '.streak-bar'
      ]
    },
    
    // URL patterns for different content types
    urlPatterns: {
      math: /math|algebra|geometry|calculus|statistics|trigonometry/i,
      reading: /reading|literature|comprehension|english/i,
      writing: /writing|grammar|essay|composition/i,
      sat: /sat|test-prep|standardized/i
    },
    
    // Context extraction functions
    contextExtractors: {
      getQuestionText: () => {
        const selectors = PLATFORMS.KHAN_ACADEMY.selectors.question;
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            return element.innerText.trim();
          }
        }
        return null;
      },
      
      getSubject: () => {
        const url = window.location.href;
        const patterns = PLATFORMS.KHAN_ACADEMY.urlPatterns;
        
        for (const [subject, pattern] of Object.entries(patterns)) {
          if (pattern.test(url)) {
            return subject;
          }
        }
        
        // Fallback to page content analysis
        const indicators = PLATFORMS.KHAN_ACADEMY.selectors.subjectIndicators;
        for (const selector of indicators) {
          const element = document.querySelector(selector);
          if (element) {
            const text = element.innerText.toLowerCase();
            if (text.includes('math')) return 'math';
            if (text.includes('reading')) return 'reading';
            if (text.includes('writing')) return 'writing';
          }
        }
        
        return 'unknown';
      }
    }
  },
  
  COLLEGE_BOARD: {
    domain: 'collegeboard.org',
    name: 'College Board',
    selectors: {
      question: [
        '.question-content',
        '.test-question',
        '[data-testid="question"]',
        '.passage-question',
        '.question-stem'
      ],
      
      answerChoices: [
        '.answer-choice',
        '[data-testid="choice"]',
        '.option-item',
        '.choice-container label',
        'input[type="radio"] + label'
      ],
      
      inputs: [
        '.student-response input',
        '.answer-input',
        'input[type="text"]',
        'textarea'
      ],
      
      subjectIndicators: [
        '.test-section-header',
        '.subject-title',
        '.section-name'
      ],
      
      progress: [
        '.progress-indicator',
        '.question-counter',
        '.timer-display'
      ]
    },
    
    urlPatterns: {
      sat: /sat|digital-sat|practice-test/i,
      math: /math|calculator|no-calculator/i,
      reading: /reading|writing|english/i,
      writing: /writing|language|grammar/i
    },
    
    contextExtractors: {
      getQuestionText: () => {
        const selectors = PLATFORMS.COLLEGE_BOARD.selectors.question;
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            return element.innerText.trim();
          }
        }
        return null;
      },
      
      getSubject: () => {
        const url = window.location.href;
        const patterns = PLATFORMS.COLLEGE_BOARD.urlPatterns;
        
        for (const [subject, pattern] of Object.entries(patterns)) {
          if (pattern.test(url)) {
            return subject;
          }
        }
        
        return 'sat';
      }
    }
  },
  
  BLUEBOOK: {
    domain: 'satsuite.collegeboard.org',
    name: 'Bluebook (Official SAT)',
    selectors: {
      question: [
        '[data-testid="question-content"]',
        '.question-renderer',
        '.test-item-content',
        '.passage-content + .question-content'
      ],
      
      answerChoices: [
        '[data-testid="answer-choice"]',
        '.answer-option',
        'input[type="radio"] + span',
        '.choice-button'
      ],
      
      inputs: [
        '[data-testid="student-response"]',
        '.response-input',
        'input[type="text"]'
      ],
      
      passage: [
        '[data-testid="passage"]',
        '.reading-passage',
        '.stimulus-content'
      ],
      
      subjectIndicators: [
        '[data-testid="section-header"]',
        '.test-section-title',
        '.module-title'
      ],
      
      progress: [
        '[data-testid="progress-bar"]',
        '.question-progress',
        '.timer-component'
      ]
    },
    
    urlPatterns: {
      sat: /digital-sat|practice|test/i,
      math: /math|module/i,
      reading: /reading|writing/i
    },
    
    contextExtractors: {
      getQuestionText: () => {
        const selectors = PLATFORMS.BLUEBOOK.selectors.question;
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            return element.innerText.trim();
          }
        }
        return null;
      },
      
      getPassage: () => {
        const selectors = PLATFORMS.BLUEBOOK.selectors.passage;
        for (const selector of selectors) {
          const element = document.querySelector(selector);
          if (element) {
            return element.innerText.trim();
          }
        }
        return null;
      },
      
      getSubject: () => {
        const url = window.location.href;
        const patterns = PLATFORMS.BLUEBOOK.urlPatterns;
        
        for (const [subject, pattern] of Object.entries(patterns)) {
          if (pattern.test(url)) {
            return subject;
          }
        }
        
        return 'sat';
      }
    }
  }
};

// Bonsai bubble configuration
export const BUBBLE_CONFIG = {
  // Position and size
  defaultPosition: { right: 20, bottom: 20 },
  size: { width: 60, height: 60 },
  expandedSize: { width: 400, height: 500 },
  
  // Animation settings
  animations: {
    fadeIn: 'bonsai-fade-in 0.3s ease-out',
    bounce: 'bonsai-bounce 0.5s ease-out',
    pulse: 'bonsai-pulse 2s infinite'
  },
  
  // Z-index to ensure it appears above page content
  zIndex: 10000,
  
  // Colors and styling
  colors: {
    primary: '#22c55e',
    secondary: '#16a34a',
    accent: '#84cc16',
    background: 'rgba(255, 255, 255, 0.95)',
    glass: 'rgba(255, 255, 255, 0.1)'
  }
};

// API endpoints
export const API_ENDPOINTS = {
  base: window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'
    : 'https://bonsaiprepagent.vercel.app',
  
  chat: '/api/ai/chat',
  context: '/api/glass/analyze-context',
  auth: '/api/auth/extension',
  progress: '/api/bonsai/progress',
  usage: '/api/subscription/increment-usage'
};

// Event types for communication
export const MESSAGE_TYPES = {
  // Content script to background
  INJECT_BUBBLE: 'inject_bubble',
  CONTEXT_DETECTED: 'context_detected',
  QUESTION_FOUND: 'question_found',
  
  // Background to content script
  BUBBLE_RESPONSE: 'bubble_response',
  AUTH_STATUS: 'auth_status',
  
  // Popup to background
  GET_STATUS: 'get_status',
  TOGGLE_BUBBLE: 'toggle_bubble',
  
  // Extension to main app
  REQUEST_HELP: 'request_help',
  TRACK_USAGE: 'track_usage'
};

// Error types
export const ERROR_TYPES = {
  NETWORK_ERROR: 'network_error',
  AUTH_ERROR: 'auth_error',
  PLATFORM_ERROR: 'platform_error',
  CONTEXT_ERROR: 'context_error'
};

// Feature flags
export const FEATURES = {
  VOICE_COMMANDS: true,
  AUTO_DETECT: true,
  SMART_POSITIONING: true,
  GLASS_EFFECTS: true,
  ANALYTICS: true,
  OFFLINE_MODE: false
};

// Platform detection
export function detectPlatform() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('khanacademy.org')) {
    return PLATFORMS.KHAN_ACADEMY;
  } else if (hostname.includes('satsuite.collegeboard.org')) {
    return PLATFORMS.BLUEBOOK;
  } else if (hostname.includes('collegeboard.org')) {
    return PLATFORMS.COLLEGE_BOARD;
  }
  
  return null;
}

// Storage keys
export const STORAGE_KEYS = {
  USER_SETTINGS: 'bonsai_user_settings',
  AUTH_TOKEN: 'bonsai_auth_token',
  BUBBLE_POSITION: 'bonsai_bubble_position',
  PLATFORM_PREFERENCES: 'bonsai_platform_preferences',
  USAGE_STATS: 'bonsai_usage_stats'
};