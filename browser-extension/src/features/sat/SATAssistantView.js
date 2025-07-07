import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

export class SATAssistantView extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            color: var(--text-color);
        }

        .assistant-container {
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        .assistant-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--header-padding);
            background: var(--header-background);
            border-bottom: 1px solid var(--border-color);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
        }

        .assistant-title {
            font-size: var(--header-font-size);
            font-weight: 600;
            color: var(--text-color);
            display: flex;
            align-items: center;
            gap: var(--header-gap);
        }

        .bonsai-logo {
            width: var(--icon-size);
            height: var(--icon-size);
            background: linear-gradient(135deg, var(--bonsai-primary), var(--bonsai-accent));
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: 700;
            color: white;
        }

        .assistant-status {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 11px;
            color: var(--text-color);
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--bonsai-primary);
            animation: pulse 2s infinite;
        }

        .assistant-content {
            flex: 1;
            padding: var(--main-content-padding);
            overflow-y: auto;
            background: var(--main-content-background);
        }

        .no-question {
            text-align: center;
            padding: 24px;
            color: rgba(255, 255, 255, 0.6);
        }

        .no-question-icon {
            font-size: 32px;
            margin-bottom: 12px;
            opacity: 0.5;
        }

        .no-question-title {
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .no-question-description {
            font-size: 12px;
            line-height: 1.5;
            margin-bottom: 16px;
        }

        .platform-info {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 6px;
            font-size: 11px;
            margin-bottom: 16px;
        }

        .current-question {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color);
            border-radius: var(--content-border-radius);
            padding: 12px;
            margin-bottom: 16px;
        }

        .question-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        }

        .question-badges {
            display: flex;
            gap: 6px;
            flex-wrap: wrap;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            padding: 3px 8px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 500;
        }

        .subject-badge.math {
            background: rgba(59, 130, 246, 0.2);
            color: #93c5fd;
        }

        .subject-badge.reading {
            background: rgba(16, 185, 129, 0.2);
            color: #6ee7b7;
        }

        .subject-badge.writing {
            background: rgba(245, 158, 11, 0.2);
            color: #fbbf24;
        }

        .difficulty-badge.easy {
            background: rgba(34, 197, 94, 0.2);
            color: #86efac;
        }

        .difficulty-badge.medium {
            background: rgba(245, 158, 11, 0.2);
            color: #fbbf24;
        }

        .difficulty-badge.hard {
            background: rgba(239, 68, 68, 0.2);
            color: #fca5a5;
        }

        .platform-badge {
            background: rgba(139, 92, 246, 0.2);
            color: #c4b5fd;
        }

        .question-text {
            font-size: 12px;
            line-height: 1.5;
            margin: 12px 0;
            padding: 8px;
            background: rgba(0, 0, 0, 0.3);
            border-radius: 4px;
            border-left: 3px solid var(--bonsai-primary);
        }

        .help-sections {
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .help-section {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
            padding: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .help-section-header {
            display: flex;
            align-items: center;
            justify-content: between;
            gap: 8px;
            margin-bottom: 8px;
            cursor: pointer;
        }

        .help-section-title {
            font-size: 12px;
            font-weight: 600;
            color: var(--bonsai-primary);
            flex: 1;
        }

        .help-section-icon {
            font-size: 10px;
            color: var(--bonsai-primary);
            transition: transform 0.2s;
        }

        .help-section.collapsed .help-section-icon {
            transform: rotate(-90deg);
        }

        .help-section-content {
            font-size: 11px;
            line-height: 1.5;
            color: var(--text-color);
        }

        .help-section.collapsed .help-section-content {
            display: none;
        }

        .hint-list {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .hint-item {
            padding: 4px 0;
            display: flex;
            align-items: flex-start;
            gap: 6px;
        }

        .hint-icon {
            color: var(--bonsai-primary);
            font-size: 8px;
            margin-top: 3px;
        }

        .step-by-step {
            counter-reset: step-counter;
        }

        .step-item {
            counter-increment: step-counter;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            position: relative;
            padding-left: 24px;
        }

        .step-item:last-child {
            border-bottom: none;
        }

        .step-item::before {
            content: counter(step-counter);
            position: absolute;
            left: 0;
            top: 8px;
            width: 16px;
            height: 16px;
            background: var(--bonsai-primary);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 9px;
            font-weight: 600;
        }

        .assistant-actions {
            padding: 12px;
            border-top: 1px solid var(--border-color);
            background: var(--header-background);
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }

        .action-button {
            padding: 6px 12px;
            background: var(--button-background);
            border: 1px solid var(--button-border);
            border-radius: 6px;
            color: var(--text-color);
            font-size: 11px;
            cursor: pointer;
            transition: all var(--transition-fast);
            display: flex;
            align-items: center;
            gap: 4px;
        }

        .action-button:hover {
            background: var(--hover-background);
            border-color: var(--bonsai-primary);
            transform: translateY(-1px);
        }

        .action-button.primary {
            background: var(--bonsai-primary);
            border-color: var(--bonsai-primary);
            color: white;
        }

        .action-button.primary:hover {
            background: #059669;
        }

        .loading-state {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            gap: 8px;
        }

        .loading-spinner {
            width: 16px;
            height: 16px;
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-top-color: var(--bonsai-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }

        @keyframes spin {
            to { transform: rotate(360deg); }
        }

        .statistics {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
            margin-top: 16px;
        }

        .stat-item {
            background: rgba(255, 255, 255, 0.05);
            padding: 8px;
            border-radius: 6px;
            text-align: center;
        }

        .stat-value {
            font-size: 16px;
            font-weight: 600;
            color: var(--bonsai-primary);
        }

        .stat-label {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 2px;
        }
    `;

    static properties = {
        currentResponseIndex: { type: Number },
        selectedSubject: { type: String },
        selectedDifficulty: { type: String },
        selectedPlatform: { type: String },
        satData: { type: Object },
        currentQuestion: { type: Object },
        practiceStats: { type: Object },
        isLoading: { type: Boolean },
        collapsedSections: { type: Array }
    };

    constructor() {
        super();
        this.currentResponseIndex = -1;
        this.selectedSubject = 'math';
        this.selectedDifficulty = 'medium';
        this.selectedPlatform = 'unknown';
        this.satData = {
            questionAnalysis: [],
            conceptExplanations: [],
            stepByStepSolutions: [],
            practiceRecommendations: []
        };
        this.currentQuestion = null;
        this.practiceStats = {
            questionsAnswered: 0,
            correctAnswers: 0,
            timeSpent: 0,
            strongTopics: [],
            weakTopics: []
        };
        this.isLoading = false;
        this.collapsedSections = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('help-section-toggle', this.handleSectionToggle);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('help-section-toggle', this.handleSectionToggle);
    }

    handleSectionToggle(event) {
        const sectionId = event.detail.sectionId;
        if (this.collapsedSections.includes(sectionId)) {
            this.collapsedSections = this.collapsedSections.filter(id => id !== sectionId);
        } else {
            this.collapsedSections = [...this.collapsedSections, sectionId];
        }
    }

    toggleSection(sectionId) {
        this.dispatchEvent(new CustomEvent('help-section-toggle', {
            detail: { sectionId },
            bubbles: true
        }));
    }

    handleGetHint() {
        this.isLoading = true;
        
        // Simulate AI processing
        setTimeout(() => {
            this.isLoading = false;
            // Add hint to current question analysis
            if (this.currentQuestion) {
                this.dispatchEvent(new CustomEvent('hint-requested', {
                    detail: { question: this.currentQuestion },
                    bubbles: true
                }));
            }
        }, 1500);
    }

    handleExplainConcept() {
        this.isLoading = true;
        
        setTimeout(() => {
            this.isLoading = false;
            this.dispatchEvent(new CustomEvent('concept-explanation-requested', {
                detail: { question: this.currentQuestion },
                bubbles: true
            }));
        }, 2000);
    }

    handleShowSolution() {
        this.isLoading = true;
        
        setTimeout(() => {
            this.isLoading = false;
            this.dispatchEvent(new CustomEvent('solution-requested', {
                detail: { question: this.currentQuestion },
                bubbles: true
            }));
        }, 2500);
    }

    handlePracticeMore() {
        this.dispatchEvent(new CustomEvent('practice-requested', {
            detail: { 
                subject: this.selectedSubject,
                difficulty: this.selectedDifficulty 
            },
            bubbles: true
        }));
    }

    renderPlatformInfo() {
        const platformNames = {
            khan: 'Khan Academy',
            bluebook: 'Bluebook',
            collegeboard: 'College Board',
            satsuite: 'SAT Suite',
            apstudents: 'AP Students'
        };

        const platformName = platformNames[this.selectedPlatform] || 'Unknown Platform';

        return html`
            <div class="platform-info">
                <span>📚</span>
                <span>Connected to ${platformName}</span>
                <div class="status-dot"></div>
            </div>
        `;
    }

    renderNoQuestion() {
        return html`
            <div class="no-question">
                <div class="no-question-icon">🌱</div>
                <div class="no-question-title">Ready to Help!</div>
                <div class="no-question-description">
                    Navigate to a SAT question on supported platforms and I'll automatically detect it.
                    You can also use <strong>Ctrl+Shift+H</strong> for quick help.
                </div>
                ${this.renderPlatformInfo()}
                <div class="statistics">
                    <div class="stat-item">
                        <div class="stat-value">${this.practiceStats.questionsAnswered}</div>
                        <div class="stat-label">Questions Helped</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${Math.round((this.practiceStats.correctAnswers / Math.max(this.practiceStats.questionsAnswered, 1)) * 100)}%</div>
                        <div class="stat-label">Success Rate</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderCurrentQuestion() {
        if (!this.currentQuestion) return '';

        return html`
            <div class="current-question">
                <div class="question-header">
                    <div class="question-badges">
                        <span class="badge subject-badge ${this.currentQuestion.subject}">
                            ${this.currentQuestion.subject === 'math' ? '📐' : 
                              this.currentQuestion.subject === 'reading' ? '📖' : '✍️'}
                            ${this.currentQuestion.subject.toUpperCase()}
                        </span>
                        <span class="badge difficulty-badge ${this.currentQuestion.difficulty}">
                            ${this.currentQuestion.difficulty === 'easy' ? '🟢' : 
                              this.currentQuestion.difficulty === 'medium' ? '🟡' : '🔴'}
                            ${this.currentQuestion.difficulty}
                        </span>
                        <span class="badge platform-badge">
                            ${this.currentQuestion.platform}
                        </span>
                    </div>
                </div>
                
                ${this.currentQuestion.text ? html`
                    <div class="question-text">
                        ${this.currentQuestion.text.substring(0, 200)}${this.currentQuestion.text.length > 200 ? '...' : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderHelpSections() {
        return html`
            <div class="help-sections">
                ${this.renderHintsSection()}
                ${this.renderConceptSection()}
                ${this.renderSolutionSection()}
                ${this.renderPracticeSection()}
            </div>
        `;
    }

    renderHintsSection() {
        const isCollapsed = this.collapsedSections.includes('hints');
        
        return html`
            <div class="help-section ${isCollapsed ? 'collapsed' : ''}">
                <div class="help-section-header" @click=${() => this.toggleSection('hints')}>
                    <div class="help-section-title">💡 Smart Hints</div>
                    <div class="help-section-icon">▼</div>
                </div>
                <div class="help-section-content">
                    <ul class="hint-list">
                        <li class="hint-item">
                            <span class="hint-icon">•</span>
                            <span>Start by identifying what the question is asking for</span>
                        </li>
                        <li class="hint-item">
                            <span class="hint-icon">•</span>
                            <span>Look for key words that indicate the approach needed</span>
                        </li>
                        <li class="hint-item">
                            <span class="hint-icon">•</span>
                            <span>Consider what information is given vs. what you need to find</span>
                        </li>
                    </ul>
                </div>
            </div>
        `;
    }

    renderConceptSection() {
        const isCollapsed = this.collapsedSections.includes('concepts');
        
        return html`
            <div class="help-section ${isCollapsed ? 'collapsed' : ''}">
                <div class="help-section-header" @click=${() => this.toggleSection('concepts')}>
                    <div class="help-section-title">🧠 Key Concepts</div>
                    <div class="help-section-icon">▼</div>
                </div>
                <div class="help-section-content">
                    <p>Understanding the fundamental concepts behind this type of question will help you solve similar problems in the future.</p>
                </div>
            </div>
        `;
    }

    renderSolutionSection() {
        const isCollapsed = this.collapsedSections.includes('solution');
        
        return html`
            <div class="help-section ${isCollapsed ? 'collapsed' : ''}">
                <div class="help-section-header" @click=${() => this.toggleSection('solution')}>
                    <div class="help-section-title">📝 Step-by-Step Solution</div>
                    <div class="help-section-icon">▼</div>
                </div>
                <div class="help-section-content">
                    <div class="step-by-step">
                        <div class="step-item">Read the question carefully and identify what's being asked</div>
                        <div class="step-item">Identify the given information and variables</div>
                        <div class="step-item">Choose the appropriate method or formula</div>
                        <div class="step-item">Solve step by step, showing your work</div>
                        <div class="step-item">Check your answer and make sure it makes sense</div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPracticeSection() {
        const isCollapsed = this.collapsedSections.includes('practice');
        
        return html`
            <div class="help-section ${isCollapsed ? 'collapsed' : ''}">
                <div class="help-section-header" @click=${() => this.toggleSection('practice')}>
                    <div class="help-section-title">🎯 Practice Recommendations</div>
                    <div class="help-section-icon">▼</div>
                </div>
                <div class="help-section-content">
                    <p>Based on this question type, I recommend practicing:</p>
                    <ul class="hint-list">
                        <li class="hint-item">
                            <span class="hint-icon">•</span>
                            <span>Similar ${this.selectedSubject} problems at ${this.selectedDifficulty} difficulty</span>
                        </li>
                        <li class="hint-item">
                            <span class="hint-icon">•</span>
                            <span>Related concept review and exercises</span>
                        </li>
                    </ul>
                </div>
            </div>
        `;
    }

    renderActions() {
        if (this.isLoading) {
            return html`
                <div class="loading-state">
                    <div class="loading-spinner"></div>
                    <span>Analyzing question...</span>
                </div>
            `;
        }

        return html`
            <div class="assistant-actions">
                <button class="action-button primary" @click=${this.handleGetHint}>
                    💡 Get Hint
                </button>
                <button class="action-button" @click=${this.handleExplainConcept}>
                    🧠 Explain Concept
                </button>
                <button class="action-button" @click=${this.handleShowSolution}>
                    📝 Show Solution
                </button>
                <button class="action-button" @click=${this.handlePracticeMore}>
                    🎯 Practice More
                </button>
            </div>
        `;
    }

    render() {
        return html`
            <div class="assistant-container">
                <div class="assistant-header">
                    <div class="assistant-title">
                        <div class="bonsai-logo">🌱</div>
                        Bonsai SAT Assistant
                    </div>
                    <div class="assistant-status">
                        <span>Ready</span>
                        <div class="status-dot"></div>
                    </div>
                </div>

                <div class="assistant-content">
                    ${this.currentQuestion ? html`
                        ${this.renderCurrentQuestion()}
                        ${this.renderHelpSections()}
                    ` : this.renderNoQuestion()}
                </div>

                ${this.currentQuestion ? this.renderActions() : ''}
            </div>
        `;
    }
}

customElements.define('sat-assistant-view', SATAssistantView);