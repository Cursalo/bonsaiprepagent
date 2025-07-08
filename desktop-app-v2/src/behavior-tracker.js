/**
 * Advanced Behavior Tracking for Desktop App
 * Monitors user patterns and predicts when help is needed
 */

const screenshot = require('screenshot-desktop');
const sharp = require('sharp');
const Tesseract = require('tesseract.js');
const robot = require('robotjs');
const EventEmitter = require('events');

class BehaviorTracker extends EventEmitter {
  constructor(store) {
    super();
    this.store = store;
    this.isTracking = false;
    this.sessionStartTime = Date.now();
    this.patterns = new Map();
    this.screenshotInterval = null;
    this.questionDetectionActive = false;
    
    // Behavior metrics
    this.metrics = {
      mouseMovements: [],
      keystrokes: 0,
      idleTime: 0,
      windowSwitches: 0,
      questionsDetected: 0,
      helpRequests: 0,
      sessionDuration: 0,
      strugglingIndicators: []
    };
    
    // Patterns that indicate user needs help
    this.strugglingPatterns = {
      rapidClicking: { threshold: 10, timeWindow: 5000 }, // 10 clicks in 5 seconds
      longIdle: { threshold: 30000 }, // 30 seconds of inactivity
      repetitiveScrolling: { threshold: 20, timeWindow: 10000 }, // 20 scrolls in 10 seconds
      backspaceSpamming: { threshold: 15, timeWindow: 3000 }, // 15 backspaces in 3 seconds
      windowHopping: { threshold: 5, timeWindow: 10000 } // 5 window switches in 10 seconds
    };
  }

  async startTracking() {
    if (this.isTracking) return;
    
    console.log('🔍 Starting behavior tracking...');
    this.isTracking = true;
    this.sessionStartTime = Date.now();
    
    // Start mouse tracking
    this.startMouseTracking();
    
    // Start screenshot analysis for question detection
    this.startQuestionDetection();
    
    // Start periodic analysis
    this.startPeriodicAnalysis();
    
    this.emit('tracking-started');
  }

  stopTracking() {
    if (!this.isTracking) return;
    
    console.log('⏹️ Stopping behavior tracking...');
    this.isTracking = false;
    
    if (this.screenshotInterval) {
      clearInterval(this.screenshotInterval);
    }
    
    this.saveSessionData();
    this.emit('tracking-stopped');
  }

  startMouseTracking() {
    let lastMousePos = robot.getMousePos();
    let lastActivity = Date.now();
    let clickCount = 0;
    let scrollCount = 0;
    
    const mouseTracker = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(mouseTracker);
        return;
      }
      
      const currentPos = robot.getMousePos();
      const now = Date.now();
      
      // Track mouse movement
      if (currentPos.x !== lastMousePos.x || currentPos.y !== lastMousePos.y) {
        this.metrics.mouseMovements.push({
          x: currentPos.x,
          y: currentPos.y,
          timestamp: now
        });
        
        lastActivity = now;
        this.metrics.idleTime = 0;
        
        // Keep only last 100 movements for memory efficiency
        if (this.metrics.mouseMovements.length > 100) {
          this.metrics.mouseMovements.shift();
        }
      } else {
        // Track idle time
        this.metrics.idleTime = now - lastActivity;
        
        // Check for long idle pattern
        if (this.metrics.idleTime > this.strugglingPatterns.longIdle.threshold) {
          this.detectStrugglePattern('longIdle', {
            idleTime: this.metrics.idleTime,
            timestamp: now
          });
        }
      }
      
      lastMousePos = currentPos;
      
