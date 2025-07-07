// Bonsai SAT Prep Assistant - Service Worker (Manifest v3)
// This background script manages extension state, analytics, and communication

console.log('Bonsai SAT: Service worker starting...');

// Extension state management
let extensionSettings = {
    bonsaiEnabled: true,
    voiceEnabled: false,
    autoDetect: true,
    apiKey: null,
    userId: null,
    subscriptionTier: 'free',
    analyticsEnabled: true
};

let usageStats = {
    dailyUsage: 0,
    weeklyUsage: 0,
    totalHelp: 0,
    streakCount: 0,
    lastUsageDate: null
};

let activeQuestions = new Map(); // Track active questions per tab
let sessionData = new Map(); // Track session data per tab

// Initialize extension on startup
self.addEventListener('install', (event) => {
    console.log('Bonsai SAT: Service worker installed');
    event.waitUntil(initializeExtension());
});

self.addEventListener('activate', (event) => {
    console.log('Bonsai SAT: Service worker activated');
    event.waitUntil(initializeExtension());
});

chrome.runtime.onStartup.addListener(() => {
    console.log('Bonsai SAT: Extension starting up');
    initializeExtension();
});

chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('Bonsai SAT: Extension installed/updated', details);
    
    try {
        if (details.reason === 'install') {
            await handleFirstInstall();
        } else if (details.reason === 'update') {
            await handleExtensionUpdate(details.previousVersion || '0.0.0');
        }
        
        await initializeExtension();
    } catch (error) {
        console.error('Bonsai SAT: Installation error:', error);
    }
});

async function initializeExtension() {
    try {
        console.log('Bonsai SAT: Initializing extension...');
        
        // Load settings from storage
        await loadExtensionSettings();
        
        // Load usage statistics
        await loadUsageStats();
        
        // Reset daily usage if new day
        await checkAndResetDailyUsage();
        
        // Set up alarm for daily reset
        try {
            await chrome.alarms.clear('dailyReset');
            await chrome.alarms.create('dailyReset', { 
                when: getNextMidnight(),
                periodInMinutes: 24 * 60 // 24 hours
            });
        } catch (error) {
            console.warn('Bonsai SAT: Could not create alarms:', error);
        }
        
        // Initialize context menus
        await setupContextMenus();
        
        console.log('Bonsai SAT: Extension initialized successfully');
        
    } catch (error) {
        console.error('Bonsai SAT: Failed to initialize extension:', error);
    }
}

async function handleFirstInstall() {
    try {
        // Set default settings for new users
        await chrome.storage.local.set({
            extensionSettings: extensionSettings,
            usageStats: usageStats,
            onboardingCompleted: false,
            installDate: Date.now()
        });
        
        // Open onboarding page
        await chrome.tabs.create({
            url: 'https://bonsaiprepagent.vercel.app/extension/install'
        });
    } catch (error) {
        console.error('Bonsai SAT: First install error:', error);
    }
}

async function handleExtensionUpdate(previousVersion) {
    console.log(`Bonsai SAT: Updated from version ${previousVersion}`);
    
    try {
        // Handle migration if needed
        if (compareVersions(previousVersion, '1.0.0') < 0) {
            await migrateToV1();
        }
    } catch (error) {
        console.error('Bonsai SAT: Update error:', error);
    }
}

async function loadExtensionSettings() {
    try {
        const result = await chrome.storage.local.get(['extensionSettings']);
        if (result.extensionSettings) {
            extensionSettings = { ...extensionSettings, ...result.extensionSettings };
        }
    } catch (error) {
        console.error('Bonsai SAT: Failed to load settings:', error);
    }
}

async function saveExtensionSettings() {
    try {
        await chrome.storage.local.set({ extensionSettings });
    } catch (error) {
        console.error('Bonsai SAT: Failed to save settings:', error);
    }
}

async function loadUsageStats() {
    try {
        const result = await chrome.storage.local.get(['usageStats']);
        if (result.usageStats) {
            usageStats = { ...usageStats, ...result.usageStats };
        }
    } catch (error) {
        console.error('Bonsai SAT: Failed to load usage stats:', error);
    }
}

async function saveUsageStats() {
    try {
        await chrome.storage.local.set({ usageStats });
    } catch (error) {
        console.error('Bonsai SAT: Failed to save usage stats:', error);
    }
}

