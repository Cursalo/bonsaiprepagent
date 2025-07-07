const path = require('path');
const os = require('os');

// Environment configuration
const isDev = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Platform detection
const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';

// App configuration
const config = {
    // Environment
    isDev,
    isProduction,
    platform: {
        isMac,
        isWindows,
        isLinux
    },
    
    // Window configuration
    windows: {
        main: {
            width: 1200,
            height: 800,
            minWidth: 800,
            minHeight: 600,
            titleBarStyle: isMac ? 'hiddenInset' : 'default',
            vibrancy: isMac ? 'under-window' : null,
            transparent: isMac,
            backgroundColor: isMac ? '#00000000' : '#1a1a1a'
        },
        tutor: {
            width: 400,
            height: 600,
            minWidth: 350,
            minHeight: 500,
            alwaysOnTop: true,
            transparent: true,
            frame: false,
            vibrancy: 'under-window'
        }
    },
    
    // Glass-inspired visual effects
    glass: {
        blurRadius: 20,
        opacity: 0.8,
        borderOpacity: 0.2,
        shadowBlur: 32,
        borderRadius: 12
    },
    
    // Bonsai SAT specific settings
    bonsai: {
        // AI provider configuration
        ai: {
            providers: ['openai', 'gemini'],
            defaultProvider: 'openai',
            maxTokens: 2048,
            temperature: 0.7
        },
        
        // Gamification settings
        gamification: {
            baseXPPerQuestion: 10,
            bonusXPCorrect: 5,
            streakMultiplier: 1.5,
            levelThreshold: 100
        },
        
        // Subscription tiers
        subscriptionTiers: {
            free: {
                aiInteractionsPerDay: 5,
                practiceQuestionsPerDay: 10,
                features: ['basic_progress', 'limited_hints']
            },
            basic: {
                aiInteractionsPerDay: 50,
                practiceQuestionsPerDay: 100,
                features: ['advanced_progress', 'unlimited_hints', 'detailed_explanations']
            },
            pro: {
                aiInteractionsPerDay: -1, // unlimited
                practiceQuestionsPerDay: -1, // unlimited
                features: ['all_features', 'priority_support', 'custom_study_plans']
            },
            enterprise: {
                aiInteractionsPerDay: -1, // unlimited
                practiceQuestionsPerDay: -1, // unlimited
                features: ['all_features', 'team_management', 'advanced_analytics', 'custom_integration']
            }
        },
        
        // Context detection (Glass-inspired)
        contextDetection: {
            platforms: {
                khanAcademy: {
                    domain: 'khanacademy.org',
                    selectors: [
                        '[data-test-id="exercise-question-renderer"]',
                        '.exercise-card .question',
                        '.perseus-widget-container'
                    ]
                },
                collegeBoard: {
                    domain: 'collegeboard.org',
                    selectors: [
                        '.question-content',
                        '.sat-practice-question',
                        '.test-question'
                    ]
                }
            },
            scanInterval: 1000, // ms
            confidence: 0.8
        }
    },
    
    // File paths
    paths: {
        userData: path.join(os.homedir(), '.bonsai-sat'),
        logs: path.join(os.homedir(), '.bonsai-sat', 'logs'),
        cache: path.join(os.homedir(), '.bonsai-sat', 'cache'),
        temp: path.join(os.tmpdir(), 'bonsai-sat'),
        assets: path.join(__dirname, 'assets'),
        preload: path.join(__dirname, 'preload.js')
    },
    
    // URLs
    urls: {
        development: 'http://localhost:3000',
        production: 'file://' + path.join(__dirname, '../dist/index.html'),
        api: {
            development: 'http://localhost:3000/api',
            production: 'https://api.bonsai-sat.com'
        },
        website: 'https://bonsai-sat.com',
        support: 'mailto:support@bonsai-sat.com',
        documentation: 'https://docs.bonsai-sat.com'
    },
    
    // Security
    security: {
        allowedOrigins: [
            'https://bonsai-sat.com',
            'https://api.bonsai-sat.com',
            'https://app.bonsai-sat.com'
        ],
        csp: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.bonsai-sat.com", "https://api.openai.com"],
            fontSrc: ["'self'", "data:"]
        }
    },
    
    // Auto-updater
    updater: {
        enabled: isProduction,
        checkInterval: 60000 * 60 * 4, // 4 hours
        autoDownload: false,
        allowPrerelease: isDev
    },
    
    // Analytics (privacy-focused)
    analytics: {
        enabled: isProduction,
        events: {
            appStarted: 'app_started',
            studySessionStarted: 'study_session_started',
            studySessionEnded: 'study_session_ended',
            questionAnswered: 'question_answered',
            aiInteraction: 'ai_interaction',
            levelUp: 'level_up',
            achievementUnlocked: 'achievement_unlocked'
        }
    },
    
    // Keyboard shortcuts
    shortcuts: {
        global: {
            toggleApp: 'CmdOrCtrl+Shift+B',
            startTutoring: 'CmdOrCtrl+Shift+T',
            quickHelp: 'CmdOrCtrl+Shift+H'
        },
        local: {
            newPractice: 'CmdOrCtrl+N',
            viewProgress: 'CmdOrCtrl+P',
            settings: 'CmdOrCtrl+,',
            fullscreen: isMac ? 'Ctrl+Cmd+F' : 'F11'
        }
    },
    
    // Notifications
    notifications: {
        enabled: true,
        types: {
            achievement: { title: 'Achievement Unlocked!', sound: true },
            levelUp: { title: 'Bonsai Growth!', sound: true },
            streak: { title: 'Study Streak', sound: false },
            reminder: { title: 'Study Reminder', sound: false }
        }
    },
    
    // Performance
    performance: {
        maxMemoryUsage: 512 * 1024 * 1024, // 512MB
        maxCacheSize: 100 * 1024 * 1024, // 100MB
        enableHardwareAcceleration: true,
        enableWebSecurity: !isDev
    }
};

// Environment-specific overrides
if (isDev) {
    config.performance.enableWebSecurity = false;
    config.windows.main.webPreferences = {
        ...config.windows.main.webPreferences,
        webSecurity: false
    };
}

// Export configuration
module.exports = config;

// Export individual sections for convenience
module.exports.windows = config.windows;
module.exports.glass = config.glass;
module.exports.bonsai = config.bonsai;
module.exports.paths = config.paths;
module.exports.urls = config.urls;
module.exports.security = config.security;
module.exports.updater = config.updater;
module.exports.analytics = config.analytics;
module.exports.shortcuts = config.shortcuts;
module.exports.notifications = config.notifications;
module.exports.performance = config.performance;