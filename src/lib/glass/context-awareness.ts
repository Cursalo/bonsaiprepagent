// Glass-inspired Context Awareness for SAT Questions
// Adapted from Glass project's screen analysis and question detection

import { BonsaiContext, ScreenContext, SATQuestionAnalysis, ContextAwareness } from '@/types/bonsai';

export class SATContextAnalyzer {
  private observer: MutationObserver | null = null;
  private isActive: boolean = false;
  private currentContext: BonsaiContext | null = null;
  private onContextChange: (context: BonsaiContext) => void;
  
  constructor(onContextChange: (context: BonsaiContext) => void) {
    this.onContextChange = onContextChange;
  }

  // Initialize context awareness (inspired by Glass's screen monitoring)
  public startContextAnalysis(): void {
    this.isActive = true;
    this.setupDOMObserver();
    this.detectInitialContext();
    this.setupKeyboardShortcuts();
  }

  public stopContextAnalysis(): void {
    this.isActive = false;
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  // Glass-inspired DOM monitoring for question detection
  private setupDOMObserver(): void {
    this.observer = new MutationObserver((mutations) => {
      if (!this.isActive) return;

      for (const mutation of mutations) {
        if (mutation.type === 'childList') {
          this.analyzeNewContent(mutation.target as Element);
        }
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  // Detect platform and initial context
  private detectInitialContext(): void {
    const platform = this.detectPlatform();
    const screenContext = this.captureScreenContext();
    
    if (platform !== 'other') {
      const context: BonsaiContext = {
        questionType: this.inferQuestionType(screenContext),
        difficulty: this.estimateDifficulty(screenContext),
        platform,
        screenContext,
        timestamp: new Date()
      };

      this.currentContext = context;
      this.onContextChange(context);
    }
  }

  // Platform detection (inspired by Glass's multi-platform support)
  private detectPlatform(): 'bluebook' | 'khan_academy' | 'web' | 'other' {
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();

    // College Board Bluebook detection
    if (hostname.includes('collegeboard.org') || 
        hostname.includes('bluebook') ||
        pathname.includes('sat') || 
        pathname.includes('practice')) {
      return 'bluebook';
    }

    // Khan Academy SAT detection
    if (hostname.includes('khanacademy.org') && 
        (pathname.includes('sat') || pathname.includes('test-prep'))) {
      return 'khan_academy';
    }

    // Generic web-based SAT prep
    if (this.containsSATIndicators()) {
      return 'web';
    }

    return 'other';
  }

  // SAT content indicators detection
  private containsSATIndicators(): boolean {
    const content = document.body.textContent?.toLowerCase() || '';
    const satKeywords = [
      'sat', 'college board', 'test prep', 'practice test',
      'reading comprehension', 'math section', 'writing and language',
      'evidence based reading', 'calculator', 'no calculator'
    ];

    return satKeywords.some(keyword => content.includes(keyword));
  }

  // Screen context capture (adapted from Glass's multimodal analysis)
  private captureScreenContext(): ScreenContext {
    const text = this.extractVisibleText();
    const images = this.extractImages();
    
    return {
      text,
      images,
      url: window.location.href,
      pageTitle: document.title,
      elementContext: this.analyzeQuestionElements()
    };
  }

  // Extract visible text with priority for question content
  private extractVisibleText(): string {
    const questionSelectors = [
      // Bluebook selectors
      '.question-content',
      '.stem',
      '.passage',
      '.question-text',
      
      // Khan Academy selectors
      '.perseus-renderer',
      '.paragraph',
      '.question-container',
      
      // Generic selectors
      '[role="main"]',
      '.content',
      '.question',
      'main'
    ];

    let extractedText = '';

    // Try platform-specific selectors first
    for (const selector of questionSelectors) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (this.isElementVisible(element)) {
          extractedText += element.textContent + '\n';
        }
      }
    }

    // Fallback to body text if no specific content found
    if (!extractedText.trim()) {
      extractedText = document.body.textContent || '';
    }

    // Clean and limit text
    return this.cleanText(extractedText).substring(0, 5000);
  }

  // Extract images with descriptions
  private extractImages(): string[] {
    const images: string[] = [];
    const imgElements = document.querySelectorAll('img');

    imgElements.forEach(img => {
      if (this.isElementVisible(img) && img.src) {
        // Include alt text or surrounding context
        const description = img.alt || 
                          img.title || 
                          this.getImageContext(img) || 
                          'Image';
        images.push(`${img.src}|${description}`);
      }
    });

    return images;
  }

  // Get context around images (for math diagrams, charts, etc.)
  private getImageContext(img: HTMLImageElement): string {
    const parent = img.closest('figure, .image-container, .diagram, .chart');
    if (parent) {
      const caption = parent.querySelector('figcaption, .caption, .description');
      if (caption) {
        return caption.textContent || '';
      }
    }

    // Look for adjacent text
    const siblings = Array.from(img.parentElement?.children || []);
    const imgIndex = siblings.indexOf(img);
    const context = siblings.slice(Math.max(0, imgIndex - 1), imgIndex + 2)
                          .map(el => el.textContent)
                          .join(' ');

    return context.substring(0, 200);
  }

  // Analyze question-specific elements
  private analyzeQuestionElements() {
    const questionElement = this.findQuestionElement();
    const choicesElements = this.findChoiceElements();
    const imageElements = this.findQuestionImages();
    const mathElements = this.findMathElements();

    return {
      questionElement,
      choicesElements,
      imageElements,
      mathElements
    };
  }

  // Find main question element
  private findQuestionElement(): HTMLElement | undefined {
    const selectors = [
      '.question-content',
      '.stem',
      '.question-text',
      '.perseus-renderer .paragraph',
      '[data-question]',
      '.problem-statement'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element && this.isElementVisible(element)) {
        return element;
      }
    }

    return undefined;
  }

  // Find answer choice elements
  private findChoiceElements(): HTMLElement[] {
    const selectors = [
      '.choice-content',
      '.choice',
      '.answer-choice',
      '.option',
      '[data-choice]',
      '.perseus-radio-option'
    ];

    const choices: HTMLElement[] = [];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
      elements.forEach(el => {
        if (this.isElementVisible(el)) {
          choices.push(el);
        }
      });
    }

    return choices;
  }

  // Find images within questions
  private findQuestionImages(): HTMLImageElement[] {
    const questionContainer = this.findQuestionElement();
    if (!questionContainer) return [];

    const images = questionContainer.querySelectorAll('img') as NodeListOf<HTMLImageElement>;
    return Array.from(images).filter(img => this.isElementVisible(img));
  }

  // Find mathematical notation elements
  private findMathElements(): HTMLElement[] {
    const mathSelectors = [
      '.MathJax',
      '.katex',
      '.math',
      '.equation',
      '[data-math]',
      'math'
    ];

    const mathElements: HTMLElement[] = [];

    for (const selector of mathSelectors) {
      const elements = document.querySelectorAll(selector) as NodeListOf<HTMLElement>;
      elements.forEach(el => {
        if (this.isElementVisible(el)) {
          mathElements.push(el);
        }
      });
    }

    return mathElements;
  }

  // Analyze new content for SAT questions
  private analyzeNewContent(target: Element): void {
    if (!this.isElementVisible(target)) return;

    const text = target.textContent || '';
    
    // Check if this looks like a new question
    if (this.isNewQuestion(text)) {
      const screenContext = this.captureScreenContext();
      const questionType = this.inferQuestionType(screenContext);
      
      if (questionType) {
        const newContext: BonsaiContext = {
          questionText: this.extractQuestionText(target),
          questionType,
          difficulty: this.estimateDifficulty(screenContext),
          platform: this.detectPlatform(),
          screenContext,
          timestamp: new Date()
        };

        this.currentContext = newContext;
        this.onContextChange(newContext);
      }
    }
  }

  // Detect if content represents a new question
  private isNewQuestion(text: string): boolean {
    const questionIndicators = [
      'question', 'solve', 'find', 'calculate', 'determine',
      'which of the following', 'what is', 'how many',
      'based on the passage', 'according to the text',
      'the author suggests', 'the passage indicates'
    ];

    const cleanText = text.toLowerCase();
    return questionIndicators.some(indicator => cleanText.includes(indicator)) &&
           text.length > 20 && // Minimum question length
           (text.includes('?') || text.includes('A)') || text.includes('(A)'));
  }

  // Extract clean question text
  private extractQuestionText(element: Element): string {
    let questionText = element.textContent || '';
    
    // Remove answer choices if included
    questionText = questionText.replace(/[A-D]\).*?(?=[A-D]\)|$)/g, '');
    
