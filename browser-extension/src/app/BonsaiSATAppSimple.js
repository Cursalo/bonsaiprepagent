// Simple Bonsai SAT App Component - No external dependencies
// This component works without LitElement to avoid CSP issues

class BonsaiSATApp extends HTMLElement {
    constructor() {
        super();
        this.currentQuestion = null;
        this.isConnected = true;
        this.createUI();
    }

    connectedCallback() {
        console.log('Bonsai SAT: Simple component connected');
    }

    createUI() {
        this.innerHTML = `
            <style>
                .bonsai-container {
                    padding: 20px;
                    text-align: center;
                    font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                    color: #e5e5e7;
                }
                
                .bonsai-header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                
                .bonsai-logo {
                    font-size: 24px;
                }
                
                .bonsai-title {
                    font-size: 18px;
                    font-weight: 600;
                }
                
                .bonsai-status {
                    background: rgba(34, 197, 94, 0.2);
                    border: 1px solid rgba(34, 197, 94, 0.4);
                    border-radius: 6px;
                    padding: 8px 12px;
                    margin: 16px 0;
                    font-size: 12px;
                }
                
                .bonsai-status.question-detected {
                    background: rgba(59, 130, 246, 0.2);
                    border-color: rgba(59, 130, 246, 0.4);
                }
                
                .bonsai-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    margin-top: 16px;
                }
                
                .bonsai-btn {
                    background: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 6px;
                    color: #e5e5e7;
                    padding: 8px 12px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: background 0.2s;
                    font-family: inherit;
                }
                
                .bonsai-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                }
                
                .bonsai-btn.primary {
                    background: rgba(34, 197, 94, 0.2);
                    border-color: rgba(34, 197, 94, 0.4);
                }
                
                .bonsai-btn.primary:hover {
                    background: rgba(34, 197, 94, 0.3);
                }
                
                .bonsai-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                
                .bonsai-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 16px;
                }
                
                .bonsai-spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.2);
                    border-top-color: #22c55e;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                
                .bonsai-settings-link {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.6);
                    text-decoration: underline;
                    cursor: pointer;
                    margin-top: 8px;
                    display: block;
                }
                
                .bonsai-settings-link:hover {
                    color: rgba(255, 255, 255, 0.8);
                }
            </style>
            
            <div class="bonsai-container" id="bonsai-main-content">
                <div class="bonsai-header">
                    <span class="bonsai-logo">🌱</span>
                    <span class="bonsai-title">Bonsai SAT Prep</span>
                </div>
                
                <div class="bonsai-status" id="connection-status">
                    ✅ Ready to help
                </div>
                
                <div id="question-status" style="display: none;">
                    <div class="bonsai-status question-detected">
                        📚 Question detected: <span id="question-subject">Unknown</span>
                    </div>
                    
                    <div class="bonsai-actions">
                        <button class="bonsai-btn primary" id="hint-btn">
                            💡 Get Hint
                        </button>
                        <button class="bonsai-btn" id="concept-btn">
                            🧠 Explain Concept
                        </button>
                        <button class="bonsai-btn" id="solution-btn">
                            📝 Show Solution
                        </button>
                    </div>
                </div>
                
                <div id="no-question-status">
                    <div class="bonsai-status">
                        Navigate to a SAT question to get started
                    </div>
                    <span class="bonsai-settings-link" id="settings-link">
                        Configure API settings
                    </span>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const hintBtn = this.querySelector('#hint-btn');
        const conceptBtn = this.querySelector('#concept-btn');
        const solutionBtn = this.querySelector('#solution-btn');
        const settingsLink = this.querySelector('#settings-link');

        if (hintBtn) {
            hintBtn.addEventListener('click', () => this.handleGetHint());
        }
        
        if (conceptBtn) {
            conceptBtn.addEventListener('click', () => this.handleExplainConcept());
        }
        
        if (solutionBtn) {
            solutionBtn.addEventListener('click', () => this.handleShowSolution());
        }
        
        if (settingsLink) {
            settingsLink.addEventListener('click', () => this.openSettings());
        }
    }

    handleQuestionDetected(questionData) {
        console.log('Bonsai SAT: Question detected in component:', questionData);
        this.currentQuestion = questionData;
        this.updateUI();
    }

    updateUI() {
        const questionStatus = this.querySelector('#question-status');
        const noQuestionStatus = this.querySelector('#no-question-status');
        const questionSubject = this.querySelector('#question-subject');

        if (this.currentQuestion) {
            if (questionStatus) questionStatus.style.display = 'block';
            if (noQuestionStatus) noQuestionStatus.style.display = 'none';
            if (questionSubject) questionSubject.textContent = this.currentQuestion.subject || 'Unknown';
        } else {
            if (questionStatus) questionStatus.style.display = 'none';
            if (noQuestionStatus) noQuestionStatus.style.display = 'block';
        }
    }

    async handleGetHint() {
        if (!this.currentQuestion) {
            this.showAlert('No question detected. Navigate to a SAT question first.');
            return;
        }

        this.setLoading(true);
        
        try {
            // Try to get OpenAI API key from storage
            const result = await chrome.storage.sync.get(['openai_api_key']);
            
            if (!result.openai_api_key) {
                this.showAlert('Please configure your OpenAI API key in extension settings first.');
                this.setLoading(false);
                return;
            }

            // Make API call to OpenAI
            const response = await this.callOpenAI(result.openai_api_key, 'hint');
            
            if (response.success) {
                this.showAlert(`💡 Hint: ${response.message}`);
            } else {
                this.showAlert('💡 Hint: Break down the problem step by step. What is the question asking for?');
            }
        } catch (error) {
            console.error('Error getting hint:', error);
            this.showAlert('💡 Hint: Start by identifying what the question is asking for, then look for key information provided.');
        } finally {
            this.setLoading(false);
        }
    }

    async handleExplainConcept() {
        if (!this.currentQuestion) {
            this.showAlert('No question detected. Navigate to a SAT question first.');
            return;
        }

        this.setLoading(true);
        
        try {
            const result = await chrome.storage.sync.get(['openai_api_key']);
            
            if (!result.openai_api_key) {
                this.showAlert('Please configure your OpenAI API key in extension settings first.');
                this.setLoading(false);
                return;
            }

            const response = await this.callOpenAI(result.openai_api_key, 'concept');
            
            if (response.success) {
                this.showAlert(`🧠 Concept: ${response.message}`);
            } else {
                this.showAlert(`🧠 This question tests ${this.currentQuestion.subject} concepts. Focus on understanding the fundamental principles.`);
            }
        } catch (error) {
            console.error('Error explaining concept:', error);
            this.showAlert('🧠 Review the key concepts for this type of question and practice similar problems.');
        } finally {
            this.setLoading(false);
        }
    }

    async handleShowSolution() {
        if (!this.currentQuestion) {
            this.showAlert('No question detected. Navigate to a SAT question first.');
            return;
        }

        this.setLoading(true);
        
        try {
            const result = await chrome.storage.sync.get(['openai_api_key']);
            
            if (!result.openai_api_key) {
                this.showAlert('Please configure your OpenAI API key in extension settings first.');
                this.setLoading(false);
                return;
            }

            const response = await this.callOpenAI(result.openai_api_key, 'solution');
            
            if (response.success) {
                this.showAlert(`📝 Solution: ${response.message}`);
            } else {
                this.showAlert('📝 Approach: 1) Read carefully, 2) Identify given info, 3) Choose method, 4) Solve step by step, 5) Check answer.');
            }
        } catch (error) {
            console.error('Error showing solution:', error);
            this.showAlert('📝 Work through this systematically: understand the question, identify relevant information, apply the appropriate method, and check your answer.');
        } finally {
            this.setLoading(false);
        }
    }

    async callOpenAI(apiKey, type) {
        try {
            const prompt = this.buildPrompt(type);
            
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
                            content: 'You are Bonsai, an expert SAT tutor. Provide helpful, encouraging guidance. Keep responses concise (under 100 words).'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 150,
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
            console.error('OpenAI API error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    buildPrompt(type) {
        const questionText = this.currentQuestion.text || 'Question text not available';
        const subject = this.currentQuestion.subject || 'unknown';
        
        let prompt = `SAT ${subject} question: "${questionText}"\n\n`;
        
        switch (type) {
            case 'hint':
                prompt += 'Provide a helpful hint to get started (don\'t give the answer):';
                break;
            case 'concept':
                prompt += 'Explain the key concept being tested:';
                break;
            case 'solution':
                prompt += 'Provide a step-by-step approach (guide, don\'t solve):';
                break;
        }
        
        return prompt;
    }

    setLoading(isLoading) {
        const buttons = this.querySelectorAll('.bonsai-btn');
        buttons.forEach(btn => {
            btn.disabled = isLoading;
            if (isLoading) {
                btn.style.opacity = '0.5';
            } else {
                btn.style.opacity = '1';
            }
        });
    }

    showAlert(message) {
        // Simple alert for now - could be enhanced with a custom modal
        alert(message);
    }

    openSettings() {
        // Open the extension options page
        chrome.runtime.sendMessage({ action: 'openSettings' });
    }
}

// Register the custom element
customElements.define('bonsai-sat-app', BonsaiSATApp);
console.log('Bonsai SAT: Simple component registered successfully');