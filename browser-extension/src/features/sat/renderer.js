// Bonsai SAT Renderer - Handles AI communication and response streaming
// Adapted from Glass renderer for SAT tutoring context

class BonsaiSATRenderer {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://bonsaiprepagent.vercel.app';
        this.isProcessing = false;
        this.abortController = null;
        this.responseHandlers = new Set();
    }

    async initialize() {
        try {
            // Get API key from background script
            const response = await chrome.runtime.sendMessage({ action: 'getApiKey' });
            if (response && response.success && response.apiKey) {
                this.apiKey = response.apiKey;
                console.log('Bonsai SAT Renderer: Initialized with API key');
            } else {
                console.warn('Bonsai SAT Renderer: No API key available');
            }
        } catch (error) {
            console.error('Bonsai SAT Renderer: Failed to initialize:', error);
        }
    }

    addResponseHandler(handler) {
        this.responseHandlers.add(handler);
    }

    removeResponseHandler(handler) {
        this.responseHandlers.delete(handler);
    }

    notifyHandlers(event, data) {
        this.responseHandlers.forEach(handler => {
            try {
                if (typeof handler === 'function') {
                    handler(event, data);
                } else if (handler[event]) {
                    handler[event](data);
                }
            } catch (error) {
                console.error('Bonsai SAT Renderer: Handler error:', error);
            }
        });
    }

    async analyzeQuestion(questionData, analysisType = 'hint') {
        if (this.isProcessing) {
            console.warn('Bonsai SAT Renderer: Already processing request');
            return { success: false, error: 'Already processing' };
        }

        try {
            this.isProcessing = true;
            this.abortController = new AbortController();

            // Notify handlers that analysis is starting
            this.notifyHandlers('analysisStart', { questionData, analysisType });

            const analysisResult = await this.performAnalysis(questionData, analysisType);

            // Notify handlers of completion
            this.notifyHandlers('analysisComplete', analysisResult);

            return analysisResult;

        } catch (error) {
            console.error('Bonsai SAT Renderer: Analysis failed:', error);
            
            const errorResult = { 
                success: false, 
                error: error.message || 'Analysis failed',
                questionData,
                analysisType
            };

            this.notifyHandlers('analysisError', errorResult);
            return errorResult;

        } finally {
            this.isProcessing = false;
            this.abortController = null;
        }
    }

    async performAnalysis(questionData, analysisType) {
        const endpoint = this.getAnalysisEndpoint(analysisType);
        const payload = this.buildAnalysisPayload(questionData, analysisType);

        // Check authentication
        if (!this.apiKey) {
            throw new Error('Authentication required. Please sign in to use Bonsai SAT.');
        }

        const response = await fetch(`${this.baseUrl}/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(payload),
            signal: this.abortController.signal
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Authentication expired. Please sign in again.');
            } else if (response.status === 429) {
                throw new Error('Usage limit reached. Please upgrade your plan.');
            } else {
                throw new Error(`Server error: ${response.status}`);
            }
        }

        // Handle streaming response for step-by-step solutions
        if (analysisType === 'solution' && response.headers.get('content-type')?.includes('text/stream')) {
            return await this.handleStreamingResponse(response, questionData);
        }

        // Handle regular JSON response
        const result = await response.json();
        return this.processAnalysisResult(result, questionData, analysisType);
    }

    getAnalysisEndpoint(analysisType) {
        const endpoints = {
            hint: 'bonsai/hint',
            concept: 'bonsai/concept',
            solution: 'bonsai/solution',
            practice: 'bonsai/practice',
            analyze: 'bonsai/analyze'
        };

        return endpoints[analysisType] || 'bonsai/analyze';
    }

    buildAnalysisPayload(questionData, analysisType) {
        return {
            question: {
                text: questionData.text,
                type: questionData.type,
                subject: questionData.subject,
                difficulty: questionData.difficulty,
                platform: questionData.platform,
                choices: questionData.choices || [],
                concepts: questionData.concepts || []
            },
            analysis: {
                type: analysisType,
                context: {
                    url: questionData.url,
                    timestamp: questionData.timestamp
                }
            },
            preferences: {
                explanationLevel: 'detailed',
                includeSteps: analysisType === 'solution',
                includeHints: analysisType === 'hint',
                includeConcepts: analysisType === 'concept'
            }
        };
    }

    async handleStreamingResponse(response, questionData) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let steps = [];
        let currentStep = '';

        try {
            while (true) {
                const { done, value } = await reader.read();
                
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.type === 'step') {
                                if (currentStep) {
                                    steps.push(currentStep);
                                }
                                currentStep = data.content;
                                
                                // Notify handlers of streaming update
                                this.notifyHandlers('stepUpdate', {
                                    step: data.content,
                                    stepNumber: steps.length + 1,
                                    total: data.total || 'unknown'
                                });
                                
                            } else if (data.type === 'complete') {
                                if (currentStep) {
                                    steps.push(currentStep);
                                }
                                break;
                            }
                        } catch (parseError) {
                            console.warn('Bonsai SAT Renderer: Failed to parse streaming data:', parseError);
                        }
                    }
                }
            }

            return {
                success: true,
                type: 'solution',
                questionData,
                result: {
                    steps: steps,
                    explanation: `Step-by-step solution for ${questionData.subject} problem`,
                    concepts: this.extractConcepts(steps, questionData.subject)
                }
            };

        } finally {
            reader.releaseLock();
        }
    }

    processAnalysisResult(result, questionData, analysisType) {
        if (!result || !result.success) {
            throw new Error(result?.error || 'Invalid response from analysis service');
        }

        const processedResult = {
            success: true,
            type: analysisType,
            questionData,
            result: result.data
        };

        // Add analysis-specific processing
        switch (analysisType) {
            case 'hint':
                processedResult.result.hints = this.processHints(result.data.hints, questionData);
                break;
                
            case 'concept':
                processedResult.result.concepts = this.processConcepts(result.data.concepts, questionData);
                break;
                
            case 'practice':
                processedResult.result.recommendations = this.processPracticeRecommendations(
                    result.data.recommendations, 
                    questionData
                );
                break;
        }

        return processedResult;
    }

    processHints(hints, questionData) {
        if (!Array.isArray(hints)) return [];

        return hints.map((hint, index) => ({
            id: `hint-${index}`,
            level: hint.level || 'general',
            text: hint.text || hint,
            helpful: hint.helpful || false,
            concept: hint.concept || null
        }));
    }

    processConcepts(concepts, questionData) {
        if (!Array.isArray(concepts)) return [];

        return concepts.map((concept, index) => ({
            id: `concept-${index}`,
            name: concept.name || concept,
            description: concept.description || '',
            difficulty: concept.difficulty || questionData.difficulty,
            subject: concept.subject || questionData.subject,
            relatedTopics: concept.relatedTopics || []
        }));
    }

    processPracticeRecommendations(recommendations, questionData) {
        if (!Array.isArray(recommendations)) return [];

        return recommendations.map((rec, index) => ({
            id: `practice-${index}`,
            type: rec.type || 'similar',
            description: rec.description || rec,
            difficulty: rec.difficulty || questionData.difficulty,
            subject: rec.subject || questionData.subject,
            url: rec.url || null,
            estimatedTime: rec.estimatedTime || '5-10 minutes'
        }));
    }

    extractConcepts(steps, subject) {
        const conceptKeywords = {
            math: ['equation', 'formula', 'theorem', 'property', 'rule'],
            reading: ['theme', 'tone', 'inference', 'evidence', 'argument'],
            writing: ['grammar', 'syntax', 'style', 'clarity', 'transition']
        };

        const keywords = conceptKeywords[subject] || [];
        const foundConcepts = [];

        steps.forEach(step => {
            keywords.forEach(keyword => {
                if (step.toLowerCase().includes(keyword)) {
                    foundConcepts.push({
                        name: keyword,
                        context: step,
                        subject: subject
                    });
                }
            });
        });

        return foundConcepts;
    }

    // Public API methods for different analysis types
    async getHint(questionData) {
        return await this.analyzeQuestion(questionData, 'hint');
    }

    async explainConcept(questionData) {
        return await this.analyzeQuestion(questionData, 'concept');
    }

    async getSolution(questionData) {
        return await this.analyzeQuestion(questionData, 'solution');
    }

    async getPracticeRecommendations(questionData) {
        return await this.analyzeQuestion(questionData, 'practice');
    }

    async analyzeGeneral(questionData) {
        return await this.analyzeQuestion(questionData, 'analyze');
    }

    // Abort current analysis
    abort() {
        if (this.abortController) {
            this.abortController.abort();
            this.isProcessing = false;
            this.notifyHandlers('analysisAborted', {});
        }
    }

    // Check if currently processing
    isAnalyzing() {
        return this.isProcessing;
    }

    // Update API key
    updateApiKey(newApiKey) {
        this.apiKey = newApiKey;
        console.log('Bonsai SAT Renderer: API key updated');
    }
}

// Global instance
window.bonsaiSATRenderer = window.bonsaiSATRenderer || new BonsaiSATRenderer();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.bonsaiSATRenderer.initialize();
    });
} else {
    window.bonsaiSATRenderer.initialize();
}

export { BonsaiSATRenderer };