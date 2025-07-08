// Bonsai SAT Desktop App - Renderer Script

class BonsaiDesktopApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.isMonitoring = false;
        this.currentQuestion = null;
        this.settings = {};
        this.stats = {};
        this.aiStatus = { configured: false, hasApiKey: false, ready: false };
        this.practiceQuestions = [];
        this.liveStatusTimeout = null;
    }

    async initialize() {
        console.log('🌱 Bonsai Desktop App: Initializing...');
        
        await this.loadSettings();
        await this.loadStats();
        this.setupEventListeners();
        this.setupIPC();
        await this.updateMonitoringStatus();
        this.updateUI();
        
        console.log('✅ App initialized successfully');
    }

    async loadSettings() {
        try {
            this.settings = await window.electronAPI.getSettings();
            this.aiStatus = await window.electronAPI.getAIStatus();
            this.updateSettingsUI();
            this.updateAIStatus();
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    async loadStats() {
        try {
            this.stats = await window.electronAPI.getUsageStats();
            this.updateStatsUI();
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Monitoring
        document.getElementById('toggleMonitoring').addEventListener('click', () => {
            this.toggleMonitoring();
        });

        // Question actions
        document.getElementById('getHint').addEventListener('click', () => {
            this.getAIHelp('hint');
        });

        document.getElementById('explainConcept').addEventListener('click', () => {
            this.getAIHelp('concept');
        });

        document.getElementById('showSolution').addEventListener('click', () => {
            this.getAIHelp('solution');
        });

        // Settings
        document.getElementById('testApiKey').addEventListener('click', () => {
            this.testApiKey();
        });

        document.getElementById('saveSettings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Screen capture testing
        document.getElementById('testScreenCapture').addEventListener('click', () => {
            this.testScreenCapture();
        });

        // Force capture button
        document.getElementById('forceCapture').addEventListener('click', () => {
            this.forceCapture();
        });

        // Show assistant button
        document.getElementById('showAssistant').addEventListener('click', () => {
            this.showAssistant();
        });

        // Practice questions
        document.getElementById('generateQuestions').addEventListener('click', () => {
            this.generatePracticeQuestions();
        });

        // Footer links
        document.getElementById('openDashboard').addEventListener('click', () => {
            this.openWebDashboard();
        });

        document.getElementById('openHelp').addEventListener('click', () => {
            this.openHelp();
        });
    }

    setupIPC() {
        // Listen for question detection
        window.electronAPI.onQuestionDetected((event, questionData) => {
            this.handleQuestionDetected(questionData);
        });

        // Listen for navigation requests
        window.electronAPI.onNavigateTo((event, section) => {
            this.navigateToSection(section);
        });

        // Listen for quick help trigger
        window.electronAPI.onTriggerQuickHelp(() => {
            this.getAIHelp('hint');
        });
        
        // Listen for live status updates
        window.electronAPI.onLiveStatusUpdate((event, statusData) => {
            this.updateLiveStatus(statusData);
        });
    }

    navigateToSection(section) {
        this.currentSection = section;
        
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.section === section) {
                btn.classList.add('active');
            }
        });

        // Show/hide sections
        const sections = {
            dashboard: document.querySelector('.dashboard-section'),
            monitoring: document.querySelector('.monitoring-section'),
            settings: document.getElementById('settingsSection')
        };

        Object.keys(sections).forEach(key => {
            if (key === section) {
                sections[key].style.display = 'block';
            } else {
                sections[key].style.display = 'none';
            }
        });
    }

    async toggleMonitoring() {
        const btn = document.getElementById('toggleMonitoring');
        btn.disabled = true;

        try {
            if (this.isMonitoring) {
                await window.electronAPI.stopMonitoring();
                this.updateStatusIndicator('Ready', '#10b981');
                this.showToast('Monitoring stopped', 'info');
            } else {
                await window.electronAPI.startMonitoring();
                this.updateStatusIndicator('Monitoring', '#0ea5e9');
                this.showToast('Monitoring started - looking for Bluebook', 'success');
            }
            
            await this.updateMonitoringStatus();
        } catch (error) {
            console.error('Failed to toggle monitoring:', error);
            this.showToast('Failed to toggle monitoring', 'error');
        } finally {
            btn.disabled = false;
        }
    }

    async updateMonitoringStatus() {
        try {
            this.isMonitoring = await window.electronAPI.getMonitoringStatus();
            
            const btn = document.getElementById('toggleMonitoring');
            const text = document.getElementById('monitoringText');
            
            if (this.isMonitoring) {
                btn.textContent = 'Stop';
                btn.classList.add('stop');
                text.textContent = 'Active - Watching for Bluebook';
            } else {
                btn.textContent = 'Start';
                btn.classList.remove('stop');
                text.textContent = 'Stopped';
            }
        } catch (error) {
            console.error('Failed to get monitoring status:', error);
        }
    }

    handleQuestionDetected(questionData) {
        console.log('📝 Question detected:', questionData);
        
        this.currentQuestion = questionData;
        
        // Update UI
        const questionSection = document.getElementById('currentQuestion');
        const subjectEl = document.getElementById('questionSubject');
        const textEl = document.getElementById('questionText');
        
        questionSection.style.display = 'block';
        subjectEl.textContent = questionData.subject.toUpperCase();
        textEl.textContent = questionData.text.substring(0, 200) + 
            (questionData.text.length > 200 ? '...' : '');
        
        // Update stats
        this.stats.dailyQuestions = (this.stats.dailyQuestions || 0) + 1;
        this.updateStatsUI();
        
        // Show notification
        this.showToast(`${questionData.subject} question detected`, 'success');
        
        // Update status
        this.updateStatusIndicator('Question Detected', '#22c55e');
    }

    async getAIHelp(helpType) {
        if (!this.currentQuestion) {
            this.showToast('No question detected', 'error');
            return;
        }

        if (!this.settings.apiKey) {
            this.showToast('Please configure your API key first', 'error');
            this.navigateToSection('settings');
            return;
        }

        const button = document.querySelector(`#${helpType === 'hint' ? 'getHint' : 
                                              helpType === 'concept' ? 'explainConcept' : 'showSolution'}`);
        
        button.disabled = true;
        button.textContent = '🤖 Thinking...';

        try {
            const response = await window.electronAPI.getAIHelp({
                questionText: this.currentQuestion.text,
                helpType: helpType,
                questionData: this.currentQuestion
            });

            if (response.success) {
                const content = response.analysis || response.hint || response.explanation || response.solution || response.message;
                this.showAIResponse(helpType, content);
                this.stats.questionsHelped = (this.stats.questionsHelped || 0) + 1;
                this.updateStatsUI();
            } else {
                this.showToast(response.error || 'AI help failed', 'error');
            }
        } catch (error) {
            console.error('AI help error:', error);
            this.showToast('Failed to get AI help', 'error');
        } finally {
            button.disabled = false;
            button.textContent = helpType === 'hint' ? '💡 Get Hint' :
                                helpType === 'concept' ? '🧠 Explain Concept' : '📝 Solution';
        }
    }

    showAIResponse(helpType, message) {
        // Create or update response overlay
        let overlay = document.getElementById('aiResponseOverlay');
        
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'aiResponseOverlay';
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                backdrop-filter: blur(4px);
            `;
            document.body.appendChild(overlay);
        }

        const icons = {
            hint: '💡',
            concept: '🧠',
            solution: '📝'
        };

        overlay.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 16px;
                padding: 24px;
                max-width: 500px;
                max-height: 70vh;
                overflow-y: auto;
                color: #ffffff;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            ">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                    <h3 style="margin: 0; display: flex; align-items: center; gap: 8px;">
                        ${icons[helpType]} ${helpType.charAt(0).toUpperCase() + helpType.slice(1)} Response
                    </h3>
                    <button onclick="document.getElementById('aiResponseOverlay').remove()" style="
                        background: transparent;
                        border: none;
                        color: rgba(255, 255, 255, 0.7);
                        font-size: 18px;
                        cursor: pointer;
                        padding: 4px;
                        border-radius: 4px;
                    ">×</button>
                </div>
                <div style="
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    padding: 16px;
                    line-height: 1.5;
                    white-space: pre-wrap;
                ">${message}</div>
                <button onclick="document.getElementById('aiResponseOverlay').remove()" style="
                    background: #22c55e;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 6px;
                    font-weight: 500;
                    cursor: pointer;
                    margin-top: 16px;
                    width: 100%;
                ">Close</button>
            </div>
        `;
    }

    async testApiKey() {
        const apiKeyInput = document.getElementById('apiKey');
        const testBtn = document.getElementById('testApiKey');
        
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            this.showToast('Please enter an API key', 'error');
            return;
        }

        testBtn.disabled = true;
        testBtn.textContent = 'Testing...';

        try {
            // Update the settings first
            await window.electronAPI.saveSettings({ apiKey });
            
            // Test using the AI service
            const response = await window.electronAPI.testAIConnection();

            if (response.success) {
                this.showToast('✅ API key is working!', 'success');
                this.aiStatus = await window.electronAPI.getAIStatus();
                this.updateAIStatus();
            } else {
                this.showToast(response.error || 'API key test failed', 'error');
            }
        } catch (error) {
            console.error('API test error:', error);
            this.showToast('Failed to test API key', 'error');
        } finally {
            testBtn.disabled = false;
            testBtn.textContent = 'Test Connection';
        }
    }

    async saveSettings() {
        const settings = {
            apiKey: document.getElementById('apiKey').value.trim(),
            autoDetect: document.getElementById('autoDetect').checked,
            sound: document.getElementById('soundEnabled').checked,
            analytics: document.getElementById('analyticsEnabled').checked
        };

        try {
            await window.electronAPI.saveSettings(settings);
            this.settings = { ...this.settings, ...settings };
            this.aiStatus = await window.electronAPI.getAIStatus();
            this.updateAIStatus();
            this.showToast('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Failed to save settings:', error);
            this.showToast('Failed to save settings', 'error');
        }
    }

    updateSettingsUI() {
        document.getElementById('apiKey').value = this.settings.apiKey || '';
        document.getElementById('autoDetect').checked = this.settings.autoDetect !== false;
        document.getElementById('soundEnabled').checked = this.settings.sound || false;
        document.getElementById('analyticsEnabled').checked = this.settings.analytics !== false;
    }

    updateStatsUI() {
        document.getElementById('dailyQuestions').textContent = this.stats.dailyQuestions || 0;
        document.getElementById('totalSessions').textContent = this.stats.totalSessions || 0;
        document.getElementById('streakDays').textContent = this.stats.streakCount || 0;
    }
    
    updateAIStatus() {
        const statusEl = document.getElementById('aiStatus');
        if (statusEl) {
            if (this.aiStatus.ready) {
                statusEl.innerHTML = '<span style="color: #22c55e;">✅ AI Ready</span>';
            } else if (this.aiStatus.hasApiKey) {
                statusEl.innerHTML = '<span style="color: #f59e0b;">⚠️ API Key Set (Not Tested)</span>';
            } else {
                statusEl.innerHTML = '<span style="color: #ef4444;">❌ No API Key</span>';
            }
        }
    }
    
    async generatePracticeQuestions() {
        const btn = document.getElementById('generateQuestions');
        const subjectSelect = document.getElementById('practiceSubject');
        const difficultySelect = document.getElementById('practiceDifficulty');
        
        if (!this.aiStatus.ready) {
            this.showToast('Please configure your API key first', 'error');
            this.navigateToSection('settings');
            return;
        }
        
        btn.disabled = true;
        btn.textContent = '🤖 Generating...';
        
        try {
            const response = await window.electronAPI.generatePracticeQuestions({
                subject: subjectSelect?.value || 'math',
                difficulty: difficultySelect?.value || 'medium',
                count: 5
            });
            
            if (response.success) {
                this.displayPracticeQuestions(response.questions);
                this.showToast('✅ 5 practice questions generated!', 'success');
            } else {
                this.showToast(response.error || 'Failed to generate questions', 'error');
            }
        } catch (error) {
            console.error('Question generation error:', error);
            this.showToast('Failed to generate practice questions', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = '📝 Generate 5 Questions';
        }
    }
    
    displayPracticeQuestions(questionsText) {
        const container = document.getElementById('practiceQuestionsContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div style="
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 20px;
                margin-top: 16px;
                max-height: 400px;
                overflow-y: auto;
            ">
                <h4 style="margin: 0 0 16px 0; color: #22c55e;">📝 Practice Questions</h4>
                <div style="
                    line-height: 1.6;
                    white-space: pre-wrap;
                    font-family: 'SF Pro Text', -apple-system, system-ui, sans-serif;
                ">${questionsText}</div>
            </div>
        `;
        
        // Scroll to the questions
        container.scrollIntoView({ behavior: 'smooth' });
    }
    
    async testScreenCapture() {
        const btn = document.getElementById('testScreenCapture');
        
        btn.disabled = true;
        btn.textContent = '📷 Testing...';
        
        try {
            const response = await window.electronAPI.testScreenCapture();
            
            if (response.success) {
                this.showToast('✅ Screen capture working!', 'success');
            } else {
                this.showToast(response.error || 'Screen capture failed', 'error');
            }
        } catch (error) {
            console.error('Screen capture test error:', error);
            this.showToast('Failed to test screen capture', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = '📷 Test Screen Capture';
        }
    }

    updateStatusIndicator(text, color) {
        const statusText = document.querySelector('.status-text');
        const statusDot = document.querySelector('.status-dot');
        
        statusText.textContent = text;
        statusDot.style.background = color;
        statusDot.style.boxShadow = `0 0 8px ${color}`;
    }

    updateUI() {
        this.updateStatsUI();
        this.updateSettingsUI();
        this.updateAIStatus();
        this.navigateToSection('dashboard');
    }

    openWebDashboard() {
        // Open external web dashboard
        const { shell } = require('electron');
        shell.openExternal('https://bonsaiprepagent.vercel.app/dashboard');
    }

    openHelp() {
        const { shell } = require('electron');
        shell.openExternal('https://bonsaiprepagent.vercel.app/help');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    async forceCapture() {
        const btn = document.getElementById('forceCapture');
        btn.disabled = true;
        btn.textContent = '🔄 Capturing...';
        
        this.showToast('🎯 Forcing screen capture...', 'info');
        
        try {
            // Force the bluebook monitor to analyze current screen
            const response = await window.electronAPI.forceAnalyzeScreen();
            
            if (response.success) {
                this.showToast('✅ Screen captured! Check for detected questions.', 'success');
                
                // If question was detected, it will be shown automatically
                if (response.questionDetected) {
                    this.showToast('📝 Question detected!', 'success');
                }
            } else {
                this.showToast(response.error || 'Failed to capture screen', 'error');
            }
        } catch (error) {
            console.error('Force capture error:', error);
            this.showToast('Failed to capture screen', 'error');
        } finally {
            btn.disabled = false;
            btn.textContent = '🎯 Capture Now!';
        }
    }

    async showAssistant() {
        try {
            await window.electronAPI.showOverlay();
            this.showToast('💬 Assistant overlay opened!', 'success');
        } catch (error) {
            console.error('Show assistant error:', error);
            this.showToast('Failed to show assistant', 'error');
        }
    }

    updateLiveStatus(statusData) {
        const liveStatusSection = document.getElementById('liveStatus');
        const lastScanTime = document.getElementById('lastScanTime');
        const ocrPreview = document.getElementById('ocrPreview');
        const detectionStatus = document.getElementById('detectionStatus');
        
        // Show live status section if hidden
        if (liveStatusSection && liveStatusSection.style.display === 'none') {
            liveStatusSection.style.display = 'block';
        }
        
        // Update scan time
        if (lastScanTime && statusData.scanTime) {
            lastScanTime.textContent = statusData.scanTime;
        }
        
        // Update OCR preview
        if (ocrPreview && statusData.ocrText) {
            ocrPreview.textContent = statusData.ocrText;
            ocrPreview.style.color = statusData.textLength > 50 ? '#22c55e' : '#f59e0b';
        }
        
        // Update detection status
        if (detectionStatus && statusData.status) {
            const statusMap = {
                'capturing': '📷 Capturing screen...',
                'analyzing': '🔍 Analyzing text...',
                'processing': '🤖 Processing question...',
                'ready': '✅ Ready',
                'error': '❌ Error detected'
            };
            
            detectionStatus.textContent = statusMap[statusData.status] || statusData.status;
            
            // Update color based on status
            const colorMap = {
                'capturing': '#3b82f6',
                'analyzing': '#f59e0b', 
                'processing': '#8b5cf6',
                'ready': '#22c55e',
                'error': '#ef4444'
            };
            
            detectionStatus.style.color = colorMap[statusData.status] || '#ffffff';
        }
        
        // Update monitoring status
        if (statusData.sourcesFound !== undefined) {
            this.updateStatusIndicator(
                `Monitoring - ${statusData.sourcesFound} sources found`, 
                '#0ea5e9'
            );
        }
        
        // Auto-hide status after inactivity
        clearTimeout(this.liveStatusTimeout);
        this.liveStatusTimeout = setTimeout(() => {
            if (liveStatusSection && statusData.status === 'ready') {
                // Keep visible but dim slightly
                liveStatusSection.style.opacity = '0.7';
            }
        }, 5000);
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new BonsaiDesktopApp();
    app.initialize();
    window.bonsaiApp = app;
});