async function checkAndResetDailyUsage() {
    try {
        const today = new Date().toDateString();
        
        if (usageStats.lastUsageDate !== today) {
            // Reset daily usage for new day
            usageStats.dailyUsage = 0;
            usageStats.lastUsageDate = today;
            
            // Update streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (usageStats.lastUsageDate === yesterday.toDateString()) {
                usageStats.streakCount += 1;
            } else {
                usageStats.streakCount = 1;
            }
            
            await saveUsageStats();
        }
    } catch (error) {
        console.error('Bonsai SAT: Failed to reset daily usage:', error);
    }
}

function getNextMidnight() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
}

async function setupContextMenus() {
    try {
        // Remove existing menus first
        await chrome.contextMenus.removeAll();
        
        // Add Bonsai SAT context menu
        chrome.contextMenus.create({
            id: 'bonsai-sat-help',
            title: 'Get SAT Help with Bonsai',
            contexts: ['selection'],
            documentUrlPatterns: [
                '*://*.khanacademy.org/*',
                '*://*.collegeboard.org/*',
                '*://*.bluebook.collegeboard.org/*',
                '*://*.satsuite.collegeboard.org/*',
                '*://*.apstudents.collegeboard.org/*'
            ]
        });
        
        chrome.contextMenus.create({
            id: 'bonsai-sat-toggle',
            title: 'Toggle Bonsai Assistant',
            contexts: ['page'],
            documentUrlPatterns: [
                '*://*.khanacademy.org/*',
                '*://*.collegeboard.org/*',
                '*://*.bluebook.collegeboard.org/*',
                '*://*.satsuite.collegeboard.org/*',
                '*://*.apstudents.collegeboard.org/*'
            ]
        });
        
        console.log('Bonsai SAT: Context menus created');
    } catch (error) {
        console.error('Bonsai SAT: Failed to setup context menus:', error);
    }
}

// Handle context menu clicks
chrome.contextMenus?.onClicked.addListener(async (info, tab) => {
    try {
        switch (info.menuItemId) {
            case 'bonsai-sat-help':
                await handleContextHelp(info, tab);
                break;
                
            case 'bonsai-sat-toggle':
                await handleToggleAssistant(tab);
                break;
        }
    } catch (error) {
        console.error('Bonsai SAT: Context menu error:', error);
    }
});

async function handleContextHelp(info, tab) {
    try {
        if (!extensionSettings.bonsaiEnabled) {
            return;
        }
        
        // Check usage limits
        if (!(await checkUsageLimit())) {
            await chrome.tabs.create({
                url: 'https://bonsaiprepagent.vercel.app/pricing'
            });
            return;
        }
        
        // Send selected text to content script for analysis
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'analyzeSelection',
            text: info.selectionText
        });
        
        if (response && response.success) {
            await incrementUsageCount();
        }
    } catch (error) {
        console.error('Bonsai SAT: Context help error:', error);
    }
}

async function handleToggleAssistant(tab) {
    try {
        const response = await chrome.tabs.sendMessage(tab.id, {
            action: 'toggleBonsai'
        });
        
        if (!response || !response.success) {
            console.error('Bonsai SAT: Failed to toggle assistant');
        }
    } catch (error) {
        console.error('Bonsai SAT: Toggle assistant error:', error);
    }
}

async function checkUsageLimit() {
    const dailyLimit = extensionSettings.subscriptionTier === 'free' ? 5 : 
                      extensionSettings.subscriptionTier === 'pro' ? 50 : 999999;
    
    return usageStats.dailyUsage < dailyLimit;
}

async function incrementUsageCount() {
    try {
        usageStats.dailyUsage += 1;
        usageStats.weeklyUsage += 1;
        usageStats.totalHelp += 1;
        
        await saveUsageStats();
        
        // Send analytics event
        await sendAnalyticsEvent('help_requested', {
            dailyUsage: usageStats.dailyUsage,
            subscriptionTier: extensionSettings.subscriptionTier
        });
    } catch (error) {
        console.error('Bonsai SAT: Failed to increment usage:', error);
    }
}

// Handle messages from content scripts and popup - Manifest v3 compatible
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Handle async operations properly in Manifest v3
    handleMessage(message, sender)
        .then(result => sendResponse(result))
        .catch(error => {
            console.error('Bonsai SAT: Message handling error:', error);
            sendResponse({ 
                success: false, 
                error: error.message 
            });
        });
    
    return true; // Keep message channel open for async response
});

