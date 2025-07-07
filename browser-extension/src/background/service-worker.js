// Bonsai SAT Prep Assistant - Service Worker
// This background script manages extension state, analytics, and communication

// Extension state management
let extensionSettings = {
    bonsaiEnabled: true,
    voiceEnabled: false,
    autoDetect: true,
    apiKey: null,
    userId: null,
    subscriptionTier: 'free'
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
chrome.runtime.onStartup.addListener(async () => {
    console.log('Bonsai SAT: Extension starting up');
    await initializeExtension();
});

chrome.runtime.onInstalled.addListener(async (details) => {
    console.log('Bonsai SAT: Extension installed/updated', details);
    
    if (details.reason === 'install') {
        await handleFirstInstall();
    } else if (details.reason === 'update') {
        await handleExtensionUpdate(details.previousVersion);
    }
    
    await initializeExtension();
});

async function initializeExtension() {
    try {
        // Load settings from storage
        await loadExtensionSettings();
        
        // Load usage statistics
        await loadUsageStats();
        
        // Reset daily usage if new day
        await checkAndResetDailyUsage();
        
        // Set up alarm for daily reset
        chrome.alarms.create('dailyReset', { 
            when: getNextMidnight(),
            periodInMinutes: 24 * 60 // 24 hours
        });
        
        // Initialize context menus
        await setupContextMenus();
        
        console.log('Bonsai SAT: Extension initialized successfully');
        
    } catch (error) {
        console.error('Bonsai SAT: Failed to initialize extension:', error);
    }
}

async function handleFirstInstall() {
    // Set default settings for new users
    await chrome.storage.local.set({
        extensionSettings: extensionSettings,
        usageStats: usageStats,
        onboardingCompleted: false,
        installDate: Date.now()
    });
    
    // Open onboarding page
    chrome.tabs.create({
        url: 'https://bonsaiprepagent.vercel.app/extension/install'
    });
}

async function handleExtensionUpdate(previousVersion) {
    console.log(`Bonsai SAT: Updated from version ${previousVersion}`);
    
    // Handle migration if needed
    if (compareVersions(previousVersion, '1.0.0') < 0) {
        await migrateToV1();
    }
}

async function loadExtensionSettings() {
    const result = await chrome.storage.local.get(['extensionSettings']);
    if (result.extensionSettings) {
        extensionSettings = { ...extensionSettings, ...result.extensionSettings };
    }
}

async function saveExtensionSettings() {
    await chrome.storage.local.set({ extensionSettings });
}

async function loadUsageStats() {
    const result = await chrome.storage.local.get(['usageStats']);
    if (result.usageStats) {
        usageStats = { ...usageStats, ...result.usageStats };
    }
}

async function saveUsageStats() {
    await chrome.storage.local.set({ usageStats });
}

async function checkAndResetDailyUsage() {
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
}

function getNextMidnight() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow.getTime();
}

async function setupContextMenus() {
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
}

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
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
    if (!extensionSettings.bonsaiEnabled) {
        return;
    }
    
    // Check usage limits
    if (!await checkUsageLimit()) {
        chrome.tabs.create({
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
}

async function handleToggleAssistant(tab) {
    const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'toggleBonsai'
    });
    
    if (!response || !response.success) {
        console.error('Bonsai SAT: Failed to toggle assistant');
    }
}

async function checkUsageLimit() {
    const dailyLimit = extensionSettings.subscriptionTier === 'free' ? 5 : 
                      extensionSettings.subscriptionTier === 'pro' ? 50 : 999999;
    
    return usageStats.dailyUsage < dailyLimit;
}