    // Clean up formatting
    questionText = this.cleanText(questionText);
    
    return questionText.substring(0, 1000);
  }

  // Infer question type from content
  private inferQuestionType(context: ScreenContext): 'math' | 'reading' | 'writing' {
    const text = context.text.toLowerCase();
    
    // Math indicators
    const mathKeywords = [
      'equation', 'solve', 'calculate', 'graph', 'function',
      'polynomial', 'algebra', 'geometry', 'trigonometry',
      'coordinate', 'slope', 'angle', 'area', 'volume',
      'probability', 'statistics', 'ratio', 'proportion'
    ];

    // Reading indicators
    const readingKeywords = [
      'passage', 'paragraph', 'author', 'main idea', 'inference',
      'tone', 'purpose', 'evidence', 'suggests', 'implies',
      'according to', 'based on the passage', 'the text indicates'
    ];

    // Writing indicators
    const writingKeywords = [
      'grammar', 'punctuation', 'sentence', 'revision',
      'transition', 'word choice', 'style', 'rhetoric',
      'editing', 'proofreading', 'comma', 'semicolon'
    ];

    // Count keyword matches
    const mathScore = mathKeywords.filter(keyword => text.includes(keyword)).length;
    const readingScore = readingKeywords.filter(keyword => text.includes(keyword)).length;
    const writingScore = writingKeywords.filter(keyword => text.includes(keyword)).length;

    // Check for mathematical notation
    if (context.elementContext?.mathElements && context.elementContext.mathElements.length > 0) {
      return 'math';
    }

    // Check for images (often math diagrams)
    if (context.images.length > 0 && mathScore > 0) {
      return 'math';
    }

    // Return highest scoring type
    if (mathScore >= readingScore && mathScore >= writingScore) {
      return 'math';
    } else if (readingScore >= writingScore) {
      return 'reading';
    } else {
      return 'writing';
    }
  }

  // Estimate question difficulty
  private estimateDifficulty(context: ScreenContext): 'easy' | 'medium' | 'hard' {
    const text = context.text;
    
    // Simple heuristics for difficulty estimation
    const complexityIndicators = {
      easy: ['basic', 'simple', 'find', 'what is', 'which'],
      medium: ['calculate', 'determine', 'analyze', 'compare'],
      hard: ['evaluate', 'synthesize', 'complex', 'advanced', 'sophisticated']
    };

    let easyScore = 0;
    let mediumScore = 0;
    let hardScore = 0;

    const lowerText = text.toLowerCase();

    complexityIndicators.easy.forEach(indicator => {
      if (lowerText.includes(indicator)) easyScore++;
    });

    complexityIndicators.medium.forEach(indicator => {
      if (lowerText.includes(indicator)) mediumScore++;
    });

    complexityIndicators.hard.forEach(indicator => {
      if (lowerText.includes(indicator)) hardScore++;
    });

    // Additional complexity factors
    const wordCount = text.split(' ').length;
    const sentenceCount = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);

    // Longer, more complex sentences suggest higher difficulty
    if (avgWordsPerSentence > 25) hardScore += 2;
    else if (avgWordsPerSentence > 15) mediumScore += 1;

    // Mathematical notation suggests complexity
    if (context.elementContext?.mathElements && context.elementContext.mathElements.length > 2) {
      hardScore += 2;
    }

    // Multiple images suggest complexity
    if (context.images.length > 1) {
      mediumScore += 1;
    }

    // Return highest scoring difficulty
    if (hardScore > mediumScore && hardScore > easyScore) {
      return 'hard';
    } else if (mediumScore > easyScore) {
      return 'medium';
    } else {
      return 'easy';
    }
  }

  // Utility methods

  private isElementVisible(element: Element): boolean {
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    return rect.width > 0 && 
           rect.height > 0 && 
           style.display !== 'none' && 
           style.visibility !== 'hidden' &&
           style.opacity !== '0';
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, ' ')
      .trim();
  }

  private setupKeyboardShortcuts(): void {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Shift + B to toggle Bonsai
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'B') {
        e.preventDefault();
        this.triggerBonsaiActivation();
      }
    });
  }

  private triggerBonsaiActivation(): void {
    // Emit custom event for Bonsai activation
    const event = new CustomEvent('bonsai:activate', {
      detail: { context: this.currentContext }
    });
    document.dispatchEvent(event);
  }

  // Public methods for external access

  public getCurrentContext(): BonsaiContext | null {
    return this.currentContext;
  }

  public forceContextUpdate(): void {
    this.detectInitialContext();
  }

  public analyzeSpecificElement(element: Element): SATQuestionAnalysis | null {
    if (!this.isElementVisible(element)) return null;

    const text = element.textContent || '';
    const questionType = this.inferQuestionType({ 
      text, 
      images: [], 
      url: window.location.href, 
      pageTitle: document.title 
    });

    return {
      subject: questionType,
      topic: this.extractTopic(text),
      difficulty: this.estimateDifficulty({ 
        text, 
        images: [], 
        url: window.location.href, 
        pageTitle: document.title 
      }),
      concepts: this.extractConcepts(text),
      commonMistakes: this.identifyCommonMistakes(text, questionType),
      hints: this.generateHints(text, questionType),
      estimatedTimeMinutes: this.estimateTimeRequired(text, questionType),
      prerequisites: this.identifyPrerequisites(text, questionType)
    };
  }

  private extractTopic(text: string): string {
    // Topic extraction logic based on keywords
    const topics = {
      math: {
        'algebra': ['equation', 'variable', 'linear', 'quadratic'],
        'geometry': ['angle', 'triangle', 'circle', 'area', 'volume'],
        'statistics': ['mean', 'median', 'probability', 'data'],
        'trigonometry': ['sine', 'cosine', 'tangent', 'radians']
      },
      reading: {
        'literature': ['character', 'theme', 'metaphor', 'symbolism'],
        'history': ['historical', 'document', 'period', 'era'],
        'science': ['experiment', 'hypothesis', 'data', 'research']
      },
      writing: {
        'grammar': ['verb', 'noun', 'subject', 'predicate'],
        'style': ['tone', 'audience', 'purpose', 'rhetoric']
      }
    };

    // Simple keyword matching - could be enhanced with ML
    for (const [subject, subjectTopics] of Object.entries(topics)) {
      for (const [topic, keywords] of Object.entries(subjectTopics)) {
        if (keywords.some(keyword => text.toLowerCase().includes(keyword))) {
          return topic;
        }
      }
    }

    return 'general';
  }

  private extractConcepts(text: string): string[] {
    // Extract key mathematical or conceptual terms
    const conceptPatterns = [
      /\b(?:equation|function|variable|constant)\b/gi,
      /\b(?:hypothesis|evidence|conclusion|argument)\b/gi,
      /\b(?:grammar|syntax|rhetoric|style)\b/gi
    ];

    const concepts: string[] = [];
    
    conceptPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        concepts.push(...matches.map(m => m.toLowerCase()));
      }
    });

    return [...new Set(concepts)];
  }

  private identifyCommonMistakes(text: string, questionType: 'math' | 'reading' | 'writing'): string[] {
    // Common mistake patterns by question type
    const mistakes = {
      math: [
        'Sign errors in algebra',
        'Forgetting to distribute',
        'Misreading the question',
        'Unit conversion errors'
      ],
      reading: [
        'Not reading the full passage',
        'Making assumptions beyond the text',
        'Confusing author\'s view with character\'s view',
        'Missing key evidence'
      ],
      writing: [
        'Subject-verb disagreement',
        'Misplaced modifiers',
        'Run-on sentences',
        'Incorrect punctuation'
      ]
    };

    return mistakes[questionType] || [];
  }

  private generateHints(text: string, questionType: 'math' | 'reading' | 'writing'): string[] {
    // Basic hint generation - could be enhanced with AI
    const hints = {
      math: [
        'Identify what the question is asking for',
        'List the given information',
        'Choose the appropriate formula or method'
      ],
      reading: [
        'Read the question first',
        'Scan for keywords in the passage',
        'Look for evidence to support your answer'
      ],
      writing: [
        'Read the sentence carefully',
        'Check for grammar and punctuation',
        'Consider the context and tone'
      ]
    };

    return hints[questionType] || [];
  }

  private estimateTimeRequired(text: string, questionType: 'math' | 'reading' | 'writing'): number {
    const baseTime = {
      math: 2,
      reading: 1.5,
      writing: 1
    };

    const wordCount = text.split(' ').length;
    const complexity = wordCount > 100 ? 1.5 : wordCount > 50 ? 1.2 : 1;

    return Math.round(baseTime[questionType] * complexity);
  }

  private identifyPrerequisites(text: string, questionType: 'math' | 'reading' | 'writing'): string[] {
    // Identify prerequisite knowledge
    const prerequisites = {
      math: ['Basic arithmetic', 'Algebraic manipulation'],
      reading: ['Reading comprehension', 'Vocabulary'],
      writing: ['Grammar rules', 'Sentence structure']
    };

    return prerequisites[questionType] || [];
  }
}

// Export singleton instance
export const contextAnalyzer = new SATContextAnalyzer(() => {});
export default SATContextAnalyzer;