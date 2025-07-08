/**
 * Advanced Question Analyzer - Revolutionary AI-powered SAT question understanding
 * This system uses multi-modal AI to deeply understand questions, context, and optimal response strategies
 */

import { OpenAI } from 'openai';
import { createClient } from '@/lib/supabase/client';

export interface QuestionInput {
  screenshot?: string; // Base64 encoded image
  ocrText?: string;
  platform: 'bluebook' | 'khan_academy' | 'other';
  userId: string;
  behaviorMetrics: BehaviorMetrics;
  questionContext?: QuestionContext;
}

export interface BehaviorMetrics {
  timeOnQuestion: number;
  mouseMovements: number;
  keystrokes: number;
  scrolls: number;
  previousAttempts: number;
  frustrationLevel: number; // 0-1 scale
}

export interface QuestionContext {
  platformData: any;
  surroundingContent: string;
  questionPosition: number;
  passageReference?: string;
}

export interface QuestionAnalysis {
  subject: 'math' | 'reading' | 'writing';
  topic: string;
  subtopics: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  questionType: string;
  concepts: string[];
  commonMistakes: string[];
  requiredKnowledge: string[];
  estimatedSolveTime: number;
  confidence: number;
  visualElements: VisualElement[];
}

export interface VisualElement {
  type: 'equation' | 'graph' | 'diagram' | 'table' | 'chart';
  content: string;
  latex?: string;
  description: string;
}

export interface StudentState {
  knowledgeLevel: Record<string, number>; // Topic -> mastery level (0-1)
  learningStyle: 'visual' | 'analytical' | 'intuitive' | 'practical';
  currentMood: 'focused' | 'struggling' | 'confident' | 'frustrated';
  recentPerformance: PerformanceData[];
  preferredExplanationStyle: 'concise' | 'detailed' | 'step-by-step';
}

export interface PerformanceData {
  topic: string;
  accuracy: number;
  avgTime: number;
  helpFrequency: number;
  timestamp: Date;
}