async function incrementUsageCount() {
    usageStats.dailyUsage += 1;
    usageStats.weeklyUsage += 1;
    usageStats.totalHelp += 1;
    
    await saveUsageStats();
    
    // Send analytics event
    await sendAnalyticsEvent('help_requested', {
        dailyUsage: usageStats.dailyUsage,
        subscriptionTier: extensionSettings.subscriptionTier
    });
}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    (async () => {
        try {
            switch (message.action) {
                case 'getSettings':
                    sendResponse({ 
                        success: true, 
                        settings: extensionSettings 
                    });
                    break;
                    
                case 'saveSettings':
                    extensionSettings = { ...extensionSettings, ...message.settings };
                    await saveExtensionSettings();
                    sendResponse({ success: true });
                    break;
                    
                case 'getUsageStats':
                    sendResponse({ 
                        success: true, 
                        stats: usageStats 
                    });
                    break;
                    
                case 'questionDetected':
                    await handleQuestionDetected(message, sender);
                    sendResponse({ success: true });
                    break;
                    
                case 'helpRequested':
                    await handleHelpRequested(message, sender);
                    sendResponse({ success: true });
                    break;
                    
                case 'sessionUpdate':
                    await handleSessionUpdate(message, sender);
                    sendResponse({ success: true });
                    break;
                    
                case 'getApiKey':
                    sendResponse({ 
                        success: true, 
                        apiKey: extensionSettings.apiKey 
                    });
                    break;
                    
                case 'authenticate':
                    await handleAuthentication(message.token);
                    sendResponse({ success: true });
                    break;
                    
                default:
                    sendResponse({ 
                        success: false, 
                        error: 'Unknown action' 
                    });
            }
        } catch (error) {
            console.error('Bonsai SAT: Message handling error:', error);
            sendResponse({ 
                success: false, 
                error: error.message 
            });
        }
    })();
    
    return true; // Keep message channel open for async response
});

async function handleQuestionDetected(message, sender) {
    const tabId = sender.tab.id;
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
}

async function handleHelpRequested(message, sender) {
    const tabId = sender.tab.id;
    
    // Check usage limits
    if (!await checkUsageLimit()) {
        chrome.tabs.create({
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
}

async function handleSessionUpdate(message, sender) {
    const tabId = sender.tab.id;
    
    if (sessionData.has(tabId)) {
        const session = sessionData.get(tabId);
        Object.assign(session, message.updates);
    }
}

async function handleAuthentication(token) {
    try {
        // Validate token with backend
        const response = await fetch('https://bonsaiprepagent.vercel.app/api/auth/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const userData = await response.json();
            
            extensionSettings.userId = userData.userId;
            extensionSettings.subscriptionTier = userData.subscriptionTier || 'free';
            extensionSettings.apiKey = token;
            
            await saveExtensionSettings();
            
            console.log('Bonsai SAT: User authenticated successfully');
        } else {
            throw new Error('Authentication failed');
        }
    } catch (error) {
        console.error('Bonsai SAT: Authentication error:', error);
        throw error;
    }
}

// Handle tab updates to track navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
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
});

// Handle tab removal to clean up data
chrome.tabs.onRemoved.addListener((tabId) => {
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
});

// Handle daily reset alarm
chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'dailyReset') {
        await checkAndResetDailyUsage();
        console.log('Bonsai SAT: Daily usage reset');
    }
});

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
    try {
        const [tab] = await chrome.tabs.query({ 
            active: true, 
            currentWindow: true 
        });
        
        if (!tab) return;
        
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
        
        // Send to analytics endpoint
        await fetch('https://bonsaiprepagent.vercel.app/api/analytics/track', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${extensionSettings.apiKey}`
            },
            body: JSON.stringify(eventData)
        });
        
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
    
    // Add any migration logic here
    const result = await chrome.storage.local.get(null);
    
    // Migrate old settings format if needed
    if (result.oldSettingsFormat) {
        // Convert old format to new format
        delete result.oldSettingsFormat;
        await chrome.storage.local.clear();
        await chrome.storage.local.set(result);
    }
}

// Error handling and logging
self.addEventListener('error', (event) => {
    console.error('Bonsai SAT: Unhandled error:', event.error);
    
    sendAnalyticsEvent('extension_error', {
        error: event.error.message,
        stack: event.error.stack,
        filename: event.filename,
        lineno: event.lineno
    });
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('Bonsai SAT: Unhandled promise rejection:', event.reason);
    
    sendAnalyticsEvent('promise_rejection', {
        reason: event.reason?.toString() || 'Unknown rejection'
    });
});

console.log('Bonsai SAT: Service worker loaded successfully');