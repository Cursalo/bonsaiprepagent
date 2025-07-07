import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/ai/openai';
import { GeminiService } from '@/lib/ai/gemini';

interface ContextAnalysisRequest {
  questionText?: string;
  questionImage?: string; // base64 encoded
  answerChoices?: string[];
  passage?: string;
  url?: string;
  platform?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContextAnalysisRequest = await request.json();

    if (!body.questionText && !body.questionImage) {
      return NextResponse.json(
        { error: 'Either questionText or questionImage is required' },
        { status: 400 }
      );
    }

    // Analyze question context using AI
    let analysis;
    try {
      // Prefer OpenAI for image analysis, Gemini for text-only
      if (body.questionImage) {
        analysis = await OpenAIService.analyzeQuestionContext(
          body.questionText,
          body.questionImage
        );
      } else {
        analysis = await GeminiService.analyzeQuestionContext(
          body.questionText!
        );
      }
    } catch (error) {
      console.error('AI analysis failed, using fallback:', error);
      
      // Fallback analysis using simple keyword detection
      analysis = this.fallbackAnalysis(body.questionText || '', body.answerChoices);
    }

    // Enhanced analysis with additional context
    const enhancedAnalysis = {
      ...analysis,
      platform: body.platform || 'unknown',
      url: body.url,
      hasImage: !!body.questionImage,
      hasPassage: !!body.passage,
      answerChoiceCount: body.answerChoices?.length || 0,
      complexity: this.calculateComplexity({
        questionText: body.questionText,
        answerChoices: body.answerChoices,
        passage: body.passage,
      }),
      recommendations: this.generateRecommendations(analysis, {
        hasImage: !!body.questionImage,
        hasPassage: !!body.passage,
        platform: body.platform,
      }),
    };

    return NextResponse.json({
      success: true,
      analysis: enhancedAnalysis,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Context analysis error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to analyze context'
      },
      { status: 500 }
    );
  }

  /**
   * Fallback analysis using keyword detection
   */
  private static fallbackAnalysis(
    questionText: string,
    answerChoices?: string[]
  ) {
    const text = (questionText + ' ' + (answerChoices?.join(' ') || '')).toLowerCase();
    
    let subject: 'math' | 'reading' | 'writing' = 'math';
    let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
    const topics: string[] = [];
    
    // Subject detection
    if (text.includes('passage') || text.includes('author') || text.includes('text') || 
        text.includes('paragraph') || text.includes('reading')) {
      subject = 'reading';
      topics.push('reading comprehension');
    } else if (text.includes('grammar') || text.includes('sentence') || 
               text.includes('punctuation') || text.includes('verb') || 
               text.includes('comma') || text.includes('period')) {
      subject = 'writing';
      topics.push('grammar');
    } else if (/\d+|equation|solve|calculate|graph|function|algebra|geometry/.test(text)) {
      subject = 'math';
      if (text.includes('algebra') || text.includes('equation')) topics.push('algebra');
      if (text.includes('geometry') || text.includes('triangle')) topics.push('geometry');
      if (text.includes('graph') || text.includes('coordinate')) topics.push('coordinate geometry');
    }
    
    // Difficulty estimation
    const complexWords = text.split(' ').filter(word => word.length > 7).length;
    const mathSymbols = (text.match(/\^|\*|\/|\+|-|\(|\)|√|π|∞/g) || []).length;
    
    if (complexWords > 8 || mathSymbols > 5 || text.length > 500) {
      difficulty = 'hard';
    } else if (complexWords > 4 || mathSymbols > 2 || text.length > 200) {
      difficulty = 'medium';
    } else {
      difficulty = 'easy';
    }
    
    // Add basic topics if none detected
    if (topics.length === 0) {
      topics.push('general');
    }
    
    return {
      subject,
      difficulty,
      topics,
      questionType: subject === 'math' ? 'problem solving' : 
                   subject === 'reading' ? 'comprehension' : 'language usage',
    };
  }

  /**
   * Calculate question complexity score
   */
  private static calculateComplexity(content: {
    questionText?: string;
    answerChoices?: string[];
    passage?: string;
  }): number {
    let complexity = 0;
    
    const allText = [
      content.questionText || '',
      ...(content.answerChoices || []),
      content.passage || ''
    ].join(' ');
    
    // Length factor
    complexity += Math.min(allText.length / 1000, 1) * 0.3;
    
    // Vocabulary complexity
    const complexWords = allText.split(' ').filter(word => word.length > 8).length;
    complexity += Math.min(complexWords / 10, 1) * 0.3;
    
    // Mathematical complexity
    const mathSymbols = (allText.match(/\^|\*|\/|\+|-|\(|\)|√|π|∞|∑|∫/g) || []).length;
    complexity += Math.min(mathSymbols / 10, 1) * 0.2;
    
    // Structure complexity
    if (content.passage) complexity += 0.1;
    if ((content.answerChoices?.length || 0) > 4) complexity += 0.1;
    
    return Math.min(complexity, 1);
  }

  /**
   * Generate assistance recommendations
   */
  private static generateRecommendations(
    analysis: any,
    context: {
      hasImage: boolean;
      hasPassage: boolean;
      platform?: string;
    }
  ) {
    const recommendations = [];
    
    // Subject-specific recommendations
    if (analysis.subject === 'math') {
      recommendations.push('Consider showing step-by-step solution process');
      if (context.hasImage) {
        recommendations.push('Analyze visual elements like graphs or diagrams');
      }
    } else if (analysis.subject === 'reading') {
      recommendations.push('Reference specific parts of the passage');
      recommendations.push('Focus on evidence-based reasoning');
      if (context.hasPassage) {
        recommendations.push('Highlight key textual evidence');
      }
    } else if (analysis.subject === 'writing') {
      recommendations.push('Explain grammar rules clearly');
      recommendations.push('Provide examples of correct usage');
    }
    
    // Difficulty-based recommendations
    if (analysis.difficulty === 'hard') {
      recommendations.push('Break down complex concepts into simpler steps');
      recommendations.push('Provide multiple approaches to the solution');
    } else if (analysis.difficulty === 'easy') {
      recommendations.push('Focus on building confidence');
      recommendations.push('Connect to fundamental concepts');
    }
    
    // Platform-specific recommendations
    if (context.platform === 'bluebook') {
      recommendations.push('Respect official test environment');
      recommendations.push('Focus on test-taking strategies');
    } else if (context.platform === 'khan_academy') {
      recommendations.push('Encourage practice and mastery');
      recommendations.push('Connect to related Khan Academy resources');
    }
    
    return recommendations;
  }
}