async function handleMessage(message, sender) {
    switch (message.action) {
        case 'getSettings':
            return { 
                success: true, 
                settings: extensionSettings 
            };
            
        case 'saveSettings':
            extensionSettings = { ...extensionSettings, ...message.settings };
            await saveExtensionSettings();
            return { success: true };
            
        case 'getUsageStats':
            return { 
                success: true, 
                stats: usageStats 
            };
            
        case 'questionDetected':
            await handleQuestionDetected(message, sender);
            return { success: true };
            
        case 'helpRequested':
            await handleHelpRequested(message, sender);
            return { success: true };
            
        case 'sessionUpdate':
            await handleSessionUpdate(message, sender);
            return { success: true };
            
        case 'getApiKey':
            return { 
                success: true, 
                apiKey: extensionSettings.apiKey 
            };
            
        case 'authenticate':
            await handleAuthentication(message.token);
            return { success: true };
            
        case 'openSettings':
            await chrome.runtime.openOptionsPage();
            return { success: true };
            
        default:
            return { 
                success: false, 
                error: 'Unknown action: ' + message.action 
            };
    }
}

async function handleQuestionDetected(message, sender) {
    try {
        const tabId = sender.tab?.id;
        if (!tabId) return;
        
        const questionData = message.question;
        
        // Store question data for this tab
        activeQuestions.set(tabId, questionData);
        
        // Update session data
        if (!sessionData.has(tabId)) {
            sessionData.set(tabId, {
                startTime: Date.now(),
                questionsDetected: 0,
                helpRequests: 0,
                platform: message.platform
            });
        }
        
        const session = sessionData.get(tabId);
        session.questionsDetected += 1;
        
        // Send analytics event
        await sendAnalyticsEvent('question_detected', {
            platform: message.platform,
            subject: questionData.subject,
            type: questionData.type,
            difficulty: questionData.difficulty
        });
        
        console.log('Bonsai SAT: Question detected on tab', tabId, questionData);
    } catch (error) {
        console.error('Bonsai SAT: Question detection error:', error);
    }
}

async function handleHelpRequested(message, sender) {
    try {
        const tabId = sender.tab?.id;
        if (!tabId) return;
        
        // Check usage limits
        if (!(await checkUsageLimit())) {
            await chrome.tabs.create({
                url: 'https://bonsaiprepagent.vercel.app/pricing'
            });
            return;
        }
        
        // Update session data
        if (sessionData.has(tabId)) {
            sessionData.get(tabId).helpRequests += 1;
        }
        
        // Increment usage count
        await incrementUsageCount();
        
        // Send analytics event
        await sendAnalyticsEvent('help_requested', {
            platform: message.platform,
            questionType: message.questionType,
            helpType: message.helpType
        });
    } catch (error) {
        console.error('Bonsai SAT: Help request error:', error);
    }
}

async function handleSessionUpdate(message, sender) {
    try {
        const tabId = sender.tab?.id;
        if (!tabId) return;
        
        if (sessionData.has(tabId)) {
            const session = sessionData.get(tabId);
            Object.assign(session, message.updates);
        }
    } catch (error) {
        console.error('Bonsai SAT: Session update error:', error);
    }
}

async function handleAuthentication(token) {
    try {
        // Simple token storage for now - in production, validate with backend
        extensionSettings.apiKey = token;
        extensionSettings.userId = 'user_' + Date.now(); // Temporary user ID
        
        await saveExtensionSettings();
        
        console.log('Bonsai SAT: User authenticated successfully');
    } catch (error) {
        console.error('Bonsai SAT: Authentication error:', error);
        throw error;
    }
}

// Handle tab updates to track navigation
chrome.tabs?.onUpdated.addListener((tabId, changeInfo, tab) => {
    try {
        if (changeInfo.status === 'complete' && tab.url) {
            // Check if this is a supported SAT platform
            const supportedDomains = [
                'khanacademy.org',
                'collegeboard.org',
                'bluebook.collegeboard.org',
                'satsuite.collegeboard.org',
                'apstudents.collegeboard.org'
            ];
            
            const isSupportedSite = supportedDomains.some(domain => 
                tab.url.includes(domain)
            );
            
            if (isSupportedSite) {
                console.log('Bonsai SAT: User navigated to supported site:', tab.url);
                
                // Send analytics event
                sendAnalyticsEvent('site_visit', {
                    url: tab.url,
                    domain: new URL(tab.url).hostname
                });
            }
        }
    } catch (error) {
        console.error('Bonsai SAT: Tab update error:', error);
    }
});

