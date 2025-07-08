/**
 * Simplified Behavior Tracking for Desktop App
 * Basic monitoring without problematic native dependencies
 */

const EventEmitter = require('events');

class SimpleBehaviorTracker extends EventEmitter {
  constructor(store) {
    super();
    this.store = store;
    this.isTracking = false;
    this.sessionStartTime = Date.now();
    this.patterns = new Map();
    
    // Basic behavior metrics
    this.metrics = {
      sessionStartTime: this.sessionStartTime,
      keystrokes: 0,
      helpRequests: 0,
      sessionDuration: 0,
      strugglingIndicators: [],
      isTracking: false
    };
  }

  async startTracking() {
    if (this.isTracking) return;
    
    console.log('🔍 Starting simplified behavior tracking...');
    this.isTracking = true;
    this.metrics.isTracking = true;
    this.sessionStartTime = Date.now();
    this.metrics.sessionStartTime = this.sessionStartTime;
    
    // Start basic tracking
    this.startBasicTracking();
    
    this.emit('tracking-started');
  }

  stopTracking() {
    if (!this.isTracking) return;
    
    console.log('⏹️ Stopping behavior tracking...');
    this.isTracking = false;
    this.metrics.isTracking = false;
    
    this.saveSessionData();
    this.emit('tracking-stopped');
  }

  startBasicTracking() {
    // Simple periodic tracking without native dependencies
    const trackingInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(trackingInterval);
        return;
      }
      
      this.updateMetrics();
      
      // Simple pattern analysis every 30 seconds
      if (Date.now() % 30000 < 1000) {
        this.analyzeBasicPatterns();
      }
      
    }, 1000); // Update every second
  }

  updateMetrics() {
    this.metrics.sessionDuration = Date.now() - this.sessionStartTime;
  }

  analyzeBasicPatterns() {
    const now = Date.now();
    const sessionDuration = now - this.sessionStartTime;
    
    // Simple heuristics for when user might need help
    let struggleScore = 0;
    let confidence = 0.3;
    
    // Long session without help requests might indicate struggle
    if (sessionDuration > 300000 && this.metrics.helpRequests === 0) { // 5+ minutes
      struggleScore += 0.4;
      confidence += 0.2;
    }
    
    // Very long session might indicate confusion
    if (sessionDuration > 900000) { // 15+ minutes
      struggleScore += 0.3;
      confidence += 0.1;
    }
    
    const needsHelp = struggleScore > 0.5;
    
    if (needsHelp) {
      this.emit('help-needed', {
        needsHelp: true,
        confidence: Math.min(confidence, 1.0),
        suggestedAction: 'gentle_prompt',
        timeUntilIntervention: 30000,
        reasoning: ['Long session without help requests detected']
      });
    }
  }

  detectStrugglePattern(patternType, data) {
    const now = Date.now();
    
    this.metrics.strugglingIndicators.push({
      type: patternType,
      timestamp: now,
      data: data
    });
    
    this.emit('struggle-detected', {
      type: patternType,
      intensity: 0.7,
      data: data
    });
    
    console.log(`⚠️ Struggle pattern detected: ${patternType}`);
  }

  saveSessionData() {
    const sessionData = {
      startTime: this.sessionStartTime,
      endTime: Date.now(),
      duration: Date.now() - this.sessionStartTime,
      metrics: { ...this.metrics }
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
    console.log(`📈 Help requests: ${this.metrics.helpRequests}`);
  }

  // Simulate question detection for demo purposes
  simulateQuestionDetection() {
    this.emit('question-detected', {
      text: 'Sample SAT question detected',
      timestamp: Date.now(),
      simulated: true
    });
  }
}

module.exports = SimpleBehaviorTracker;