'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Paperclip, Image, Smile, MoreHorizontal, ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { BonsaiContext, BonsaiInteraction } from '@/types/bonsai';
import { cn } from '@/lib/utils';

interface ChatInterfaceProps {
  chatHistory: BonsaiInteraction[];
  onSendMessage: (message: string, images?: File[]) => void;
  isThinking: boolean;
  currentContext: BonsaiContext | null;
  className?: string;
}

export function ChatInterface({
  chatHistory,
  onSendMessage,
  isThinking,
  currentContext,
  className
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  // Handle message submission
  const handleSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!message.trim() && selectedImages.length === 0) return;
    
    onSendMessage(message.trim(), selectedImages);
    setMessage('');
    setSelectedImages([]);
    setShowEmojiPicker(false);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, selectedImages, onSendMessage]);

  // Handle image upload
  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;
    
    const imageFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/') && file.size < 5 * 1024 * 1024 // 5MB limit
    );
    
    setSelectedImages(prev => [...prev, ...imageFiles]);
  };

  // Remove selected image
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Quick response suggestions based on context
  const getQuickResponses = () => {
    if (!currentContext) return [];
    
    const suggestions = {
      math: [
        "Can you help me solve this step by step?",
        "I don't understand this concept",
        "Can you explain the formula?",
        "Is there a shortcut for this?"
      ],
      reading: [
        "What's the main idea here?",
        "Can you help me find evidence?",
        "I'm confused about the author's tone",
        "What does this word mean?"
      ],
      writing: [
        "Is this grammatically correct?",
        "How can I improve this sentence?",
        "What punctuation should I use?",
        "Can you suggest better word choices?"
      ]
    };
    
    return suggestions[currentContext.questionType] || [];
  };

  const quickResponses = getQuickResponses();

  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Get assistance type color
  const getAssistanceTypeColor = (type: string) => {
    const colors = {
      hint: 'text-blue-400',
      explanation: 'text-green-400',
      spiral_question: 'text-purple-400',
      full_solution: 'text-orange-400'
    };
    return colors[type as keyof typeof colors] || 'text-gray-400';
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-webkit">
        {/* Welcome message */}
        {chatHistory.length === 0 && (
          <motion.div
            className="text-center py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/5 rounded-xl p-6 max-w-md mx-auto">
              <h3 className="text-white font-semibold mb-2">
                Welcome to Bonsai! 🌱
              </h3>
              <p className="text-white/70 text-sm">
                I'm here to help you with SAT preparation. Ask me anything about 
                {currentContext ? ` ${currentContext.questionType} questions` : ' your studies'}!
              </p>
              
              {currentContext && (
                <div className="mt-4 p-3 bg-white/5 rounded-lg">
                  <p className="text-xs text-white/60 mb-1">Current Context:</p>
                  <p className="text-sm text-white/80">
                    {currentContext.platform} • {currentContext.questionType} • {currentContext.difficulty}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Chat history */}
        <AnimatePresence>
          {chatHistory.map((interaction) => (
            <motion.div
              key={interaction.id}
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {/* User message */}
              <div className="flex justify-end">
                <div className="bg-bonsai-600 text-white rounded-2xl rounded-tr-sm px-4 py-2 max-w-[70%]">
                  <p className="text-sm">{interaction.request.text}</p>
                  {interaction.request.images && interaction.request.images.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {interaction.request.images.map((image, idx) => (
                        <div key={idx} className="text-xs bg-white/20 rounded px-2 py-1">
                          📷 {image.description || 'Image'}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-right mt-1">
                    <span className="text-xs text-white/70">
                      {formatTimestamp(interaction.timestamp)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bonsai response */}
              <div className="flex justify-start">
                <div className="bg-white/10 text-white rounded-2xl rounded-tl-sm px-4 py-2 max-w-[80%]">
                  {/* Assistance type indicator */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={cn(
                      "text-xs font-medium",
                      getAssistanceTypeColor(interaction.response.assistanceType)
                    )}>
                      {interaction.response.assistanceType.replace('_', ' ').toUpperCase()}
                    </span>
                    {interaction.response.experienceGained > 0 && (
                      <span className="text-xs bg-bonsai-500/30 text-bonsai-300 px-2 py-0.5 rounded-full">
                        +{interaction.response.experienceGained} XP
                      </span>
                    )}
                  </div>

                  {/* Response content */}
                  <div className="prose prose-sm prose-invert max-w-none">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {interaction.response.response}
                    </p>
                  </div>

                  {/* Follow-up questions */}
                  {interaction.response.followUpQuestions && interaction.response.followUpQuestions.length > 0 && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-white/60">Follow-up questions:</p>
                      {interaction.response.followUpQuestions.map((question, idx) => (
                        <button
                          key={idx}
                          onClick={() => setMessage(question)}
                          className="block text-left text-xs text-blue-300 hover:text-blue-200 hover:underline"
                        >
                          • {question}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Response metadata */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/50">
                        {formatTimestamp(interaction.timestamp)}
                      </span>
                      <span className="text-xs text-white/50">
                        {interaction.response.metadata.model}
                      </span>
                      <span className="text-xs text-white/50">
                        {interaction.response.metadata.responseTimeMs}ms
                      </span>
                    </div>

                    {/* Feedback buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        className={cn(
                          "p-1 rounded transition-colors",
                          interaction.userFeedback?.helpful === true
                            ? "text-green-400 bg-green-400/20"
                            : "text-white/40 hover:text-green-400"
                        )}
                        onClick={() => {
                          // Handle positive feedback
                        }}
                      >
                        <ThumbsUp size={12} />
                      </button>
                      <button
                        className={cn(
                          "p-1 rounded transition-colors",
                          interaction.userFeedback?.helpful === false
                            ? "text-red-400 bg-red-400/20"
                            : "text-white/40 hover:text-red-400"
                        )}
                        onClick={() => {
                          // Handle negative feedback
                        }}
                      >
                        <ThumbsDown size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Thinking indicator */}
        {isThinking && (
          <motion.div
            className="flex justify-start"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/10 text-white rounded-2xl rounded-tl-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <motion.div
                    className="w-2 h-2 bg-bonsai-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-bonsai-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-bonsai-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                  />
                </div>
                <span className="text-sm text-white/70">Bonsai is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Quick responses */}
        {quickResponses.length > 0 && chatHistory.length === 0 && (
          <motion.div
            className="space-y-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-white/60 px-2">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickResponses.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(suggestion)}
                  className="text-sm bg-white/5 hover:bg-white/10 text-white/80 px-3 py-2 rounded-full transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Image preview */}
      {selectedImages.length > 0 && (
        <div className="p-2 border-t border-white/10">
          <div className="flex flex-wrap gap-2">
            {selectedImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Upload ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message input */}
      <div className="border-t border-white/10 p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          {/* Attachment button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-white/60 hover:text-white/80 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Paperclip size={20} />
          </button>

          {/* Message input container */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask Bonsai anything about ${currentContext?.questionType || 'SAT prep'}...`}
              className={cn(
                "w-full bg-white/10 text-white placeholder-white/50",
                "border border-white/20 rounded-xl px-4 py-3 pr-12",
                "resize-none max-h-32 overflow-y-auto",
                "focus:outline-none focus:ring-2 focus:ring-bonsai-500/50",
                "scrollbar-webkit"
              )}
              rows={1}
              disabled={isThinking}
            />

            {/* Character count */}
            {message.length > 0 && (
              <div className="absolute bottom-1 right-3 text-xs text-white/40">
                {message.length}/500
              </div>
            )}
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={(!message.trim() && selectedImages.length === 0) || isThinking}
            className={cn(
              "p-3 rounded-xl transition-all",
              message.trim() || selectedImages.length > 0
                ? "bg-bonsai-600 text-white hover:bg-bonsai-700 shadow-lg"
                : "bg-white/10 text-white/40 cursor-not-allowed"
            )}
          >
            <Send size={20} />
          </button>
        </form>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleImageUpload(e.target.files)}
        />
      </div>
    </div>
  );
}

export default ChatInterface;