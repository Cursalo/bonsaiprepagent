// Bonsai SAT Prep Assistant - Content Script Injector
// This script initializes the Bonsai assistant on supported SAT platforms

(function() {
    'use strict';
    
    // Prevent multiple injections
    if (window.bonsaiSATInjected) {
        console.log('Bonsai SAT already injected');
        return;
    }
    window.bonsaiSATInjected = true;

    // Detect current platform
    const currentPlatform = detectPlatform();
    console.log('Bonsai SAT: Detected platform:', currentPlatform);

    // Initialize based on platform
    if (currentPlatform !== 'unsupported') {
        initializeBonsaiSAT(currentPlatform);
    }

    function detectPlatform() {
        const hostname = window.location.hostname;
        
        if (hostname.includes('khanacademy.org')) {
            return 'khan';
        } else if (hostname.includes('bluebook.collegeboard.org')) {
            return 'bluebook';
        } else if (hostname.includes('collegeboard.org')) {
            return 'collegeboard';
        } else if (hostname.includes('satsuite.collegeboard.org')) {
            return 'satsuite';
        } else if (hostname.includes('apstudents.collegeboard.org')) {
            return 'apstudents';
        }
        
        return 'unsupported';
    }

    async function initializeBonsaiSAT(platform) {
        try {
            // Load required assets
            await loadBonsaiAssets();
            
            // Create and inject the Bonsai app container
            createBonsaiContainer();
            
            // Initialize platform-specific features
            initializePlatformFeatures(platform);
            
            // Set up communication with background script
            setupMessageHandling();
            
            // Set up keyboard shortcuts
            setupKeyboardShortcuts();
            
            console.log('Bonsai SAT: Successfully initialized for platform:', platform);
            
        } catch (error) {
            console.error('Bonsai SAT: Failed to initialize:', error);
        }
    }

    async function loadBonsaiAssets() {
        try {
            console.log('Bonsai SAT: Loading assets...');
            
            // Check if custom elements are supported
            if (typeof customElements === 'undefined') {
                throw new Error('Custom elements not supported');
            }
            
            // Check if marked is loaded
            if (!window.marked) {
                console.warn('Marked library not loaded, but continuing...');
            }
            
            // Load the Glass-inspired module file to avoid CSP issues
            const script = document.createElement('script');
            script.type = 'module';
            script.src = chrome.runtime.getURL('src/app/BonsaiGlassApp.js');
            
            // Wait for script to load
            await new Promise((resolve, reject) => {
                script.onload = () => {
                    console.log('Bonsai SAT: Glass component loaded');
                    resolve();
                };
                script.onerror = (error) => {
                    console.error('Bonsai SAT: Failed to load Glass component:', error);
                    reject(error);
                };
                document.head.appendChild(script);
            });
            
            // Wait for component registration
            await new Promise(resolve => setTimeout(resolve, 200));
            
            console.log('Bonsai SAT: Asset loading complete');
            
        } catch (error) {
            console.error('Bonsai SAT: Asset loading error:', error);
            throw error;
        }
    }

    function createBonsaiContainer() {
        console.log('Bonsai SAT: Creating container...');
        
        // Get saved position or use default
        const savedPosition = JSON.parse(localStorage.getItem('bonsai-position') || '{"top": 20, "right": 20}');
        
        // Create a minimal container since Glass component handles its own UI
        const container = document.createElement('div');
        container.id = 'bonsai-glass-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 999998;
            pointer-events: none;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        `;

        // Create the Glass app instance
        console.log('Bonsai SAT: Creating Glass app element...');
        const app = document.createElement('bonsai-glass-app');
        app.id = 'bonsai-glass-app';
        
        // Glass component handles its own styling and positioning
        container.appendChild(app);
        
        // Check if the Glass component loads properly after a delay
        setTimeout(() => {
            if (app.shadowRoot) {
                console.log('Bonsai SAT: Glass component loaded successfully');
            } else {
                console.warn('Bonsai SAT: Glass component may not have loaded properly');
            }
        }, 1000);
        
        // Add to body with error handling
        try {
            document.body.appendChild(container);
            console.log('Bonsai SAT: Glass container added to page');
        } catch (error) {
            console.error('Bonsai SAT: Failed to add Glass container to page:', error);
            return null;
        }

        console.log('Bonsai SAT: Glass container ready');
        return { container, app };
    }

    // Glass component handles its own drag functionality

    function initializePlatformFeatures(platform) {
        switch (platform) {
            case 'khan':
                initializeKhanAcademy();
                break;
            case 'bluebook':
                initializeBluebook();
                break;
            case 'collegeboard':
                initializeCollegeBoard();
                break;
            case 'satsuite':
                initializeSATSuite();
                break;
            case 'apstudents':
                initializeAPStudents();
                break;
        }
    }

    function initializeKhanAcademy() {
        console.log('Bonsai SAT: Initializing Khan Academy integration');
        
        // Khan Academy specific selectors and observers
        const questionSelectors = [
            '[data-test-id="question-container"]',
            '.question-container',
            '[class*="question"]',
            '.exercise-content'
        ];

        // Set up observers for question detection
        setupQuestionObserver(questionSelectors, 'khan');
        
        // Khan Academy specific features
        detectKhanSATContent();
    }

    function initializeBluebook() {
        console.log('Bonsai SAT: Initializing Bluebook integration');
        
        // Bluebook specific selectors
        const questionSelectors = [
            '[data-testid="question"]',
            '.question-content',
            '[class*="Question"]',
            '.test-question'
        ];

        setupQuestionObserver(questionSelectors, 'bluebook');
        detectBluebookSATContent();
    }

    function initializeCollegeBoard() {
        console.log('Bonsai SAT: Initializing College Board integration');
        
        const questionSelectors = [
            '.question-container',
            '[data-cy="question"]',
            '.practice-question',
            '[class*="question"]'
        ];

        setupQuestionObserver(questionSelectors, 'collegeboard');
        detectCollegeBoardSATContent();
    }

    function initializeSATSuite() {
        console.log('Bonsai SAT: Initializing SAT Suite integration');
        
        const questionSelectors = [
            '.sat-question',
            '[data-testid="sat-question"]',
            '.question-wrapper',
            '.test-content'
        ];

        setupQuestionObserver(questionSelectors, 'satsuite');
    }

    function initializeAPStudents() {
        console.log('Bonsai SAT: Initializing AP Students integration');
        
        const questionSelectors = [
            '.ap-question',
            '[data-testid="ap-question"]',
            '.question-content',
            '.practice-item'
        ];

        setupQuestionObserver(questionSelectors, 'apstudents');
    }

    function setupQuestionObserver(selectors, platform) {
        // Create mutation observer to detect new questions
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if any of the selectors match
                        selectors.forEach(selector => {
                            const questions = node.querySelectorAll ? node.querySelectorAll(selector) : [];
                            const isQuestion = node.matches ? node.matches(selector) : false;
                            
                            if (isQuestion || questions.length > 0) {
                                handleQuestionDetected(isQuestion ? node : questions[0], platform);
                            }
                        });
                    }
                });
            });
        });

        // Start observing
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Check for existing questions
        selectors.forEach(selector => {
            const existingQuestions = document.querySelectorAll(selector);
            existingQuestions.forEach(question => {
                handleQuestionDetected(question, platform);
            });
        });
    }

    function handleQuestionDetected(questionElement, platform) {
        try {
            const questionData = extractQuestionData(questionElement, platform);
            
            if (questionData) {
                // Send to Glass app
                const app = document.getElementById('bonsai-glass-app');
                if (app && app.handleQuestionDetected) {
                    app.handleQuestionDetected(questionData);
                }

                // Notify background script
                chrome.runtime.sendMessage({
                    action: 'questionDetected',
                    platform: platform,
                    question: questionData
                });

                console.log('Bonsai SAT: Question detected:', questionData);
            }
        } catch (error) {
            console.error('Bonsai SAT: Error handling question detection:', error);
        }
    }

    function extractQuestionData(element, platform) {
        const questionData = {
            platform: platform,
            timestamp: Date.now(),
            url: window.location.href,
            element: element,
            text: '',
            type: 'unknown',
            subject: 'unknown',
            difficulty: 'unknown',
            choices: [],
            concepts: []
        };

        try {
            // Extract question text
            questionData.text = extractQuestionText(element, platform);
            
            // Extract answer choices
            questionData.choices = extractAnswerChoices(element, platform);
            
            // Determine question type
            questionData.type = determineQuestionType(element, questionData.choices, platform);
            
            // Detect subject area
            questionData.subject = detectSubjectArea(questionData.text, element, platform);
            
            // Estimate difficulty
            questionData.difficulty = estimateDifficulty(questionData.text, element, platform);
            
            return questionData;
            
        } catch (error) {
            console.error('Bonsai SAT: Error extracting question data:', error);
            return null;
        }
    }

    function extractQuestionText(element, platform) {
        // Platform-specific text extraction logic
        const textSelectors = {
            khan: ['.question-text', '[data-test-id="question-text"]', '.perseus-question-paragraph'],
            bluebook: ['.question-stem', '.question-text', '[data-testid="question-text"]'],
            collegeboard: ['.question-content', '.question-stem', '.practice-question-text'],
            satsuite: ['.sat-question-text', '.question-stem'],
            apstudents: ['.ap-question-text', '.question-content']
        };

        const selectors = textSelectors[platform] || ['.question-text', '.question-content'];
        
        for (const selector of selectors) {
            const textElement = element.querySelector(selector);
            if (textElement) {
                return textElement.textContent.trim();
            }
        }

        // Fallback to element text content
        return element.textContent.trim();
    }

    function extractAnswerChoices(element, platform) {
        const choiceSelectors = {
            khan: ['.choice', '[data-test-id="choice"]', '.perseus-radio-option'],
            bluebook: ['.answer-choice', '[data-testid="choice"]', '.choice-option'],
            collegeboard: ['.answer-option', '.choice', '.multiple-choice-option'],
            satsuite: ['.sat-choice', '.answer-choice'],
            apstudents: ['.ap-choice', '.answer-option']
        };

        const selectors = choiceSelectors[platform] || ['.choice', '.answer-choice', '.option'];
        const choices = [];

        for (const selector of selectors) {
            const choiceElements = element.querySelectorAll(selector);
            if (choiceElements.length > 0) {
                choiceElements.forEach((choice, index) => {
                    choices.push({
                        index: index,
                        text: choice.textContent.trim(),
                        label: String.fromCharCode(65 + index) // A, B, C, D
                    });
                });
                break;
            }
        }

        return choices;
    }

    function determineQuestionType(element, choices, platform) {
        if (choices.length >= 2) {
            return choices.length === 4 ? 'multiple-choice' : 'multiple-select';
        }

        // Check for input fields
        const inputs = element.querySelectorAll('input[type="text"], input[type="number"], textarea');
        if (inputs.length > 0) {
            return 'student-response';
        }

        // Check for grid-in patterns
        if (element.querySelector('.grid-in, .student-produced-response')) {
            return 'grid-in';
        }

        return 'unknown';
    }

    function detectSubjectArea(questionText, element, platform) {
        // Math keywords
        const mathKeywords = [
            'equation', 'solve', 'function', 'graph', 'angle', 'triangle', 'circle',
            'polynomial', 'linear', 'quadratic', 'exponential', 'logarithm',
            'geometry', 'algebra', 'calculus', 'statistics', 'probability'
        ];

        // Reading keywords
        const readingKeywords = [
            'passage', 'author', 'tone', 'main idea', 'inference', 'evidence',
            'rhetoric', 'argument', 'claim', 'support', 'context'
        ];

        // Writing keywords
        const writingKeywords = [
            'grammar', 'punctuation', 'transition', 'sentence', 'paragraph',
            'revision', 'editing', 'style', 'clarity', 'conciseness'
        ];

        const text = questionText.toLowerCase();

        if (mathKeywords.some(keyword => text.includes(keyword))) {
            return 'math';
        } else if (readingKeywords.some(keyword => text.includes(keyword))) {
            return 'reading';
        } else if (writingKeywords.some(keyword => text.includes(keyword))) {
            return 'writing';
        }

        // Check for platform-specific subject indicators
        const subjectIndicators = element.querySelectorAll('[class*="math"], [class*="reading"], [class*="writing"]');
        if (subjectIndicators.length > 0) {
            const className = subjectIndicators[0].className.toLowerCase();
            if (className.includes('math')) return 'math';
            if (className.includes('reading')) return 'reading';
            if (className.includes('writing')) return 'writing';
        }

        return 'unknown';
    }

    function estimateDifficulty(questionText, element, platform) {
        // Simple heuristic based on text complexity
        const wordCount = questionText.split(/\s+/).length;
        const sentenceCount = questionText.split(/[.!?]+/).length;
        const avgWordsPerSentence = wordCount / sentenceCount;

        // Check for complexity indicators
        const complexWords = [
            'analyze', 'synthesize', 'evaluate', 'compare', 'contrast',
            'interpret', 'infer', 'deduce', 'derive', 'justify'
        ];

        const hasComplexWords = complexWords.some(word => 
            questionText.toLowerCase().includes(word)
        );

        if (wordCount > 100 || avgWordsPerSentence > 20 || hasComplexWords) {
            return 'hard';
        } else if (wordCount > 50 || avgWordsPerSentence > 15) {
            return 'medium';
        } else {
            return 'easy';
        }
    }

    function detectKhanSATContent() {
        // Khan Academy specific SAT content detection
        const satIndicators = [
            'SAT', 'College Board', 'Practice Test', 'Official SAT'
        ];

        const pageText = document.body.textContent;
        const isSATContent = satIndicators.some(indicator => 
            pageText.includes(indicator)
        );

        if (isSATContent) {
            console.log('Bonsai SAT: SAT content detected on Khan Academy');
        }
    }

    function detectBluebookSATContent() {
        // Bluebook is primarily SAT content
        console.log('Bonsai SAT: Bluebook SAT content detected');
    }

    function detectCollegeBoardSATContent() {
        // College Board SAT content detection
        const url = window.location.href;
        const isSATContent = url.includes('sat') || url.includes('practice');
        
        if (isSATContent) {
            console.log('Bonsai SAT: SAT content detected on College Board');
        }
    }

    function setupMessageHandling() {
        // Listen for messages from popup and background script
        chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
            try {
                switch (message.action) {
                    case 'toggleBonsai':
                        toggleBonsaiVisibility();
                        sendResponse({ success: true });
                        break;
                        
                    case 'quickHelp':
                        triggerQuickHelp();
                        sendResponse({ success: true });
                        break;
                        
                    case 'getQuestionData':
                        const questionData = getCurrentQuestionData();
                        sendResponse({ success: true, data: questionData });
                        break;
                        
                    case 'updateSettings':
                        updateBonsaiSettings(message.settings);
                        sendResponse({ success: true });
                        break;
                        
                    default:
                        sendResponse({ success: false, error: 'Unknown action' });
                }
            } catch (error) {
                console.error('Bonsai SAT: Message handling error:', error);
                sendResponse({ success: false, error: error.message });
            }
        });
    }

    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            // Ctrl/Cmd + Shift + B: Toggle Bonsai
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'B') {
                event.preventDefault();
                toggleBonsaiVisibility();
            }
            
            // Ctrl/Cmd + Shift + H: Quick help
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'H') {
                event.preventDefault();
                triggerQuickHelp();
            }
        });
    }

    function toggleBonsaiVisibility() {
        const app = document.getElementById('bonsai-glass-app');
        if (app) {
            // Glass component handles its own visibility
            if (app.isExpanded) {
                app.collapseGlass();
            } else {
                app.expandGlass();
            }
        }
    }

    function triggerQuickHelp() {
        const app = document.getElementById('bonsai-glass-app');
        if (app) {
            // Expand Glass if collapsed
            if (!app.isExpanded) {
                app.expandGlass();
            }
            
            // Get current question and trigger help
            const currentQuestion = getCurrentQuestionData();
            if (currentQuestion && app.handleQuestionDetected) {
                app.handleQuestionDetected(currentQuestion);
            }
        }
    }

    function getCurrentQuestionData() {
        // Get the most recent question detected
        const questionElements = document.querySelectorAll([
            '[data-test-id="question-container"]',
            '.question-container',
            '[data-testid="question"]',
            '.question-content'
        ].join(', '));

        if (questionElements.length > 0) {
            const latestQuestion = questionElements[questionElements.length - 1];
            return extractQuestionData(latestQuestion, detectPlatform());
        }

        return null;
    }

    function updateBonsaiSettings(settings) {
        const app = document.getElementById('bonsai-glass-app');
        if (app && settings) {
            // Update Glass app settings
            Object.keys(settings).forEach(key => {
                if (app.hasOwnProperty(key)) {
                    app[key] = settings[key];
                }
            });
        }
    }

    // Initialize the Glass-style context awareness
    window.bonsaiSAT = {
        platform: currentPlatform,
        initialized: true,
        version: '1.0.0',
        
        // Public API for external integrations
        detectQuestion: () => getCurrentQuestionData(),
        toggleAssistant: toggleBonsaiVisibility,
        triggerHelp: triggerQuickHelp,
        
        // Internal communication
        sendMessage: (action, data) => {
            chrome.runtime.sendMessage({ action, data });
        }
    };

    console.log('Bonsai SAT: Content script initialization complete');

})();