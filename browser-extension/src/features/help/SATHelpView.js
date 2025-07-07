import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

export class SATHelpView extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: 20px;
            color: #e5e5e7;
        }
        
        .help-container {
            max-height: 500px;
            overflow-y: auto;
        }
        
        .title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
            text-align: center;
        }
        
        .section {
            margin-bottom: 24px;
        }
        
        .section-title {
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 12px;
            color: #667eea;
        }
        
        .help-item {
            margin: 8px 0;
            padding: 12px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            border-left: 3px solid #667eea;
        }
        
        .help-title {
            font-weight: 600;
            margin-bottom: 4px;
        }
        
        .help-desc {
            font-size: 14px;
            opacity: 0.8;
            line-height: 1.4;
        }
        
        .shortcut {
            display: inline-block;
            background: rgba(255, 255, 255, 0.1);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
            font-size: 12px;
        }
        
        .back-btn {
            width: 100%;
            background: rgba(255, 255, 255, 0.1);
            color: #e5e5e7;
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 10px;
            border-radius: 8px;
            font-size: 14px;
            cursor: pointer;
            margin-top: 16px;
            transition: background 0.2s ease;
        }
        
        .back-btn:hover {
            background: rgba(255, 255, 255, 0.15);
        }
    `;

    render() {
        return html`
            <div class="help-container">
                <div class="title">Bonsai SAT Prep Help 🌱</div>
                
                <div class="section">
                    <div class="section-title">Getting Started</div>
                    <div class="help-item">
                        <div class="help-title">Automatic Question Detection</div>
                        <div class="help-desc">
                            Bonsai automatically detects SAT questions on supported platforms 
                            and provides contextual help when you need it.
                        </div>
                    </div>
                    <div class="help-item">
                        <div class="help-title">Instant Help</div>
                        <div class="help-desc">
                            Click on any question to get AI-powered explanations, hints, 
                            and step-by-step solutions tailored to your learning level.
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Keyboard Shortcuts</div>
                    <div class="help-item">
                        <div class="help-title">Toggle Assistant</div>
                        <div class="help-desc">
                            <span class="shortcut">Ctrl+Shift+B</span> (or <span class="shortcut">Cmd+Shift+B</span> on Mac)
                            - Show or hide the Bonsai assistant
                        </div>
                    </div>
                    <div class="help-item">
                        <div class="help-title">Quick Help</div>
                        <div class="help-desc">
                            <span class="shortcut">Ctrl+Shift+H</span> (or <span class="shortcut">Cmd+Shift+H</span> on Mac)
                            - Get instant help for the current question
                        </div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Supported Platforms</div>
                    <div class="help-item">
                        <div class="help-title">Khan Academy</div>
                        <div class="help-desc">SAT practice tests and individual questions</div>
                    </div>
                    <div class="help-item">
                        <div class="help-title">College Board</div>
                        <div class="help-desc">Official SAT practice materials and tests</div>
                    </div>
                    <div class="help-item">
                        <div class="help-title">Bluebook</div>
                        <div class="help-desc">Digital SAT testing environment</div>
                    </div>
                </div>
                
                <div class="section">
                    <div class="section-title">Features</div>
                    <div class="help-item">
                        <div class="help-title">Smart Question Analysis</div>
                        <div class="help-desc">
                            Automatically identifies question type, subject area, and difficulty level
                        </div>
                    </div>
                    <div class="help-item">
                        <div class="help-title">Personalized Hints</div>
                        <div class="help-desc">
                            Get hints that match your current understanding and progress level
                        </div>
                    </div>
                    <div class="help-item">
                        <div class="help-title">Progress Tracking</div>
                        <div class="help-desc">
                            Monitor your improvement across different SAT subject areas
                        </div>
                    </div>
                </div>
                
                <button class="back-btn" @click=${this.handleBack}>
                    ← Back to Assistant
                </button>
            </div>
        `;
    }

    handleBack() {
        this.dispatchEvent(new CustomEvent('back-click'));
    }
}

customElements.define('sat-help-view', SATHelpView);