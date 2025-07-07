// Glass-inspired context awareness for Bonsai SAT Tutor
// Detects SAT questions and provides contextual assistance

export interface ScreenContext {
  url: string;
  title: string;
  platform: 'khan_academy' | 'bluebook' | 'princeton_review' | 'kaplan' | 'other';
  elements: ContextElement[];
  detectedQuestions: DetectedQuestion[];
  isTestMode: boolean;
  timestamp: number;
}

export interface ContextElement {
  type: 'question' | 'answer_choice' | 'passage' | 'diagram' | 'timer' | 'navigation';
  id: string;
  text?: string;
  position: { x: number; y: number; width: number; height: number };
  confidence: number;
  attributes?: Record<string, any>;
}

export interface DetectedQuestion {
  id: string;
  subject: 'math' | 'reading' | 'writing';
  questionText: string;
  answerChoices: string[];
  passage?: string;
  diagram?: string; // base64 image
  difficulty: 'easy' | 'medium' | 'hard';
  questionNumber?: number;
  timeLimit?: number;
  confidence: number;
  contextData: {
    platform: string;
    section: string;
    estimatedSATScore?: number;
  };
}

export interface GlassAssistanceOptions {
  assistanceLevel: 'minimal' | 'guided' | 'comprehensive';
  allowedTypes: ('hint' | 'explanation' | 'strategy' | 'full_solution')[];
  respectTestMode: boolean;
  adaptToUserLevel: boolean;
}

export class GlassContextDetector {
  private static readonly PLATFORM_SELECTORS = {
    khan_academy: {
      hostname: 'khanacademy.org',
      questionSelectors: [
        '[data-test-id="question"]',
        '.question-container',
        '.exercise-content',
        '[class*="question"]'
      ],
      answerSelectors: [
        '[data-test-id="choice"]',
        '.answer-choice',
        '[class*="choice"]',
        'input[type="radio"] + label'
      ],
      passageSelectors: [
        '.passage',
        '[data-test-id="passage"]',
        '.reading-passage'
      ],
      testModeIndicators: [
        '[data-test-id="test-mode"]',
        '.test-interface',
        '.timed-test'
      ]
    },
    bluebook: {
      hostname: 'bluebook.collegeboard.org',
      questionSelectors: [
        '.question-content',
        '[data-testid="question"]',
        '.sat-question',
        '.question-wrapper'
      ],
      answerSelectors: [
        '.answer-option',
        '[data-testid="answer-choice"]',
        '.choice-container input + label'
      ],
      passageSelectors: [
        '.passage-content',
        '.reading-selection',
        '[data-testid="passage"]'
      ],
      testModeIndicators: [
        '.test-timer',
        '.official-test',
        '[data-testid="test-mode"]'
      ]
    },
    princeton_review: {
      hostname: 'princetonreview.com',
      questionSelectors: [
        '.question-text',
        '.problem-content',
        '[class*="question"]'
      ],
      answerSelectors: [
        '.answer-choice',
        '.option-text',
        'input[name*="answer"] + label'
      ],
      passageSelectors: [
        '.passage-text',
        '.reading-content'
      ],
      testModeIndicators: [
        '.practice-test',
        '.timed-section'
      ]
    }
  };

  /**
   * Detect current platform based on URL and page structure
   */
  static detectPlatform(url: string, document: Document): ScreenContext['platform'] {
    const hostname = new URL(url).hostname;
    
    for (const [platform, config] of Object.entries(this.PLATFORM_SELECTORS)) {
      if (hostname.includes(config.hostname)) {
        return platform as ScreenContext['platform'];
      }
    }
    
    return 'other';
  }

