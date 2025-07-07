'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { VoiceConfig, VoiceInteraction, VoiceIntent } from '@/types/bonsai';
import { cn } from '@/lib/utils';

interface VoiceInterfaceProps {
  isListening: boolean;
  onStopListening: () => void;
  onTranscription: (text: string) => void;
  config: VoiceConfig;
  className?: string;
}

export function VoiceInterface({
  isListening,
  onStopListening,
  onTranscription,
  config,
  className
}: VoiceInterfaceProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for speech recognition support
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        setIsSupported(true);
        
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = config.language;
        
        // Set up event handlers
        recognition.onstart = () => {
          console.log('Voice recognition started');
        };
        
        recognition.onresult = (event) => {
          let finalTranscript = '';
          let interimTranscript = '';
          let resultConfidence = 0;
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
              resultConfidence = confidence;
              setConfidence(confidence);
            } else {
              interimTranscript += transcript;
            }
          }
          
          setTranscription(finalTranscript || interimTranscript);
          
          // Process final transcript
          if (finalTranscript && resultConfidence > config.confidenceThreshold) {
            processVoiceCommand(finalTranscript);
          }
        };
        
        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          onStopListening();
        };
        
        recognition.onend = () => {
          if (isListening) {
            // Restart recognition if still supposed to be listening
            try {
              recognition.start();
            } catch (error) {
              console.error('Error restarting recognition:', error);
              onStopListening();
            }
          }
        };
        
        recognitionRef.current = recognition;
      } else {
        console.warn('Speech recognition not supported');
      }

      // Initialize speech synthesis
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
      }

      // Initialize audio context for volume monitoring
      if ('AudioContext' in window || 'webkitAudioContext' in window) {
        try {
          const AudioContextClass = window.AudioContext || window.webkitAudioContext;
          audioContextRef.current = new AudioContextClass();
        } catch (error) {
          console.error('Error initializing audio context:', error);
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [config.language, config.confidenceThreshold, isListening, onStopListening]);

  // Start/stop listening
  useEffect(() => {
    if (!isSupported || !recognitionRef.current) return;

    if (isListening) {
      try {
        recognitionRef.current.start();
        setupVolumeMonitoring();
      } catch (error) {
        console.error('Error starting recognition:', error);
        onStopListening();
      }
    } else {
      recognitionRef.current.stop();
      cleanupVolumeMonitoring();
      setTranscription('');
      setConfidence(0);
      setVolume(0);
    }
  }, [isListening, isSupported, onStopListening]);

  // Set up microphone volume monitoring
  const setupVolumeMonitoring = async () => {
    if (!audioContextRef.current) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          noiseSuppression: config.noiseReduction,
          echoCancellation: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      const audioContext = audioContextRef.current;
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      analyserRef.current = analyser;
      microphoneRef.current = microphone;
      
      // Start volume monitoring
      monitorVolume();
    } catch (error) {
      console.error('Error setting up microphone:', error);
    }
  };

  // Monitor microphone volume
  const monitorVolume = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateVolume = () => {
      if (!isListening) return;

      analyser.getByteFrequencyData(dataArray);
      
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
      const normalizedVolume = Math.min(average / 128, 1);
      
      setVolume(normalizedVolume);
      
      requestAnimationFrame(updateVolume);
    };

    updateVolume();
  };

  // Cleanup volume monitoring
  const cleanupVolumeMonitoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    analyserRef.current = null;
  };

  // Process voice commands
  const processVoiceCommand = useCallback((text: string) => {
    const lowerText = text.toLowerCase();
    
    // Check for wake word
    if (lowerText.includes(config.wakeWord.toLowerCase())) {
      const commandText = lowerText.replace(config.wakeWord.toLowerCase(), '').trim();
      if (commandText) {
        onTranscription(commandText);
      }
    } else if (isListening) {
      // If actively listening, process any speech
      onTranscription(text);
    }
  }, [config.wakeWord, isListening, onTranscription]);

  // Text-to-speech for responses
  const speak = useCallback((text: string) => {
    if (!synthRef.current || !config.voiceEnabled) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = config.language;
    utterance.volume = 0.8;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synthRef.current.speak(utterance);
  }, [config.voiceEnabled, config.language]);

  // Detect voice intent
  const detectIntent = (text: string): VoiceIntent => {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('help') || lowerText.includes('stuck')) {
      return 'help_request';
    } else if (lowerText.includes('hint') || lowerText.includes('clue')) {
      return 'hint_request';
    } else if (lowerText.includes('explain') || lowerText.includes('how')) {
      return 'explanation_request';
    } else if (lowerText.includes('what') || lowerText.includes('clarify')) {
      return 'question_clarification';
    } else if (lowerText.includes('progress') || lowerText.includes('score')) {
      return 'progress_check';
    } else if (lowerText.includes('chat') || lowerText.includes('talk')) {
      return 'bonsai_chat';
    }
    
    return 'unknown';
  };

  if (!isSupported) {
    return null;
  }

  return (
    <AnimatePresence>
      {isListening && (
        <motion.div
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center",
            "bg-black/50 backdrop-blur-sm",
            className
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onStopListening}
        >
          <motion.div
            className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 max-w-md mx-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Microphone visualization */}
            <div className="flex flex-col items-center space-y-6">
              {/* Animated microphone icon */}
              <div className="relative">
                <motion.div
                  className={cn(
                    "w-20 h-20 rounded-full flex items-center justify-center",
                    "bg-gradient-to-br from-red-500 to-red-600",
                    "shadow-lg shadow-red-500/25"
                  )}
                  animate={{
                    scale: [1, 1 + volume * 0.3, 1],
                    boxShadow: [
                      "0 10px 25px rgba(239, 68, 68, 0.25)",
                      `0 10px 25px rgba(239, 68, 68, ${0.25 + volume * 0.5})`,
                      "0 10px 25px rgba(239, 68, 68, 0.25)"
                    ]
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <Mic size={32} className="text-white" />
                </motion.div>

                {/* Volume rings */}
                {volume > 0.1 && (
                  <>
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-red-400/30"
                      animate={{
                        scale: [1, 1.5],
                        opacity: [0.6, 0]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeOut"
                      }}
                    />
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-red-400/20"
                      animate={{
                        scale: [1, 2],
                        opacity: [0.4, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: 0.3
                      }}
                    />
                  </>
                )}
              </div>

              {/* Status text */}
              <div className="text-center">
                <h3 className="text-white font-semibold mb-2">
                  {transcription ? 'Processing...' : `Say "${config.wakeWord}" to start`}
                </h3>
                
                {transcription && (
                  <motion.div
                    className="bg-white/10 rounded-lg p-3 mb-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <p className="text-white text-sm">"{transcription}"</p>
                    {confidence > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs text-white/60">
                          <span>Confidence</span>
                          <span>{Math.round(confidence * 100)}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-1 mt-1">
                          <motion.div
                            className="bg-green-400 h-1 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${confidence * 100}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                <p className="text-white/60 text-sm">
                  Tap anywhere to stop listening
                </p>
              </div>

              {/* Volume indicator */}
              <div className="flex items-center space-x-2">
                <Volume2 size={16} className="text-white/60" />
                <div className="flex space-x-1">
                  {Array.from({ length: 10 }, (_, i) => (
                    <motion.div
                      key={i}
                      className={cn(
                        "w-1 h-4 rounded-full",
                        volume * 10 > i ? "bg-green-400" : "bg-white/20"
                      )}
                      animate={{
                        height: volume * 10 > i ? [16, 24, 16] : 16
                      }}
                      transition={{ duration: 0.2 }}
                    />
                  ))}
                </div>
              </div>

              {/* Stop button */}
              <button
                onClick={onStopListening}
                className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              >
                Stop Listening
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Speaking indicator */}
      <AnimatePresence>
        {isSpeaking && (
          <motion.div
            className="fixed bottom-4 right-4 z-40"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <div className="bg-blue-600 text-white rounded-full p-3 shadow-lg">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Volume2 size={20} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatePresence>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
    AudioContext: typeof AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

export default VoiceInterface;