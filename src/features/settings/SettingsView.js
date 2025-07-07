import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

export class SettingsView extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: relative;
            overflow: hidden;
        }

        .settings-header {
            text-align: center;
            margin-bottom: 32px;
            position: relative;
            z-index: 2;
        }

        .settings-title {
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 8px 0;
            background: linear-gradient(135deg, #ffffff, #f0f8ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .settings-subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
        }

        .settings-section {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .section-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .section-title-icon {
            font-size: 24px;
        }

        .setting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .setting-item:last-child {
            border-bottom: none;
        }

        .setting-info {
            flex: 1;
        }

        .setting-label {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .setting-description {
            font-size: 14px;
            opacity: 0.8;
            line-height: 1.4;
        }

        .setting-control {
            margin-left: 16px;
        }

        .toggle-switch {
            position: relative;
            width: 60px;
            height: 30px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }

        .toggle-switch.active {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            border-color: #4CAF50;
        }

        .toggle-slider {
            position: absolute;
            top: 2px;
            left: 2px;
            width: 22px;
            height: 22px;
            background: white;
            border-radius: 50%;
            transition: transform 0.3s ease;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .toggle-switch.active .toggle-slider {
            transform: translateX(30px);
        }

        .select-dropdown {
            background: rgba(255, 255, 255, 0.15);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 10px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            min-width: 120px;
            backdrop-filter: blur(10px);
        }

        .select-dropdown:focus {
            outline: none;
            border-color: rgba(255, 255, 255, 0.5);
            background: rgba(255, 255, 255, 0.2);
        }

        .select-dropdown option {
            background: #333;
            color: white;
            padding: 8px 12px;
        }

        .subscription-section {
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05));
            border: 2px solid rgba(255, 255, 255, 0.2);
        }

        .current-plan {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            margin-bottom: 16px;
        }

        .plan-info {
            flex: 1;
        }

        .plan-name {
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 4px;
        }

        .plan-features {
            font-size: 14px;
            opacity: 0.9;
        }

        .plan-badge {
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .badge-free { background: #ff9800; color: white; }
        .badge-basic { background: #2196f3; color: white; }
        .badge-pro { background: #9c27b0; color: white; }
        .badge-enterprise { background: #4caf50; color: white; }

        .upgrade-button {
            background: linear-gradient(135deg, #6c63ff, #5a52ff);
            border: none;
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(108, 99, 255, 0.3);
            width: 100%;
            margin-top: 12px;
        }

        .upgrade-button:hover {
            background: linear-gradient(135deg, #5a52ff, #4c46ff);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(108, 99, 255, 0.4);
        }

        .danger-section {
            border-color: rgba(244, 67, 54, 0.5);
            background: rgba(244, 67, 54, 0.1);
        }

        .danger-button {
            background: linear-gradient(135deg, #f44336, #d32f2f);
            border: none;
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .danger-button:hover {
            background: linear-gradient(135deg, #d32f2f, #c62828);
            transform: translateY(-2px);
        }

        .ai-provider-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-top: 16px;
        }

        .provider-card {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 16px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: center;
        }

        .provider-card:hover {
            background: rgba(255, 255, 255, 0.15);
            border-color: rgba(255, 255, 255, 0.3);
        }

        .provider-card.selected {
            border-color: #4CAF50;
            background: rgba(76, 175, 80, 0.2);
        }

        .provider-logo {
            font-size: 32px;
            margin-bottom: 8px;
        }

        .provider-name {
            font-weight: 600;
            margin-bottom: 4px;
        }

        .provider-description {
            font-size: 12px;
            opacity: 0.8;
        }

        .notifications-list {
            margin-top: 16px;
        }

        .notification-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .notification-item:last-child {
            border-bottom: none;
        }

        .notification-info {
            flex: 1;
        }

        .notification-title {
            font-weight: 600;
            margin-bottom: 2px;
        }

        .notification-description {
            font-size: 12px;
            opacity: 0.8;
        }

        .subscription-tier {
            position: absolute;
            top: 20px;
            right: 20px;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(10px);
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .tier-free { color: #ff9800; }
        .tier-basic { color: #2196f3; }
        .tier-pro { color: #9c27b0; }
        .tier-enterprise { color: #4caf50; }

        @media (max-width: 768px) {
            :host {
                padding: 16px;
            }

            .settings-title {
                font-size: 24px;
            }

            .setting-item {
                flex-direction: column;
                align-items: flex-start;
                gap: 12px;
            }

            .setting-control {
                margin-left: 0;
                align-self: flex-end;
            }

            .ai-provider-grid {
                grid-template-columns: 1fr;
            }
        }
    `;

    static properties = {
        subscriptionTier: { type: String },
        settings: { type: Object },
        aiProvider: { type: String },
        notifications: { type: Object }
    };

    constructor() {
        super();
        this.subscriptionTier = localStorage.getItem('bonsai_subscription_tier') || 'free';
        this.aiProvider = localStorage.getItem('bonsai_ai_provider') || 'openai';
        
        this.settings = {
            notifications: {
                dailyReminders: true,
                achievementAlerts: true,
                weeklyProgress: false,
                streakReminders: true
            },
            study: {
                autoPlayExplanations: false,
                showHints: true,
                difficultQuestionsFirst: false,
                timeBasedSessions: true
            },
            privacy: {
                shareProgress: false,
                anonymousAnalytics: true,
                saveSearchHistory: true
            },
            accessibility: {
                highContrast: false,
                largerText: false,
                reducedMotion: false,
                screenReader: false
            }
        };

        this.notifications = {
            daily: { enabled: true, time: '18:00', title: 'Daily Practice Reminder', description: 'Time for your daily SAT practice!' },
            achievement: { enabled: true, title: 'Achievement Notifications', description: 'Get notified when you unlock achievements' },
            streak: { enabled: true, title: 'Streak Reminders', description: 'Don\'t break your practice streak!' },
            weekly: { enabled: false, title: 'Weekly Progress Report', description: 'Summary of your weekly progress' }
        };

        this.loadSettings();
    }

    async loadSettings() {
        try {
            const savedSettings = localStorage.getItem('bonsai_settings');
            if (savedSettings) {
                this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
            }
            
            const savedNotifications = localStorage.getItem('bonsai_notifications');
            if (savedNotifications) {
                this.notifications = { ...this.notifications, ...JSON.parse(savedNotifications) };
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    saveSettings() {
        localStorage.setItem('bonsai_settings', JSON.stringify(this.settings));
        localStorage.setItem('bonsai_notifications', JSON.stringify(this.notifications));
        localStorage.setItem('bonsai_ai_provider', this.aiProvider);
    }

    handleToggle(category, setting) {
        this.settings[category][setting] = !this.settings[category][setting];
        this.saveSettings();
        this.requestUpdate();
    }

    handleNotificationToggle(notificationType) {
        this.notifications[notificationType].enabled = !this.notifications[notificationType].enabled;
        this.saveSettings();
        this.requestUpdate();
    }

    handleAIProviderChange(provider) {
        this.aiProvider = provider;
        this.saveSettings();
        this.requestUpdate();
    }

    handleSelectChange(category, setting, value) {
        this.settings[category][setting] = value;
        this.saveSettings();
        this.requestUpdate();
    }

    handleUpgradeSubscription() {
        const event = new CustomEvent('upgrade-subscription', {
            detail: { currentTier: this.subscriptionTier },
            bubbles: true
        });
        this.dispatchEvent(event);
    }

    handleResetProgress() {
        if (confirm('Are you sure you want to reset all your progress? This action cannot be undone.')) {
            localStorage.removeItem('bonsai_progress');
            localStorage.removeItem('bonsai_level');
            localStorage.removeItem('bonsai_experience');
            
            const event = new CustomEvent('progress-reset', {
                bubbles: true
            });
            this.dispatchEvent(event);
        }
    }

    handleDeleteAccount() {
        if (confirm('Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone.')) {
            const event = new CustomEvent('delete-account', {
                bubbles: true
            });
            this.dispatchEvent(event);
        }
    }

    getTierDisplayName() {
        const tierNames = {
            free: 'Free',
            basic: 'Basic',
            pro: 'Pro',
            enterprise: 'Enterprise'
        };
        return tierNames[this.subscriptionTier] || 'Free';
    }

    getTierFeatures() {
        const features = {
            free: '5 AI interactions/day, Basic progress tracking',
            basic: '50 AI interactions/day, Advanced analytics',
            pro: 'Unlimited AI interactions, Priority support',
            enterprise: 'Everything + Team management, Custom features'
        };
        return features[this.subscriptionTier] || features.free;
    }

    renderSubscriptionSection() {
        return html`
            <div class="settings-section subscription-section">
                <div class="section-title">
                    <span class="section-title-icon">💎</span>
                    Subscription
                </div>
                
                <div class="current-plan">
                    <div class="plan-info">
                        <div class="plan-name">${this.getTierDisplayName()} Plan</div>
                        <div class="plan-features">${this.getTierFeatures()}</div>
                    </div>
                    <div class="plan-badge badge-${this.subscriptionTier}">
                        ${this.getTierDisplayName()}
                    </div>
                </div>

                ${this.subscriptionTier === 'free' ? html`
                    <button class="upgrade-button" @click=${this.handleUpgradeSubscription}>
                        🚀 Upgrade to unlock more features
                    </button>
                ` : ''}
            </div>
        `;
    }

    renderAIProviderSection() {
        const providers = [
            { id: 'openai', name: 'OpenAI GPT-4', logo: '🤖', description: 'Advanced reasoning and explanations' },
            { id: 'gemini', name: 'Google Gemini', logo: '💎', description: 'Multimodal AI with fast responses' }
        ];

        return html`
            <div class="settings-section">
                <div class="section-title">
                    <span class="section-title-icon">🧠</span>
                    AI Provider
                </div>
                
                <div class="ai-provider-grid">
                    ${providers.map(provider => html`
                        <div 
                            class="provider-card ${this.aiProvider === provider.id ? 'selected' : ''}"
                            @click=${() => this.handleAIProviderChange(provider.id)}
                        >
                            <div class="provider-logo">${provider.logo}</div>
                            <div class="provider-name">${provider.name}</div>
                            <div class="provider-description">${provider.description}</div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    renderNotificationSection() {
        return html`
            <div class="settings-section">
                <div class="section-title">
                    <span class="section-title-icon">🔔</span>
                    Notifications
                </div>
                
                <div class="notifications-list">
                    ${Object.entries(this.notifications).map(([key, notification]) => html`
                        <div class="notification-item">
                            <div class="notification-info">
                                <div class="notification-title">${notification.title}</div>
                                <div class="notification-description">${notification.description}</div>
                            </div>
                            <div class="setting-control">
                                <div 
                                    class="toggle-switch ${notification.enabled ? 'active' : ''}"
                                    @click=${() => this.handleNotificationToggle(key)}
                                >
                                    <div class="toggle-slider"></div>
                                </div>
                            </div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    renderStudyPreferences() {
        return html`
            <div class="settings-section">
                <div class="section-title">
                    <span class="section-title-icon">📚</span>
                    Study Preferences
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <div class="setting-label">Auto-play Explanations</div>
                        <div class="setting-description">Automatically show explanations after answering</div>
                    </div>
                    <div class="setting-control">
                        <div 
                            class="toggle-switch ${this.settings.study.autoPlayExplanations ? 'active' : ''}"
                            @click=${() => this.handleToggle('study', 'autoPlayExplanations')}
                        >
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <div class="setting-label">Show Hints</div>
                        <div class="setting-description">Display hint buttons during practice</div>
                    </div>
                    <div class="setting-control">
                        <div 
                            class="toggle-switch ${this.settings.study.showHints ? 'active' : ''}"
                            @click=${() => this.handleToggle('study', 'showHints')}
                        >
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <div class="setting-label">Difficult Questions First</div>
                        <div class="setting-description">Prioritize questions you struggle with</div>
                    </div>
                    <div class="setting-control">
                        <div 
                            class="toggle-switch ${this.settings.study.difficultQuestionsFirst ? 'active' : ''}"
                            @click=${() => this.handleToggle('study', 'difficultQuestionsFirst')}
                        >
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <div class="setting-label">Time-based Sessions</div>
                        <div class="setting-description">Track time spent on each question</div>
                    </div>
                    <div class="setting-control">
                        <div 
                            class="toggle-switch ${this.settings.study.timeBasedSessions ? 'active' : ''}"
                            @click=${() => this.handleToggle('study', 'timeBasedSessions')}
                        >
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderAccessibilitySection() {
        return html`
            <div class="settings-section">
                <div class="section-title">
                    <span class="section-title-icon">♿</span>
                    Accessibility
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <div class="setting-label">High Contrast Mode</div>
                        <div class="setting-description">Increase contrast for better visibility</div>
                    </div>
                    <div class="setting-control">
                        <div 
                            class="toggle-switch ${this.settings.accessibility.highContrast ? 'active' : ''}"
                            @click=${() => this.handleToggle('accessibility', 'highContrast')}
                        >
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <div class="setting-label">Larger Text</div>
                        <div class="setting-description">Increase font size for better readability</div>
                    </div>
                    <div class="setting-control">
                        <div 
                            class="toggle-switch ${this.settings.accessibility.largerText ? 'active' : ''}"
                            @click=${() => this.handleToggle('accessibility', 'largerText')}
                        >
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <div class="setting-label">Reduced Motion</div>
                        <div class="setting-description">Minimize animations and transitions</div>
                    </div>
                    <div class="setting-control">
                        <div 
                            class="toggle-switch ${this.settings.accessibility.reducedMotion ? 'active' : ''}"
                            @click=${() => this.handleToggle('accessibility', 'reducedMotion')}
                        >
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <div class="setting-label">Screen Reader Support</div>
                        <div class="setting-description">Enhanced support for screen readers</div>
                    </div>
                    <div class="setting-control">
                        <div 
                            class="toggle-switch ${this.settings.accessibility.screenReader ? 'active' : ''}"
                            @click=${() => this.handleToggle('accessibility', 'screenReader')}
                        >
                            <div class="toggle-slider"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderDataSection() {
        return html`
            <div class="settings-section danger-section">
                <div class="section-title">
                    <span class="section-title-icon">⚠️</span>
                    Data & Account
                </div>
                
                <div class="setting-item">
                    <div class="setting-info">
                        <div class="setting-label">Reset Progress</div>
                        <div class="setting-description">Clear all progress data and start over</div>
                    </div>
                    <div class="setting-control">
                        <button class="danger-button" @click=${this.handleResetProgress}>
                            Reset
                        </button>
                    </div>
                </div>

                <div class="setting-item">
                    <div class="setting-info">
                        <div class="setting-label">Delete Account</div>
                        <div class="setting-description">Permanently delete your account and all data</div>
                    </div>
                    <div class="setting-control">
                        <button class="danger-button" @click=${this.handleDeleteAccount}>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        return html`
            <div class="subscription-tier tier-${this.subscriptionTier}">
                ${this.getTierDisplayName()}
            </div>

            <div class="settings-header">
                <h1 class="settings-title">Settings</h1>
                <p class="settings-subtitle">Customize your Bonsai SAT experience</p>
            </div>

            ${this.renderSubscriptionSection()}
            ${this.renderAIProviderSection()}
            ${this.renderNotificationSection()}
            ${this.renderStudyPreferences()}
            ${this.renderAccessibilitySection()}
            ${this.renderDataSection()}
        `;
    }
}

customElements.define('settings-view', SettingsView);