import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

export class SATOnboardingView extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: 20px;
            color: #e5e5e7;
        }
        
        .onboarding-container {
            text-align: center;
        }
        
        .title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 16px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        
        .subtitle {
            font-size: 16px;
            opacity: 0.8;
            margin-bottom: 24px;
            line-height: 1.5;
        }
        
        .features {
            text-align: left;
            margin: 24px 0;
        }
        
        .feature {
            display: flex;
            align-items: center;
            margin: 12px 0;
            padding: 8px;
            border-radius: 8px;
            background: rgba(255, 255, 255, 0.05);
        }
        
        .feature-icon {
            margin-right: 12px;
            font-size: 18px;
        }
        
        .feature-text {
            font-size: 14px;
        }
        
        .continue-btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
        }
        
        .continue-btn:hover {
            transform: translateY(-1px);
        }
    `;

    render() {
        return html`
            <div class="onboarding-container">
                <div class="title">Welcome to Bonsai SAT Prep! 🌱</div>
                <div class="subtitle">
                    Your AI-powered SAT tutor that works directly on Khan Academy, 
                    College Board, and Bluebook platforms.
                </div>
                
                <div class="features">
                    <div class="feature">
                        <span class="feature-icon">🤖</span>
                        <span class="feature-text">Real-time question analysis and hints</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">📚</span>
                        <span class="feature-text">Step-by-step explanations for all subjects</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">⚡</span>
                        <span class="feature-text">Instant help with keyboard shortcuts</span>
                    </div>
                    <div class="feature">
                        <span class="feature-icon">📊</span>
                        <span class="feature-text">Track your progress and weak areas</span>
                    </div>
                </div>
                
                <button class="continue-btn" @click=${this.handleContinue}>
                    Get Started
                </button>
            </div>
        `;
    }

    handleContinue() {
        this.dispatchEvent(new CustomEvent('onboarding-complete'));
    }
}

customElements.define('sat-onboarding-view', SATOnboardingView);