// Main content script for injecting Bonsai bubble into SAT platforms

import { BUBBLE_CONFIG, MESSAGE_TYPES, STORAGE_KEYS } from '../lib/constants.js';
import { DOM, Storage, Animation, Position, Messaging, ErrorHandler } from '../lib/utils.js';
import contextDetector from '../lib/context-detector.js';
import apiClient from '../lib/api-client.js';

class BonsaiBubbleInjector {
  constructor() {
    this.bubble = null;
    this.chatWindow = null;
    this.isVisible = false;
    this.isExpanded = false;
    this.isDragging = false;
    this.currentPosition = null;
    this.userSettings = null;
    this.subscriptionStatus = null;
    
    // Event handlers
    this.handleMessage = this.handleMessage.bind(this);
    this.handleContextChange = this.handleContextChange.bind(this);
  }

  /**
   * Initialize the bubble injector
   */
  async initialize() {
    try {
      console.log('Bonsai: Initializing bubble injector');
      
      // Load user settings
      await this.loadUserSettings();
      
      // Load subscription status
      await this.loadSubscriptionStatus();
      
      // Set up message listeners
      Messaging.onMessage(this.handleMessage);
      
      // Listen for context changes
      contextDetector.onContextChange(this.handleContextChange);
      
      // Create bubble
      await this.createBubble();
      
      // Auto-show if question detected and user has feature access
      const context = contextDetector.getCurrentContext();
      if (context && context.question && this.hasFeatureAccess('auto_detect')) {
        this.showBubble();
      }
      
      console.log('Bonsai: Bubble injector initialized successfully');
    } catch (error) {
      await ErrorHandler.handleError(error, 'bubble_injector_init');
    }
  }

  /**
   * Load user settings from storage
   */
  async loadUserSettings() {
    try {
      this.userSettings = await Storage.get(STORAGE_KEYS.USER_SETTINGS) || {
        autoShow: true,
        position: BUBBLE_CONFIG.defaultPosition,
        animations: true,
        quickHelp: true,
        voiceCommands: false
      };
      
      this.currentPosition = this.userSettings.position || BUBBLE_CONFIG.defaultPosition;
    } catch (error) {
      console.warn('Failed to load user settings:', error);
      this.userSettings = {};
      this.currentPosition = BUBBLE_CONFIG.defaultPosition;
    }
  }

  /**
   * Load subscription status
   */
  async loadSubscriptionStatus() {
    try {
      this.subscriptionStatus = await apiClient.getSubscriptionStatus();
    } catch (error) {
      console.warn('Failed to load subscription status:', error);
      this.subscriptionStatus = { tier: 'free', features: {} };
    }
  }

  /**
   * Check if user has access to a feature
   */
  hasFeatureAccess(feature) {
    if (!this.subscriptionStatus) return false;
    return this.subscriptionStatus.features[feature]?.enabled || false;
  }