      // Analyze patterns every 5 seconds
      if (now % 5000 < 100) {
        this.analyzeRecentActivity();
      }
      
    }, 100); // Check every 100ms
  }

  startQuestionDetection() {
    // Take screenshots every 10 seconds to detect questions
    this.screenshotInterval = setInterval(() => {
      if (!this.isTracking) return;
      this.detectQuestions();
    }, 10000);
  }

  async detectQuestions() {
    try {
      // Take screenshot
      const img = await screenshot({ format: 'png' });
      
      // Resize for faster OCR
      const resized = await sharp(img)
        .resize(1200, 800, { fit: 'inside' })
        .greyscale()
        .normalize()
        .png()
        .toBuffer();
      
      // Run OCR to detect text
      const { data: { text } } = await Tesseract.recognize(resized, 'eng', {
        logger: () => {} // Suppress logs
      });
      
      // Look for SAT question patterns
      const questionPatterns = [
        /question \d+/i,
        /which of the following/i,
        /what is the/i,
        /if .* then/i,
        /solve for/i,
        /find the/i,
        /calculate/i,
        /determine/i,
        /based on the passage/i,
        /according to the graph/i,
        /the author suggests/i,
        /reading comprehension/i,
        /math section/i,
        /writing and language/i
      ];
      
      const foundQuestions = questionPatterns.filter(pattern => pattern.test(text));
      
      if (foundQuestions.length > 0) {
        this.metrics.questionsDetected++;
        
        // Analyze question difficulty and type
        const questionData = {
          text: text.substring(0, 500), // First 500 chars
          patterns: foundQuestions.map(p => p.toString()),
          timestamp: Date.now(),
          screenshot: resized.toString('base64')
        };
        
        this.emit('question-detected', questionData);
        
        // Store for behavior analysis
        this.store.set(`questions.${Date.now()}`, questionData);
        
        console.log('📝 SAT Question detected!');
      }
      
    } catch (error) {
      console.error('Screenshot analysis failed:', error);
    }
  }

  startPeriodicAnalysis() {
    setInterval(() => {
      if (!this.isTracking) return;
      
      const prediction = this.analyzeBehaviorPatterns();
      if (prediction.needsHelp) {
        this.emit('help-needed', prediction);
      }
      
    }, 30000); // Analyze every 30 seconds
  }

  detectStrugglePattern(patternType, data) {
    const now = Date.now();
    
    if (!this.patterns.has(patternType)) {
      this.patterns.set(patternType, []);
    }
    
    const pattern = this.patterns.get(patternType);
    pattern.push({ ...data, timestamp: now });
    
    // Clean old entries
    const timeWindow = this.strugglingPatterns[patternType].timeWindow || 60000;
    this.patterns.set(patternType, 
      pattern.filter(entry => now - entry.timestamp < timeWindow)
    );
    
    // Check if pattern threshold is met
    const threshold = this.strugglingPatterns[patternType].threshold;
    if (pattern.length >= threshold) {
      this.metrics.strugglingIndicators.push({
        type: patternType,
        intensity: pattern.length / threshold,
        timestamp: now,
        data: data
      });
      
      this.emit('struggle-detected', {
        type: patternType,
        intensity: pattern.length / threshold,
        data: data
      });
      
      console.log(`⚠️ Struggle pattern detected: ${patternType}`);
    }
  }

  analyzeRecentActivity() {
    const now = Date.now();
    const recentMovements = this.metrics.mouseMovements.filter(
      mov => now - mov.timestamp < 10000 // Last 10 seconds
    );
    
    // Detect rapid clicking (same area multiple times)
    const clickClusters = this.findClickClusters(recentMovements);
    if (clickClusters.length > 5) {
      this.detectStrugglePattern('rapidClicking', {
        clusters: clickClusters.length,
        area: clickClusters[0]
      });
    }
    
    // Detect repetitive scrolling
    const scrollEvents = this.detectScrolling(recentMovements);
    if (scrollEvents > this.strugglingPatterns.repetitiveScrolling.threshold) {
      this.detectStrugglePattern('repetitiveScrolling', {
        scrollCount: scrollEvents
      });
    }
  }

  findClickClusters(movements) {
    const clusters = [];
    const clusterRadius = 50; // pixels
    
    for (let i = 0; i < movements.length; i++) {
      const movement = movements[i];
      let foundCluster = false;
      
      for (let cluster of clusters) {
        const distance = Math.sqrt(
          Math.pow(movement.x - cluster.x, 2) + 
          Math.pow(movement.y - cluster.y, 2)
        );
        
        if (distance < clusterRadius) {
          cluster.count++;
          foundCluster = true;
          break;
        }
      }
      
      if (!foundCluster) {
        clusters.push({
          x: movement.x,
          y: movement.y,
          count: 1
        });
      }
    }
    
    return clusters.filter(cluster => cluster.count > 3);
  }

  detectScrolling(movements) {
    let scrollCount = 0;
    for (let i = 1; i < movements.length; i++) {
      const prev = movements[i - 1];
      const curr = movements[i];
      
      // Detect vertical movement patterns (scrolling)
      if (Math.abs(curr.y - prev.y) > 10 && Math.abs(curr.x - prev.x) < 5) {
        scrollCount++;
      }
    }
    return scrollCount;
  }

  analyzeBehaviorPatterns() {
    const now = Date.now();
    const sessionDuration = now - this.sessionStartTime;
    this.metrics.sessionDuration = sessionDuration;
    
    // Calculate struggle score
    let struggleScore = 0;
    let confidence = 0.5;
    
    // Recent struggling indicators
    const recentStruggles = this.metrics.strugglingIndicators.filter(
      indicator => now - indicator.timestamp < 120000 // Last 2 minutes
    );
    
    if (recentStruggles.length > 0) {
      struggleScore += recentStruggles.length * 0.3;
      confidence += 0.2;
    }
    
    // Long idle time
    if (this.metrics.idleTime > 60000) { // 1 minute idle
      struggleScore += 0.4;
      confidence += 0.15;
    }
    
    // Question detection without help requests
    if (this.metrics.questionsDetected > 0 && this.metrics.helpRequests === 0) {
      struggleScore += 0.3;
      confidence += 0.1;
    }
    
    // Time spent vs progress ratio
    if (sessionDuration > 300000 && this.metrics.helpRequests === 0) { // 5 minutes
      struggleScore += 0.2;
      confidence += 0.1;
    }
    
    const needsHelp = struggleScore > 0.6;
    const urgency = Math.min(struggleScore, 1.0);
    
    let suggestedAction = 'wait';
    let timeUntilIntervention = 0;
    let reasoning = [];
    
    if (needsHelp) {
      if (urgency > 0.8) {
        suggestedAction = 'immediate_help';
        timeUntilIntervention = 0;
        reasoning.push('High urgency: Multiple struggle indicators detected');
      } else if (urgency > 0.6) {
        suggestedAction = 'gentle_prompt';
        timeUntilIntervention = 30000; // 30 seconds
        reasoning.push('Moderate concern: User showing signs of struggle');
      } else {
        suggestedAction = 'monitor';
        timeUntilIntervention = 60000; // 1 minute
        reasoning.push('Low concern: Minor struggle indicators');
      }
    }
    
    if (recentStruggles.length > 0) {
      reasoning.push(`Recent struggles: ${recentStruggles.map(s => s.type).join(', ')}`);
    }
    
    if (this.metrics.idleTime > 60000) {
      reasoning.push(`Long idle time: ${Math.round(this.metrics.idleTime / 1000)}s`);
    }
    
    if (this.metrics.questionsDetected > 0) {
      reasoning.push(`Questions detected: ${this.metrics.questionsDetected}`);
    }
    
    return {
      needsHelp,
      confidence: Math.min(confidence, 1.0),
      urgency,
      suggestedAction,
      timeUntilIntervention,
      reasoning,
      struggleScore,
      metrics: this.metrics,
      patterns: Object.fromEntries(this.patterns)
    };
  }

  saveSessionData() {
    const sessionData = {
      startTime: this.sessionStartTime,
      endTime: Date.now(),
      duration: Date.now() - this.sessionStartTime,
      metrics: { ...this.metrics },
      patterns: Object.fromEntries(this.patterns),
      finalAnalysis: this.analyzeBehaviorPatterns()
    };
    
    this.store.set(`sessions.${this.sessionStartTime}`, sessionData);
    
    // Keep only last 10 sessions
    const sessions = this.store.get('sessions', {});
    const sessionKeys = Object.keys(sessions).sort().slice(-10);
    const filteredSessions = {};
    sessionKeys.forEach(key => {
      filteredSessions[key] = sessions[key];
    });
    this.store.set('sessions', filteredSessions);
  }

  getSessionHistory() {
    return this.store.get('sessions', {});
  }

  getCurrentMetrics() {
    return {
      ...this.metrics,
      sessionDuration: Date.now() - this.sessionStartTime,
      isTracking: this.isTracking
    };
  }

  incrementHelpRequests() {
    this.metrics.helpRequests++;
  }
}

module.exports = BehaviorTracker;