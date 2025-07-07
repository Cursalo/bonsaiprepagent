import { html, css, LitElement } from '../assets/lit-core-2.7.4.min.js';
import { BonsaiTutorView } from '../features/tutor/BonsaiTutorView.js';
import { SATPracticeView } from '../features/practice/SATPracticeView.js';
import { OnboardingView } from '../features/onboarding/OnboardingView.js';
import { ProgressView } from '../features/progress/ProgressView.js';
import { SettingsView } from '../features/settings/SettingsView.js';

export class BonsaiSATApp extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            color: var(--text-color, #ffffff);
            background: transparent;
            border-radius: 12px;
            overflow: hidden;
        }

        .app-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
        }

        .glass-header {
            padding: 16px 20px;
            background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1));
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-shrink: 0;
        }

        .bonsai-logo {
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 600;
            font-size: 18px;
            color: #22c55e;
        }

        .bonsai-tree-icon {
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, #22c55e, #16a34a);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        }

        .subscription-badge {
            padding: 4px 12px;
            background: rgba(34, 197, 94, 0.2);
            border: 1px solid rgba(34, 197, 94, 0.3);
            border-radius: 16px;
            font-size: 12px;
            font-weight: 500;
            color: #22c55e;
        }

        .view-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            min-height: 0;
            opacity: 1;
            transform: translateY(0);
            transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .view-container.entering {
            opacity: 0;
            transform: translateY(20px);
        }

        .navigation-tabs {
            display: flex;
            padding: 0 20px;
            background: rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            gap: 4px;
        }

        .nav-tab {
            padding: 12px 16px;
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.7);
            cursor: pointer;
            border-radius: 8px 8px 0 0;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s ease;
            position: relative;
        }

        .nav-tab:hover {
            background: rgba(255, 255, 255, 0.1);
            color: rgba(255, 255, 255, 0.9);
        }

        .nav-tab.active {
            background: rgba(34, 197, 94, 0.2);
            color: #22c55e;
            border-bottom: 2px solid #22c55e;
        }

        .nav-tab.active::after {
            content: '';
            position: absolute;
            bottom: -1px;
            left: 0;
            right: 0;
            height: 2px;
            background: #22c55e;
        }

        .status-indicator {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            animation: pulse 2s infinite;
        }

        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
        }

        /* View-specific styles */
        bonsai-tutor-view,
        sat-practice-view,
        progress-view,
        settings-view,
        onboarding-view {
            display: block;
            width: 100%;
            flex: 1;
            min-height: 0;
        }

        .floating-controls {
            position: absolute;
            top: 20px;
            right: 20px;
            display: flex;
            gap: 8px;
            z-index: 1000;
        }

        .control-button {
            width: 32px;
            height: 32px;
            background: rgba(0, 0, 0, 0.7);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .control-button:hover {
            background: rgba(0, 0, 0, 0.9);
            border-color: rgba(255, 255, 255, 0.4);
        }

        .control-button svg {
            width: 16px;
            height: 16px;
            stroke: rgba(255, 255, 255, 0.9);
        }

        /* Growth animation for Bonsai tree */
        .bonsai-tree-icon.growing {
            animation: grow 0.8s ease-out;
        }

        @keyframes grow {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
            .glass-header {
                padding: 12px 16px;
            }

            .bonsai-logo {
                font-size: 16px;
            }

            .navigation-tabs {
                padding: 0 16px;
                overflow-x: auto;
                scrollbar-width: none;
                -ms-overflow-style: none;
            }

            .navigation-tabs::-webkit-scrollbar {
                display: none;
            }

            .nav-tab {
                padding: 10px 12px;
                font-size: 13px;
                white-space: nowrap;
            }
        }
    `;

    static properties = {
        currentView: { type: String },
        subscriptionTier: { type: String },
        isOnboarded: { type: Boolean },
        bonsaiLevel: { type: Number },
        currentStreak: { type: Number },
        studyMinutesToday: { type: Number },
        isMainViewVisible: { type: Boolean },
        userProgress: { type: Object },
        selectedSubject: { type: String },
        currentQuestion: { type: Object },
        isListening: { type: Boolean }
    };

    constructor() {
        super();
        
        // Initialize from localStorage or defaults
        this.isOnboarded = localStorage.getItem('bonsai_onboarded') === 'true';
        this.currentView = this.isOnboarded ? 'tutor' : 'onboarding';
        this.subscriptionTier = localStorage.getItem('bonsai_subscription_tier') || 'free';
        this.bonsaiLevel = parseInt(localStorage.getItem('bonsai_level')) || 1;
        this.currentStreak = parseInt(localStorage.getItem('bonsai_streak')) || 0;
        this.studyMinutesToday = parseInt(localStorage.getItem('bonsai_study_minutes_today')) || 0;
        this.isMainViewVisible = true;
        this.selectedSubject = localStorage.getItem('bonsai_selected_subject') || 'math';
        this.isListening = false;
        
        this.userProgress = {
            totalExperience: parseInt(localStorage.getItem('bonsai_total_experience')) || 0,
            questionsAnswered: parseInt(localStorage.getItem('bonsai_questions_answered')) || 0,
            correctAnswers: parseInt(localStorage.getItem('bonsai_correct_answers')) || 0,
            averageScore: parseFloat(localStorage.getItem('bonsai_average_score')) || 0
        };

        // Set up global Bonsai object
        window.bonsaiSAT = {
            sendMessage: this.handleAIMessage.bind(this),
            updateProgress: this.updateProgress.bind(this),
            trackStudyTime: this.trackStudyTime.bind(this),
            showQuestion: this.showQuestion.bind(this),
            completeOnboarding: this.completeOnboarding.bind(this)
        };
    }

    connectedCallback() {
        super.connectedCallback();
        
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            
            // IPC event listeners
            ipcRenderer.on('update-status', (_, status) => this.setStatus(status));
            ipcRenderer.on('show-view', (_, view) => {
                this.currentView = view;
                this.isMainViewVisible = true;
            });
            ipcRenderer.on('start-tutoring-session', () => {
                this.handleStartTutoring();
            });
            ipcRenderer.on('bonsai-growth', (_, data) => {
                this.handleBonsaiGrowth(data);
            });
            ipcRenderer.on('subscription-updated', (_, tier) => {
                this.subscriptionTier = tier;
                localStorage.setItem('bonsai_subscription_tier', tier);
            });
        }

        // Load user data on startup
        this.loadUserData();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.removeAllListeners('update-status');
            ipcRenderer.removeAllListeners('show-view');
            ipcRenderer.removeAllListeners('start-tutoring-session');
            ipcRenderer.removeAllListeners('bonsai-growth');
            ipcRenderer.removeAllListeners('subscription-updated');
        }
    }

    updated(changedProperties) {
        super.updated(changedProperties);
        
        if (changedProperties.has('isMainViewVisible') || changedProperties.has('currentView')) {
            this.requestWindowResize();
        }

        if (changedProperties.has('currentView') && window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.send('view-changed', this.currentView);

            // Add entering animation
            const viewContainer = this.shadowRoot?.querySelector('.view-container');
            if (viewContainer) {
                viewContainer.classList.add('entering');
                requestAnimationFrame(() => {
                    viewContainer.classList.remove('entering');
                });
            }
        }

        // Persist important data to localStorage
        if (changedProperties.has('bonsaiLevel')) {
            localStorage.setItem('bonsai_level', this.bonsaiLevel.toString());
        }
        if (changedProperties.has('currentStreak')) {
            localStorage.setItem('bonsai_streak', this.currentStreak.toString());
        }
        if (changedProperties.has('studyMinutesToday')) {
            localStorage.setItem('bonsai_study_minutes_today', this.studyMinutesToday.toString());
        }
        if (changedProperties.has('selectedSubject')) {
            localStorage.setItem('bonsai_selected_subject', this.selectedSubject);
        }
    }

    async loadUserData() {
        try {
            // In a real app, this would fetch from your API
            // For now, we'll use localStorage
            const savedData = {
                level: this.bonsaiLevel,
                streak: this.currentStreak,
                studyMinutes: this.studyMinutesToday,
                progress: this.userProgress
            };
            
            console.log('🌱 Bonsai SAT: User data loaded', savedData);
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    }

    requestWindowResize() {
        if (window.require) {
            const { ipcRenderer } = window.require('electron');
            ipcRenderer.invoke('resize-window', {
                isMainViewVisible: this.isMainViewVisible,
                view: this.currentView,
            });
        }
    }

    async handleAIMessage(message, context = {}) {
        try {
            console.log('🤖 Bonsai AI Message:', message);
            
            // Add SAT-specific context
            const satContext = {
                ...context,
                subject: this.selectedSubject,
                userLevel: this.bonsaiLevel,
                subscriptionTier: this.subscriptionTier,
                recentTopics: this.getRecentTopics()
            };

            // This would integrate with your AI service
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message,
                    context: satContext,
                    assistanceType: context.assistanceType || 'explanation'
                })
            });

            if (!response.ok) {
                throw new Error(`AI request failed: ${response.status}`);
            }

            const result = await response.json();
            
            // Update progress if experience was gained
            if (result.experienceGained) {
                this.updateProgress({
                    experience: result.experienceGained,
                    action: 'ai_interaction'
                });
            }

            return result;
        } catch (error) {
            console.error('AI message error:', error);
            return {
                success: false,
                error: error.message,
                message: 'Sorry, I encountered an error. Please try again.'
            };
        }
    }

    updateProgress(data) {
        const { experience = 0, action, subject } = data;
        
        // Update total experience
        this.userProgress.totalExperience += experience;
        localStorage.setItem('bonsai_total_experience', this.userProgress.totalExperience.toString());
        
        // Check for level up
        const newLevel = Math.floor(this.userProgress.totalExperience / 100) + 1;
        if (newLevel > this.bonsaiLevel) {
            this.bonsaiLevel = newLevel;
            this.handleBonsaiGrowth({ newLevel, experience });
        }

        // Track specific actions
        if (action === 'question_answered') {
            this.userProgress.questionsAnswered++;
            localStorage.setItem('bonsai_questions_answered', this.userProgress.questionsAnswered.toString());
            
            if (data.correct) {
                this.userProgress.correctAnswers++;
                localStorage.setItem('bonsai_correct_answers', this.userProgress.correctAnswers.toString());
                
                // Update average score
                this.userProgress.averageScore = (this.userProgress.correctAnswers / this.userProgress.questionsAnswered) * 100;
                localStorage.setItem('bonsai_average_score', this.userProgress.averageScore.toString());
            }
        }

        console.log('📊 Progress updated:', this.userProgress);
        this.requestUpdate();
    }

    trackStudyTime(minutes) {
        this.studyMinutesToday += minutes;
        
        // Check for daily streak
        const today = new Date().toDateString();
        const lastStudyDate = localStorage.getItem('bonsai_last_study_date');
        
        if (lastStudyDate !== today) {
            this.currentStreak++;
            localStorage.setItem('bonsai_last_study_date', today);
        }
    }

    showQuestion(question) {
        this.currentQuestion = question;
        if (this.currentView !== 'practice') {
            this.currentView = 'practice';
        }
        this.requestUpdate();
    }

    handleBonsaiGrowth(data) {
        const { newLevel, experience } = data;
        
        // Animate the tree icon
        const treeIcon = this.shadowRoot?.querySelector('.bonsai-tree-icon');
        if (treeIcon) {
            treeIcon.classList.add('growing');
            setTimeout(() => {
                treeIcon.classList.remove('growing');
            }, 800);
        }

        // Show level up notification
        if (newLevel > this.bonsaiLevel) {
            this.showNotification(`🌱 Bonsai grew to level ${newLevel}!`, 'success');
        }

        console.log('🌳 Bonsai growth:', data);
    }

    showNotification(message, type = 'info') {
        // In a real app, this would show a toast notification
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
    }

    getRecentTopics() {
        // Return recent study topics for context
        return JSON.parse(localStorage.getItem('bonsai_recent_topics') || '[]');
    }

    async handleStartTutoring() {
        if (this.currentView !== 'tutor') {
            this.currentView = 'tutor';
        }
        
        this.isListening = true;
        
        // Initialize AI tutoring session
        if (window.bonsaiSAT) {
            console.log('🎯 Starting Bonsai tutoring session');
        }
    }

    completeOnboarding(data) {
        this.isOnboarded = true;
        this.currentView = 'tutor';
        localStorage.setItem('bonsai_onboarded', 'true');
        
        // Store onboarding data
        if (data) {
            localStorage.setItem('bonsai_onboarding_data', JSON.stringify(data));
        }
        
        this.showNotification('Welcome to Bonsai SAT Prep! Let\'s start growing together! 🌱', 'success');
    }

    handleTabClick(view) {
        if (this.currentView !== view) {
            this.currentView = view;
        }
    }

    getTabLabel(view) {
        const labels = {
            tutor: '🤖 AI Tutor',
            practice: '📚 Practice',
            progress: '📊 Progress',
            settings: '⚙️ Settings'
        };
        return labels[view] || view;
    }

    isTabActive(view) {
        return this.currentView === view;
    }

    getSubscriptionDisplay() {
        const displays = {
            free: 'Free',
            basic: 'Basic',
            pro: 'Pro',
            enterprise: 'Enterprise'
        };
        return displays[this.subscriptionTier] || 'Free';
    }

    render() {
        if (!this.isOnboarded) {
            return html`
                <div class="app-container">
                    <onboarding-view 
                        @onboarding-complete=${(e) => this.completeOnboarding(e.detail)}>
                    </onboarding-view>
                </div>
            `;
        }

        return html`
            <div class="app-container">
                <!-- Header -->
                <div class="glass-header">
                    <div class="bonsai-logo">
                        <div class="bonsai-tree-icon">🌱</div>
                        <span>Bonsai SAT Prep</span>
                        <div class="status-indicator">
                            <div class="status-dot"></div>
                            <span>Level ${this.bonsaiLevel}</span>
                        </div>
                    </div>
                    
                    <div class="subscription-badge">
                        ${this.getSubscriptionDisplay()}
                    </div>
                </div>

                <!-- Navigation Tabs -->
                <div class="navigation-tabs">
                    <button 
                        class="nav-tab ${this.isTabActive('tutor') ? 'active' : ''}"
                        @click=${() => this.handleTabClick('tutor')}>
                        ${this.getTabLabel('tutor')}
                    </button>
                    <button 
                        class="nav-tab ${this.isTabActive('practice') ? 'active' : ''}"
                        @click=${() => this.handleTabClick('practice')}>
                        ${this.getTabLabel('practice')}
                    </button>
                    <button 
                        class="nav-tab ${this.isTabActive('progress') ? 'active' : ''}"
                        @click=${() => this.handleTabClick('progress')}>
                        ${this.getTabLabel('progress')}
                    </button>
                    <button 
                        class="nav-tab ${this.isTabActive('settings') ? 'active' : ''}"
                        @click=${() => this.handleTabClick('settings')}>
                        ${this.getTabLabel('settings')}
                    </button>
                </div>

                <!-- View Container -->
                <div class="view-container">
                    ${this.renderCurrentView()}
                </div>

                <!-- Floating Controls -->
                <div class="floating-controls">
                    <button class="control-button" @click=${this.handleStartTutoring} title="Start AI Tutoring">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polygon points="10,8 16,12 10,16 10,8"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    renderCurrentView() {
        switch (this.currentView) {
            case 'tutor':
                return html`<bonsai-tutor-view
                    .subscriptionTier=${this.subscriptionTier}
                    .bonsaiLevel=${this.bonsaiLevel}
                    .selectedSubject=${this.selectedSubject}
                    .userProgress=${this.userProgress}
                    .isListening=${this.isListening}
                    @subject-changed=${(e) => this.selectedSubject = e.detail}
                    @question-detected=${(e) => this.showQuestion(e.detail)}
                    @progress-update=${(e) => this.updateProgress(e.detail)}
                ></bonsai-tutor-view>`;
                
            case 'practice':
                return html`<sat-practice-view
                    .selectedSubject=${this.selectedSubject}
                    .currentQuestion=${this.currentQuestion}
                    .subscriptionTier=${this.subscriptionTier}
                    @progress-update=${(e) => this.updateProgress(e.detail)}
                    @subject-changed=${(e) => this.selectedSubject = e.detail}
                ></sat-practice-view>`;
                
            case 'progress':
                return html`<progress-view
                    .userProgress=${this.userProgress}
                    .bonsaiLevel=${this.bonsaiLevel}
                    .currentStreak=${this.currentStreak}
                    .studyMinutesToday=${this.studyMinutesToday}
                    .subscriptionTier=${this.subscriptionTier}
                ></progress-view>`;
                
            case 'settings':
                return html`<settings-view
                    .subscriptionTier=${this.subscriptionTier}
                    .selectedSubject=${this.selectedSubject}
                    @subscription-changed=${(e) => this.subscriptionTier = e.detail}
                    @subject-changed=${(e) => this.selectedSubject = e.detail}
                ></settings-view>`;
                
            default:
                return html`<div>Unknown view: ${this.currentView}</div>`;
        }
    }
}

customElements.define('bonsai-sat-app', BonsaiSATApp);