  /**
   * Analyze current screen context
   */
  static async analyzeScreenContext(
    url: string = window.location.href,
    document: Document = window.document
  ): Promise<ScreenContext> {
    const platform = this.detectPlatform(url, document);
    const platformConfig = this.PLATFORM_SELECTORS[platform] || this.PLATFORM_SELECTORS.khan_academy;
    
    // Extract elements from page
    const elements = this.extractElements(document, platformConfig);
    
    // Detect questions
    const detectedQuestions = await this.detectQuestions(elements, platform);
    
    // Check if in test mode
    const isTestMode = this.detectTestMode(document, platformConfig);
    
    return {
      url,
      title: document.title,
      platform,
      elements,
      detectedQuestions,
      isTestMode,
      timestamp: Date.now(),
    };
  }

  /**
   * Extract relevant elements from the page
   */
  private static extractElements(
    document: Document,
    platformConfig: any
  ): ContextElement[] {
    const elements: ContextElement[] = [];
    
    // Extract questions
    platformConfig.questionSelectors?.forEach((selector: string) => {
      const questionElements = document.querySelectorAll(selector);
      questionElements.forEach((el: Element, index: number) => {
        const rect = el.getBoundingClientRect();
        elements.push({
          type: 'question',
          id: `question-${index}`,
          text: el.textContent?.trim() || '',
          position: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          },
          confidence: this.calculateElementConfidence(el, 'question'),
          attributes: {
            className: el.className,
            tagName: el.tagName,
          },
        });
      });
    });

