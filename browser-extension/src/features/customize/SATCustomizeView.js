import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

export class SATCustomizeView extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 100%;
            color: var(--text-color);
        }

        .customize-container {
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        .customize-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: var(--header-padding);
            background: var(--header-background);
            border-bottom: 1px solid var(--border-color);
        }

        .customize-title {
            font-size: var(--header-font-size);
            font-weight: 600;
            color: var(--text-color);
        }

        .back-button {
            padding: var(--header-icon-padding);
            background: transparent;
            border: 1px solid var(--border-color);
            border-radius: 4px;
            color: var(--icon-button-color);
            cursor: pointer;
            transition: all var(--transition-fast);
        }

        .back-button:hover {
            background: var(--hover-background);
        }

        .customize-content {
            flex: 1;
            padding: var(--main-content-padding);
            overflow-y: auto;
            background: var(--main-content-background);
        }

        .setting-section {
            margin-bottom: 24px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: 8px;
            padding: 16px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .setting-section-title {
            font-size: 13px;
            font-weight: 600;
            color: var(--bonsai-primary);
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .setting-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
        }

        .setting-row:last-child {
            margin-bottom: 0;
        }

        .setting-label {
            font-size: 12px;
            color: var(--text-color);
            flex: 1;
        }

        .setting-description {
            font-size: 10px;
            color: rgba(255, 255, 255, 0.6);
            margin-top: 2px;
        }

        .setting-control {
            min-width: 120px;
            text-align: right;
        }

        .setting-select {
            background: var(--input-background);
            border: 1px solid var(--border-color);
            border-radius: 6px;
            color: var(--text-color);
            font-size: 11px;
            padding: 6px 8px;
            width: 100%;
            cursor: pointer;
        }

        .setting-select:focus {
            outline: none;
            border-color: var(--bonsai-primary);
            box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.2);
        }

        .setting-toggle {
            position: relative;
            width: 40px;
            height: 20px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            cursor: pointer;
            transition: background-color 0.3s;
        }

        .setting-toggle.active {
            background: var(--bonsai-primary);
        }

        .setting-toggle::after {
            content: '';
            position: absolute;
            top: 2px;
            left: 2px;
            width: 16px;
            height: 16px;
            background: white;
            border-radius: 50%;
            transition: transform 0.3s;
        }

        .setting-toggle.active::after {
            transform: translateX(20px);
        }

        .setting-slider {
            width: 100%;
            height: 4px;
            border-radius: 2px;
            background: rgba(255, 255, 255, 0.2);
            outline: none;
            cursor: pointer;
        }

        .setting-slider::-webkit-slider-thumb {
            appearance: none;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--bonsai-primary);
            cursor: pointer;
        }

        .setting-slider::-moz-range-thumb {
            width: 16px;
            height: 16px;
            border-radius: 50%;
            background: var(--bonsai-primary);
            cursor: pointer;
            border: none;
        }

        .subject-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
            gap: 8px;
        }

        .subject-card {
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid transparent;
            border-radius: 8px;
            padding: 12px;
            text-align: center;
            cursor: pointer;
            transition: all var(--transition-fast);
        }

        .subject-card:hover {
            background: rgba(255, 255, 255, 0.08);
            border-color: var(--bonsai-primary);
        }

        .subject-card.selected {
            background: rgba(16, 185, 129, 0.2);
            border-color: var(--bonsai-primary);
        }

        .subject-icon {
            font-size: 24px;
            margin-bottom: 6px;
        }

        .subject-name {
            font-size: 11px;
            font-weight: 500;
            color: var(--text-color);
        }

        .difficulty-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
        }

        .difficulty-card {
            background: rgba(255, 255, 255, 0.05);
            border: 2px solid transparent;
            border-radius: 8px;
            padding: 8px;
            text-align: center;
            cursor: pointer;
            transition: all var(--transition-fast);
        }

        .difficulty-card:hover {
            background: rgba(255, 255, 255, 0.08);
        }

        .difficulty-card.selected {
            border-color: var(--bonsai-primary);
        }

        .difficulty-card.easy.selected {
            background: rgba(34, 197, 94, 0.2);
            border-color: #22c55e;
        }

        .difficulty-card.medium.selected {
            background: rgba(245, 158, 11, 0.2);
            border-color: #f59e0b;
        }

        .difficulty-card.hard.selected {
            background: rgba(239, 68, 68, 0.2);
            border-color: #ef4444;
        }

        .difficulty-indicator {
            font-size: 16px;
            margin-bottom: 4px;
        }

        .difficulty-name {
            font-size: 10px;
            font-weight: 500;
            color: var(--text-color);
        }

        .reset-section {
            border-top: 1px solid var(--border-color);
            padding-top: 16px;
            margin-top: 16px;
        }

        .reset-button {
            width: 100%;
            padding: 8px 16px;
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid rgba(239, 68, 68, 0.3);
            border-radius: 6px;
            color: #fca5a5;
            font-size: 11px;
            cursor: pointer;
            transition: all var(--transition-fast);
        }

        .reset-button:hover {
            background: rgba(239, 68, 68, 0.3);
            border-color: #ef4444;
        }

        .platform-status {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 6px;
            font-size: 11px;
        }

        .platform-status.supported {
            border-left: 3px solid var(--bonsai-success);
        }

        .platform-status.unsupported {
            border-left: 3px solid var(--bonsai-error);
        }
    `;

    static properties = {
        selectedSubject: { type: String },
        selectedDifficulty: { type: String },
        onSubjectChange: { type: Function },
        onDifficultyChange: { type: Function },
        autoDetect: { type: Boolean },
        voiceEnabled: { type: Boolean },
        notifications: { type: Boolean }
    };

    constructor() {
        super();
        this.selectedSubject = 'math';
        this.selectedDifficulty = 'medium';
        this.onSubjectChange = () => {};
        this.onDifficultyChange = () => {};
        this.autoDetect = true;
        this.voiceEnabled = false;
        this.notifications = true;
    }

    handleSubjectChange(subject) {
        this.selectedSubject = subject;
        this.onSubjectChange(subject);
        this.requestUpdate();
    }

    handleDifficultyChange(difficulty) {
        this.selectedDifficulty = difficulty;
        this.onDifficultyChange(difficulty);
        this.requestUpdate();
    }

    handleToggleChange(property, value) {
        this[property] = value;
        
        // Save setting
        chrome.runtime.sendMessage({
            action: 'saveSettings',
            settings: { [property]: value }
        });
        
        this.requestUpdate();
    }

    handleBackClick() {
        this.dispatchEvent(new CustomEvent('back-clicked', {
            bubbles: true
        }));
    }

    handleResetSettings() {
        // Reset to defaults
        this.selectedSubject = 'math';
        this.selectedDifficulty = 'medium';
        this.autoDetect = true;
        this.voiceEnabled = false;
        this.notifications = true;

        // Save defaults
        chrome.runtime.sendMessage({
            action: 'saveSettings',
            settings: {
                selectedSubject: 'math',
                selectedDifficulty: 'medium',
                autoDetect: true,
                voiceEnabled: false,
                notifications: true
            }
        });

        // Notify parent components
        this.onSubjectChange('math');
        this.onDifficultyChange('medium');

        this.requestUpdate();
    }

    renderSubjectSection() {
        const subjects = [
            { id: 'math', name: 'Math', icon: '📐' },
            { id: 'reading', name: 'Reading', icon: '📖' },
            { id: 'writing', name: 'Writing', icon: '✍️' }
        ];

        return html`
            <div class="setting-section">
                <div class="setting-section-title">
                    🎯 Subject Focus
                </div>
                <div class="subject-grid">
                    ${subjects.map(subject => html`
                        <div 
                            class="subject-card ${this.selectedSubject === subject.id ? 'selected' : ''}"
                            @click=${() => this.handleSubjectChange(subject.id)}
                        >
                            <div class="subject-icon">${subject.icon}</div>
                            <div class="subject-name">${subject.name}</div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    renderDifficultySection() {
        const difficulties = [
            { id: 'easy', name: 'Easy', indicator: '🟢' },
            { id: 'medium', name: 'Medium', indicator: '🟡' },
            { id: 'hard', name: 'Hard', indicator: '🔴' }
        ];

        return html`
            <div class="setting-section">
                <div class="setting-section-title">
                    ⚡ Difficulty Level
                </div>
                <div class="difficulty-grid">
                    ${difficulties.map(difficulty => html`
                        <div 
                            class="difficulty-card ${difficulty.id} ${this.selectedDifficulty === difficulty.id ? 'selected' : ''}"
                            @click=${() => this.handleDifficultyChange(difficulty.id)}
                        >
                            <div class="difficulty-indicator">${difficulty.indicator}</div>
                            <div class="difficulty-name">${difficulty.name}</div>
                        </div>
                    `)}
                </div>
            </div>
        `;
    }

    renderAssistanceSettings() {
        return html`
            <div class="setting-section">
                <div class="setting-section-title">
                    🤖 Assistance Settings
                </div>

                <div class="setting-row">
                    <div>
                        <div class="setting-label">Auto-detect Questions</div>
                        <div class="setting-description">Automatically detect SAT questions on supported platforms</div>
                    </div>
                    <div class="setting-control">
                        <div 
                            class="setting-toggle ${this.autoDetect ? 'active' : ''}"
                            @click=${() => this.handleToggleChange('autoDetect', !this.autoDetect)}
                        ></div>
                    </div>
                </div>

                <div class="setting-row">
                    <div>
                        <div class="setting-label">Voice Commands</div>
                        <div class="setting-description">Enable voice activation for Bonsai assistant</div>
                    </div>
                    <div class="setting-control">
                        <div 
                            class="setting-toggle ${this.voiceEnabled ? 'active' : ''}"
                            @click=${() => this.handleToggleChange('voiceEnabled', !this.voiceEnabled)}
                        ></div>
                    </div>
                </div>

                <div class="setting-row">
                    <div>
                        <div class="setting-label">Notifications</div>
                        <div class="setting-description">Show helpful notifications and tips</div>
                    </div>
                    <div class="setting-control">
                        <div 
                            class="setting-toggle ${this.notifications ? 'active' : ''}"
                            @click=${() => this.handleToggleChange('notifications', !this.notifications)}
                        ></div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPlatformStatus() {
        const currentPlatform = this.detectCurrentPlatform();
        const supportedPlatforms = [
            'Khan Academy',
            'College Board',
            'Bluebook',
            'SAT Suite',
            'AP Students'
        ];

        return html`
            <div class="setting-section">
                <div class="setting-section-title">
                    🌐 Platform Status
                </div>

                ${currentPlatform !== 'unknown' ? html`
                    <div class="platform-status supported">
                        <span>✅</span>
                        <span>Connected to ${currentPlatform}</span>
                    </div>
                ` : html`
                    <div class="platform-status unsupported">
                        <span>❌</span>
                        <span>Not on a supported platform</span>
                    </div>
                `}

                <div style="margin-top: 12px; font-size: 10px; color: rgba(255, 255, 255, 0.6);">
                    <strong>Supported platforms:</strong><br>
                    ${supportedPlatforms.join(', ')}
                </div>
            </div>
        `;
    }

    detectCurrentPlatform() {
        const hostname = window.location.hostname;
        
        if (hostname.includes('khanacademy.org')) return 'Khan Academy';
        if (hostname.includes('bluebook.collegeboard.org')) return 'Bluebook';
        if (hostname.includes('collegeboard.org')) return 'College Board';
        if (hostname.includes('satsuite.collegeboard.org')) return 'SAT Suite';
        if (hostname.includes('apstudents.collegeboard.org')) return 'AP Students';
        
        return 'unknown';
    }

    renderResetSection() {
        return html`
            <div class="setting-section">
                <div class="reset-section">
                    <button class="reset-button" @click=${this.handleResetSettings}>
                        🔄 Reset to Defaults
                    </button>
                </div>
            </div>
        `;
    }

    render() {
        return html`
            <div class="customize-container">
                <div class="customize-header">
                    <button class="back-button" @click=${this.handleBackClick}>
                        ← Back
                    </button>
                    <div class="customize-title">Customize Bonsai</div>
                    <div></div>
                </div>

                <div class="customize-content">
                    ${this.renderSubjectSection()}
                    ${this.renderDifficultySection()}
                    ${this.renderAssistanceSettings()}
                    ${this.renderPlatformStatus()}
                    ${this.renderResetSection()}
                </div>
            </div>
        `;
    }
}

customElements.define('sat-customize-view', SATCustomizeView);