  /**
   * Create the Bonsai bubble
   */
  async createBubble() {
    if (this.bubble) return;

    // Main bubble container
    this.bubble = DOM.createElement('div', {
      id: 'bonsai-bubble',
      className: 'bonsai-bubble-container',
      style: {
        position: 'fixed',
        ...this.currentPosition,
        width: `${BUBBLE_CONFIG.size.width}px`,
        height: `${BUBBLE_CONFIG.size.height}px`,
        zIndex: BUBBLE_CONFIG.zIndex,
        cursor: 'pointer',
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${BUBBLE_CONFIG.colors.primary}, ${BUBBLE_CONFIG.colors.secondary})`,
        boxShadow: '0 8px 32px rgba(34, 197, 94, 0.3)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        opacity: '0',
        transform: 'scale(0.8)'
      }
    });

    // Bonsai icon/avatar
    const avatar = DOM.createElement('div', {
      className: 'bonsai-avatar',
      style: {
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'rgba(255, 255, 255, 0.9)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: BUBBLE_CONFIG.colors.primary
      }
    }, ['🌱']);

    this.bubble.appendChild(avatar);

    // Status indicator
    const statusIndicator = DOM.createElement('div', {
      className: 'bonsai-status-indicator',
      style: {
        position: 'absolute',
        top: '5px',
        right: '5px',
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        background: '#10b981',
        border: '2px solid white',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
      }
    });

    this.bubble.appendChild(statusIndicator);

    // Pulse animation for attention
    if (this.userSettings.animations) {
      const pulseRing = DOM.createElement('div', {
        className: 'bonsai-pulse-ring',
        style: {
          position: 'absolute',
          top: '-10px',
          left: '-10px',
          right: '-10px',
          bottom: '-10px',
          borderRadius: '50%',
          border: `2px solid ${BUBBLE_CONFIG.colors.primary}`,
          opacity: '0',
          animation: 'bonsai-pulse 2s infinite'
        }
      });

      this.bubble.appendChild(pulseRing);
    }

    // Event listeners
    this.bubble.addEventListener('click', this.handleBubbleClick.bind(this));
    this.bubble.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.bubble.addEventListener('mouseenter', this.handleMouseEnter.bind(this));
    this.bubble.addEventListener('mouseleave', this.handleMouseLeave.bind(this));

    // Add to page
    document.body.appendChild(this.bubble);

    // Create chat window (initially hidden)
    await this.createChatWindow();
  }

  /**
   * Create the chat window
   */
  async createChatWindow() {
    this.chatWindow = DOM.createElement('div', {
      id: 'bonsai-chat-window',
      className: 'bonsai-chat-window',
      style: {
        position: 'fixed',
        width: `${BUBBLE_CONFIG.expandedSize.width}px`,
        height: `${BUBBLE_CONFIG.expandedSize.height}px`,
        zIndex: BUBBLE_CONFIG.zIndex + 1,
        borderRadius: '16px',
        background: BUBBLE_CONFIG.colors.background,
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        display: 'none',
        flexDirection: 'column',
        overflow: 'hidden'
      }
    });

    // Header
    const header = DOM.createElement('div', {
      className: 'chat-header',
      style: {
        padding: '16px 20px',
        background: `linear-gradient(135deg, ${BUBBLE_CONFIG.colors.primary}, ${BUBBLE_CONFIG.colors.secondary})`,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    });

    const title = DOM.createElement('div', {
      style: {
        fontWeight: '600',
        fontSize: '16px'
      }
    }, ['Bonsai SAT Assistant']);

    const controls = DOM.createElement('div', {
      style: {
        display: 'flex',
        gap: '8px'
      }
    });

    const minimizeBtn = DOM.createElement('button', {
      className: 'chat-control-btn',
      style: {
        background: 'rgba(255, 255, 255, 0.2)',
        border: 'none',
        borderRadius: '4px',
        color: 'white',
        cursor: 'pointer',
        padding: '4px 8px',
        fontSize: '12px'
      }
    }, ['−']);

    const closeBtn = DOM.createElement('button', {
      className: 'chat-control-btn',
      style: {
        background: 'rgba(255, 255, 255, 0.2)',
        border: 'none',
        borderRadius: '4px',
        color: 'white',
        cursor: 'pointer',
        padding: '4px 8px',
        fontSize: '12px'
      }
    }, ['×']);

    controls.appendChild(minimizeBtn);
    controls.appendChild(closeBtn);
    header.appendChild(title);
    header.appendChild(controls);

    // Messages container
    const messagesContainer = DOM.createElement('div', {
      className: 'chat-messages',
      style: {
        flex: '1',
        padding: '20px',
        overflowY: 'auto',
        background: 'rgba(255, 255, 255, 0.5)'
      }
    });

    // Input area
    const inputArea = DOM.createElement('div', {
      className: 'chat-input-area',
      style: {
        padding: '16px 20px',
        background: 'rgba(255, 255, 255, 0.8)',
        borderTop: '1px solid rgba(0, 0, 0, 0.1)',
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }
    });

    const messageInput = DOM.createElement('input', {
      type: 'text',
      placeholder: 'Ask about this question...',
      style: {
        flex: '1',
        padding: '12px 16px',
        border: '1px solid rgba(0, 0, 0, 0.2)',
        borderRadius: '24px',
        fontSize: '14px',
        outline: 'none',
        background: 'white'
      }
    });

    const sendBtn = DOM.createElement('button', {
      style: {
        padding: '12px 20px',
        background: BUBBLE_CONFIG.colors.primary,
        color: 'white',
        border: 'none',
        borderRadius: '24px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500'
      }
    }, ['Send']);

    inputArea.appendChild(messageInput);
    inputArea.appendChild(sendBtn);

    this.chatWindow.appendChild(header);
    this.chatWindow.appendChild(messagesContainer);
    this.chatWindow.appendChild(inputArea);

    // Event listeners
    minimizeBtn.addEventListener('click', this.minimizeChatWindow.bind(this));
    closeBtn.addEventListener('click', this.closeChatWindow.bind(this));
    sendBtn.addEventListener('click', () => this.sendMessage(messageInput.value));
    messageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage(messageInput.value);
      }
    });

    // Add to page
    document.body.appendChild(this.chatWindow);

    // Position chat window relative to bubble
    this.positionChatWindow();
  }

  /**
   * Handle message from background script
   */
  handleMessage(message, sender) {
    switch (message.type) {
      case MESSAGE_TYPES.TOGGLE_BUBBLE:
        this.toggleBubble();
        break;
        
      case MESSAGE_TYPES.BUBBLE_RESPONSE:
        this.handleBubbleResponse(message.data);
        break;
        
      case MESSAGE_TYPES.AUTH_STATUS:
        this.handleAuthStatus(message.status);
        break;
        
      default:
        console.log('Unhandled message:', message);
    }
  }

  /**
   * Handle context changes
   */
  handleContextChange(context) {
    if (!this.bubble) return;

    // Update bubble appearance based on context
    if (context.question) {
      this.updateBubbleStatus('question-detected');
      
      // Auto-show if enabled and user has access
      if (this.userSettings.autoShow && this.hasFeatureAccess('auto_detect')) {
        this.showBubble();
      }
    } else {
      this.updateBubbleStatus('listening');
    }
  }

  /**
   * Update bubble status indicator
   */
  updateBubbleStatus(status) {
    const indicator = this.bubble.querySelector('.bonsai-status-indicator');
    if (!indicator) return;

    const colors = {
      'listening': '#6b7280',
      'question-detected': '#10b981',
      'thinking': '#f59e0b',
      'responding': '#3b82f6',
      'error': '#ef4444'
    };

    indicator.style.background = colors[status] || colors.listening;
  }

  /**
   * Show the bubble
   */
  showBubble() {
    if (!this.bubble || this.isVisible) return;

    this.isVisible = true;
    
    if (this.userSettings.animations) {
      Animation.fadeIn(this.bubble);
      setTimeout(() => {
        this.bubble.style.transform = 'scale(1)';
      }, 100);
    } else {
      this.bubble.style.opacity = '1';
      this.bubble.style.transform = 'scale(1)';
    }

    // Track usage
    apiClient.trackUsage('bubble_shown', {
      trigger: 'auto_detect',
      platform: contextDetector.platform?.name
    });
  }

  /**
   * Hide the bubble
   */
  hideBubble() {
    if (!this.bubble || !this.isVisible) return;

    this.isVisible = false;
    
    if (this.userSettings.animations) {
      this.bubble.style.transform = 'scale(0.8)';
      setTimeout(() => {
        this.bubble.style.opacity = '0';
      }, 100);
    } else {
      this.bubble.style.opacity = '0';
    }
  }

  /**
   * Toggle bubble visibility
   */
  toggleBubble() {
    if (this.isVisible) {
      this.hideBubble();
    } else {
      this.showBubble();
    }
  }

  /**
   * Handle bubble click
   */
  handleBubbleClick(event) {
    if (this.isDragging) return;

    event.preventDefault();
    event.stopPropagation();

    if (this.isExpanded) {
      this.closeChatWindow();
    } else {
      this.expandToChatWindow();
    }
  }

  /**
   * Handle mouse down for dragging
   */
  handleMouseDown(event) {
    if (event.button !== 0) return; // Only left click

    this.isDragging = false;
    const startX = event.clientX;
    const startY = event.clientY;
    const bubbleRect = this.bubble.getBoundingClientRect();

    const handleMouseMove = (e) => {
      const deltaX = Math.abs(e.clientX - startX);
      const deltaY = Math.abs(e.clientY - startY);
      
      if (deltaX > 5 || deltaY > 5) {
        this.isDragging = true;
        
        // Calculate new position
        const newX = e.clientX - (bubbleRect.width / 2);
        const newY = e.clientY - (bubbleRect.height / 2);
        
        // Keep within viewport
        const maxX = window.innerWidth - bubbleRect.width;
        const maxY = window.innerHeight - bubbleRect.height;
        
        const constrainedX = Math.max(0, Math.min(newX, maxX));
        const constrainedY = Math.max(0, Math.min(newY, maxY));
        
        this.bubble.style.left = `${constrainedX}px`;
        this.bubble.style.top = `${constrainedY}px`;
        this.bubble.style.right = 'auto';
        this.bubble.style.bottom = 'auto';
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (this.isDragging) {
        // Save new position
        const rect = this.bubble.getBoundingClientRect();
        this.currentPosition = {
          left: rect.left,
          top: rect.top
        };
        
        this.userSettings.position = this.currentPosition;
        Storage.set(STORAGE_KEYS.USER_SETTINGS, this.userSettings);
        
        // Reset dragging after a short delay
        setTimeout(() => {
          this.isDragging = false;
        }, 100);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  /**
   * Handle mouse enter
   */
  handleMouseEnter() {
    if (this.userSettings.animations) {
      this.bubble.style.transform = 'scale(1.1)';
      this.bubble.style.boxShadow = '0 12px 40px rgba(34, 197, 94, 0.4)';
    }
  }

  /**
   * Handle mouse leave
   */
  handleMouseLeave() {
    if (this.userSettings.animations) {
      this.bubble.style.transform = 'scale(1)';
      this.bubble.style.boxShadow = '0 8px 32px rgba(34, 197, 94, 0.3)';
    }
  }

  /**
   * Expand bubble to chat window
   */
  expandToChatWindow() {
    if (this.isExpanded) return;

    // Check feature access
    if (!this.hasFeatureAccess('ai_chat')) {
      this.showUpgradePrompt('AI Chat');
      return;
    }

    this.isExpanded = true;
    this.chatWindow.style.display = 'flex';
    this.positionChatWindow();

    if (this.userSettings.animations) {
      Animation.fadeIn(this.chatWindow);
      Animation.slideIn(this.chatWindow, 'right');
    }

    // Initialize chat with current context
    this.initializeChatWithContext();

    // Track usage
    apiClient.trackUsage('chat_opened', {
      platform: contextDetector.platform?.name
    });
  }

  /**
   * Position chat window
   */
  positionChatWindow() {
    if (!this.chatWindow || !this.bubble) return;

    const bubbleRect = this.bubble.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const chatWidth = BUBBLE_CONFIG.expandedSize.width;
    const chatHeight = BUBBLE_CONFIG.expandedSize.height;

    let left = bubbleRect.right + 20;
    let top = bubbleRect.top;

    // Adjust if chat window goes off-screen
    if (left + chatWidth > windowWidth) {
      left = bubbleRect.left - chatWidth - 20;
    }

    if (top + chatHeight > windowHeight) {
      top = windowHeight - chatHeight - 20;
    }

    if (top < 20) {
      top = 20;
    }

    this.chatWindow.style.left = `${left}px`;
    this.chatWindow.style.top = `${top}px`;
  }

  /**
   * Initialize chat with current context
   */
  async initializeChatWithContext() {
    const context = contextDetector.getCurrentContext();
    const messagesContainer = this.chatWindow.querySelector('.chat-messages');
    
    if (!context || !context.question) {
      this.addChatMessage('assistant', 'Hi! I\'m your Bonsai SAT assistant. I can help you understand questions and concepts. What would you like to know?');
      return;
    }

    // Show context-aware greeting
    const subject = context.subject || 'SAT';
    const greeting = `I can see you're working on a ${subject} question. Would you like me to help explain it or provide a hint?`;
    
    this.addChatMessage('assistant', greeting);

    // Add quick action buttons
    this.addQuickActions(context);
  }

  /**
   * Add quick action buttons
   */
  addQuickActions(context) {
    const messagesContainer = this.chatWindow.querySelector('.chat-messages');
    
    const actionsContainer = DOM.createElement('div', {
      className: 'quick-actions',
      style: {
        display: 'flex',
        gap: '8px',
        marginTop: '12px',
        flexWrap: 'wrap'
      }
    });

    const actions = [
      { text: 'Explain this question', action: 'explain' },
      { text: 'Give me a hint', action: 'hint' },
      { text: 'Show similar examples', action: 'examples' }
    ];

    actions.forEach(({ text, action }) => {
      const button = DOM.createElement('button', {
        style: {
          padding: '8px 16px',
          background: 'rgba(34, 197, 94, 0.1)',
          color: BUBBLE_CONFIG.colors.primary,
          border: `1px solid ${BUBBLE_CONFIG.colors.primary}`,
          borderRadius: '16px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '500'
        }
      }, [text]);

      button.addEventListener('click', () => {
        this.handleQuickAction(action, context);
      });

      actionsContainer.appendChild(button);
    });

    messagesContainer.appendChild(actionsContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Handle quick action
   */
  async handleQuickAction(action, context) {
    this.updateBubbleStatus('thinking');
    
    try {
      let response;
      
      switch (action) {
        case 'explain':
          response = await apiClient.sendChatMessage(
            `Please explain this ${context.subject} question in detail: ${context.question}`,
            { assistanceType: 'explanation', ...context }
          );
          break;
          
        case 'hint':
          response = await apiClient.getQuickHint(context);
          break;
          
        case 'examples':
          response = await apiClient.sendChatMessage(
            `Can you show me similar examples to this ${context.subject} question?`,
            { assistanceType: 'examples', ...context }
          );
          break;
      }

      if (response && response.message) {
        this.addChatMessage('assistant', response.message);
      }
      
      this.updateBubbleStatus('question-detected');
    } catch (error) {
      this.addChatMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      this.updateBubbleStatus('error');
      await ErrorHandler.handleError(error, 'quick_action');
    }
  }

  /**
   * Send chat message
   */
  async sendMessage(text) {
    if (!text.trim()) return;

    const messageInput = this.chatWindow.querySelector('input[type="text"]');
    messageInput.value = '';

    // Add user message
    this.addChatMessage('user', text);
    
    // Update status
    this.updateBubbleStatus('thinking');

    try {
      const context = contextDetector.getCurrentContext();
      const response = await apiClient.sendChatMessage(text, context);
      
      if (response && response.message) {
        this.addChatMessage('assistant', response.message);
        
        // Update Bonsai progress if applicable
        if (response.experienceGained) {
          await apiClient.updateBonsaiProgress({
            experience: response.experienceGained,
            action: 'ai_interaction',
            subject: context?.subject
          });
        }
      }
      
      this.updateBubbleStatus('question-detected');
    } catch (error) {
      this.addChatMessage('assistant', 'Sorry, I encountered an error. Please try again.');
      this.updateBubbleStatus('error');
      await ErrorHandler.handleError(error, 'send_message');
    }
  }

  /**
   * Add message to chat
   */
  addChatMessage(sender, text) {
    const messagesContainer = this.chatWindow.querySelector('.chat-messages');
    
    const messageDiv = DOM.createElement('div', {
      className: `chat-message chat-message-${sender}`,
      style: {
        marginBottom: '16px',
        display: 'flex',
        justifyContent: sender === 'user' ? 'flex-end' : 'flex-start'
      }
    });

    const messageBubble = DOM.createElement('div', {
      style: {
        maxWidth: '80%',
        padding: '12px 16px',
        borderRadius: '16px',
        fontSize: '14px',
        lineHeight: '1.4',
        ...(sender === 'user' ? {
          background: BUBBLE_CONFIG.colors.primary,
          color: 'white',
          borderBottomRightRadius: '4px'
        } : {
          background: 'rgba(255, 255, 255, 0.9)',
          color: '#374151',
          borderBottomLeftRadius: '4px',
          border: '1px solid rgba(0, 0, 0, 0.1)'
        })
      }
    }, [text]);

    messageDiv.appendChild(messageBubble);
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Minimize chat window
   */
  minimizeChatWindow() {
    this.isExpanded = false;
    
    if (this.userSettings.animations) {
      Animation.fadeOut(this.chatWindow);
    } else {
      this.chatWindow.style.display = 'none';
    }
  }

  /**
   * Close chat window
   */
  closeChatWindow() {
    this.isExpanded = false;
    
    if (this.userSettings.animations) {
      Animation.fadeOut(this.chatWindow);
    } else {
      this.chatWindow.style.display = 'none';
    }
    
    // Clear messages for next session
    const messagesContainer = this.chatWindow.querySelector('.chat-messages');
    messagesContainer.innerHTML = '';
  }

  /**
   * Show upgrade prompt for premium features
   */
  showUpgradePrompt(feature) {
    this.addChatMessage('assistant', 
      `${feature} is available with Bonsai Pro! Upgrade to unlock unlimited AI interactions, advanced explanations, and more features.`
    );
    
    // Add upgrade button
    const messagesContainer = this.chatWindow.querySelector('.chat-messages');
    const upgradeBtn = DOM.createElement('button', {
      style: {
        padding: '12px 24px',
        background: BUBBLE_CONFIG.colors.primary,
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
        marginTop: '12px'
      }
    }, ['Upgrade to Pro']);

    upgradeBtn.addEventListener('click', () => {
      window.open(this.subscriptionStatus?.upgradeUrl || '/subscription', '_blank');
    });

    messagesContainer.appendChild(upgradeBtn);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * Clean up and remove bubble
   */
  destroy() {
    if (this.bubble) {
      this.bubble.remove();
      this.bubble = null;
    }
    
    if (this.chatWindow) {
      this.chatWindow.remove();
      this.chatWindow = null;
    }
    
    contextDetector.offContextChange(this.handleContextChange);
  }
}

// Initialize when DOM is ready
let bubbleInjector = null;

function initializeBonsai() {
  if (bubbleInjector) return;
  
  bubbleInjector = new BonsaiBubbleInjector();
  bubbleInjector.initialize().catch(error => {
    console.error('Failed to initialize Bonsai bubble:', error);
  });
}

// Wait for DOM and context detector
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeBonsai, 2000);
  });
} else {
  setTimeout(initializeBonsai, 2000);
}

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (bubbleInjector) {
    bubbleInjector.destroy();
  }
});

export default bubbleInjector;