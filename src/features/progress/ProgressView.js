import { html, css, LitElement } from '../../assets/lit-core-2.7.4.min.js';

export class ProgressView extends LitElement {
    static styles = css`
        :host {
            display: block;
            width: 100%;
            padding: 20px;
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            position: relative;
            overflow: hidden;
        }

        .progress-header {
            text-align: center;
            margin-bottom: 32px;
            position: relative;
            z-index: 2;
        }

        .progress-title {
            font-size: 32px;
            font-weight: 700;
            margin: 0 0 8px 0;
            background: linear-gradient(135deg, #ffffff, #f0f8ff);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .progress-subtitle {
            font-size: 16px;
            opacity: 0.9;
            margin: 0;
        }

        .bonsai-growth-section {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 24px;
            backdrop-filter: blur(15px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            text-align: center;
        }

        .bonsai-tree {
            font-size: 80px;
            margin-bottom: 16px;
            filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
        }

        .bonsai-level {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .bonsai-experience {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 16px;
        }

        .experience-bar {
            width: 200px;
            height: 8px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4px;
            overflow: hidden;
            position: relative;
        }

        .experience-fill {
            height: 100%;
            background: linear-gradient(90deg, #4CAF50, #8BC34A);
            border-radius: 4px;
            transition: width 0.5s ease;
            position: relative;
        }

        .experience-fill::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            animation: shimmer 2s infinite;
        }

        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }

        .experience-text {
            font-size: 14px;
            font-weight: 600;
            min-width: 80px;
        }

        .achievements-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .achievement-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
        }

        .achievement-card:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateY(-2px);
        }

        .achievement-card.unlocked {
            border-color: #4CAF50;
            box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
        }

        .achievement-icon {
            font-size: 32px;
            margin-bottom: 8px;
            display: block;
        }

        .achievement-card.locked .achievement-icon {
            filter: grayscale(100%);
            opacity: 0.5;
        }

        .achievement-title {
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 4px;
        }

        .achievement-description {
            font-size: 10px;
            opacity: 0.8;
            line-height: 1.3;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 16px;
            margin-bottom: 24px;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .stat-title {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .stat-value {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 4px;
            background: linear-gradient(135deg, #fff, #e3f2fd);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }

        .stat-change {
            font-size: 12px;
            font-weight: 600;
        }

        .stat-change.positive {
            color: #4CAF50;
        }

        .stat-change.negative {
            color: #f44336;
        }

        .subject-breakdown {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            margin-bottom: 24px;
        }

        .breakdown-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            text-align: center;
        }

        .subject-progress {
            margin-bottom: 16px;
        }

        .subject-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .subject-name {
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .subject-score {
            font-size: 14px;
            font-weight: 600;
        }

        .subject-bar {
            width: 100%;
            height: 6px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
            overflow: hidden;
        }

        .subject-fill {
            height: 100%;
            border-radius: 3px;
            transition: width 0.5s ease;
        }

        .fill-math { background: linear-gradient(90deg, #2196F3, #1976D2); }
        .fill-reading { background: linear-gradient(90deg, #FF9800, #F57C00); }
        .fill-writing { background: linear-gradient(90deg, #9C27B0, #7B1FA2); }

        .recent-activity {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .activity-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            text-align: center;
        }

        .activity-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .activity-item:last-child {
            border-bottom: none;
        }

        .activity-icon {
            font-size: 20px;
            width: 32px;
            text-align: center;
        }

        .activity-content {
            flex: 1;
        }

        .activity-description {
            font-size: 14px;
            margin-bottom: 2px;
        }

        .activity-time {
            font-size: 12px;
            opacity: 0.7;
        }

        .activity-points {
            font-size: 12px;
            font-weight: 600;
            color: #4CAF50;
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

            .progress-title {
                font-size: 24px;
            }

            .bonsai-tree {
                font-size: 60px;
            }

            .experience-bar {
                width: 150px;
            }

            .achievements-grid {
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            }

            .stats-grid {
                grid-template-columns: 1fr;
            }
        }
    `;

    static properties = {
        subscriptionTier: { type: String },
        bonsaiLevel: { type: Number },
        bonsaiExperience: { type: Number },
        nextLevelXP: { type: Number },
        achievements: { type: Array },
        stats: { type: Object },
        subjectProgress: { type: Object },
        recentActivity: { type: Array }
    };

