'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Sparkles } from 'lucide-react';

interface DemoBonsaiBubbleProps {
  className?: string;
}

export function DemoBonsaiBubble({ className }: DemoBonsaiBubbleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);

  // Hide tooltip after 5 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={className}>
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && !isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute bottom-20 right-0 mb-2 mr-2"
          >
            <div className="bonsai-glass rounded-lg p-3 max-w-xs">
              <p className="text-white text-sm">
                👋 Hi! I'm your AI SAT tutor. Click me to see how I can help!
              </p>
              <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-bonsai-500/20 border border-bonsai-500/30"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Bubble */}
      <motion.div
        className="relative"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 3 }, (_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-bonsai-400 rounded-full"
              animate={{
                y: [-10, -30, -10],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
              style={{
                left: `${30 + i * 20}%`,
                top: '10%',
              }}
            />
          ))}
        </div>

        {/* Main bubble button */}
        <motion.button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative w-16 h-16 bonsai-glass rounded-full shadow-bonsai-lg hover:shadow-bonsai-xl transition-all duration-300 group overflow-hidden"
          animate={{
            boxShadow: [
              '0 10px 25px -5px rgba(34, 197, 94, 0.25)',
              '0 10px 25px -5px rgba(34, 197, 94, 0.4)',
              '0 10px 25px -5px rgba(34, 197, 94, 0.25)',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* Background gradient animation */}
          <div className="absolute inset-0 bg-bonsai-gradient opacity-20 group-hover:opacity-30 transition-opacity" />
          
          {/* Bonsai tree icon */}
          <div className="relative flex items-center justify-center h-full">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="text-2xl"
            >
              🌱
            </motion.div>
          </div>

          {/* Ripple effect */}
          <motion.div
            className="absolute inset-0 border-2 border-bonsai-400/30 rounded-full"
            animate={{
              scale: [1, 1.5],
              opacity: [0.7, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
            }}
          />
        </motion.button>
      </motion.div>

      {/* Expanded Chat Demo */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-80 bonsai-glass rounded-xl shadow-bonsai-lg overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <div className="text-lg">🌱</div>
                <div>
                  <h3 className="text-white font-semibold">Bonsai AI</h3>
                  <p className="text-white/60 text-xs">Your SAT tutor</p>
                </div>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Demo chat content */}
            <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
              <div className="flex space-x-2">
                <div className="text-sm">🌱</div>
                <div className="bonsai-glass rounded-lg p-2 max-w-xs">
                  <p className="text-white text-sm">
                    Hello! I can help you with SAT questions in real-time. Just browse to Khan Academy or take a practice test, and I'll be here when you need me! 
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <div className="text-sm">🌱</div>
                <div className="bonsai-glass rounded-lg p-2 max-w-xs">
                  <p className="text-white text-sm">
                    Try saying "Hey Bonsai" or click me when you're stuck on a question!
                  </p>
                </div>
              </div>

              <div className="flex justify-center py-2">
                <div className="flex items-center space-x-1 text-white/40 text-xs">
                  <Sparkles size={12} />
                  <span>Install browser extension to get started</span>
                </div>
              </div>
            </div>

            {/* Demo input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Ask me anything about SAT..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 text-sm focus:outline-none focus:border-bonsai-400"
                  disabled
                />
                <button className="bg-bonsai-gradient rounded-lg px-3 py-2 disabled:opacity-50" disabled>
                  <MessageCircle size={16} className="text-white" />
                </button>
              </div>
              <p className="text-white/40 text-xs mt-2 text-center">
                Demo mode - Install extension for full functionality
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}