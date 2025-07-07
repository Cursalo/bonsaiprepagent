'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, MessageCircle, X, Minimize2, Maximize2, Settings } from 'lucide-react';
import { BonsaiContext, BonsaiResponse, BonsaiState, VoiceConfig } from '@/types/bonsai';
import { SATContextAnalyzer } from '@/lib/glass/context-awareness';
import { BonsaiAIProvider } from '@/lib/ai/bonsai-provider';
import { BonsaiTree } from './BonsaiTree';
import { ChatInterface } from './ChatInterface';
import { VoiceInterface } from './VoiceInterface';
import { cn } from '@/lib/utils';

interface BonsaiBubbleProps {
  userId: string;
  bonsaiState: BonsaiState;
  onStateChange: (state: BonsaiState) => void;
  className?: string;
}

export function BonsaiBubble({ 
  userId, 
  bonsaiState, 
  onStateChange, 
  className 
}: BonsaiBubbleProps) {
  // State management
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentContext, setCurrentContext] = useState<BonsaiContext | null>(null);
  const [position, setPosition] = useState({ x: window.innerWidth - 120, y: window.innerHeight - 120 });
  const [isDragging, setIsDragging] = useState(false);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  // Refs
  const bubbleRef = useRef<HTMLDivElement>(null);
  const contextAnalyzer = useRef<SATContextAnalyzer | null>(null);
  const aiProvider = useRef<BonsaiAIProvider | null>(null);
  const dragStart = useRef({ x: 0, y: 0 });

  // Voice configuration
  const [voiceConfig] = useState<VoiceConfig>({
    wakeWord: 'hey bonsai',
    language: 'en-US',
    voiceEnabled: true,
    noiseReduction: true,
    confidenceThreshold: 0.7
  });

  // Initialize Glass-inspired context awareness
  useEffect(() => {
    contextAnalyzer.current = new SATContextAnalyzer(handleContextChange);
    aiProvider.current = new BonsaiAIProvider();
    
    contextAnalyzer.current.startContextAnalysis();

    // Listen for bonsai activation events
    const handleBonsaiActivation = (event: CustomEvent) => {
      if (!isExpanded) {
        setIsExpanded(true);
        setCurrentContext(event.detail.context);
      }
    };

    document.addEventListener('bonsai:activate', handleBonsaiActivation as EventListener);

    return () => {
      contextAnalyzer.current?.stopContextAnalysis();
      document.removeEventListener('bonsai:activate', handleBonsaiActivation as EventListener);
    };
  }, []);

  // Handle context changes from Glass-inspired analyzer
  const handleContextChange = useCallback((context: BonsaiContext) => {
    setCurrentContext(context);
    
    // Auto-expand if new question detected and not already expanded
    if (context.questionText && !isExpanded) {
      // Gentle notification rather than forced expansion
      animatePulse();
    }
  }, [isExpanded]);

  // Pulse animation for notifications
  const animatePulse = () => {
    if (bubbleRef.current) {
      bubbleRef.current.classList.add('animate-bonsai-pulse');
      setTimeout(() => {
        bubbleRef.current?.classList.remove('animate-bonsai-pulse');
      }, 2000);
    }
  };

  // Handle AI interactions
  const handleUserMessage = async (message: string, images?: File[]) => {
    if (!currentContext || !aiProvider.current) return;

    setIsThinking(true);
    
    try {
      // Convert images to base64 if present
      const imageData = await Promise.all(
        (images || []).map(async (file) => ({
          base64: await fileToBase64(file),
          mimeType: file.type,
          description: file.name
        }))
      );

      const request = {
        text: message,
        images: imageData,
        context: currentContext,
        previousInteractions: chatHistory.slice(-3) // Last 3 for context
      };

      const response = await aiProvider.current.getBonsaiResponse(request);
      
      // Update chat history
      const newInteraction = {
        id: Date.now().toString(),
        timestamp: new Date(),
        request,
        response,
        userFeedback: null
      };

      setChatHistory(prev => [...prev, newInteraction]);
      
      // Update Bonsai state with experience gained
      onStateChange({
        ...bonsaiState,
        experience: bonsaiState.experience + response.experienceGained,
        totalExperience: bonsaiState.totalExperience + response.experienceGained
      });

      // Check for level up
      if (response.levelUp) {
        handleLevelUp();
      }

    } catch (error) {
      console.error('Bonsai AI Error:', error);
      // Add error message to chat
      setChatHistory(prev => [...prev, {
        id: Date.now().toString(),
        timestamp: new Date(),
        request: { text: message, context: currentContext },
        response: {
          response: "I'm having trouble connecting right now. Please try again in a moment.",
          assistanceType: 'explanation',
          experienceGained: 0,
          levelUp: false,
          usageCount: 0,
          remainingUsage: -1,
          metadata: {
            aiProvider: 'none',
            model: 'error',
            responseTimeMs: 0,
            tokensUsed: 0,
            confidence: 0
          }
        }
      }]);
    } finally {
      setIsThinking(false);
    }
  };

  // Handle level up animation
  const handleLevelUp = () => {
    // Trigger level up animation
    if (bubbleRef.current) {
      bubbleRef.current.classList.add('animate-bonsai-grow');
      setTimeout(() => {
        bubbleRef.current?.classList.remove('animate-bonsai-grow');
      }, 1000);
    }
  };

  // Voice interaction handlers
  const toggleVoiceListening = () => {
    setIsListening(!isListening);
  };

  // Drag functionality for Glass-like floating behavior
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isExpanded) return; // Don't drag when expanded
    
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.current.x;
    const newY = e.clientY - dragStart.current.y;

    // Keep within screen bounds
    const maxX = window.innerWidth - 80;
    const maxY = window.innerHeight - 80;

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY))
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Utility function
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove data:type;base64, prefix
      };
      reader.onerror = error => reject(error);
    });
  };

  // Main render
  return (
    <>
      {/* Glass-inspired floating bubble */}
      <motion.div
        ref={bubbleRef}
        className={cn(
          "fixed z-100 select-none",
          isExpanded ? "inset-4" : "w-20 h-20",
          className
        )}
        style={!isExpanded ? { left: position.x, top: position.y } : {}}
        initial={false}
        animate={isExpanded ? {
          width: "calc(100vw - 2rem)",
          height: "calc(100vh - 2rem)",
          x: 0,
          y: 0
        } : {
          width: 80,
          height: 80,
          x: 0,
          y: 0
        }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {!isExpanded ? (
          // Collapsed bubble state
          <motion.div
            className={cn(
              "w-full h-full rounded-full cursor-pointer",
              "bonsai-glass shadow-bonsai",
              "flex items-center justify-center",
              "hover:scale-105 transition-transform duration-200",
              isDragging && "cursor-grabbing"
            )}
            onMouseDown={handleMouseDown}
            onClick={() => !isDragging && setIsExpanded(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BonsaiTree 
              state={bonsaiState} 
              size="small"
              animated={true}
            />
          </motion.div>
        ) : (
          // Expanded interface state
          <motion.div
            className={cn(
              "w-full h-full rounded-2xl",
              "bonsai-glass border border-bonsai-300/20",
              "flex flex-col overflow-hidden",
              "shadow-bonsai-lg backdrop-blur-xl"
            )}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <BonsaiTree 
                  state={bonsaiState} 
                  size="small"
                  animated={true}
                />
                <div>
                  <h3 className="text-white font-semibold">Bonsai</h3>
                  <p className="text-white/70 text-sm">
                    Level {bonsaiState.level} • {bonsaiState.growthStage.replace('_', ' ')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Voice toggle */}
                <button
                  onClick={toggleVoiceListening}
                  className={cn(
                    "p-2 rounded-lg transition-colors",
                    isListening 
                      ? "bg-red-500 text-white" 
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  )}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                {/* Minimize */}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                >
                  <Minimize2 size={18} />
                </button>

                {/* Close */}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-2 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Main content */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  className="flex-1 flex"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  {/* Chat interface */}
                  <div className="flex-1 flex flex-col">
                    <ChatInterface
                      chatHistory={chatHistory}
                      onSendMessage={handleUserMessage}
                      isThinking={isThinking}
                      currentContext={currentContext}
                    />
                  </div>

                  {/* Bonsai visualization sidebar */}
                  <div className="w-80 border-l border-white/10 p-4">
                    <div className="h-full flex flex-col">
                      {/* Large Bonsai tree */}
                      <div className="flex-1 flex items-center justify-center">
                        <BonsaiTree 
                          state={bonsaiState} 
                          size="large"
                          animated={true}
                          interactive={true}
                        />
                      </div>

                      {/* Progress info */}
                      <div className="space-y-3 pt-4 border-t border-white/10">
                        <div>
                          <div className="flex justify-between text-sm text-white/70 mb-1">
                            <span>Experience</span>
                            <span>{bonsaiState.experience}/{bonsaiState.experienceToNext}</span>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <motion.div
                              className="bg-bonsai-400 h-2 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ 
                                width: `${(bonsaiState.experience / bonsaiState.experienceToNext) * 100}%` 
                              }}
                              transition={{ duration: 0.5 }}
                            />
                          </div>
                        </div>

                        {currentContext && (
                          <div className="text-sm text-white/70">
                            <p>Context: {currentContext.platform}</p>
                            <p>Subject: {currentContext.questionType}</p>
                            <p>Difficulty: {currentContext.difficulty}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>

      {/* Voice interface overlay */}
      <VoiceInterface
        isListening={isListening}
        onStopListening={() => setIsListening(false)}
        onTranscription={handleUserMessage}
        config={voiceConfig}
      />
    </>
  );
}

export default BonsaiBubble;