    constructor() {
        super();
        this.subscriptionTier = localStorage.getItem('bonsai_subscription_tier') || 'free';
        this.bonsaiLevel = parseInt(localStorage.getItem('bonsai_level')) || 1;
        this.bonsaiExperience = parseInt(localStorage.getItem('bonsai_experience')) || 0;
        this.nextLevelXP = this.calculateNextLevelXP(this.bonsaiLevel);
        
        this.achievements = [
            { id: 'first_question', icon: '🌱', title: 'First Steps', description: 'Answer your first question', unlocked: true },
            { id: 'math_master', icon: '📊', title: 'Math Master', description: 'Score 80%+ on 10 math questions', unlocked: false },
            { id: 'reading_expert', icon: '📚', title: 'Reading Expert', description: 'Score 90%+ on reading passage', unlocked: true },
            { id: 'writing_wizard', icon: '✍️', title: 'Writing Wizard', description: 'Perfect score on writing section', unlocked: false },
            { id: 'streak_warrior', icon: '🔥', title: 'Streak Warrior', description: '7-day practice streak', unlocked: false },
            { id: 'bonsai_master', icon: '🎋', title: 'Bonsai Master', description: 'Reach level 10', unlocked: false }
        ];

        this.stats = {
            totalQuestions: 147,
            correctAnswers: 118,
            currentStreak: 3,
            bestStreak: 7,
            studyTime: 1240, // minutes
            averageScore: 82
        };

        this.subjectProgress = {
            math: { score: 78, total: 56, correct: 44 },
            reading: { score: 85, total: 42, correct: 36 },
            writing: { score: 89, total: 49, correct: 44 }
        };

        this.recentActivity = [
            {
                type: 'question_correct',
                icon: '✅',
                description: 'Answered math question correctly',
                time: '5 minutes ago',
                points: '+10 XP'
            },
            {
                type: 'achievement',
                icon: '🏆',
                description: 'Unlocked "Reading Expert" achievement',
                time: '1 hour ago',
                points: '+50 XP'
            },
            {
                type: 'level_up',
                icon: '🌟',
                description: 'Leveled up to Bonsai Level 3!',
                time: '2 hours ago',
                points: '+100 XP'
            },
            {
                type: 'practice_session',
                icon: '📝',
                description: 'Completed writing practice session',
                time: '1 day ago',
                points: '+25 XP'
            }
        ];

        this.loadProgressData();
    }

    async loadProgressData() {
        try {
            // In a real implementation, this would fetch from your API
            const savedProgress = localStorage.getItem('bonsai_progress');
            if (savedProgress) {
                const progress = JSON.parse(savedProgress);
                this.updateProgressData(progress);
            }
        } catch (error) {
            console.error('Failed to load progress data:', error);
        }
    }

    updateProgressData(data) {
        if (data.bonsaiLevel) this.bonsaiLevel = data.bonsaiLevel;
        if (data.bonsaiExperience) this.bonsaiExperience = data.bonsaiExperience;
        if (data.achievements) this.achievements = data.achievements;
        if (data.stats) this.stats = { ...this.stats, ...data.stats };
        if (data.subjectProgress) this.subjectProgress = { ...this.subjectProgress, ...data.subjectProgress };
        
        this.nextLevelXP = this.calculateNextLevelXP(this.bonsaiLevel);
        this.requestUpdate();
    }

    calculateNextLevelXP(level) {
        // Exponential growth: level^2 * 100
        return Math.pow(level + 1, 2) * 100;
    }

    getBonsaiTreeIcon() {
        if (this.bonsaiLevel >= 10) return '🎋'; // Mature bamboo
        if (this.bonsaiLevel >= 7) return '🌳'; // Full tree
        if (this.bonsaiLevel >= 5) return '🌲'; // Growing tree
        if (this.bonsaiLevel >= 3) return '🌿'; // Plant with leaves
        if (this.bonsaiLevel >= 2) return '🌱'; // Sprouting plant
        return '🌾'; // Seedling
    }

    getAccuracyPercentage() {
        if (this.stats.totalQuestions === 0) return 0;
        return Math.round((this.stats.correctAnswers / this.stats.totalQuestions) * 100);
    }

