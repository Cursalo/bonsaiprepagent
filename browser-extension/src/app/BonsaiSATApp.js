import { html, css, LitElement } from '../assets/lit-core-2.7.4.min.js';
import { SATCustomizeView } from '../features/customize/SATCustomizeView.js';
import { SATAssistantView } from '../features/sat/SATAssistantView.js';
import { SATOnboardingView } from '../features/onboarding/SATOnboardingView.js';
import { SATHelpView } from '../features/help/SATHelpView.js';

import '../features/sat/renderer.js';

export class BonsaiSATApp extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            color: var(--text-color);
            background: transparent;
            border-radius: 7px;
        }

        sat-assistant-view {
            display: block;
            width: 100%;
        }

        sat-customize-view, sat-help-view, sat-onboarding-view {
            display: block;
            width: 100%;
        }
    `;

    static properties = {
        currentView: { type: String },
        statusText: { type: String },
        startTime: { type: Number },
        currentResponseIndex: { type: Number },
        isMainViewVisible: { type: Boolean },
        selectedDifficulty: { type: String },
        selectedSubject: { type: String },
        selectedPlatform: { type: String },
        isClickThrough: { type: Boolean, state: true },
        layoutMode: { type: String },
        _viewInstances: { type: Object, state: true },
        _isClickThrough: { state: true },
        satData: { type: Object },
        currentQuestion: { type: Object },
        practiceStats: { type: Object }
    };

    constructor() {
        super();
        const urlParams = new URLSearchParams(window.location.search);
        this.currentView = urlParams.get('view') || 'assist';
        this.currentResponseIndex = -1;
        
        // SAT-specific settings
        this.selectedDifficulty = localStorage.getItem('selectedDifficulty') || 'medium';
        this.selectedSubject = localStorage.getItem('selectedSubject') || 'math';
        this.selectedPlatform = this.detectCurrentPlatform();
        
        this._isClickThrough = false;
        this.satData = {
            questionAnalysis: [],
            conceptExplanations: [],
            stepByStepSolutions: [],
            practiceRecommendations: []
        };
        this.practiceStats = {
            questionsAnswered: 0,
            correctAnswers: 0,
            timeSpent: 0,
            strongTopics: [],
            weakTopics: []
        };

        // Initialize Bonsai SAT functions
        window.bonsaiSAT = window.bonsaiSAT || {};
        window.bonsaiSAT.setSATData = data => {
            this.updateSATData(data);
        };
        window.bonsaiSAT.analyzeQuestion = question => {
            this.analyzeCurrentQuestion(question);
        };
    }

    detectCurrentPlatform() {
        const hostname = window.location.hostname;
        if (hostname.includes('khanacademy.org')) return 'khan';
        if (hostname.includes('collegeboard.org')) return 'collegeboard';
        if (hostname.includes('bluebook.collegeboard.org')) return 'bluebook';
        return 'unknown';
    }

    connectedCallback() {
        super.connectedCallback();
        
        // Listen for messages from content script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            if (message.action === 'questionDetected') {
                this.handleQuestionDetected(message.question);
            } else if (message.action === 'updateStats') {
                this.updatePracticeStats(message.stats);
            } else if (message.action === 'toggleView') {
                this.toggleMainView();
            }
            sendResponse({ success: true });
        });

        // Auto-detect questions on supported platforms
        if (this.selectedPlatform !== 'unknown') {
            this.initializeQuestionDetection();
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        chrome.runtime.onMessage.removeListener();
    }

    updated(changedProperties) {
        if (changedProperties.has('isMainViewVisible') || changedProperties.has('currentView')) {
            this.requestUpdate();
        }

        if (changedProperties.has('currentView')) {
            const viewContainer = this.shadowRoot?.querySelector('.view-container');
            if (viewContainer) {
                viewContainer.classList.add('entering');
                requestAnimationFrame(() => {
                    viewContainer.classList.remove('entering');
                });
            }
        }

        // Save SAT-specific settings
        if (changedProperties.has('selectedDifficulty')) {
            localStorage.setItem('selectedDifficulty', this.selectedDifficulty);
        }
        if (changedProperties.has('selectedSubject')) {
            localStorage.setItem('selectedSubject', this.selectedSubject);
        }
    }

    async handleAssistClick() {
        // Initialize AI assistance for SAT
        if (window.bonsaiSAT) {
            await window.bonsaiSAT.initializeAI(this.selectedSubject, this.selectedDifficulty);
            window.bonsaiSAT.startAssistance(this.selectedPlatform);
        }

        // Clear previous analysis
        this.satData = {
            questionAnalysis: [],
            conceptExplanations: [],
            stepByStepSolutions: [],
            practiceRecommendations: []
        };

        this.currentResponseIndex = -1;
        this.startTime = Date.now();
        this.currentView = 'assist';
        this.isMainViewVisible = true;
    }

    handleQuestionDetected(question) {
        console.log('SAT Question detected:', question);
        this.currentQuestion = question;
        
        // Analyze the question using AI
        if (window.bonsaiSAT && window.bonsaiSAT.analyzeQuestion) {
            window.bonsaiSAT.analyzeQuestion(question);
        }
    }

    analyzeCurrentQuestion(question) {
        // This would connect to the AI service to analyze SAT questions
        console.log('Analyzing SAT question:', question);
        
        // Example analysis structure
        const analysis = {
            type: question.type || 'multiple-choice',
            subject: question.subject || this.selectedSubject,
            difficulty: question.difficulty || this.selectedDifficulty,
            concepts: question.concepts || [],
            hints: [],
            solution: null,
            explanation: null
        };

        this.updateSATData({
            questionAnalysis: [analysis, ...this.satData.questionAnalysis]
        });
    }

    updateSATData(data) {
        console.log('📝 BonsaiSATApp updateSATData:', data);
        this.satData = { ...this.satData, ...data };
        this.requestUpdate();
        
        const assistantView = this.shadowRoot?.querySelector('sat-assistant-view');
        if (assistantView) {
            assistantView.satData = this.satData;
            console.log('✅ SAT data passed to AssistantView');
        }
    }

    updatePracticeStats(stats) {
        this.practiceStats = { ...this.practiceStats, ...stats };
        this.requestUpdate();
    }

    toggleMainView() {
        this.isMainViewVisible = !this.isMainViewVisible;
    }

    initializeQuestionDetection() {
        // Platform-specific question detection
        switch (this.selectedPlatform) {
            case 'khan':
                this.initializeKhanAcademyDetection();
                break;
            case 'collegeboard':
                this.initializeCollegeBoardDetection();
                break;
            case 'bluebook':
                this.initializeBluebookDetection();
                break;
        }
    }

    initializeKhanAcademyDetection() {
        console.log('Initializing Khan Academy SAT question detection');
        // Khan Academy specific selectors and logic
    }

    initializeCollegeBoardDetection() {
        console.log('Initializing College Board SAT question detection');
        // College Board specific selectors and logic
    }

    initializeBluebookDetection() {
        console.log('Initializing Bluebook SAT question detection');
        // Bluebook specific selectors and logic
    }

    handleCustomizeClick() {
        this.currentView = 'customize';
        this.isMainViewVisible = true;
    }

    handleHelpClick() {
        this.currentView = 'help';
        this.isMainViewVisible = true;
    }

    handleBackClick() {
        this.currentView = 'assist';
    }

    handleResponseIndexChanged(e) {
        this.currentResponseIndex = e.detail.index;
    }

    handleOnboardingComplete() {
        this.currentView = 'assist';
    }

    render() {
        switch (this.currentView) {
            case 'assist':
                return html`<sat-assistant-view
                    .currentResponseIndex=${this.currentResponseIndex}
                    .selectedSubject=${this.selectedSubject}
                    .selectedDifficulty=${this.selectedDifficulty}
                    .selectedPlatform=${this.selectedPlatform}
                    .satData=${this.satData}
                    .currentQuestion=${this.currentQuestion}
                    .practiceStats=${this.practiceStats}
                    @response-index-changed=${e => (this.currentResponseIndex = e.detail.index)}
                ></sat-assistant-view>`;
            case 'customize':
                return html`<sat-customize-view
                    .selectedSubject=${this.selectedSubject}
                    .selectedDifficulty=${this.selectedDifficulty}
                    .onSubjectChange=${subject => (this.selectedSubject = subject)}
                    .onDifficultyChange=${difficulty => (this.selectedDifficulty = difficulty)}
                ></sat-customize-view>`;
            case 'help':
                return html`<sat-help-view></sat-help-view>`;
            case 'onboarding':
                return html`<sat-onboarding-view
                    @onboarding-complete=${this.handleOnboardingComplete}
                ></sat-onboarding-view>`;
            default:
                return html`<div>Unknown view: ${this.currentView}</div>`;
        }
    }
}

customElements.define('bonsai-sat-app', BonsaiSATApp);