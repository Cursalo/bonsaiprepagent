// Advanced Question Detector Module
// Revolutionary SAT question analysis with GPT-4 Vision and behavior tracking

const { EventEmitter } = require('events');
const axios = require('axios');

class QuestionDetector extends EventEmitter {
  constructor(apiEndpoint = 'http://localhost:3000/api') {
    super();
    this.questionPatterns = this.initializePatterns();
    this.apiEndpoint = apiEndpoint;
    this.currentAnalysis = null;
    this.behaviorTracker = {
      startTime: Date.now(),
      mouseMovements: 0,
      keystrokes: 0,
      scrolls: 0,
      clicks: 0,
      lastActivity: Date.now()
    };
    
    this.setupBehaviorTracking();
  }

  initializePatterns() {
    return {
      // General question patterns
      general: [
        /which.*(?:choice|option|answer)/i,
        /what.*is.*the/i,
        /according.*to.*(?:passage|text|graph)/i,
        /the.*author.*(?:suggests|implies|believes)/i,
        /based.*on.*(?:passage|information)/i,
        /as.*used.*in.*line/i,
        /in.*context.*line/i,
        /which.*best.*(?:describes|explains)/i
      ],

      // Math specific patterns
      math: [
        /solve.*for/i,
        /find.*the.*value/i,
        /what.*is.*the.*(?:area|volume|perimeter)/i,
        /if.*x.*=.*then/i,
        /the.*equation.*of/i,
        /which.*expression/i,
        /simplify/i,
        /factor/i
      ],

      // Reading specific patterns
      reading: [
        /the.*passage.*suggests/i,
        /the.*author.*tone/i,
        /main.*idea/i,
        /central.*theme/i,
        /the.*narrator/i,
        /in.*the.*passage/i,
        /according.*to.*lines/i
      ],

      // Writing specific patterns
      writing: [
        /which.*choice.*best/i,
        /to.*make.*the.*passage/i,
        /the.*writer.*wants.*to/i,
        /which.*revision/i,
        /delete.*the.*underlined/i,
        /add.*the.*following/i,
        /where.*should.*the.*sentence/i
      ]
    };
  }

  analyzeText(text) {
    if (!text || typeof text !== 'string') {
      return { isQuestion: false };
    }

    const cleanText = text.trim();
    
    // Check if text is long enough to be a question
    if (cleanText.length < 20) {
      return { isQuestion: false };
    }

    // Detect question type and subject
    const analysis = {
      isQuestion: false,
      subject: 'unknown',
      type: 'unknown',
      confidence: 0,
      text: cleanText,
      patterns: [],
      timestamp: Date.now()
    };

    // Check for general question patterns
    const generalMatches = this.findMatches(cleanText, this.questionPatterns.general);
    if (generalMatches.length > 0) {
      analysis.isQuestion = true;
      analysis.patterns.push(...generalMatches);
      analysis.confidence += 0.3;
    }

    // Check for subject-specific patterns
    const mathMatches = this.findMatches(cleanText, this.questionPatterns.math);
    const readingMatches = this.findMatches(cleanText, this.questionPatterns.reading);
    const writingMatches = this.findMatches(cleanText, this.questionPatterns.writing);

    // Determine subject based on pattern matches
    if (mathMatches.length > 0) {
      analysis.subject = 'math';
      analysis.patterns.push(...mathMatches);
      analysis.confidence += 0.4;
    }

    if (readingMatches.length > 0) {
      analysis.subject = 'reading';
      analysis.patterns.push(...readingMatches);
      analysis.confidence += 0.4;
    }

    if (writingMatches.length > 0) {
      analysis.subject = 'writing';
      analysis.patterns.push(...writingMatches);
      analysis.confidence += 0.4;
    }

    // Additional indicators
    if (cleanText.includes('?')) {
      analysis.confidence += 0.2;
      analysis.isQuestion = true;
    }

    if (cleanText.toLowerCase().includes('choice')) {
      analysis.confidence += 0.1;
      analysis.type = 'multiple-choice';
    }

    // Extract question number if present
    const questionNumberMatch = cleanText.match(/(?:question|q)\s*[:\.]?\s*(\d+)/i) || 
                               cleanText.match(/^(\d+)\s*[\.\)]/);
    if (questionNumberMatch) {
      analysis.questionNumber = parseInt(questionNumberMatch[1]);
    }

    // Set minimum confidence threshold
    if (analysis.confidence >= 0.3) {
      analysis.isQuestion = true;
    }

