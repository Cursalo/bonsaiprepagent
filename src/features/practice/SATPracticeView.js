import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

export class SATPracticeView extends LitElement {
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

        .practice-header {
            text-align: center;
            margin-bottom: 24px;
            position: relative;
            z-index: 2;
        }

        .practice-title {
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 8px 0;
            background: linear-gradient(135deg, #ffffff, #f0f8ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .practice-subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
        }

        .subject-selector {
            display: flex;
            gap: 12px;
            justify-content: center;
            margin-bottom: 24px;
            flex-wrap: wrap;
        }

        .subject-button {
            background: rgba(255, 255, 255, 0.15);
            border: 2px solid rgba(255, 255, 255, 0.3);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }

        .subject-button:hover {
            background: rgba(255, 255, 255, 0.25);
            border-color: rgba(255, 255, 255, 0.5);
            transform: translateY(-2px);
        }

        .subject-button.active {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            border-color: #4CAF50;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
        }

        .practice-content {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .question-content {
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 20px;
            color: #f8f9fa;
        }

        .answer-choices {
            display: flex;
            flex-direction: column;
            gap: 12px;
            margin-bottom: 24px;
        }

        .choice-option {
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            padding: 16px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            color: #f8f9fa;
        }

        .choice-option:hover {
            background: rgba(255, 255, 255, 0.2);
            border-color: rgba(255, 255, 255, 0.4);
        }

        .choice-option.selected {
            background: linear-gradient(135deg, #2196F3, #1976D2);
            border-color: #2196F3;
            box-shadow: 0 4px 15px rgba(33, 150, 243, 0.4);
        }

        .choice-option.correct {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            border-color: #4CAF50;
        }

        .choice-option.incorrect {
            background: linear-gradient(135deg, #f44336, #d32f2f);
            border-color: #f44336;
        }

        .action-buttons {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
        }

        .action-button {
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
        }

        .action-button:hover {
            background: linear-gradient(135deg, #5a52ff, #4c46ff);
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(108, 99, 255, 0.4);
        }

        .action-button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
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

        .question-progress {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 16px;
            font-size: 14px;
            opacity: 0.9;
        }

        .progress-bar {
            width: 100px;
            height: 6px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            overflow: hidden;
        }

        .progress-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #45a049);
            transition: width 0.3s ease;
        }

        .no-questions {
            text-align: center;
            padding: 40px 20px;
            opacity: 0.8;
        }

        .no-questions-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }

        .explanation-panel {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
            border-left: 4px solid #4CAF50;
        }

        .explanation-title {
            font-weight: 600;
            margin-bottom: 12px;
            color: #4CAF50;
        }

        .explanation-content {
            line-height: 1.6;
            color: #f8f9fa;
        }

        @media (max-width: 768px) {
            :host {
                padding: 16px;
            }

            .practice-title {
                font-size: 24px;
            }

            .subject-selector {
                gap: 8px;
            }

            .subject-button {
                padding: 10px 16px;
                font-size: 12px;
            }

            .action-buttons {
                flex-direction: column;
            }
        }
    `;

    static properties = {
        subscriptionTier: { type: String },
        selectedSubject: { type: String },
        currentQuestion: { type: Object },
        questionIndex: { type: Number },
        totalQuestions: { type: Number },
        selectedAnswer: { type: String },
        showExplanation: { type: Boolean },
        isAnswered: { type: Boolean },
        practiceSession: { type: Object },
        subjects: { type: Array }
    };

    constructor() {
        super();
        this.subscriptionTier = localStorage.getItem('bonsai_subscription_tier') || 'free';
        this.selectedSubject = 'math';
        this.currentQuestion = null;
        this.questionIndex = 0;
        this.totalQuestions = 0;
        this.selectedAnswer = null;
        this.showExplanation = false;
        this.isAnswered = false;
        this.practiceSession = {
            correct: 0,
            incorrect: 0,
            questions: []
        };
        this.subjects = [
            { id: 'math', name: 'Math', icon: '📊' },
            { id: 'reading', name: 'Reading', icon: '📖' },
            { id: 'writing', name: 'Writing', icon: '✍️' },
            { id: 'mixed', name: 'Mixed', icon: '🎯' }
        ];

        this.loadPracticeQuestions();
    }

    async loadPracticeQuestions() {
        try {
            // In a real implementation, this would fetch from your API
            const mockQuestions = this.getMockQuestions(this.selectedSubject);
            this.practiceSession.questions = mockQuestions;
            this.totalQuestions = mockQuestions.length;
            this.currentQuestion = mockQuestions[0] || null;
            this.requestUpdate();
        } catch (error) {
            console.error('Failed to load practice questions:', error);
        }
    }

    getMockQuestions(subject) {
        const questions = {
            math: [
                {
                    id: 1,
                    subject: 'math',
                    content: 'If 3x + 7 = 22, what is the value of x?',
                    choices: [
                        { id: 'A', text: 'x = 3' },
                        { id: 'B', text: 'x = 5' },
                        { id: 'C', text: 'x = 7' },
                        { id: 'D', text: 'x = 9' }
                    ],
                    correctAnswer: 'B',
                    explanation: 'To solve 3x + 7 = 22, subtract 7 from both sides: 3x = 15. Then divide by 3: x = 5.'
                },
                {
                    id: 2,
                    subject: 'math',
                    content: 'What is the slope of the line passing through points (2, 3) and (6, 11)?',
                    choices: [
                        { id: 'A', text: '1' },
                        { id: 'B', text: '2' },
                        { id: 'C', text: '3' },
                        { id: 'D', text: '4' }
                    ],
                    correctAnswer: 'B',
                    explanation: 'Slope = (y₂ - y₁)/(x₂ - x₁) = (11 - 3)/(6 - 2) = 8/4 = 2'
                }
            ],
            reading: [
                {
                    id: 3,
                    subject: 'reading',
                    content: 'Based on the passage, the author\'s primary purpose is to:',
                    choices: [
                        { id: 'A', text: 'Persuade readers to take action' },
                        { id: 'B', text: 'Inform readers about a scientific discovery' },
                        { id: 'C', text: 'Entertain readers with a story' },
                        { id: 'D', text: 'Compare different viewpoints' }
                    ],
                    correctAnswer: 'B',
                    explanation: 'The passage focuses on presenting factual information about a recent scientific breakthrough, making this an informative text.'
                }
            ],
            writing: [
                {
                    id: 4,
                    subject: 'writing',
                    content: 'Which choice provides the most effective transition between paragraphs?',
                    choices: [
                        { id: 'A', text: 'However, this trend has unexpected consequences.' },
                        { id: 'B', text: 'In addition, many people agree.' },
                        { id: 'C', text: 'For example, consider the following.' },
                        { id: 'D', text: 'Nonetheless, the situation remains unclear.' }
                    ],
                    correctAnswer: 'A',
                    explanation: '"However" provides an effective contrast that logically connects the previous paragraph\'s positive outlook with the following paragraph\'s discussion of problems.'
                }
            ]
        };

        return questions[subject] || [];
    }

    handleSubjectChange(subjectId) {
        this.selectedSubject = subjectId;
        this.resetSession();
        this.loadPracticeQuestions();
    }

    handleAnswerSelect(choiceId) {
        if (this.isAnswered) return;
        this.selectedAnswer = choiceId;
        this.requestUpdate();
    }

    handleSubmitAnswer() {
        if (!this.selectedAnswer || this.isAnswered) return;

        this.isAnswered = true;
        const isCorrect = this.selectedAnswer === this.currentQuestion.correctAnswer;
        
        if (isCorrect) {
            this.practiceSession.correct++;
        } else {
            this.practiceSession.incorrect++;
        }

        // Show explanation after a brief delay
        setTimeout(() => {
            this.showExplanation = true;
            this.requestUpdate();
        }, 500);

        this.requestUpdate();
    }

    handleNextQuestion() {
        if (this.questionIndex < this.totalQuestions - 1) {
            this.questionIndex++;
            this.currentQuestion = this.practiceSession.questions[this.questionIndex];
            this.selectedAnswer = null;
            this.showExplanation = false;
            this.isAnswered = false;
            this.requestUpdate();
        }
    }

    handleGetHint() {
        // In a real implementation, this would call the Bonsai AI for a hint
        const event = new CustomEvent('request-hint', {
            detail: {
                question: this.currentQuestion,
                type: 'hint'
            },
            bubbles: true
        });
        this.dispatchEvent(event);
    }

    handleGetExplanation() {
        const event = new CustomEvent('request-explanation', {
            detail: {
                question: this.currentQuestion,
                type: 'explanation'
            },
            bubbles: true
        });
        this.dispatchEvent(event);
    }

    resetSession() {
        this.questionIndex = 0;
        this.selectedAnswer = null;
        this.showExplanation = false;
        this.isAnswered = false;
        this.practiceSession = {
            correct: 0,
            incorrect: 0,
            questions: []
        };
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

    canAccessFeature(feature) {
        const tierLimits = {
            free: { hints: 2, explanations: 1, questions: 5 },
            basic: { hints: 10, explanations: 5, questions: 50 },
            pro: { hints: -1, explanations: -1, questions: -1 },
            enterprise: { hints: -1, explanations: -1, questions: -1 }
        };

        const limits = tierLimits[this.subscriptionTier] || tierLimits.free;
        return limits[feature] === -1 || limits[feature] > 0;
    }

    renderSubjectSelector() {
        return html`
            <div class="subject-selector">
                ${this.subjects.map(subject => html`
                    <button 
                        class="subject-button ${this.selectedSubject === subject.id ? 'active' : ''}"
                        @click=${() => this.handleSubjectChange(subject.id)}
                    >
                        ${subject.icon} ${subject.name}
                    </button>
                `)}
            </div>
        `;
    }

    renderQuestion() {
        if (!this.currentQuestion) {
            return html`
                <div class="no-questions">
                    <div class="no-questions-icon">📝</div>
                    <h3>No questions available</h3>
                    <p>Please select a different subject or try again later.</p>
                </div>
            `;
        }

        const progress = ((this.questionIndex + 1) / this.totalQuestions) * 100;

        return html`
            <div class="practice-content">
                <div class="question-progress">
                    <span>Question ${this.questionIndex + 1} of ${this.totalQuestions}</span>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <span>Score: ${this.practiceSession.correct}/${this.practiceSession.correct + this.practiceSession.incorrect}</span>
                </div>

                <div class="question-content">
                    ${this.currentQuestion.content}
                </div>

                <div class="answer-choices">
                    ${this.currentQuestion.choices.map(choice => {
                        let choiceClass = 'choice-option';
                        if (this.selectedAnswer === choice.id) {
                            choiceClass += ' selected';
                        }
                        if (this.isAnswered) {
                            if (choice.id === this.currentQuestion.correctAnswer) {
                                choiceClass += ' correct';
                            } else if (this.selectedAnswer === choice.id && choice.id !== this.currentQuestion.correctAnswer) {
                                choiceClass += ' incorrect';
                            }
                        }

                        return html`
                            <div 
                                class="${choiceClass}"
                                @click=${() => this.handleAnswerSelect(choice.id)}
                            >
                                <strong>${choice.id}.</strong> ${choice.text}
                            </div>
                        `;
                    })}
                </div>

                ${this.showExplanation ? html`
                    <div class="explanation-panel">
                        <div class="explanation-title">Explanation</div>
                        <div class="explanation-content">${this.currentQuestion.explanation}</div>
                    </div>
                ` : ''}

                <div class="action-buttons">
                    ${!this.isAnswered ? html`
                        <button 
                            class="action-button"
                            @click=${this.handleSubmitAnswer}
                            ?disabled=${!this.selectedAnswer}
                        >
                            Submit Answer
                        </button>
                        ${this.canAccessFeature('hints') ? html`
                            <button 
                                class="action-button"
                                @click=${this.handleGetHint}
                            >
                                🔍 Get Hint
                            </button>
                        ` : ''}
                    ` : html`
                        ${this.questionIndex < this.totalQuestions - 1 ? html`
                            <button 
                                class="action-button"
                                @click=${this.handleNextQuestion}
                            >
                                Next Question →
                            </button>
                        ` : html`
                            <button 
                                class="action-button"
                                @click=${this.resetSession}
                            >
                                🔄 Start Over
                            </button>
                        `}
                        ${this.canAccessFeature('explanations') ? html`
                            <button 
                                class="action-button"
                                @click=${this.handleGetExplanation}
                            >
                                🧠 Ask Bonsai
                            </button>
                        ` : ''}
                    `}
                </div>
            </div>
        `;
    }

    render() {
        return html`
            <div class="subscription-tier tier-${this.subscriptionTier}">
                ${this.getTierDisplayName()}
            </div>

            <div class="practice-header">
                <h1 class="practice-title">SAT Practice</h1>
                <p class="practice-subtitle">Master your skills with targeted practice questions</p>
            </div>

            ${this.renderSubjectSelector()}
            ${this.renderQuestion()}
        `;
    }
}

customElements.define('sat-practice-view', SATPracticeView);