// Handle tab removal to clean up data
chrome.tabs?.onRemoved.addListener((tabId) => {
    try {
        // Clean up session data
        if (sessionData.has(tabId)) {
            const session = sessionData.get(tabId);
            
            // Send session end analytics
            sendAnalyticsEvent('session_end', {
                duration: Date.now() - session.startTime,
                questionsDetected: session.questionsDetected,
                helpRequests: session.helpRequests,
                platform: session.platform
            });
            
            sessionData.delete(tabId);
        }
        
        activeQuestions.delete(tabId);
    } catch (error) {
        console.error('Bonsai SAT: Tab removal error:', error);
    }
});

// Handle daily reset alarm
chrome.alarms?.onAlarm.addListener(async (alarm) => {
    try {
        if (alarm.name === 'dailyReset') {
            await checkAndResetDailyUsage();
            console.log('Bonsai SAT: Daily usage reset');
        }
    } catch (error) {
        console.error('Bonsai SAT: Alarm error:', error);
    }
});

// Handle keyboard commands
chrome.commands?.onCommand.addListener(async (command) => {
    try {
        const [tab] = await chrome.tabs.query({ 
            active: true, 
            currentWindow: true 
        });
        
        if (!tab || !tab.id) return;
        
        switch (command) {
            case 'toggle-bonsai':
                await chrome.tabs.sendMessage(tab.id, { 
                    action: 'toggleBonsai' 
                });
                break;
                
            case 'quick-help':
                await chrome.tabs.sendMessage(tab.id, { 
                    action: 'quickHelp' 
                });
                break;
        }
    } catch (error) {
        console.error('Bonsai SAT: Command error:', error);
    }
});

// Analytics and tracking
async function sendAnalyticsEvent(eventName, properties = {}) {
    try {
        // Only send analytics if user has opted in
        if (!extensionSettings.analyticsEnabled) {
            return;
        }
        
        const eventData = {
            event: eventName,
            properties: {
                ...properties,
                userId: extensionSettings.userId,
                subscriptionTier: extensionSettings.subscriptionTier,
                extensionVersion: chrome.runtime.getManifest().version,
                timestamp: Date.now()
            }
        };
        
        console.log('Bonsai SAT: Analytics event:', eventName, eventData);
        
        // In development, just log events - in production, send to backend
        // await fetch('https://bonsaiprepagent.vercel.app/api/analytics/track', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': `Bearer ${extensionSettings.apiKey}`
        //     },
        //     body: JSON.stringify(eventData)
        // });
        
    } catch (error) {
        console.error('Bonsai SAT: Analytics error:', error);
    }
}

// Utility functions
function compareVersions(version1, version2) {
    const parts1 = version1.split('.').map(Number);
    const parts2 = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
        const part1 = parts1[i] || 0;
        const part2 = parts2[i] || 0;
        
        if (part1 < part2) return -1;
        if (part1 > part2) return 1;
    }
    
    return 0;
}

async function migrateToV1() {
    console.log('Bonsai SAT: Migrating to version 1.0.0');
    
    try {
        // Add any migration logic here
        const result = await chrome.storage.local.get(null);
        
        // Migrate old settings format if needed
        if (result.oldSettingsFormat) {
            // Convert old format to new format
            delete result.oldSettingsFormat;
            await chrome.storage.local.clear();
            await chrome.storage.local.set(result);
        }
    } catch (error) {
        console.error('Bonsai SAT: Migration error:', error);
    }
}

// Error handling and logging
self.addEventListener('error', (event) => {
    console.error('Bonsai SAT: Unhandled error:', event.error);
    
    sendAnalyticsEvent('extension_error', {
        error: event.error?.message || 'Unknown error',
        stack: event.error?.stack || 'No stack trace',
        filename: event.filename || 'Unknown file',
        lineno: event.lineno || 0
    });
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Bonsai SAT: Unhandled promise rejection:', event.reason);
    
    sendAnalyticsEvent('promise_rejection', {
        reason: event.reason?.toString() || 'Unknown rejection'
    });
});

console.log('Bonsai SAT: Service worker loaded successfully');