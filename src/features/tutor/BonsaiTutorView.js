import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

export class BonsaiTutorView extends LitElement {
    static properties = {
        currentResponse: { type: String },
        currentQuestion: { type: String },
        detectedContext: { type: Object },
        isLoading: { type: Boolean },
        isStreaming: { type: Boolean },
        copyState: { type: String },
        showTextInput: { type: Boolean },
        headerText: { type: String },
        headerAnimating: { type: Boolean },
        subscriptionTier: { type: String },
        bonsaiLevel: { type: Number },
        selectedSubject: { type: String },
        userProgress: { type: Object },
        isListening: { type: Boolean },
        contextDetected: { type: Boolean },
        assistanceType: { type: String }
    };

    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            color: white;
            transform: translate3d(0, 0, 0);
            backface-visibility: hidden;
            transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.2s ease-out;
            will-change: transform, opacity;
        }

        * {
            font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            cursor: default;
            user-select: none;
        }

        .tutor-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            background: rgba(0, 0, 0, 0.6);
            border-radius: 12px;
            outline: 0.5px rgba(255, 255, 255, 0.3) solid;
            outline-offset: -1px;
            backdrop-filter: blur(20px);
            box-sizing: border-box;
            position: relative;
            overflow: hidden;
        }

        .tutor-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.15);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            border-radius: 12px;
            filter: blur(10px);
            z-index: -1;
        }

        .context-banner {
            padding: 12px 20px;
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2));
            border-bottom: 1px solid rgba(34, 197, 94, 0.3);
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 13px;
            color: #22c55e;
            flex-shrink: 0;
        }

        .context-banner.hidden {
            display: none;
        }

        .context-info {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .context-icon {
            width: 16px;
            height: 16px;
            background: rgba(34, 197, 94, 0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
        }

        .platform-badge {
            padding: 2px 8px;
            background: rgba(34, 197, 94, 0.2);
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: 12px;
            font-size: 11px;
            font-weight: 500;
        }

        .quick-actions {
            display: flex;
            gap: 8px;
        }

        .quick-action-btn {
            padding: 4px 12px;
            background: rgba(34, 197, 94, 0.2);
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: 12px;
            color: #22c55e;
            cursor: pointer;
            font-size: 11px;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .quick-action-btn:hover {
            background: rgba(34, 197, 94, 0.3);
            border-color: rgba(34, 197, 94, 0.5);
        }

        .response-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            background: transparent;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            flex-shrink: 0;
        }

        .response-header.hidden {
            display: none;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-shrink: 0;
        }

        .bonsai-avatar {
            width: 36px;
            height: 36px;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
            flex-shrink: 0;
            position: relative;
        }

        .bonsai-avatar::after {
            content: '';
            position: absolute;
            top: -2px;
            left: -2px;
            right: -2px;
            bottom: -2px;
            border-radius: 50%;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            opacity: 0.3;
            z-index: -1;
            animation: pulse 2s infinite;
        }

        .response-label {
            font-size: 15px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.95);
            white-space: nowrap;
            position: relative;
            overflow: hidden;
        }

        .response-label.animating {
            animation: fadeInOut 0.3s ease-in-out;
        }

        @keyframes fadeInOut {
            0% { opacity: 1; transform: translateY(0); }
            50% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
        }

        .assistance-type-selector {
            display: flex;
            gap: 8px;
            margin-bottom: 12px;
        }

        .assistance-type-btn {
            padding: 6px 12px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 16px;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .assistance-type-btn.active {
            background: rgba(34, 197, 94, 0.2);
            border-color: rgba(34, 197, 94, 0.5);
            color: #22c55e;
        }

        .assistance-type-btn:hover:not(.active) {
            background: rgba(255, 255, 255, 0.15);
            color: rgba(255, 255, 255, 0.9);
        }

        .header-right {
            display: flex;
            align-items: center;
            gap: 12px;
            flex: 1;
            justify-content: flex-end;
        }

        .subject-badge {
            padding: 4px 12px;
            background: rgba(59, 130, 246, 0.2);
            border: 1px solid rgba(59, 130, 246, 0.3);
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            color: #60a5fa;
            text-transform: uppercase;
        }

        .level-indicator {
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 4px 8px;
            background: rgba(168, 85, 247, 0.2);
            border: 1px solid rgba(168, 85, 247, 0.3);
            border-radius: 12px;
            font-size: 11px;
            color: #c084fc;
        }

        .header-controls {
            display: flex;
            gap: 8px;
            align-items: center;
            flex-shrink: 0;
        }

        .copy-button {
            background: transparent;
            color: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 6px;
            border-radius: 6px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 28px;
            height: 28px;
            flex-shrink: 0;
            transition: all 0.15s ease;
            position: relative;
            overflow: hidden;
        }

        .copy-button:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        .copy-button svg {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            transition: opacity 0.2s ease-in-out, transform 0.2s ease-in-out;
        }

        .copy-button .check-icon {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }

        .copy-button.copied .copy-icon {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.5);
        }

        .copy-button.copied .check-icon {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }

        .response-container {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            font-size: 15px;
            line-height: 1.7;
            background: transparent;
            min-height: 0;
            position: relative;
        }

        .response-container.hidden {
            display: none;
        }

        .response-container::-webkit-scrollbar {
            width: 6px;
        }

        .response-container::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
        }

        .response-container::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
        }

        .response-container::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
        }

        .empty-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: rgba(255, 255, 255, 0.6);
            text-align: center;
            gap: 16px;
        }

        .empty-state-icon {
            width: 64px;
            height: 64px;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            margin-bottom: 8px;
        }

        .empty-state h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: rgba(255, 255, 255, 0.9);
        }

        .empty-state p {
            margin: 8px 0 0 0;
            font-size: 14px;
            max-width: 300px;
        }

        .suggested-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            justify-content: center;
            margin-top: 20px;
        }

        .suggested-action {
            padding: 8px 16px;
            background: rgba(34, 197, 94, 0.2);
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: 20px;
            color: #22c55e;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .suggested-action:hover {
            background: rgba(34, 197, 94, 0.3);
            border-color: rgba(34, 197, 94, 0.5);
        }

        .loading-dots {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 60px;
        }

        .loading-dot {
            width: 10px;
            height: 10px;
            background: #22c55e;
            border-radius: 50%;
            animation: pulse 1.5s ease-in-out infinite;
        }

        .loading-dot:nth-child(1) { animation-delay: 0s; }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes pulse {
            0%, 80%, 100% {
                opacity: 0.3;
                transform: scale(0.8);
            }
            40% {
                opacity: 1;
                transform: scale(1.2);
            }
        }

        .text-input-container {
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding: 20px;
            background: rgba(0, 0, 0, 0.2);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            flex-shrink: 0;
            transition: all 0.3s ease-in-out;
            transform-origin: bottom;
        }

        .text-input-container.hidden {
            opacity: 0;
            transform: scaleY(0);
            padding: 0;
            height: 0;
            overflow: hidden;
        }

        .input-row {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        #textInput {
            flex: 1;
            padding: 12px 16px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 24px;
            outline: none;
            color: white;
            font-size: 14px;
            font-family: inherit;
            font-weight: 400;
            transition: all 0.2s ease;
        }

        #textInput::placeholder {
            color: rgba(255, 255, 255, 0.5);
        }

        #textInput:focus {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(34, 197, 94, 0.5);
            box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
        }

        .send-button {
            padding: 12px 20px;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            color: white;
            border: none;
            border-radius: 24px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s ease;
            flex-shrink: 0;
        }

        .send-button:hover:not(:disabled) {
            background: linear-gradient(135deg, #16a34a, #15803d);
            transform: translateY(-1px);
        }

        .send-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        /* Markdown content styles */
        .response-container h1,
        .response-container h2,
        .response-container h3,
        .response-container h4,
        .response-container h5,
        .response-container h6 {
            color: rgba(255, 255, 255, 0.95);
            margin: 20px 0 12px 0;
            font-weight: 600;
        }

        .response-container h1 { font-size: 24px; }
        .response-container h2 { font-size: 20px; }
        .response-container h3 { font-size: 18px; }
        .response-container h4 { font-size: 16px; }

        .response-container p {
            margin: 12px 0;
            color: rgba(255, 255, 255, 0.9);
        }

        .response-container ul,
        .response-container ol {
            margin: 12px 0;
            padding-left: 24px;
        }

        .response-container li {
            margin: 6px 0;
            color: rgba(255, 255, 255, 0.9);
        }

        .response-container code {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
            font-size: 13px;
        }

        .response-container pre {
            background: rgba(0, 0, 0, 0.4);
            color: rgba(255, 255, 255, 0.95);
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 16px 0;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .response-container pre code {
            background: none;
            padding: 0;
            color: inherit;
        }

        .response-container blockquote {
            border-left: 3px solid #22c55e;
            margin: 16px 0;
            padding: 12px 20px;
            background: rgba(34, 197, 94, 0.1);
            color: rgba(255, 255, 255, 0.9);
            border-radius: 0 8px 8px 0;
        }

        .response-container strong {
            color: #22c55e;
            font-weight: 600;
        }

        .response-container em {
            color: #60a5fa;
            font-style: italic;
        }

        /* Quick response buttons */
        .quick-responses {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 16px;
        }

        .quick-response-btn {
            padding: 8px 16px;
            background: rgba(34, 197, 94, 0.2);
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: 20px;
            color: #22c55e;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .quick-response-btn:hover {
            background: rgba(34, 197, 94, 0.3);
            border-color: rgba(34, 197, 94, 0.5);
        }

        /* Subscription gate */
        .subscription-gate {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            padding: 40px 20px;
            background: rgba(168, 85, 247, 0.1);
            border: 1px solid rgba(168, 85, 247, 0.3);
            border-radius: 12px;
            margin: 20px;
            text-align: center;
        }

        .subscription-gate h3 {
            margin: 0;
            color: #c084fc;
            font-size: 18px;
            font-weight: 600;
        }

        .subscription-gate p {
            margin: 0;
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
        }

        .upgrade-button {
            padding: 12px 24px;
            background: linear-gradient(135deg, #8b5cf6, #7c3aed);
            color: white;
            border: none;
            border-radius: 24px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.2s ease;
        }

        .upgrade-button:hover {
            background: linear-gradient(135deg, #7c3aed, #6d28d9);
            transform: translateY(-1px);
        }

        /* Responsive design */
        @media (max-width: 768px) {
            .response-header {
                padding: 12px 16px;
            }

            .response-container {
                padding: 16px;
                font-size: 14px;
            }

            .text-input-container {
                padding: 16px;
            }

            .context-banner {
                padding: 10px 16px;
                flex-wrap: wrap;
                gap: 8px;
            }

            .quick-actions {
                flex-wrap: wrap;
            }

            .assistance-type-selector {
                flex-wrap: wrap;
            }
        }
    `;

    constructor() {
        super();
        this.currentResponse = '';
        this.currentQuestion = '';
        this.detectedContext = null;
        this.isLoading = false;
        this.copyState = 'idle';
        this.showTextInput = true;
        this.headerText = 'Bonsai AI Tutor';
        this.headerAnimating = false;
        this.isStreaming = false;
        this.accumulatedResponse = '';
        this.contextDetected = false;
        this.assistanceType = 'explanation';

        // Load markdown libraries
        this.marked = null;
        this.hljs = null;
        this.DOMPurify = null;
        this.isLibrariesLoaded = false;

        this.loadLibraries();
        this.initializeContextDetection();
    }

    async loadLibraries() {
        try {
            if (!window.marked) {
                await this.loadScript('../../assets/marked-4.3.0.min.js');
            }
            if (!window.hljs) {
                await this.loadScript('../../assets/highlight-11.9.0.min.js');
            }
            if (!window.DOMPurify) {
                await this.loadScript('../../assets/dompurify-3.0.7.min.js');
            }

            this.marked = window.marked;
            this.hljs = window.hljs;
            this.DOMPurify = window.DOMPurify;

            if (this.marked && this.hljs) {
                this.marked.setOptions({
                    highlight: (code, lang) => {
                        if (lang && this.hljs.getLanguage(lang)) {
                            try {
                                return this.hljs.highlight(code, { language: lang }).value;
                            } catch (err) {
                                console.warn('Highlight error:', err);
                            }
                        }
                        try {
                            return this.hljs.highlightAuto(code).value;
                        } catch (err) {
                            console.warn('Auto highlight error:', err);
                        }
                        return code;
                    },
                    breaks: true,
                    gfm: true,
                });

                this.isLibrariesLoaded = true;
                this.renderContent();
            }
        } catch (error) {
            console.error('Failed to load libraries:', error);
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    initializeContextDetection() {
        // Monitor for SAT-related content on the page
        this.contextMonitor = setInterval(() => {
            this.detectSATContext();
        }, 2000);
    }

    detectSATContext() {
        // Look for SAT question indicators in the current window
        const satKeywords = [
            'sat', 'college board', 'khan academy', 'bluebook',
            'multiple choice', 'grid-in', 'reading passage',
            'math section', 'evidence', 'best supported'
        ];

        let contextFound = false;
        let platform = 'unknown';
        let questionText = '';
        let subject = this.selectedSubject;

        // Check for Khan Academy
        if (window.location.hostname.includes('khanacademy.org')) {
            platform = 'Khan Academy';
            contextFound = true;
            
            // Look for question content
            const questionSelectors = [
                '[data-test-id="exercise-question-renderer"]',
                '.exercise-card .question',
                '.perseus-widget-container'
            ];
            
            for (const selector of questionSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    questionText = element.textContent.trim();
                    break;
                }
            }
        }

        // Check for College Board
        if (window.location.hostname.includes('collegeboard.org') || 
            window.location.hostname.includes('satsuite.collegeboard.org')) {
            platform = 'College Board';
            contextFound = true;
            
            const questionSelectors = [
                '.question-content',
                '[data-testid="question"]',
                '.test-question'
            ];
            
            for (const selector of questionSelectors) {
                const element = document.querySelector(selector);
                if (element) {
                    questionText = element.textContent.trim();
                    break;
                }
            }
        }

        // Check general page content for SAT keywords
        if (!contextFound) {
            const pageText = document.body.textContent.toLowerCase();
            contextFound = satKeywords.some(keyword => pageText.includes(keyword));
            
            if (contextFound) {
                platform = 'General SAT Content';
            }
        }

        if (contextFound && !this.contextDetected) {
            this.contextDetected = true;
            this.detectedContext = {
                platform,
                questionText,
                subject,
                url: window.location.href,
                timestamp: Date.now()
            };

            this.dispatchEvent(new CustomEvent('question-detected', {
                detail: this.detectedContext
            }));

            this.requestUpdate();
        } else if (!contextFound && this.contextDetected) {
            this.contextDetected = false;
            this.detectedContext = null;
            this.requestUpdate();
        }
    }

    connectedCallback() {
        super.connectedCallback();
        
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            
            ipcRenderer.on('bonsai-response-chunk', this.handleStreamChunk.bind(this));
            ipcRenderer.on('bonsai-response-stream-end', this.handleStreamEnd.bind(this));
            ipcRenderer.on('context-detected', this.handleContextUpdate.bind(this));
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        
        if (this.contextMonitor) {
            clearInterval(this.contextMonitor);
        }
        
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.removeAllListeners('bonsai-response-chunk');
            ipcRenderer.removeAllListeners('bonsai-response-stream-end');
            ipcRenderer.removeAllListeners('context-detected');
        }
    }

    handleStreamChunk(event, { token }) {
        if (!this.isStreaming) {
            this.isStreaming = true;
            this.isLoading = false;
            this.accumulatedResponse = '';
            const container = this.shadowRoot.getElementById('responseContainer');
            if (container) container.innerHTML = '';
            this.headerText = 'Bonsai AI Tutor';
            this.headerAnimating = false;
            this.requestUpdate();
        }
        this.accumulatedResponse += token;
        this.renderContent();
    }

    handleStreamEnd() {
        this.isStreaming = false;
        this.currentResponse = this.accumulatedResponse;
        this.renderContent();
        
        // Show quick response options
        this.showQuickResponses();
    }

    handleContextUpdate(event, context) {
        this.detectedContext = context;
        this.contextDetected = true;
        this.requestUpdate();
    }

    renderContent() {
        const responseContainer = this.shadowRoot.getElementById('responseContainer');
        if (!responseContainer) return;

        if (this.isLoading) {
            responseContainer.innerHTML = `
                <div class="loading-dots">
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                    <div class="loading-dot"></div>
                </div>`;
            return;
        }

        if (!this.currentResponse && !this.isStreaming) {
            responseContainer.innerHTML = this.renderEmptyState();
            return;
        }

        let textToRender = this.isStreaming ? this.accumulatedResponse : this.currentResponse;

        if (this.isLibrariesLoaded && this.marked && this.DOMPurify) {
            try {
                const parsedHtml = this.marked.parse(textToRender);
                const cleanHtml = this.DOMPurify.sanitize(parsedHtml, {
                    ALLOWED_TAGS: [
                        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'strong', 'b', 'em', 'i',
                        'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'table',
                        'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'sup', 'sub', 'del', 'ins'
                    ],
                    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel']
                });

                responseContainer.innerHTML = cleanHtml;

                if (this.hljs) {
                    responseContainer.querySelectorAll('pre code').forEach(block => {
                        this.hljs.highlightElement(block);
                    });
                }

                responseContainer.scrollTop = responseContainer.scrollHeight;
            } catch (error) {
                console.error('Error rendering markdown:', error);
                responseContainer.textContent = textToRender;
            }
        } else {
            responseContainer.textContent = textToRender;
        }
    }

    renderEmptyState() {
        const suggestions = this.getSuggestedActions();
        
        return `
            <div class="empty-state">
                <div class="empty-state-icon">🌱</div>
                <h3>Welcome to Bonsai SAT Tutor!</h3>
                <p>I'm here to help you master the SAT. Ask me questions about any topic or let me detect what you're working on.</p>
                <div class="suggested-actions">
                    ${suggestions.map(action => 
                        `<button class="suggested-action" onclick="this.getRootNode().host.handleSuggestedAction('${action.type}')">${action.text}</button>`
                    ).join('')}
                </div>
            </div>
        `;
    }

    getSuggestedActions() {
        const actions = [
            { type: 'explain_concept', text: 'Explain a concept' },
            { type: 'practice_problems', text: 'Practice problems' },
            { type: 'test_strategies', text: 'Test strategies' },
            { type: 'study_plan', text: 'Study plan help' }
        ];

        if (this.detectedContext) {
            actions.unshift(
                { type: 'help_current', text: 'Help with current question' },
                { type: 'hint', text: 'Give me a hint' }
            );
        }

        return actions;
    }

    showQuickResponses() {
        if (!this.currentResponse) return;

        const responses = [
            'Can you explain this differently?',
            'Give me an example',
            'What are the key steps?',
            'Show me a similar problem'
        ];

        const quickResponsesHtml = `
            <div class="quick-responses">
                ${responses.map(response => 
                    `<button class="quick-response-btn" onclick="this.getRootNode().host.handleQuickResponse('${response}')">${response}</button>`
                ).join('')}
            </div>
        `;

        const responseContainer = this.shadowRoot.getElementById('responseContainer');
        if (responseContainer) {
            responseContainer.insertAdjacentHTML('beforeend', quickResponsesHtml);
        }
    }

    async handleSuggestedAction(actionType) {
        const actions = {
            explain_concept: 'Can you explain a key SAT concept in detail?',
            practice_problems: 'I\'d like to practice some SAT problems.',
            test_strategies: 'What are the best strategies for taking the SAT?',
            study_plan: 'Can you help me create a study plan?',
            help_current: this.detectedContext?.questionText || 'Help me with this question',
            hint: 'Can you give me a hint for this problem?'
        };

        const message = actions[actionType];
        if (message) {
            await this.sendMessage(message, actionType);
        }
    }

    async handleQuickResponse(response) {
        await this.sendMessage(response, 'follow_up');
    }

    async sendMessage(message, assistanceType = 'explanation') {
        if (!message.trim()) return;

        // Check subscription limits
        if (!this.checkSubscriptionAccess()) {
            this.showSubscriptionGate();
            return;
        }

        this.currentQuestion = message;
        this.assistanceType = assistanceType;
        this.showTextInput = false;
        this.isLoading = true;
        this.isStreaming = false;
        this.currentResponse = '';
        this.accumulatedResponse = '';
        this.startHeaderAnimation();
        this.requestUpdate();
        this.renderContent();

        try {
            const context = {
                platform: this.detectedContext?.platform || 'Direct',
                questionText: this.detectedContext?.questionText,
                subject: this.selectedSubject,
                assistanceType,
                userLevel: this.bonsaiLevel,
                subscriptionTier: this.subscriptionTier
            };

            const response = await window.bonsaiSAT.sendMessage(message, context);
            
            if (response.success) {
                this.currentResponse = response.message;
                this.isLoading = false;
                this.renderContent();
                
                // Update progress
                this.dispatchEvent(new CustomEvent('progress-update', {
                    detail: {
                        experience: response.experienceGained || 10,
                        action: 'ai_interaction',
                        subject: this.selectedSubject
                    }
                }));
            } else {
                throw new Error(response.error);
            }
        } catch (error) {
            this.isLoading = false;
            this.currentResponse = `I apologize, but I encountered an error: ${error.message}. Please try again.`;
            this.renderContent();
        }
    }

    checkSubscriptionAccess() {
        const limits = {
            free: 5,
            basic: 50,
            pro: -1, // unlimited
            enterprise: -1 // unlimited
        };

        const dailyLimit = limits[this.subscriptionTier] || 5;
        if (dailyLimit === -1) return true;

        const today = new Date().toDateString();
        const usageKey = `bonsai_ai_usage_${today}`;
        const currentUsage = parseInt(localStorage.getItem(usageKey) || '0');

        return currentUsage < dailyLimit;
    }

    showSubscriptionGate() {
        const responseContainer = this.shadowRoot.getElementById('responseContainer');
        if (responseContainer) {
            responseContainer.innerHTML = `
                <div class="subscription-gate">
                    <h3>🌟 Upgrade to Continue</h3>
                    <p>You've reached your daily AI interaction limit. Upgrade to unlock unlimited tutoring sessions!</p>
                    <button class="upgrade-button" onclick="this.getRootNode().host.handleUpgrade()">
                        Upgrade Now
                    </button>
                </div>
            `;
        }
    }

    handleUpgrade() {
        // This would open the subscription page
        if (window.require) {
            const { shell } = window.require('electron');
            shell.openExternal('/subscription');
        } else {
            window.open('/subscription', '_blank');
        }
    }

    startHeaderAnimation() {
        this.animateHeaderText('Analyzing your question...');
        
        setTimeout(() => {
            this.animateHeaderText('Thinking...');
        }, 1500);
    }

    animateHeaderText(text) {
        this.headerAnimating = true;
        this.requestUpdate();

        setTimeout(() => {
            this.headerText = text;
            this.headerAnimating = false;
            this.requestUpdate();
        }, 150);
    }

    handleTextKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleSendText();
        }
    }

    async handleSendText() {
        const textInput = this.shadowRoot?.getElementById('textInput');
        if (!textInput) return;
        
        const text = textInput.value.trim();
        if (!text) return;

        textInput.value = '';
        await this.sendMessage(text, this.assistanceType);
    }

    async handleCopy() {
        if (this.copyState === 'copied') return;

        const textToCopy = `Question: ${this.currentQuestion}\n\nAnswer: ${this.currentResponse}`;

        try {
            await navigator.clipboard.writeText(textToCopy);
            this.copyState = 'copied';
            this.requestUpdate();

            setTimeout(() => {
                this.copyState = 'idle';
                this.requestUpdate();
            }, 1500);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    }

    handleQuickAction(action) {
        if (this.detectedContext) {
            switch (action) {
                case 'explain':
                    this.sendMessage(`Please explain this ${this.selectedSubject} question: ${this.detectedContext.questionText}`, 'explanation');
                    break;
                case 'hint':
                    this.sendMessage(`Give me a hint for this problem: ${this.detectedContext.questionText}`, 'hint');
                    break;
                case 'similar':
                    this.sendMessage(`Show me a similar ${this.selectedSubject} problem`, 'examples');
                    break;
            }
        }
    }

    handleAssistanceTypeChange(type) {
        this.assistanceType = type;
        this.requestUpdate();
    }

    render() {
        const hasResponse = this.isLoading || this.currentResponse || this.isStreaming;
        const showContext = this.contextDetected && this.detectedContext;

        return html`
            <div class="tutor-container">
                <!-- Context Detection Banner -->
                <div class="context-banner ${!showContext ? 'hidden' : ''}">
                    <div class="context-info">
                        <div class="context-icon">📍</div>
                        <span>Detected ${showContext ? this.detectedContext.platform : ''} content</span>
                        <div class="platform-badge">${this.selectedSubject.toUpperCase()}</div>
                    </div>
                    <div class="quick-actions">
                        <button class="quick-action-btn" @click=${() => this.handleQuickAction('explain')}>
                            Explain
                        </button>
                        <button class="quick-action-btn" @click=${() => this.handleQuickAction('hint')}>
                            Hint
                        </button>
                        <button class="quick-action-btn" @click=${() => this.handleQuickAction('similar')}>
                            Similar
                        </button>
                    </div>
                </div>

                <!-- Response Header -->
                <div class="response-header ${!hasResponse ? 'hidden' : ''}">
                    <div class="header-left">
                        <div class="bonsai-avatar">🌱</div>
                        <span class="response-label ${this.headerAnimating ? 'animating' : ''}">${this.headerText}</span>
                    </div>
                    <div class="header-right">
                        <div class="subject-badge">${this.selectedSubject}</div>
                        <div class="level-indicator">
                            <span>⭐ ${this.bonsaiLevel}</span>
                        </div>
                        <div class="header-controls">
                            <button class="copy-button ${this.copyState === 'copied' ? 'copied' : ''}" @click=${this.handleCopy}>
                                <svg class="copy-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                                </svg>
                                <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Response Container -->
                <div class="response-container ${!hasResponse ? 'hidden' : ''}" id="responseContainer">
                    <!-- Content is dynamically generated -->
                </div>

                <!-- Text Input Container -->
                <div class="text-input-container ${!this.showTextInput ? 'hidden' : ''}">
                    <!-- Assistance Type Selector -->
                    <div class="assistance-type-selector">
                        <button class="assistance-type-btn ${this.assistanceType === 'explanation' ? 'active' : ''}" 
                                @click=${() => this.handleAssistanceTypeChange('explanation')}>
                            Explain
                        </button>
                        <button class="assistance-type-btn ${this.assistanceType === 'hint' ? 'active' : ''}" 
                                @click=${() => this.handleAssistanceTypeChange('hint')}>
                            Hint
                        </button>
                        <button class="assistance-type-btn ${this.assistanceType === 'examples' ? 'active' : ''}" 
                                @click=${() => this.handleAssistanceTypeChange('examples')}>
                            Examples
                        </button>
                        <button class="assistance-type-btn ${this.assistanceType === 'strategy' ? 'active' : ''}" 
                                @click=${() => this.handleAssistanceTypeChange('strategy')}>
                            Strategy
                        </button>
                    </div>
                    
                    <!-- Input Row -->
                    <div class="input-row">
                        <input
                            type="text"
                            id="textInput"
                            placeholder="Ask me anything about SAT ${this.selectedSubject}..."
                            @keydown=${this.handleTextKeydown}
                        />
                        <button class="send-button" @click=${this.handleSendText}>
                            Send
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('bonsai-tutor-view', BonsaiTutorView);