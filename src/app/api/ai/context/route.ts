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

/**
 * Fallback analysis using keyword detection
 */
function fallbackAnalysis(
  questionText: string,
  answerChoices?: string[]
) {
  const text = (questionText + ' ' + (answerChoices?.join(' ') || '')).toLowerCase();

  // Determine subject based on keywords
  let subject = 'general';
  let difficulty = 'medium';
  let topics: string[] = [];

  // Math keywords
  if (text.match(/\b(equation|solve|calculate|algebra|geometry|trigonometry|function|graph|polynomial|derivative|integral|probability|statistics|ratio|proportion|percentage)\b/)) {
    subject = 'math';
    if (text.match(/\b(derivative|integral|calculus|limit)\b/)) difficulty = 'hard';
    if (text.match(/\b(basic|simple|elementary)\b/)) difficulty = 'easy';
    
    if (text.includes('algebra')) topics.push('algebra');
    if (text.includes('geometry')) topics.push('geometry');
    if (text.includes('statistics')) topics.push('statistics');
  }

  // Reading keywords
  else if (text.match(/\b(passage|paragraph|author|tone|main idea|inference|conclusion|evidence|purpose|argument|theme|character|plot)\b/)) {
    subject = 'reading';
    if (text.match(/\b(complex|sophisticated|nuanced|implicit)\b/)) difficulty = 'hard';
    if (text.match(/\b(simple|straightforward|obvious)\b/)) difficulty = 'easy';
    
    if (text.includes('main idea')) topics.push('main-idea');
    if (text.includes('inference')) topics.push('inference');
    if (text.includes('evidence')) topics.push('evidence-based-reading');
  }

  // Writing keywords
  else if (text.match(/\b(grammar|punctuation|sentence|paragraph|transition|revision|edit|comma|semicolon|apostrophe|subject|verb|pronoun)\b/)) {
    subject = 'writing';
    if (text.match(/\b(complex|advanced|sophisticated)\b/)) difficulty = 'hard';
    if (text.match(/\b(basic|simple|elementary)\b/)) difficulty = 'easy';
    
    if (text.includes('grammar')) topics.push('grammar');
    if (text.includes('punctuation')) topics.push('punctuation');
    if (text.includes('revision')) topics.push('revision');
  }

  return {
    subject,
    difficulty,
    topics,
    confidence: 0.6, // Lower confidence for fallback
    keywords: text.split(' ').filter(word => word.length > 3).slice(0, 10)
  };
}

/**
 * Calculate question complexity based on various factors
 */
function calculateComplexity(context: {
  questionText?: string;
  answerChoices?: string[];
  passage?: string;
}) {
  let score = 0;
  
  // Text length complexity
  const totalLength = (context.questionText?.length || 0) + 
                     (context.passage?.length || 0) + 
                     (context.answerChoices?.join('').length || 0);
  
  if (totalLength > 1000) score += 3;
  else if (totalLength > 500) score += 2;
  else score += 1;
  
  // Answer choice complexity
  if (context.answerChoices && context.answerChoices.length > 4) score += 1;
  
  // Passage complexity
  if (context.passage) {
    if (context.passage.length > 500) score += 2;
    else score += 1;
  }
  
  if (score >= 6) return 'very-hard';
  if (score >= 4) return 'hard';
  if (score >= 2) return 'medium';
  return 'easy';
}

/**
 * Generate recommendations based on analysis
 */
function generateRecommendations(
  analysis: any,
  context: {
    hasImage: boolean;
    hasPassage: boolean;
    platform?: string;
  }
) {
  const recommendations = [];
  
  if (analysis.difficulty === 'hard') {
    recommendations.push('Break down the problem into smaller steps');
    recommendations.push('Review relevant concepts before attempting');
  }
  
  if (analysis.subject === 'math') {
    recommendations.push('Show your work step by step');
    recommendations.push('Double-check your calculations');
  }
  
  if (analysis.subject === 'reading' && context.hasPassage) {
    recommendations.push('Read the passage carefully before answering');
    recommendations.push('Look for evidence in the text to support your answer');
  }
  
  if (analysis.subject === 'writing') {
    recommendations.push('Read the sentence aloud to check for errors');
    recommendations.push('Consider the context and tone');
  }
  
  if (context.hasImage) {
    recommendations.push('Examine all parts of the image carefully');
    recommendations.push('Look for visual clues and patterns');
  }
  
  return recommendations;
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
      analysis = fallbackAnalysis(body.questionText || '', body.answerChoices);
    }

    // Enhanced analysis with additional context
    const enhancedAnalysis = {
      ...analysis,
      platform: body.platform || 'unknown',
      url: body.url,
      hasImage: !!body.questionImage,
      hasPassage: !!body.passage,
      answerChoiceCount: body.answerChoices?.length || 0,
      complexity: calculateComplexity({
        questionText: body.questionText,
        answerChoices: body.answerChoices,
        passage: body.passage,
      }),
      recommendations: generateRecommendations(analysis, {
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
}