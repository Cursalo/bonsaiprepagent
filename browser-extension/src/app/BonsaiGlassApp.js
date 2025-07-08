// Bonsai Glass-Inspired SAT Assistant
// Based on Glass architecture for seamless SAT tutoring experience

class BonsaiGlassApp extends HTMLElement {
    constructor() {
        super();
        this.currentQuestion = null;
        this.isExpanded = false;
        this.isAnalyzing = false;
        this.glassConnected = true;
        this.spiralQuestions = [];
        this.currentSpiral = 0;
        this.attachShadow({ mode: 'open' });
        this.createGlassInterface();
    }

    connectedCallback() {
        console.log('Bonsai Glass: Component connected');
        this.startContextAwareness();
    }

    createGlassInterface() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    z-index: 999999;
                    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
                    pointer-events: none;
                }

                .glass-bubble {
                    width: 56px;
                    height: 56px;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    pointer-events: auto;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    position: relative;
                }

                .glass-bubble:hover {
                    transform: scale(1.05);
                    background: rgba(0, 0, 0, 0.8);
                    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.3);
                }

                .glass-bubble.expanded {
                    width: 380px;
                    height: 520px;
                    border-radius: 16px;
                    background: linear-gradient(135deg, #6B46C1 0%, #8B5CF6 50%, #A855F7 100%);
                    transform: none;
                    box-shadow: 0 20px 60px rgba(107, 70, 193, 0.4);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .glass-bubble.analyzing {
                    border-color: rgba(34, 197, 94, 0.4);
                    box-shadow: 0 4px 20px rgba(34, 197, 94, 0.2);
                }

                .bubble-icon {
                    font-size: 24px;
                    color: #10b981;
                    text-shadow: 0 2px 8px rgba(16, 185, 129, 0.4);
                    transition: all 0.2s ease;
                }

                .glass-content {
                    display: none;
                    width: 100%;
                    height: 100%;
                    padding: 20px;
                    color: #ffffff;
                    overflow-y: auto;
                }

                .glass-content::-webkit-scrollbar {
                    width: 4px;
                }

                .glass-content::-webkit-scrollbar-track {
                    background: transparent;
                }

                .glass-content::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 2px;
                }

                .expanded .glass-content {
                    display: block;
                }

                .expanded .bubble-icon {
                    display: none;
                }

                .glass-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 24px;
                    padding: 0 4px;
                }

                .glass-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 18px;
                    font-weight: 700;
                    color: #ffffff;
                }

                .glass-logo {
                    font-size: 20px;
                }

                .connection-status {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: #ffffff;
                    background: rgba(255, 255, 255, 0.1);
                    padding: 4px 8px;
                    border-radius: 12px;
                }

                .status-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #10b981;
                    box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
                }

                .close-btn {
                    background: transparent;
                    border: none;
                    color: rgba(255, 255, 255, 0.7);
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    font-size: 18px;
                }

                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #ffffff;
                }

                .platform-section {
                    margin-bottom: 20px;
                }

                .platform-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 16px;
                }

                .platform-icon {
                    font-size: 24px;
                }

                .platform-details {
                    flex: 1;
                }

                .platform-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 2px;
                }

                .platform-status {
                    font-size: 12px;
                    color: #10b981;
                    font-weight: 500;
                }

                .stats-section {
                    margin-bottom: 20px;
                }

                .stats-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 1px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .stat-item {
                    background: rgba(0, 0, 0, 0.2);
                    padding: 16px 12px;
                    text-align: center;
                }

                .stat-number {
                    font-size: 18px;
                    font-weight: 700;
                    color: #ffffff;
                    margin-bottom: 4px;
                }

                .stat-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.7);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .features-section {
                    margin-bottom: 20px;
                }

                .feature-toggle {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.05);
                    margin-bottom: 8px;
                    border-radius: 12px;
                }

                .feature-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .feature-icon {
                    font-size: 18px;
                }

                .feature-label {
                    font-size: 14px;
                    font-weight: 500;
                    color: #ffffff;
                }

                .toggle-switch {
                    width: 44px;
                    height: 24px;
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 12px;
                    position: relative;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .toggle-switch.active {
                    background: #10b981;
                }

                .toggle-slider {
                    width: 20px;
                    height: 20px;
                    background: #ffffff;
                    border-radius: 50%;
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                }

                .toggle-switch.active .toggle-slider {
                    left: 22px;
                }

                .actions-section {
                    margin-bottom: 20px;
                }

                .actions-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #ffffff;
                    margin-bottom: 12px;
                    padding-left: 4px;
                }

                .bottom-navigation {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 1px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    overflow: hidden;
                    margin-bottom: 12px;
                }

                .nav-btn {
                    background: rgba(0, 0, 0, 0.2);
                    border: none;
                    color: #ffffff;
                    padding: 14px 8px;
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: center;
                }

                .nav-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                }

                .version-info {
                    text-align: center;
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 500;
                }

                .context-display {
                    background: rgba(34, 197, 94, 0.1);
                    border: 1px solid rgba(34, 197, 94, 0.3);
                    border-radius: 12px;
                    padding: 16px;
                    margin-bottom: 20px;
                    font-size: 14px;
                }

                .context-title {
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: #22c55e;
                }

                .question-preview {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    padding: 12px;
                    margin-top: 8px;
                    font-size: 12px;
                    line-height: 1.4;
                    max-height: 80px;
                    overflow: hidden;
                    position: relative;
                }

                .spiral-section {
                    margin-bottom: 24px;
                }

                .spiral-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: #60a5fa;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .spiral-progress {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 16px;
                }

                .spiral-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    transition: all 0.3s ease;
                }

                .spiral-dot.active {
                    background: #60a5fa;
                    transform: scale(1.3);
                }

                .spiral-dot.completed {
                    background: #22c55e;
                }

                .glass-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-bottom: 16px;
                }

                .glass-btn {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #ffffff;
                    padding: 10px 14px;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .glass-btn:hover {
                    background: rgba(255, 255, 255, 0.1);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .glass-btn.primary {
                    background: rgba(34, 197, 94, 0.15);
                    border-color: rgba(34, 197, 94, 0.3);
                    color: #22c55e;
                }

                .glass-btn.primary:hover {
                    background: rgba(34, 197, 94, 0.25);
                }

                .glass-btn:disabled {
                    opacity: 0.4;
                    cursor: not-allowed;
                }

                .explanation-panel {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 16px;
                    margin-top: 16px;
                    animation: slideIn 0.3s ease;
                }

                .explanation-title {
                    font-weight: 600;
                    margin-bottom: 8px;
                    color: #fbbf24;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .explanation-content {
                    font-size: 13px;
                    line-height: 1.5;
                    color: rgba(255, 255, 255, 0.9);
                }

                .loading-indicator {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 20px;
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 13px;
                }

                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-top-color: #22c55e;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                .glass-status {
                    position: absolute;
                    bottom: 16px;
                    left: 16px;
                    right: 16px;
                    background: rgba(0, 0, 0, 0.5);
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.7);
                    text-align: center;
                }

                .settings-link {
                    color: #60a5fa;
                    cursor: pointer;
                    text-decoration: underline;
                    font-size: 11px;
                    margin-top: 8px;
                    display: block;
                    text-align: center;
                }

                .settings-link:hover {
                    color: #93c5fd;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .drag-handle {
                    position: absolute;
                    top: 8px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 40px;
                    height: 4px;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 2px;
                    cursor: grab;
                    display: none;
                }

                .expanded .drag-handle {
                    display: block;
                }

                .drag-handle:active {
                    cursor: grabbing;
                }
            </style>

            <div class="glass-bubble" id="glassBubble">
                <div class="bubble-icon">🌱</div>
                <div class="drag-handle" id="dragHandle"></div>
                
                <div class="glass-content" id="glassContent">
                    <div class="glass-header">
                        <div class="glass-title">
                            <span class="glass-logo">✨</span>
                            <span>Bonsai</span>
                        </div>
                        <div class="connection-status">
                            <div class="status-indicator connected"></div>
                            <span>Connected</span>
                        </div>
                        <button class="close-btn" id="closeBtn">×</button>
                    </div>

                    <div class="platform-section">
                        <div class="platform-info">
                            <div class="platform-icon">🎓</div>
                            <div class="platform-details">
                                <div class="platform-name" id="platformName">Khan Academy</div>
                                <div class="platform-status">✅ Supported</div>
                            </div>
                        </div>
                    </div>

                    <div class="stats-section">
                        <div class="stats-row">
                            <div class="stat-item">
                                <div class="stat-number" id="dailyLimit">0</div>
                                <div class="stat-label">Daily Limit</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number" id="dayStreak">0</div>
                                <div class="stat-label">Day Streak</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number" id="totalHelp">0</div>
                                <div class="stat-label">Total Help</div>
                            </div>
                        </div>
                    </div>

                    <div class="features-section">
                        <div class="feature-toggle">
                            <div class="feature-info">
                                <div class="feature-icon">🎤</div>
                                <div class="feature-label">Voice Commands</div>
                            </div>
                            <div class="toggle-switch" id="voiceToggle">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                        <div class="feature-toggle">
                            <div class="feature-info">
                                <div class="feature-icon">🔍</div>
                                <div class="feature-label">Auto-detect Questions</div>
                            </div>
                            <div class="toggle-switch active" id="autoDetectToggle">
                                <div class="toggle-slider"></div>
                            </div>
                        </div>
                    </div>

                    <div class="actions-section" id="actionsSection" style="display: none;">
                        <div class="actions-title">Quick Actions</div>
                        <div class="glass-actions">
                            <button class="glass-btn primary" id="hintBtn">
                                💡 Get Hint
                            </button>
                            <button class="glass-btn" id="conceptBtn">
                                🧠 Explain Concept
                            </button>
                            <button class="glass-btn" id="solutionBtn">
                                📝 Show Solution
                            </button>
                        </div>
                        <div id="explanationContainer"></div>
                    </div>

                    <div class="bottom-navigation">
                        <button class="nav-btn" id="settingsBtn">
                            ⚙️ Settings
                        </button>
                        <button class="nav-btn" id="upgradeBtn">
                            ⭐ Upgrade
                        </button>
                        <button class="nav-btn" id="helpBtn">
                            ❓ Help
                        </button>
                    </div>

                    <div class="version-info">v1.0.0</div>
                </div>
            </div>
        `;

        this.setupGlassInteractions();
    }

    setupGlassInteractions() {
        const bubble = this.shadowRoot.getElementById('glassBubble');
        const closeBtn = this.shadowRoot.getElementById('closeBtn');
        const hintBtn = this.shadowRoot.getElementById('hintBtn');
        const conceptBtn = this.shadowRoot.getElementById('conceptBtn');
        const solutionBtn = this.shadowRoot.getElementById('solutionBtn');
        const voiceToggle = this.shadowRoot.getElementById('voiceToggle');
        const autoDetectToggle = this.shadowRoot.getElementById('autoDetectToggle');
        const settingsBtn = this.shadowRoot.getElementById('settingsBtn');
        const upgradeBtn = this.shadowRoot.getElementById('upgradeBtn');
        const helpBtn = this.shadowRoot.getElementById('helpBtn');
        const dragHandle = this.shadowRoot.getElementById('dragHandle');

        // Bubble click to expand/collapse
        bubble.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (this.isExpanded) {
                this.collapseGlass();
            } else {
                this.expandGlass();
            }
        });

        // Close button
        closeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.collapseGlass();
        });

        // Action buttons - DON'T close the interface
        if (hintBtn) {
            hintBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleGlassAction('hint');
            });
        }

        if (conceptBtn) {
            conceptBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleGlassAction('concept');
            });
        }

        if (solutionBtn) {
            solutionBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handleGlassAction('solution');
            });
        }

        // Toggle switches
        if (voiceToggle) {
            voiceToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                voiceToggle.classList.toggle('active');
            });
        }

        if (autoDetectToggle) {
            autoDetectToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                autoDetectToggle.classList.toggle('active');
            });
        }

        // Navigation buttons
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openSettings();
            });
        }

        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showUpgradeInfo();
            });
        }

        if (helpBtn) {
            helpBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.showHelpInfo();
            });
        }

        // Drag functionality
        this.setupGlassDrag(dragHandle);

        // Load initial stats
        this.loadUsageStats();
    }

    expandGlass() {
        this.isExpanded = true;
        const bubble = this.shadowRoot.getElementById('glassBubble');
        bubble.classList.add('expanded');
        
        // Update status based on current context
        this.updateGlassStatus();
    }

    collapseGlass() {
        this.isExpanded = false;
        const bubble = this.shadowRoot.getElementById('glassBubble');
        bubble.classList.remove('expanded');
    }

    handleQuestionDetected(questionData) {
        console.log('Bonsai Glass: Question detected:', questionData);
        this.currentQuestion = questionData;
        
        // Update platform info
        this.updatePlatformInfo();
        
        // Show actions section
        const actionsSection = this.shadowRoot.getElementById('actionsSection');
        if (actionsSection) {
            actionsSection.style.display = 'block';
        }
        
        // Pulse to indicate new content
        const bubble = this.shadowRoot.getElementById('glassBubble');
        bubble.classList.add('analyzing');
        setTimeout(() => bubble.classList.remove('analyzing'), 2000);
        
        // Update stats
        this.incrementQuestionCount();
    }

    updateContextDisplay() {
        const contextText = this.shadowRoot.getElementById('contextText');
        const questionPreview = this.shadowRoot.getElementById('questionPreview');
        
        if (this.currentQuestion) {
            contextText.textContent = `${this.currentQuestion.subject.toUpperCase()} - ${this.currentQuestion.type}`;
            
            if (this.currentQuestion.text) {
                questionPreview.style.display = 'block';
                questionPreview.textContent = this.currentQuestion.text.substring(0, 150) + 
                    (this.currentQuestion.text.length > 150 ? '...' : '');
            }
        }
    }

    generateSpiralQuestions() {
        // Generate spiral learning sequence based on current question
        this.spiralQuestions = [
            { type: 'understanding', title: 'What is being asked?' },
            { type: 'approach', title: 'How should we approach this?' },
            { type: 'solve', title: 'Step-by-step solution' },
            { type: 'verify', title: 'How can we verify?' },
            { type: 'extend', title: 'What if we change something?' }
        ];
        
        this.currentSpiral = 0;
        this.updateSpiralProgress();
    }

    updateSpiralProgress() {
        const progressContainer = this.shadowRoot.getElementById('spiralProgress');
        const spiralCount = this.shadowRoot.getElementById('spiralCount');
        
        progressContainer.innerHTML = '';
        
        this.spiralQuestions.forEach((question, index) => {
            const dot = document.createElement('div');
            dot.className = 'spiral-dot';
            
            if (index < this.currentSpiral) {
                dot.classList.add('completed');
            } else if (index === this.currentSpiral) {
                dot.classList.add('active');
            }
            
            progressContainer.appendChild(dot);
        });
        
        spiralCount.textContent = `(${this.currentSpiral}/${this.spiralQuestions.length})`;
    }

    async handleGlassAction(actionType) {
        if (!this.currentQuestion) {
            this.showExplanation('No Question Detected', 'Please navigate to a SAT question first.');
            return;
        }

        this.setGlassLoading(true);
        
        try {
            let apiKey = null;
            
            // Try to get API key from extension storage
            if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
                const result = await chrome.storage.sync.get(['openai_api_key']);
                apiKey = result.openai_api_key;
            }
            
            if (!apiKey) {
                this.showExplanation('API Key Required', 'Please configure your OpenAI API key in extension settings first.');
                return;
            }

            const response = await this.callGlassAI(apiKey, actionType);
            
            if (response.success) {
                this.showExplanation(this.getActionTitle(actionType), response.message);
            } else {
                this.showExplanation(this.getActionTitle(actionType), this.getFallbackMessage(actionType));
            }
        } catch (error) {
            console.error('Glass action error:', error);
            this.showExplanation('Error', this.getFallbackMessage(actionType));
        } finally {
            this.setGlassLoading(false);
        }
    }

    async startSpiralLearning() {
        if (!this.currentQuestion || this.currentSpiral >= this.spiralQuestions.length) {
            return;
        }

        const currentStep = this.spiralQuestions[this.currentSpiral];
        await this.handleGlassAction(currentStep.type);
        
        this.currentSpiral++;
        this.updateSpiralProgress();
    }

    async callGlassAI(apiKey, actionType) {
        try {
            const prompt = this.buildGlassPrompt(actionType);
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are Bonsai Glass, an expert SAT tutor with real-time contextual awareness. Provide concise, helpful guidance that builds understanding progressively. Keep responses under 80 words and use a encouraging, friendly tone.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 120,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status}`);
            }

            const data = await response.json();
            return {
                success: true,
                message: data.choices[0].message.content
            };

        } catch (error) {
            console.error('Glass AI error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    buildGlassPrompt(actionType) {
        const questionText = this.currentQuestion.text || 'Question context not available';
        const subject = this.currentQuestion.subject || 'unknown';
        
        const prompts = {
            hint: `SAT ${subject}: "${questionText}"\n\nProvide a gentle hint to get started (don't give the answer):`,
            concept: `SAT ${subject}: "${questionText}"\n\nExplain the key concept being tested:`,
            solution: `SAT ${subject}: "${questionText}"\n\nProvide step-by-step guidance:`,
            understanding: `SAT ${subject}: "${questionText}"\n\nHelp me understand what this question is asking:`,
            approach: `SAT ${subject}: "${questionText}"\n\nWhat's the best approach to solve this:`,
            solve: `SAT ${subject}: "${questionText}"\n\nGuide me through solving this step by step:`,
            verify: `SAT ${subject}: "${questionText}"\n\nHow can I verify my answer is correct:`,
            extend: `SAT ${subject}: "${questionText}"\n\nWhat variations of this problem might appear:`
        };
        
        return prompts[actionType] || prompts.hint;
    }

    showExplanation(title, content) {
        const container = this.shadowRoot.getElementById('explanationContainer');
        
        const explanationPanel = document.createElement('div');
        explanationPanel.className = 'explanation-panel';
        explanationPanel.innerHTML = `
            <div class="explanation-title">
                ${this.getActionIcon(title)} ${title}
            </div>
            <div class="explanation-content">${content}</div>
        `;
        
        container.innerHTML = '';
        container.appendChild(explanationPanel);
    }

    setGlassLoading(isLoading) {
        this.isAnalyzing = isLoading;
        const bubble = this.shadowRoot.getElementById('glassBubble');
        const actions = this.shadowRoot.querySelectorAll('.glass-btn');
        const container = this.shadowRoot.getElementById('explanationContainer');
        
        if (isLoading) {
            bubble.classList.add('analyzing');
            actions.forEach(btn => btn.disabled = true);
            
            container.innerHTML = `
                <div class="loading-indicator">
                    <div class="spinner"></div>
                    <span>Glass is analyzing...</span>
                </div>
            `;
        } else {
            bubble.classList.remove('analyzing');
            actions.forEach(btn => btn.disabled = false);
        }
    }

    getActionTitle(actionType) {
        const titles = {
            hint: 'Smart Hint',
            concept: 'Key Concept',
            solution: 'Solution Guide',
            understanding: 'Understanding',
            approach: 'Approach',
            solve: 'Solution',
            verify: 'Verification',
            extend: 'Extensions'
        };
        return titles[actionType] || 'Glass Response';
    }

    getActionIcon(actionType) {
        const icons = {
            'Smart Hint': '💡',
            'Key Concept': '🧠',
            'Solution Guide': '📝',
            'Understanding': '🎯',
            'Approach': '🗺️',
            'Solution': '✨',
            'Verification': '✅',
            'Extensions': '🔄'
        };
        return icons[actionType] || '🌱';
    }

    getFallbackMessage(actionType) {
        const fallbacks = {
            hint: 'Start by identifying what the question is asking. Look for key words and given information.',
            concept: 'This question tests fundamental SAT concepts. Review the topic and practice similar problems.',
            solution: 'Break this down step by step: 1) Understand the question, 2) Identify given info, 3) Apply the right method, 4) Check your work.',
            understanding: 'Read the question carefully and identify what it\'s asking you to find.',
            approach: 'Consider what information you have and what methods apply to this type of problem.',
            solve: 'Work through this systematically, showing each step clearly.',
            verify: 'Check your answer by substituting back or using an alternative method.',
            extend: 'Think about how this concept might appear in other question formats.'
        };
        return fallbacks[actionType] || 'Continue working through this problem step by step.';
    }

    startContextAwareness() {
        // Simulate Glass-style context awareness
        const observer = new MutationObserver(() => {
            this.detectGlassContext();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Initial context check
        setTimeout(() => this.detectGlassContext(), 1000);
    }

    detectGlassContext() {
        // Look for SAT question indicators
        const questionSelectors = [
            '[data-test-id*="question"]',
            '.question-container',
            '.exercise-content',
            '[class*="Question"]'
        ];
        
        for (const selector of questionSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim().length > 50) {
                const questionData = {
                    text: element.textContent.trim(),
                    subject: this.detectSubjectFromContext(),
                    type: 'multiple-choice',
                    platform: 'khan',
                    element: element
                };
                
                this.handleQuestionDetected(questionData);
                break;
            }
        }
    }

    detectSubjectFromContext() {
        const url = window.location.href.toLowerCase();
        if (url.includes('math')) return 'math';
        if (url.includes('reading')) return 'reading';
        if (url.includes('writing')) return 'writing';
        return 'unknown';
    }

    updateGlassStatus() {
        const status = this.shadowRoot.getElementById('glassStatus');
        
        if (this.currentQuestion) {
            status.innerHTML = `
                Glass is ready to help with ${this.currentQuestion.subject} questions
                <div class="settings-link" id="settingsLink">Configure API Settings</div>
            `;
        } else {
            status.innerHTML = `
                Navigate to SAT content to begin
                <div class="settings-link" id="settingsLink">Configure API Settings</div>
            `;
        }
        
        // Re-attach settings listener
        const newSettingsLink = this.shadowRoot.getElementById('settingsLink');
        if (newSettingsLink) {
            newSettingsLink.addEventListener('click', () => this.openSettings());
        }
    }

    setupGlassDrag(dragHandle) {
        let isDragging = false;
        let currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;

        const dragStart = (e) => {
            if (e.target === dragHandle) {
                isDragging = true;
                
                if (e.type === "touchstart") {
                    initialX = e.touches[0].clientX - xOffset;
                    initialY = e.touches[0].clientY - yOffset;
                } else {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;
                }
            }
        };

        const dragEnd = () => {
            if (isDragging) {
                isDragging = false;
                
                // Save position
                const rect = this.getBoundingClientRect();
                localStorage.setItem('bonsai-glass-position', JSON.stringify({
                    top: rect.top,
                    right: window.innerWidth - rect.right
                }));
            }
        };

        const drag = (e) => {
            if (isDragging) {
                e.preventDefault();
                
                if (e.type === "touchmove") {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }

                xOffset = currentX;
                yOffset = currentY;

                const newTop = Math.max(0, Math.min(currentY + this.offsetTop, window.innerHeight - this.offsetHeight));
                const newLeft = Math.max(0, Math.min(currentX + this.offsetLeft, window.innerWidth - this.offsetWidth));

                this.style.top = `${newTop}px`;
                this.style.left = `${newLeft}px`;
                this.style.right = 'auto';
            }
        };

        dragHandle.addEventListener("mousedown", dragStart);
        document.addEventListener("mouseup", dragEnd);
        document.addEventListener("mousemove", drag);
        
        dragHandle.addEventListener("touchstart", dragStart);
        document.addEventListener("touchend", dragEnd);
        document.addEventListener("touchmove", drag);
    }

    openSettings() {
        try {
            if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                chrome.runtime.sendMessage({ action: 'openSettings' });
            } else {
                // Fallback: open options page directly
                const optionsUrl = chrome.runtime.getURL('src/popup/options.html');
                window.open(optionsUrl, '_blank');
            }
        } catch (error) {
            console.warn('Could not open settings:', error);
            // Show inline message instead
            this.showExplanation('Settings', 'Please click the extension icon in your browser toolbar to access settings.');
        }
    }

    updatePlatformInfo() {
        const platformName = this.shadowRoot.getElementById('platformName');
        const platformIcon = this.shadowRoot.querySelector('.platform-icon');
        const platformStatus = this.shadowRoot.querySelector('.platform-status');
        
        // Detect current platform
        const url = window.location.href.toLowerCase();
        let platform = { name: 'Unknown', icon: '🌍', status: '❓ Checking...' };
        
        if (url.includes('khanacademy.org')) {
            platform = { name: 'Khan Academy', icon: '🎓', status: '✅ Supported' };
        } else if (url.includes('collegeboard.org')) {
            platform = { name: 'College Board', icon: '📚', status: '✅ Supported' };
        } else if (url.includes('satsuite.collegeboard.org')) {
            platform = { name: 'SAT Suite', icon: '📝', status: '✅ Supported' };
        } else if (url.includes('localhost') || url.includes('file://')) {
            platform = { name: 'Test Environment', icon: '🧪', status: '✅ Testing' };
        } else {
            platform = { name: 'Generic Website', icon: '🌐', status: '⚠️ Limited Support' };
        }
        
        if (platformName) platformName.textContent = platform.name;
        if (platformIcon) platformIcon.textContent = platform.icon;
        if (platformStatus) platformStatus.textContent = platform.status;
    }

    loadUsageStats() {
        // Load usage statistics from local storage
        const stats = JSON.parse(localStorage.getItem('bonsai-usage-stats') || '{}');
        
        const dailyLimit = this.shadowRoot.getElementById('dailyLimit');
        const dayStreak = this.shadowRoot.getElementById('dayStreak');
        const totalHelp = this.shadowRoot.getElementById('totalHelp');
        
        if (dailyLimit) dailyLimit.textContent = stats.dailyUsage || '0';
        if (dayStreak) dayStreak.textContent = stats.dayStreak || '0';
        if (totalHelp) totalHelp.textContent = stats.totalHelp || '0';
        
        // Update daily usage reset if needed
        const today = new Date().toDateString();
        const lastUsed = stats.lastUsedDate;
        
        if (lastUsed !== today) {
            stats.dailyUsage = 0;
            stats.lastUsedDate = today;
            
            // Update streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastUsed === yesterday.toDateString()) {
                stats.dayStreak = (stats.dayStreak || 0) + 1;
            } else if (lastUsed) {
                stats.dayStreak = 1;
            }
            
            localStorage.setItem('bonsai-usage-stats', JSON.stringify(stats));
        }
    }

    incrementQuestionCount() {
        const stats = JSON.parse(localStorage.getItem('bonsai-usage-stats') || '{}');
        
        stats.dailyUsage = (stats.dailyUsage || 0) + 1;
        stats.totalHelp = (stats.totalHelp || 0) + 1;
        stats.lastUsedDate = new Date().toDateString();
        
        localStorage.setItem('bonsai-usage-stats', JSON.stringify(stats));
        
        // Update display
        this.loadUsageStats();
        
        console.log('Bonsai Glass: Question count incremented', stats);
    }

    showUpgradeInfo() {
        this.showExplanation('🌟 Upgrade to Premium', 
            'Unlock unlimited AI hints, advanced explanations, personalized study plans, and priority support. Get 50% off your first month with code BONSAI50!');
    }

    showHelpInfo() {
        this.showExplanation('❓ How to Use Bonsai', 
            `Welcome to your AI SAT tutor! Here's how to get started:
            
            1. 🎯 Navigate to any SAT practice question
            2. 💡 Click "Get Hint" for gentle guidance  
            3. 🧠 Use "Explain Concept" to understand the topic
            4. 📝 Get "Solution" for step-by-step help
            5. ⚙️ Configure your API key in Settings
            
            Tip: Use keyboard shortcuts Ctrl+Shift+B to toggle the interface!`);
    }
}

// Register the Glass component
customElements.define('bonsai-glass-app', BonsaiGlassApp);
console.log('Bonsai Glass: Glass-inspired component registered successfully');