    // Extract answer choices
    platformConfig.answerSelectors?.forEach((selector: string) => {
      const answerElements = document.querySelectorAll(selector);
      answerElements.forEach((el: Element, index: number) => {
        const rect = el.getBoundingClientRect();
        elements.push({
          type: 'answer_choice',
          id: `answer-${index}`,
          text: el.textContent?.trim() || '',
          position: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          },
          confidence: this.calculateElementConfidence(el, 'answer_choice'),
        });
      });
    });

    // Extract passages
    platformConfig.passageSelectors?.forEach((selector: string) => {
      const passageElements = document.querySelectorAll(selector);
      passageElements.forEach((el: Element, index: number) => {
        const rect = el.getBoundingClientRect();
        elements.push({
          type: 'passage',
          id: `passage-${index}`,
          text: el.textContent?.trim() || '',
          position: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          },
          confidence: this.calculateElementConfidence(el, 'passage'),
        });
      });
    });

    // Extract timer elements
    const timerSelectors = ['.timer', '.countdown', '[class*="time"]', '[data-testid="timer"]'];
    timerSelectors.forEach(selector => {
      const timerElements = document.querySelectorAll(selector);
      timerElements.forEach((el: Element, index: number) => {
        const rect = el.getBoundingClientRect();
        elements.push({
          type: 'timer',
          id: `timer-${index}`,
          text: el.textContent?.trim() || '',
          position: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height,
          },
          confidence: this.calculateElementConfidence(el, 'timer'),
        });
      });
    });

    return elements;
  }

  /**
   * Calculate confidence score for element detection
   */
  private static calculateElementConfidence(element: Element, type: string): number {
    let confidence = 0.5; // Base confidence
    
    const className = element.className.toLowerCase();
    const id = element.id.toLowerCase();
    const textContent = element.textContent?.toLowerCase() || '';
    
    // Type-specific confidence boosting
    switch (type) {
      case 'question':
        if (className.includes('question') || id.includes('question')) confidence += 0.3;
        if (textContent.includes('which') || textContent.includes('what') || textContent.includes('how')) confidence += 0.2;
        if (element.querySelectorAll('input[type="radio"]').length > 0) confidence += 0.2;
        break;
        
      case 'answer_choice':
        if (className.includes('choice') || className.includes('answer')) confidence += 0.3;
        if (element.tagName === 'LABEL' && element.querySelector('input[type="radio"]')) confidence += 0.3;
        if (/^[A-D]\)?\s/.test(textContent)) confidence += 0.2;
        break;
        
      case 'passage':
        if (className.includes('passage') || className.includes('reading')) confidence += 0.3;
        if (textContent.length > 200) confidence += 0.2;
        if (element.querySelector('p')) confidence += 0.1;
        break;
        
      case 'timer':
        if (className.includes('timer') || className.includes('time')) confidence += 0.3;
        if (/\d{1,2}:\d{2}/.test(textContent)) confidence += 0.3;
        break;
    }
    
    // General confidence factors
    if (element.offsetWidth > 0 && element.offsetHeight > 0) confidence += 0.1;
    if (window.getComputedStyle(element).display !== 'none') confidence += 0.1;
    
    return Math.min(1.0, confidence);
  }

  /**
   * Detect and structure questions from extracted elements
   */
  private static async detectQuestions(
    elements: ContextElement[],
    platform: ScreenContext['platform']
  ): Promise<DetectedQuestion[]> {
    const questions: DetectedQuestion[] = [];
    const questionElements = elements.filter(el => el.type === 'question');
    
    for (const questionElement of questionElements) {
      if (questionElement.confidence < 0.6) continue; // Skip low-confidence detections
      
      // Find associated answer choices
      const answerChoices = elements
        .filter(el => el.type === 'answer_choice')
        .filter(el => this.isElementNearby(questionElement, el))
        .map(el => el.text || '')
        .filter(text => text.length > 0);

      // Find associated passage
      const passage = elements
        .filter(el => el.type === 'passage')
        .find(el => this.isElementNearby(questionElement, el, 500));

      if (!questionElement.text || questionElement.text.length < 10) continue;

      // Analyze question subject and difficulty
      const analysis = await this.analyzeQuestionContent(
        questionElement.text,
        answerChoices,
        passage?.text
      );

      questions.push({
        id: questionElement.id,
        subject: analysis.subject,
        questionText: questionElement.text,
        answerChoices,
        passage: passage?.text,
        difficulty: analysis.difficulty,
        confidence: questionElement.confidence,
        contextData: {
          platform,
          section: analysis.section,
          estimatedSATScore: analysis.estimatedScore,
        },
      });
    }

    return questions;
  }

  /**
   * Check if elements are nearby (for associating questions with answers/passages)
   */
  private static isElementNearby(
    element1: ContextElement,
    element2: ContextElement,
    maxDistance: number = 200
  ): boolean {
    const center1 = {
      x: element1.position.x + element1.position.width / 2,
      y: element1.position.y + element1.position.height / 2,
    };
    const center2 = {
      x: element2.position.x + element2.position.width / 2,
      y: element2.position.y + element2.position.height / 2,
    };
    
    const distance = Math.sqrt(
      Math.pow(center1.x - center2.x, 2) + Math.pow(center1.y - center2.y, 2)
    );
    
    return distance <= maxDistance;
  }

  /**
   * Analyze question content to determine subject and difficulty
   */
  private static async analyzeQuestionContent(
    questionText: string,
    answerChoices: string[],
    passage?: string
  ): Promise<{
    subject: 'math' | 'reading' | 'writing';
    difficulty: 'easy' | 'medium' | 'hard';
    section: string;
    estimatedScore?: number;
  }> {
    // Quick local analysis based on keywords and patterns
    let subject: 'math' | 'reading' | 'writing' = 'math';
    let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
    
    const text = (questionText + ' ' + answerChoices.join(' ')).toLowerCase();
    
    // Subject detection
    if (passage || text.includes('passage') || text.includes('author') || text.includes('reading')) {
      subject = 'reading';
    } else if (text.includes('grammar') || text.includes('sentence') || text.includes('punctuation')) {
      subject = 'writing';
    } else if (/\d+|equation|solve|calculate|graph|function/.test(text)) {
      subject = 'math';
    }
    
    // Difficulty estimation
    const complexWords = text.split(' ').filter(word => word.length > 7).length;
    const mathComplexity = (text.match(/\^|\*|\/|\+|-|\(|\)/g) || []).length;
    
    if (complexWords > 5 || mathComplexity > 3) {
      difficulty = 'hard';
    } else if (complexWords > 2 || mathComplexity > 1) {
      difficulty = 'medium';
    } else {
      difficulty = 'easy';
    }
    
    return {
      subject,
      difficulty,
      section: subject === 'math' ? 'Math' : subject === 'reading' ? 'Reading and Writing' : 'Writing',
      estimatedScore: this.estimateScoreRange(subject, difficulty),
    };
  }

  /**
   * Estimate SAT score range for question difficulty
   */
  private static estimateScoreRange(
    subject: string,
    difficulty: string
  ): number {
    const baseScores = {
      math: { easy: 500, medium: 600, hard: 750 },
      reading: { easy: 450, medium: 550, hard: 700 },
      writing: { easy: 450, medium: 550, hard: 700 },
    };
    
    return baseScores[subject as keyof typeof baseScores]?.[difficulty as keyof typeof baseScores.math] || 600;
  }

  /**
   * Detect if page is in test mode
   */
  private static detectTestMode(
    document: Document,
    platformConfig: any
  ): boolean {
    // Check for test mode indicators
    const testModeSelectors = platformConfig.testModeIndicators || [];
    
    for (const selector of testModeSelectors) {
      if (document.querySelector(selector)) {
        return true;
      }
    }
    
    // Check URL for test indicators
    const url = window.location.href.toLowerCase();
    if (url.includes('test') || url.includes('exam') || url.includes('practice')) {
      return true;
    }
    
    // Check for timer elements (usually indicates test mode)
    const timerElements = document.querySelectorAll('.timer, .countdown, [class*="time"]');
    if (timerElements.length > 0) {
      return true;
    }
    
    return false;
  }

  /**
   * Monitor page changes for dynamic content
   */
  static startContextMonitoring(
    callback: (context: ScreenContext) => void,
    options: { interval?: number; detectChanges?: boolean } = {}
  ): () => void {
    const { interval = 2000, detectChanges = true } = options;
    
    let lastContext: ScreenContext | null = null;
    let intervalId: number;
    
    const checkContext = async () => {
      try {
        const currentContext = await this.analyzeScreenContext();
        
        // Only call callback if context changed significantly
        if (!lastContext || this.hasSignificantChange(lastContext, currentContext)) {
          callback(currentContext);
          lastContext = currentContext;
        }
      } catch (error) {
        console.error('Context monitoring error:', error);
      }
    };
    
    // Initial check
    checkContext();
    
    // Set up periodic monitoring
    intervalId = window.setInterval(checkContext, interval);
    
    // Optional: Monitor DOM changes for more responsive updates
    let observer: MutationObserver | null = null;
    if (detectChanges) {
      observer = new MutationObserver(() => {
        // Debounce rapid changes
        clearTimeout(intervalId);
        intervalId = window.setTimeout(checkContext, 500);
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style'],
      });
    }
    
    // Return cleanup function
    return () => {
      clearInterval(intervalId);
      if (observer) {
        observer.disconnect();
      }
    };
  }

  /**
   * Check if context has changed significantly
   */
  private static hasSignificantChange(
    oldContext: ScreenContext,
    newContext: ScreenContext
  ): boolean {
    // URL changed
    if (oldContext.url !== newContext.url) return true;
    
    // Number of questions changed
    if (oldContext.detectedQuestions.length !== newContext.detectedQuestions.length) return true;
    
    // Question content changed
    const oldQuestionTexts = oldContext.detectedQuestions.map(q => q.questionText).sort();
    const newQuestionTexts = newContext.detectedQuestions.map(q => q.questionText).sort();
    
    if (JSON.stringify(oldQuestionTexts) !== JSON.stringify(newQuestionTexts)) return true;
    
    // Test mode changed
    if (oldContext.isTestMode !== newContext.isTestMode) return true;
    
    return false;
  }

  /**
   * Extract visual context (screenshots) for AI analysis
   */
  static async captureVisualContext(
    element?: Element
  ): Promise<string | null> {
    try {
      // This would use html2canvas or similar to capture screenshots
      // For now, return null as this requires additional libraries
      return null;
    } catch (error) {
      console.error('Visual context capture error:', error);
      return null;
    }
  }
}