    getStudyTimeFormatted() {
        const hours = Math.floor(this.stats.studyTime / 60);
        const minutes = this.stats.studyTime % 60;
        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
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

    renderBonsaiGrowth() {
        const experienceProgress = (this.bonsaiExperience / this.nextLevelXP) * 100;

        return html`
            <div class="bonsai-growth-section">
                <div class="bonsai-tree">${this.getBonsaiTreeIcon()}</div>
                <div class="bonsai-level">Level ${this.bonsaiLevel} Bonsai</div>
                <div class="bonsai-experience">
                    <span class="experience-text">${this.bonsaiExperience} XP</span>
                    <div class="experience-bar">
                        <div class="experience-fill" style="width: ${experienceProgress}%"></div>
                    </div>
                    <span class="experience-text">${this.nextLevelXP} XP</span>
                </div>
                <div style="font-size: 14px; opacity: 0.9;">
                    ${this.nextLevelXP - this.bonsaiExperience} XP to next level
                </div>
            </div>
        `;
    }

    renderAchievements() {
        return html`
            <div class="achievements-grid">
                ${this.achievements.map(achievement => html`
                    <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                        <span class="achievement-icon">${achievement.icon}</span>
                        <div class="achievement-title">${achievement.title}</div>
                        <div class="achievement-description">${achievement.description}</div>
                    </div>
                `)}
            </div>
        `;
    }

    renderStats() {
        return html`
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-title">
                        📊 Accuracy Rate
                    </div>
                    <div class="stat-value">${this.getAccuracyPercentage()}%</div>
                    <div class="stat-change positive">+3% this week</div>
                </div>

                <div class="stat-card">
                    <div class="stat-title">
                        🔥 Current Streak
                    </div>
                    <div class="stat-value">${this.stats.currentStreak}</div>
                    <div class="stat-change ${this.stats.currentStreak > this.stats.bestStreak ? 'positive' : 'negative'}">
                        Best: ${this.stats.bestStreak} days
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-title">
                        ⏱️ Study Time
                    </div>
                    <div class="stat-value">${this.getStudyTimeFormatted()}</div>
                    <div class="stat-change positive">+45m this week</div>
                </div>

                <div class="stat-card">
                    <div class="stat-title">
                        📝 Questions Answered
                    </div>
                    <div class="stat-value">${this.stats.totalQuestions}</div>
                    <div class="stat-change positive">+12 this week</div>
                </div>
            </div>
        `;
    }

    renderSubjectBreakdown() {
        return html`
            <div class="subject-breakdown">
                <div class="breakdown-title">Subject Progress</div>
                
                ${Object.entries(this.subjectProgress).map(([subject, data]) => {
                    const percentage = (data.correct / data.total) * 100;
                    const subjectEmojis = {
                        math: '📊',
                        reading: '📖',
                        writing: '✍️'
                    };

                    return html`
                        <div class="subject-progress">
                            <div class="subject-header">
                                <div class="subject-name">
                                    ${subjectEmojis[subject]} ${subject.charAt(0).toUpperCase() + subject.slice(1)}
                                </div>
                                <div class="subject-score">${data.score}% (${data.correct}/${data.total})</div>
                            </div>
                            <div class="subject-bar">
                                <div class="subject-fill fill-${subject}" style="width: ${percentage}%"></div>
                            </div>
                        </div>
                    `;
                })}
            </div>
        `;
    }

    renderRecentActivity() {
        return html`
            <div class="recent-activity">
                <div class="activity-title">Recent Activity</div>
                ${this.recentActivity.map(activity => html`
                    <div class="activity-item">
                        <div class="activity-icon">${activity.icon}</div>
                        <div class="activity-content">
                            <div class="activity-description">${activity.description}</div>
                            <div class="activity-time">${activity.time}</div>
                        </div>
                        <div class="activity-points">${activity.points}</div>
                    </div>
                `)}
            </div>
        `;
    }

    render() {
        return html`
            <div class="subscription-tier tier-${this.subscriptionTier}">
                ${this.getTierDisplayName()}
            </div>

            <div class="progress-header">
                <h1 class="progress-title">Your Progress</h1>
                <p class="progress-subtitle">Watch your Bonsai grow as you master the SAT</p>
            </div>

            ${this.renderBonsaiGrowth()}
            ${this.renderStats()}
            ${this.renderAchievements()}
            ${this.renderSubjectBreakdown()}
            ${this.renderRecentActivity()}
        `;
    }
}

customElements.define('progress-view', ProgressView);