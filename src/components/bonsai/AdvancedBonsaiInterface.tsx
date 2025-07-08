/**
 * Advanced Bonsai Interface - Revolutionary floating AI tutor with contextual intelligence
 * This component provides an invisible, intelligent interface that appears when students need help
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { Mic, Volume2, Sparkles, Brain, Lightbulb, TreePine, MessageCircle } from 'lucide-react';
import { AdvancedQuestionAnalyzer, QuestionAnalysis, StudentState } from '@/lib/ai/advanced-question-analyzer';
import { ResponseOptimizer, OptimizedResponse, ResponseContext } from '@/lib/ai/response-optimizer';
import { BehaviorAnalytics, BehaviorPattern, PredictionResult } from '@/lib/behavior/analytics';

interface AdvancedBonsaiInterfaceProps {
  userId: string;
  sessionId: string;
  platform: 'bluebook' | 'khan_academy' | 'other';
  onResponse?: (response: OptimizedResponse) => void;
  onBehaviorUpdate?: (pattern: BehaviorPattern) => void;
}

interface BonsaiState {
  isActive: boolean;
  isListening: boolean;
  isThinking: boolean;
  isResponding: boolean;
  currentMode: 'sleeping' | 'alert' | 'helping' | 'encouraging';
  position: { x: number; y: number };
  size: number;
  opacity: number;
  glowIntensity: number;
}

interface InteractionContext {
  screenshot?: string;
  questionText?: string;
  mousePosition: { x: number; y: number };
  behaviorMetrics: any;
  urgencyLevel: 'low' | 'medium' | 'high';
}

export function AdvancedBonsaiInterface({
  userId,
  sessionId,
  platform,
  onResponse,
  onBehaviorUpdate
}: AdvancedBonsaiInterfaceProps) {
  // Core state
  const [bonsaiState, setBonsaiState] = useState<BonsaiState>({
    isActive: false,
    isListening: false,
    isThinking: false,
    isResponding: false,
    currentMode: 'sleeping',
    position: { x: 100, y: 100 },
    size: 80,
    opacity: 0.7,
    glowIntensity: 0.3
  });

  const [currentResponse, setCurrentResponse] = useState<OptimizedResponse | null>(null);
  const [showResponsePanel, setShowResponsePanel] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  // Services
  const [questionAnalyzer] = useState(new AdvancedQuestionAnalyzer());
  const [responseOptimizer] = useState(new ResponseOptimizer());
  const [behaviorAnalytics] = useState(new BehaviorAnalytics());

  // Animation values
  const x = useMotionValue(100);
  const y = useMotionValue(100);
  const scale = useSpring(1);
  const glow = useSpring(0.3);

  // Refs
  const lastInteractionTime = useRef(Date.now());
  const behaviorTracker = useRef<any>({});
  const speechRecognition = useRef<any>(null);

  /**
   * Initialize the advanced interface
   */
  useEffect(() => {
    initializeInterface();
    startBehaviorTracking();
    setupVoiceRecognition();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeInterface = useCallback(async () => {
    // Position Bonsai in optimal location
    const optimalPosition = calculateOptimalPosition();
    setBonsaiState(prev => ({
      ...prev,
      position: optimalPosition,
      isActive: true,
      currentMode: 'alert'
    }));

    // Start monitoring for help opportunities
    startPredictiveMonitoring();
  }, []);

  /**
   * Calculate optimal position for Bonsai interface
   */
  const calculateOptimalPosition = useCallback(() => {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // Position in top-right corner by default, away from typical content areas
    return {
      x: screenWidth - 120,
      y: 100
    };
  }, []);

  /**
   * Start tracking user behavior for predictive assistance
   */
  const startBehaviorTracking = useCallback(() => {
    let mouseMovements = 0;
    let keystrokes = 0;
    let scrolls = 0;
    let clicks = 0;
    let lastActivity = Date.now();

    // Mouse movement tracking
    const handleMouseMove = () => {
      mouseMovements++;
      lastActivity = Date.now();
    };

    // Keyboard tracking
    const handleKeyPress = () => {
      keystrokes++;
      lastActivity = Date.now();
    };

    // Scroll tracking
    const handleScroll = () => {
      scrolls++;
      lastActivity = Date.now();
    };

    // Click tracking
    const handleClick = () => {
      clicks++;
      lastActivity = Date.now();
    };

    // Set up event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeyPress);
    document.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClick);

    // Update behavior metrics every 10 seconds
    const behaviorInterval = setInterval(() => {
      const now = Date.now();
      const timeInactive = now - lastActivity;
      
      const pattern: BehaviorPattern = {
        userId,
        sessionId,
        timestamp: new Date(),
        mouseMovements,
        keystrokes,
        scrolls,
        clicks,
        timeOnQuestion: (now - lastInteractionTime.current) / 1000,
        timeInactive: timeInactive / 1000,
        averageResponseTime: 30, // This would be calculated from actual responses
        windowFocusChanges: 0, // Would track actual focus changes
        platformSwitches: 0,
        questionAttempts: 0, // Would track from platform
        correctAnswers: 0, // Would track from platform
        helpRequests: 0, // Track help button clicks
        frustrationLevel: 0, // Calculated by analytics
        confidenceLevel: 0.5, // Calculated by analytics
        engagementLevel: 0.5 // Calculated by analytics
      };

      behaviorAnalytics.trackBehavior(pattern);
      onBehaviorUpdate?.(pattern);

      // Reset counters
      mouseMovements = 0;
      keystrokes = 0;
      scrolls = 0;
      clicks = 0;
    }, 10000);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClick);
      clearInterval(behaviorInterval);
    };
  }, [userId, sessionId, behaviorAnalytics, onBehaviorUpdate]);

  /**
   * Start predictive monitoring for proactive assistance
   */
  const startPredictiveMonitoring = useCallback(() => {
    const monitoringInterval = setInterval(async () => {
      try {
        const prediction = await behaviorAnalytics.predictStudentNeeds(userId);
        
        if (prediction.needsHelp && prediction.confidence > 0.7) {
          await handlePredictiveIntervention(prediction);
        }
      } catch (error) {
        console.error('Predictive monitoring failed:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(monitoringInterval);
  }, [userId, behaviorAnalytics]);

  /**
   * Handle predictive intervention
   */
  const handlePredictiveIntervention = useCallback(async (prediction: PredictionResult) => {
    setBonsaiState(prev => ({
      ...prev,
      currentMode: 'alert',
      glowIntensity: 0.8
    }));

    // Animate to get attention
    scale.set(1.2);
    glow.set(0.8);
    
    setTimeout(() => {
      scale.set(1);
      glow.set(0.3);
    }, 1000);

    // Show subtle indication that help is available
    if (prediction.suggestedAction === 'offer_hint') {
      showSubtleHelpOffer();
    } else if (prediction.suggestedAction === 'provide_encouragement') {
      showEncouragement();
    } else if (prediction.suggestedAction === 'suggest_break') {
      showBreakSuggestion();
    }
  }, [scale, glow]);

  /**
   * Show subtle help offer
   */
  const showSubtleHelpOffer = useCallback(() => {
    setBonsaiState(prev => ({
      ...prev,
      currentMode: 'alert'
    }));
    
    // Add subtle pulsing animation
    const pulseAnimation = setInterval(() => {
      glow.set(0.6);
      setTimeout(() => glow.set(0.3), 500);
    }, 2000);

    setTimeout(() => {
      clearInterval(pulseAnimation);
      setBonsaiState(prev => ({ ...prev, currentMode: 'sleeping' }));
    }, 10000);
  }, [glow]);

  /**
   * Handle user interaction with Bonsai
   */
  const handleBonsaiInteraction = useCallback(async (interactionType: 'click' | 'voice' | 'gesture') => {
    try {
      setBonsaiState(prev => ({
        ...prev,
        isThinking: true,
        currentMode: 'helping'
      }));

      // Capture current context
      const context = await captureInteractionContext();
      
      // Analyze the question
      const questionAnalysis = await questionAnalyzer.analyzeQuestion({
        screenshot: context.screenshot,
        platform,
        userId,
        behaviorMetrics: context.behaviorMetrics
      });

      // Get student state
      const studentState = await questionAnalyzer.getStudentState(userId);

      // Generate optimal response
      const responseContext: ResponseContext = {
        questionAnalysis,
        studentState,
        behaviorMetrics: context.behaviorMetrics,
        requestType: interactionType === 'voice' ? 'help' : 'hint',
        urgency: context.urgencyLevel
      };

      const response = await responseOptimizer.generateOptimalResponse(responseContext);

      setBonsaiState(prev => ({
        ...prev,
        isThinking: false,
        isResponding: true
      }));

      // Display response
      setCurrentResponse(response);
      setShowResponsePanel(true);
      onResponse?.(response);

      // Update Bonsai state based on response
      updateBonsaiForResponse(response);

    } catch (error) {
      console.error('Failed to handle interaction:', error);
      setBonsaiState(prev => ({
        ...prev,
        isThinking: false,
        currentMode: 'alert'
      }));
    }
  }, [questionAnalyzer, responseOptimizer, platform, userId, onResponse]);

  /**
   * Capture current interaction context
   */
  const captureInteractionContext = useCallback(async (): Promise<InteractionContext> => {
    // This would integrate with screen capture in the desktop app
    const context: InteractionContext = {
      mousePosition: { x: 0, y: 0 }, // Would get actual mouse position
      behaviorMetrics: behaviorTracker.current,
      urgencyLevel: 'medium' // Would calculate based on behavior
    };

    return context;
  }, []);

  /**
   * Update Bonsai appearance based on response
   */
  const updateBonsaiForResponse = useCallback((response: OptimizedResponse) => {
    if (response.responseType === 'encouragement') {
      setBonsaiState(prev => ({ ...prev, currentMode: 'encouraging' }));
      glow.set(0.7);
    } else if (response.responseType === 'hint') {
      setBonsaiState(prev => ({ ...prev, currentMode: 'helping' }));
      glow.set(0.5);
    }

    // Gradually return to normal state
    setTimeout(() => {
      setBonsaiState(prev => ({ ...prev, currentMode: 'alert' }));
      glow.set(0.3);
    }, 5000);
  }, [glow]);

  /**
   * Setup voice recognition
   */
  const setupVoiceRecognition = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      speechRecognition.current = new SpeechRecognition();
      
      speechRecognition.current.continuous = true;
      speechRecognition.current.interimResults = true;
      
      speechRecognition.current.onresult = (event: any) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const transcript = lastResult[0].transcript.toLowerCase();
          if (transcript.includes('hey bonsai') || transcript.includes('bonsai help')) {
            handleBonsaiInteraction('voice');
          }
        }
      };

      setIsVoiceEnabled(true);
    }
  }, [handleBonsaiInteraction]);

  /**
   * Toggle voice listening
   */
  const toggleVoiceListening = useCallback(() => {
    if (speechRecognition.current) {
      if (bonsaiState.isListening) {
        speechRecognition.current.stop();
        setBonsaiState(prev => ({ ...prev, isListening: false }));
      } else {
        speechRecognition.current.start();
        setBonsaiState(prev => ({ ...prev, isListening: true }));
      }
    }
  }, [bonsaiState.isListening]);

  /**
   * Show encouragement
   */
  const showEncouragement = useCallback(() => {
    setBonsaiState(prev => ({ ...prev, currentMode: 'encouraging' }));
    // Would show encouraging message
  }, []);

  /**
   * Show break suggestion
   */
  const showBreakSuggestion = useCallback(() => {
    // Would show break suggestion modal
  }, []);

  /**
   * Cleanup
   */
  const cleanup = useCallback(() => {
    if (speechRecognition.current) {
      speechRecognition.current.stop();
    }
  }, []);

  /**
   * Get Bonsai color based on mode
   */
  const getBonsaiColor = useCallback(() => {
    switch (bonsaiState.currentMode) {
      case 'helping': return '#22c55e'; // Green
      case 'encouraging': return '#f59e0b'; // Amber
      case 'alert': return '#3b82f6'; // Blue
      default: return '#6b7280'; // Gray
    }
  }, [bonsaiState.currentMode]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Main Bonsai Interface */}
      <motion.div
        className="absolute pointer-events-auto cursor-pointer"
        style={{
          x,
          y,
          scale,
          left: bonsaiState.position.x,
          top: bonsaiState.position.y
        }}
        drag
        dragMomentum={false}
        onDrag={(_, info) => {
          x.set(info.point.x);
          y.set(info.point.y);
        }}
        onClick={() => handleBonsaiInteraction('click')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Bonsai Tree Visualization */}
        <div className="relative">
          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 rounded-full blur-lg"
            style={{
              backgroundColor: getBonsaiColor(),
              opacity: glow
            }}
          />
          
          {/* Main Bonsai body */}
          <div
            className="relative w-20 h-20 rounded-full flex items-center justify-center backdrop-blur-sm border-2"
            style={{
              backgroundColor: `${getBonsaiColor()}20`,
              borderColor: getBonsaiColor()
            }}
          >
            {/* Bonsai icon with state-based animation */}
            <motion.div
              animate={bonsaiState.isThinking ? { rotate: 360 } : {}}
              transition={{ duration: 2, repeat: bonsaiState.isThinking ? Infinity : 0 }}
            >
              {bonsaiState.currentMode === 'helping' && <Brain className="w-8 h-8" style={{ color: getBonsaiColor() }} />}
              {bonsaiState.currentMode === 'encouraging' && <Sparkles className="w-8 h-8" style={{ color: getBonsaiColor() }} />}
              {bonsaiState.currentMode === 'alert' && <Lightbulb className="w-8 h-8" style={{ color: getBonsaiColor() }} />}
              {bonsaiState.currentMode === 'sleeping' && <TreePine className="w-8 h-8" style={{ color: getBonsaiColor() }} />}
            </motion.div>
          </div>

          {/* Voice indicator */}
          {bonsaiState.isListening && (
            <motion.div
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Mic className="w-3 h-3 text-white" />
            </motion.div>
          )}

          {/* Quick action buttons */}
          {bonsaiState.currentMode === 'alert' && (
            <motion.div
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              {isVoiceEnabled && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVoiceListening();
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    bonsaiState.isListening ? 'bg-red-500' : 'bg-blue-500'
                  } text-white`}
                >
                  <Mic className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleBonsaiInteraction('click');
                }}
                className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Response Panel */}
      <AnimatePresence>
        {showResponsePanel && currentResponse && (
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="bg-white rounded-xl shadow-2xl border p-6 pointer-events-auto">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <TreePine className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-gray-800">Bonsai</span>
                </div>
                <button
                  onClick={() => setShowResponsePanel(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700">{currentResponse.content}</p>
                
                {currentResponse.followUpSuggestions.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-600">Would you like to:</p>
                    {currentResponse.followUpSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        className="block w-full text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700"
                        onClick={() => {
                          setUserMessage(suggestion);
                          handleBonsaiInteraction('click');
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Extend Window interface for speech recognition
declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}