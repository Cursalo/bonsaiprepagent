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
            
            // Load the main app component dynamically
            const extensionUrl = chrome.runtime.getURL('');
            console.log('Extension URL:', extensionUrl);
            
            // Create script element to load the BonsaiSATApp
            const script = document.createElement('script');
            script.type = 'module';
            script.src = chrome.runtime.getURL('src/app/BonsaiSATApp.js');
            
            // Wait for script to load
            await new Promise((resolve, reject) => {
                script.onload = () => {
                    console.log('Bonsai SAT: App component loaded');
                    resolve();
                };
                script.onerror = (error) => {
                    console.error('Bonsai SAT: Failed to load app component:', error);
                    reject(error);
                };
                document.head.appendChild(script);
            });
            
            // Wait a bit for component registration
            await new Promise(resolve => setTimeout(resolve, 100));
            
        } catch (error) {
            console.error('Bonsai SAT: Asset loading error:', error);
            throw error;
        }
    }

    function createBonsaiContainer() {
        console.log('Bonsai SAT: Creating container...');
        
        // Get saved position or use default
        const savedPosition = JSON.parse(localStorage.getItem('bonsai-position') || '{"top": 20, "right": 20}');
        
        // Create the floating container for Bonsai assistant
        const container = document.createElement('div');
        container.id = 'bonsai-sat-container';
        container.style.cssText = `
            position: fixed;
            top: ${savedPosition.top}px;
            right: ${savedPosition.right}px;
            width: 380px;
            max-height: 600px;
            z-index: 999999;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            pointer-events: auto;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            transform: translateX(100%);
            transition: transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
            overflow: hidden;
            cursor: move;
        `;

        // Add drag handle
        const dragHandle = document.createElement('div');
        dragHandle.className = 'bonsai-drag-handle';
        dragHandle.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 40px;
            background: rgba(255, 255, 255, 0.05);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            cursor: move;
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
            font-weight: 500;
            user-select: none;
            border-radius: 12px 12px 0 0;
        `;
        dragHandle.innerHTML = '⋮⋮⋮ Drag to move';
        
        container.appendChild(dragHandle);

        // Create the app instance
        console.log('Bonsai SAT: Creating app element...');
        const app = document.createElement('bonsai-sat-app');
        app.id = 'bonsai-sat-app';
        
        // Add some basic styling to the app element
        app.style.cssText = `
            display: block;
            width: 100%;
            height: 100%;
            min-height: 200px;
            color: #e5e5e7;
            background: transparent;
            margin-top: 40px;
            cursor: default;
        `;
        
        // Add fallback content in case the component doesn't load
        app.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #e5e5e7;">
                <div style="margin-bottom: 10px;">🌱</div>
                <div style="font-weight: 600; margin-bottom: 5px;">Bonsai SAT Prep</div>
                <div style="font-size: 14px; opacity: 0.7;">Loading assistant...</div>
            </div>
        `;
        
        container.appendChild(app);
        
        // Add drag functionality
        setupDragFunctionality(container, dragHandle);
        
        // Add to body with error handling
        try {
            document.body.appendChild(container);
            console.log('Bonsai SAT: Container added to page');
        } catch (error) {
            console.error('Bonsai SAT: Failed to add container to page:', error);
            return null;
        }

        // Show container after a delay
        setTimeout(() => {
            container.style.transform = 'translateX(0)';
            console.log('Bonsai SAT: Container made visible');
        }, 500);

        return { container, app };
    }

    function setupDragFunctionality(container, dragHandle) {
        let isDragging = false;
        let currentX;
        let currentY;
        let initialX;
        let initialY;
        let xOffset = 0;
        let yOffset = 0;

        function dragStart(e) {
            if (e.type === "touchstart") {
                initialX = e.touches[0].clientX - xOffset;
                initialY = e.touches[0].clientY - yOffset;
            } else {
                initialX = e.clientX - xOffset;
                initialY = e.clientY - yOffset;
            }

            if (e.target === dragHandle || dragHandle.contains(e.target)) {
                isDragging = true;
                container.style.transition = 'none';
            }
        }

        function dragEnd(e) {
            if (isDragging) {
                isDragging = false;
                container.style.transition = 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)';
                
                // Save position to localStorage
                const rect = container.getBoundingClientRect();
                const position = {
                    top: rect.top,
                    right: window.innerWidth - rect.right
                };
                localStorage.setItem('bonsai-position', JSON.stringify(position));
            }
        }

        function drag(e) {
            if (isDragging) {
                e.preventDefault();
                
                if (e.type === "touchmove") {
                    currentX = e.touches[0].clientX - initialX;
                    currentY = e.touches[0].clientY - initialY;
                } else {
                    currentX = e.clientX - initialX;
                    currentY = e.clientY - initialY;
                }

                xOffset = currentX;
                yOffset = currentY;

                // Calculate new position
                const rect = container.getBoundingClientRect();
                let newTop = rect.top + currentY;
                let newLeft = rect.left + currentX;

                // Constrain to viewport
                const maxTop = window.innerHeight - rect.height;
                const maxLeft = window.innerWidth - rect.width;
                
                newTop = Math.max(0, Math.min(newTop, maxTop));
                newLeft = Math.max(0, Math.min(newLeft, maxLeft));

                container.style.top = `${newTop}px`;
                container.style.left = `${newLeft}px`;
                container.style.right = 'auto';
                
                // Reset offset for next calculation
                xOffset = 0;
                yOffset = 0;
                initialX = e.type === "touchmove" ? e.touches[0].clientX : e.clientX;
                initialY = e.type === "touchmove" ? e.touches[0].clientY : e.clientY;
            }
        }

        // Add event listeners
        dragHandle.addEventListener("mousedown", dragStart, false);
        document.addEventListener("mouseup", dragEnd, false);
        document.addEventListener("mousemove", drag, false);

        // Touch events for mobile
        dragHandle.addEventListener("touchstart", dragStart, false);
        document.addEventListener("touchend", dragEnd, false);
        document.addEventListener("touchmove", drag, false);
    }

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
                // Send to Bonsai app
                const app = document.getElementById('bonsai-sat-app');
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
        const container = document.getElementById('bonsai-sat-container');
        if (container) {
            const isVisible = container.style.transform === 'translateX(0px)' || 
                            container.style.transform === '';
            
            container.style.transform = isVisible ? 'translateX(100%)' : 'translateX(0)';
            
            // Notify app about visibility change
            const app = document.getElementById('bonsai-sat-app');
            if (app && app.toggleMainView) {
                app.toggleMainView();
            }
        }
    }

    function triggerQuickHelp() {
        const app = document.getElementById('bonsai-sat-app');
        if (app) {
            // Show Bonsai if hidden
            toggleBonsaiVisibility();
            
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
        const app = document.getElementById('bonsai-sat-app');
        if (app && settings) {
            // Update app settings
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