    return analysis;
  }

  findMatches(text, patterns) {
    const matches = [];
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        matches.push(pattern.source);
      }
    }
    return matches;
  }

  // Detect difficulty level based on text complexity
  estimateDifficulty(text) {
    const wordCount = text.split(/\s+/).length;
    const avgWordLength = text.replace(/\s+/g, '').length / wordCount;
    const complexWords = text.match(/\b\w{7,}\b/g) || [];
    
    let difficulty = 'medium';
    
    if (wordCount < 30 && avgWordLength < 5) {
      difficulty = 'easy';
    } else if (wordCount > 80 || complexWords.length > 5) {
      difficulty = 'hard';
    }
    
    return difficulty;
  }

  // Extract multiple choice options
  extractChoices(text) {
    const choicePatterns = [
      /[A-D]\)\s*([^\n\r]+)/g,
      /[A-D]\.\s*([^\n\r]+)/g,
      /\([A-D]\)\s*([^\n\r]+)/g
    ];
    
    for (const pattern of choicePatterns) {
      const matches = Array.from(text.matchAll(pattern));
      if (matches.length >= 2) {
        return matches.map(match => ({
          label: match[0].match(/[A-D]/)[0],
          text: match[1].trim()
        }));
      }
    }
    
    return [];
  }

  /**
   * Revolutionary question analysis using GPT-4 Vision
   */
  async analyzeScreenshot(screenshotData, userId, platform = 'unknown') {
    try {
      console.log('🔍 Starting advanced screenshot analysis...');
      
      // Update behavior tracking
      this.updateBehaviorTracking();
      
      // Call the advanced AI service
      const response = await axios.post(`${this.apiEndpoint}/ai/analyze-screen`, {
        screenshot: screenshotData,
        userId: userId,
        platform: platform,
        behaviorMetrics: this.getBehaviorMetrics()
      }, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.questionAnalysis) {
        this.currentAnalysis = response.data.questionAnalysis;
        
        // Emit analysis event
        this.emit('questionAnalyzed', {
          analysis: this.currentAnalysis,
          confidence: this.currentAnalysis.confidence,
          subject: this.currentAnalysis.subject,
          difficulty: this.currentAnalysis.difficulty
        });

        console.log('✅ Advanced analysis complete:', {
          subject: this.currentAnalysis.subject,
          topic: this.currentAnalysis.topic,
          difficulty: this.currentAnalysis.difficulty,
          confidence: this.currentAnalysis.confidence
        });

        return this.currentAnalysis;
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      console.error('❌ Advanced analysis failed:', error.message);
      
      // Fallback to basic OCR analysis
      return this.fallbackToBasicAnalysis(screenshotData);
    }
  }

  /**
   * Setup behavior tracking for predictive assistance
   */
  setupBehaviorTracking() {
    // Reset behavior tracking periodically
    setInterval(() => {
      this.resetBehaviorTracking();
    }, 60000); // Reset every minute

    // Track various user behaviors
    this.trackMouseActivity();
    this.trackKeyboardActivity();
    this.trackScrollActivity();
  }

  /**
   * Track mouse activity
   */
  trackMouseActivity() {
    // This would integrate with the main window's mouse tracking
    // For now, we'll simulate tracking
    setInterval(() => {
      // Simulate mouse movement detection
      const activity = Math.random() > 0.7 ? 1 : 0;
      this.behaviorTracker.mouseMovements += activity;
      if (activity) this.behaviorTracker.lastActivity = Date.now();
    }, 1000);
  }

  /**
   * Track keyboard activity
   */
  trackKeyboardActivity() {
    // This would integrate with the main window's keyboard tracking
    setInterval(() => {
      // Simulate keyboard activity detection
      const activity = Math.random() > 0.8 ? 1 : 0;
      this.behaviorTracker.keystrokes += activity;
      if (activity) this.behaviorTracker.lastActivity = Date.now();
    }, 1000);
  }

  /**
   * Track scroll activity
   */
  trackScrollActivity() {
    // This would integrate with the main window's scroll tracking
    setInterval(() => {
      // Simulate scroll activity detection
      const activity = Math.random() > 0.9 ? 1 : 0;
      this.behaviorTracker.scrolls += activity;
      if (activity) this.behaviorTracker.lastActivity = Date.now();
    }, 1000);
  }

  /**
   * Get current behavior metrics
   */
  getBehaviorMetrics() {
    const now = Date.now();
    const timeOnQuestion = (now - this.behaviorTracker.startTime) / 1000;
    const timeInactive = (now - this.behaviorTracker.lastActivity) / 1000;

    // Calculate frustration level based on behavior patterns
    let frustrationLevel = 0;
    if (timeOnQuestion > 120) frustrationLevel += 0.3;
    if (timeInactive > 30) frustrationLevel += 0.2;
    if (this.behaviorTracker.mouseMovements > 50) frustrationLevel += 0.2;
    
    // Calculate confidence and engagement
    const activityLevel = this.behaviorTracker.mouseMovements + this.behaviorTracker.keystrokes;
    const engagementLevel = Math.min(1, activityLevel / 20);
    const confidenceLevel = Math.max(0, 1 - (frustrationLevel / 2));

    return {
      timeOnQuestion: Math.round(timeOnQuestion),
      mouseMovements: this.behaviorTracker.mouseMovements,
      keystrokes: this.behaviorTracker.keystrokes,
      scrolls: this.behaviorTracker.scrolls,
      previousAttempts: 0, // Would track from session data
      frustrationLevel: Math.min(1, frustrationLevel),
      confidenceLevel,
      engagementLevel,
      timeInactive: Math.round(timeInactive)
    };
  }

  /**
   * Update behavior tracking
   */
  updateBehaviorTracking() {
    this.behaviorTracker.lastActivity = Date.now();
    this.behaviorTracker.clicks += 1;
  }

  /**
   * Reset behavior tracking
   */
  resetBehaviorTracking() {
    const metrics = this.getBehaviorMetrics();
    
    // Emit behavior data for analytics
    this.emit('behaviorData', metrics);
    
    // Reset counters but keep start time
    this.behaviorTracker.mouseMovements = 0;
    this.behaviorTracker.keystrokes = 0;
    this.behaviorTracker.scrolls = 0;
    this.behaviorTracker.clicks = 0;
  }

  /**
   * Fallback to basic analysis when advanced analysis fails
   */
  async fallbackToBasicAnalysis(screenshotData) {
    console.log('🔄 Falling back to basic analysis...');
    
    // This would typically use basic OCR
    // For now, return a basic analysis structure
    return {
      subject: 'unknown',
      topic: 'general',
      difficulty: 'medium',
      confidence: 0.3,
      questionType: 'unknown',
      concepts: [],
      visualElements: [],
      isQuestion: false
    };
  }

  /**
   * Get behavioral prediction for user
   */
  async getBehavioralPrediction(userId) {
    try {
      const response = await axios.get(`${this.apiEndpoint}/ai/behavior-prediction/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get behavioral prediction:', error);
      return null;
    }
  }

  /**
   * Send behavior pattern to backend for analytics
   */
  async sendBehaviorPattern(userId, sessionId, pattern) {
    try {
      await axios.post(`${this.apiEndpoint}/ai/track-behavior`, {
        userId,
        sessionId,
        pattern,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to send behavior pattern:', error);
    }
  }

  /**
   * Check if user needs proactive assistance
   */
  async checkForProactiveAssistance(userId) {
    try {
      const prediction = await this.getBehavioralPrediction(userId);
      
      if (prediction && prediction.needsHelp && prediction.confidence > 0.7) {
        this.emit('proactiveAssistanceNeeded', {
          suggestedAction: prediction.suggestedAction,
          confidence: prediction.confidence,
          reasoning: prediction.reasoning
        });
      }
    } catch (error) {
      console.error('Failed to check for proactive assistance:', error);
    }
  }

  /**
   * Enhanced analyze text with AI integration
   */
  async analyzeTextAdvanced(text, userId) {
    // First run basic analysis
    const basicAnalysis = this.analyzeText(text);
    
    // If it looks like a question, get AI enhancement
    if (basicAnalysis.isQuestion && basicAnalysis.confidence > 0.5) {
      try {
        const response = await axios.post(`${this.apiEndpoint}/ai/analyze-text`, {
          text: text,
          userId: userId,
          basicAnalysis: basicAnalysis,
          behaviorMetrics: this.getBehaviorMetrics()
        });

        if (response.data && response.data.analysis) {
          return {
            ...basicAnalysis,
            ...response.data.analysis,
            enhanced: true
          };
        }
      } catch (error) {
        console.error('AI text analysis failed, using basic analysis:', error);
      }
    }

    return basicAnalysis;
  }

  /**
   * Smart question detection that combines multiple methods
   */
  async smartQuestionDetection(input, userId, platform = 'unknown') {
    const detection = {
      timestamp: Date.now(),
      method: 'unknown',
      result: null,
      confidence: 0
    };

    try {
      // If we have a screenshot, use advanced vision analysis
      if (input.screenshot) {
        detection.method = 'vision_ai';
        detection.result = await this.analyzeScreenshot(input.screenshot, userId, platform);
        detection.confidence = detection.result.confidence;
      }
      // If we have text, use enhanced text analysis
      else if (input.text) {
        detection.method = 'text_ai';
        detection.result = await this.analyzeTextAdvanced(input.text, userId);
        detection.confidence = detection.result.confidence;
      }
      // Fallback to basic text analysis
      else {
        detection.method = 'basic';
        detection.result = this.analyzeText(input.text || '');
        detection.confidence = detection.result.confidence;
      }

      // Update current analysis
      this.currentAnalysis = detection.result;

      // Emit detection event
      this.emit('questionDetected', detection);

      // Check for proactive assistance needs
      if (userId) {
        setTimeout(() => this.checkForProactiveAssistance(userId), 5000);
      }

      return detection;
    } catch (error) {
      console.error('Smart question detection failed:', error);
      detection.method = 'error';
      detection.result = { isQuestion: false, error: error.message };
      return detection;
    }
  }

  /**
   * Get current question analysis
   */
  getCurrentAnalysis() {
    return this.currentAnalysis;
  }

  /**
   * Test the enhanced detector
   */
  async testAdvanced(input, userId = 'test-user') {
    console.log('🧪 Testing Advanced Question Detector...');
    console.log('Input:', input);
    
    const result = await this.smartQuestionDetection(input, userId);
    console.log('Detection result:', result);
    
    return result;
  }

  // Legacy test method for compatibility
  test(sampleText) {
    console.log('🧪 Testing Question Detector...');
    console.log('Sample text:', sampleText);
    
    const result = this.analyzeText(sampleText);
    console.log('Analysis result:', result);
    
    return result;
  }
}

module.exports = QuestionDetector;