export class AdvancedQuestionAnalyzer {
  private openai: OpenAI;
  private supabase = createClient();

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }

  /**
   * Main analysis pipeline - understands questions with unprecedented depth
   */
  async analyzeQuestion(input: QuestionInput): Promise<QuestionAnalysis> {
    try {
      // Step 1: Multi-modal understanding using GPT-4 Vision
      const visualAnalysis = await this.performVisualAnalysis(input);
      
      // Step 2: Extract and parse mathematical elements
      const mathElements = await this.extractMathematicalElements(visualAnalysis);
      
      // Step 3: Classify question type and difficulty
      const classification = await this.classifyQuestion(visualAnalysis, mathElements);
      
      // Step 4: Identify key concepts and common pitfalls
      const conceptAnalysis = await this.analyzeRequiredConcepts(classification);
      
      // Step 5: Estimate difficulty and solve time
      const complexityAnalysis = await this.analyzeComplexity(classification, mathElements);

      return {
        ...classification,
        ...conceptAnalysis,
        ...complexityAnalysis,
        visualElements: mathElements,
        confidence: this.calculateConfidence(visualAnalysis, classification)
      };
    } catch (error) {
      console.error('Question analysis failed:', error);
      throw new Error('Failed to analyze question');
    }
  }

  /**
   * Revolutionary visual analysis using GPT-4 Vision
   */
  private async performVisualAnalysis(input: QuestionInput): Promise<any> {
    if (!input.screenshot) {
      throw new Error('Screenshot required for visual analysis');
    }

    const response = await this.openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: `You are an expert SAT question analyzer. Analyze this SAT question image with extreme precision.

Identify:
1. Question text (complete and exact)
2. Answer choices (if multiple choice)
3. Any mathematical expressions, equations, or formulas
4. Graphs, charts, diagrams, or visual elements
5. Reading passages (if present)
6. Subject area (Math, Reading, Writing)
7. Question type (algebra, geometry, data analysis, etc.)
8. Difficulty indicators
9. Any special formatting or layout
10. Context clues about the platform (Bluebook, Khan Academy, etc.)

Be extremely thorough and precise. This analysis will determine how we help the student.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this SAT question. Platform: ${input.platform}\nOCR Text: ${input.ocrText || 'None provided'}`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${input.screenshot}`
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.1
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  /**
   * Extract and understand mathematical elements
   */
  private async extractMathematicalElements(visualAnalysis: any): Promise<VisualElement[]> {
    const mathElements: VisualElement[] = [];

    // Extract equations and convert to LaTeX
    if (visualAnalysis.mathematical_expressions) {
      for (const expr of visualAnalysis.mathematical_expressions) {
        const latexConversion = await this.convertToLatex(expr);
        mathElements.push({
          type: 'equation',
          content: expr,
          latex: latexConversion,
          description: await this.describeMathElement(expr)
        });
      }
    }

    // Process graphs and diagrams
    if (visualAnalysis.visual_elements) {
      for (const element of visualAnalysis.visual_elements) {
        mathElements.push({
          type: element.type,
          content: element.content,
          description: element.description
        });
      }
    }

    return mathElements;
  }

  /**
   * Intelligent question classification
   */
  private async classifyQuestion(visualAnalysis: any, mathElements: VisualElement[]): Promise<Partial<QuestionAnalysis>> {
    const prompt = `Based on this question analysis, classify it precisely:

Visual Analysis: ${JSON.stringify(visualAnalysis)}
Math Elements: ${JSON.stringify(mathElements)}

Provide classification in JSON format:
{
  "subject": "math|reading|writing",
  "topic": "specific topic like 'linear equations' or 'reading comprehension'",
  "subtopics": ["array of specific subtopics"],
  "difficulty": "easy|medium|hard",
  "questionType": "specific type like 'solve for x' or 'main idea'"
}`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert SAT question classifier. Provide precise, detailed classifications." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  /**
   * Analyze required concepts and common mistakes
   */
  private async analyzeRequiredConcepts(classification: any): Promise<Partial<QuestionAnalysis>> {
    const prompt = `For this SAT question classification, identify the required knowledge and common mistakes:

Classification: ${JSON.stringify(classification)}

Provide analysis in JSON format:
{
  "concepts": ["array of key concepts needed"],
  "requiredKnowledge": ["prerequisite knowledge areas"],
  "commonMistakes": ["typical errors students make on this type"]
}`;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert SAT tutor who understands common student difficulties." },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  /**
   * Analyze question complexity and timing
   */
  private async analyzeComplexity(classification: any, mathElements: VisualElement[]): Promise<Partial<QuestionAnalysis>> {
    const complexity = this.calculateComplexityScore(classification, mathElements);
    const estimatedTime = this.estimateSolveTime(complexity, classification.subject);

    return {
      estimatedSolveTime: estimatedTime
    };
  }

  /**
   * Convert mathematical expressions to LaTeX
   */
  private async convertToLatex(expression: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "Convert mathematical expressions to proper LaTeX format. Return only the LaTeX code." 
        },
        { role: "user", content: `Convert to LaTeX: ${expression}` }
      ],
      temperature: 0
    });

    return response.choices[0].message.content || expression;
  }

  /**
   * Describe mathematical elements for accessibility
   */
  private async describeMathElement(element: string): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "Provide a clear, accessible description of mathematical elements for students." 
        },
        { role: "user", content: `Describe this mathematical element: ${element}` }
      ],
      temperature: 0.2
    });

    return response.choices[0].message.content || 'Mathematical element';
  }

  /**
   * Calculate analysis confidence score
   */
  private calculateConfidence(visualAnalysis: any, classification: any): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence based on clear visual elements
    if (visualAnalysis.question_text && visualAnalysis.question_text.length > 10) confidence += 0.2;
    if (visualAnalysis.answer_choices && visualAnalysis.answer_choices.length > 0) confidence += 0.2;
    if (classification.subject && classification.topic) confidence += 0.1;

    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate complexity score for difficulty assessment
   */
  private calculateComplexityScore(classification: any, mathElements: VisualElement[]): number {
    let score = 0;

    // Base complexity by subject
    const subjectComplexity = {
      'math': 0.6,
      'reading': 0.4,
      'writing': 0.3
    };
    score += subjectComplexity[classification.subject as keyof typeof subjectComplexity] || 0.5;

    // Add complexity for mathematical elements
    score += mathElements.length * 0.1;

    // Add complexity for multiple concepts
    if (classification.concepts) {
      score += classification.concepts.length * 0.05;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Estimate solve time based on complexity and subject
   */
  private estimateSolveTime(complexity: number, subject: string): number {
    const baseTime = {
      'math': 90, // seconds
      'reading': 120,
      'writing': 60
    };

    const base = baseTime[subject as keyof typeof baseTime] || 90;
    return Math.round(base * (0.5 + complexity));
  }

  /**
   * Get student's current knowledge state
   */
  async getStudentState(userId: string): Promise<StudentState> {
    const { data: profile } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    const { data: recentSessions } = await this.supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: interactions } = await this.supabase
      .from('ai_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    // Analyze performance patterns
    const knowledgeLevel = this.calculateKnowledgeLevel(interactions || []);
    const learningStyle = this.detectLearningStyle(interactions || []);
    const currentMood = this.assessCurrentMood(recentSessions || []);

    return {
      knowledgeLevel,
      learningStyle,
      currentMood,
      recentPerformance: this.extractPerformanceData(interactions || []),
      preferredExplanationStyle: this.detectPreferredStyle(interactions || [])
    };
  }

  private calculateKnowledgeLevel(interactions: any[]): Record<string, number> {
    const topicScores: Record<string, { correct: number; total: number }> = {};

    interactions.forEach(interaction => {
      if (interaction.question_context?.topic) {
        const topic = interaction.question_context.topic;
        if (!topicScores[topic]) {
          topicScores[topic] = { correct: 0, total: 0 };
        }
        topicScores[topic].total++;
        if (interaction.user_helpful === true) {
          topicScores[topic].correct++;
        }
      }
    });

    const knowledgeLevel: Record<string, number> = {};
    Object.entries(topicScores).forEach(([topic, scores]) => {
      knowledgeLevel[topic] = scores.total > 0 ? scores.correct / scores.total : 0.5;
    });

    return knowledgeLevel;
  }

  private detectLearningStyle(interactions: any[]): 'visual' | 'analytical' | 'intuitive' | 'practical' {
    // Analyze interaction patterns to detect learning style
    // This is a simplified heuristic - in practice, you'd use more sophisticated analysis
    const recentInteractions = interactions.slice(0, 20);
    
    const visualRequests = recentInteractions.filter(i => 
      i.request_text?.includes('diagram') || i.request_text?.includes('visual')
    ).length;
    
    const stepByStepRequests = recentInteractions.filter(i => 
      i.assistance_type === 'explanation'
    ).length;

    if (visualRequests > stepByStepRequests) return 'visual';
    if (stepByStepRequests > visualRequests) return 'analytical';
    return 'intuitive'; // Default
  }

  private assessCurrentMood(sessions: any[]): 'focused' | 'struggling' | 'confident' | 'frustrated' {
    if (sessions.length === 0) return 'focused';

    const recentSession = sessions[0];
    const accuracy = recentSession.questions_correct / (recentSession.questions_attempted || 1);
    const helpFrequency = recentSession.bonsai_interactions / (recentSession.questions_attempted || 1);

    if (accuracy > 0.8 && helpFrequency < 0.3) return 'confident';
    if (accuracy < 0.4 && helpFrequency > 0.7) return 'frustrated';
    if (helpFrequency > 0.5) return 'struggling';
    return 'focused';
  }

  private extractPerformanceData(interactions: any[]): PerformanceData[] {
    // Group interactions by topic and calculate performance metrics
    const topicData: Record<string, any[]> = {};
    
    interactions.forEach(interaction => {
      const topic = interaction.question_context?.topic || 'general';
      if (!topicData[topic]) topicData[topic] = [];
      topicData[topic].push(interaction);
    });

    return Object.entries(topicData).map(([topic, data]) => ({
      topic,
      accuracy: data.filter(d => d.user_helpful === true).length / data.length,
      avgTime: data.reduce((sum, d) => sum + (d.response_time_ms || 0), 0) / data.length,
      helpFrequency: data.length / interactions.length,
      timestamp: new Date(data[0]?.created_at || Date.now())
    }));
  }

  private detectPreferredStyle(interactions: any[]): 'concise' | 'detailed' | 'step-by-step' {
    const recentInteractions = interactions.slice(0, 10);
    const hintRequests = recentInteractions.filter(i => i.assistance_type === 'hint').length;
    const explanationRequests = recentInteractions.filter(i => i.assistance_type === 'explanation').length;
    
    if (hintRequests > explanationRequests) return 'concise';
    if (explanationRequests > hintRequests * 2) return 'detailed';
    return 'step-by-step';
  }
}