import { NextRequest, NextResponse } from 'next/server';
import { BonsaiAIService, type AIInteractionContext } from '@/lib/ai/service';
import { type ChatMessage } from '@/lib/ai/openai';
import { GlassContextDetector, type ScreenContext } from '@/lib/glass/context';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface ChatRequest {
  userId: string;
  message: string;
  images?: string[]; // base64 encoded images
  assistanceType: 'hint' | 'explanation' | 'spiral_question' | 'full_solution';
  sessionId?: string;
  context?: {
    subject?: 'math' | 'reading' | 'writing';
    difficulty?: 'easy' | 'medium' | 'hard';
    questionType?: string;
    voiceInput?: boolean;
    voiceIntent?: string;
    screenContext?: ScreenContext;
    detectedPlatform?: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    
    // Validate required fields
    if (!body.userId || !body.message || !body.assistanceType) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, message, assistanceType' },
        { status: 400 }
      );
    }

    // Validate assistance type
    const validAssistanceTypes = ['hint', 'explanation', 'spiral_question', 'full_solution'];
    if (!validAssistanceTypes.includes(body.assistanceType)) {
      return NextResponse.json(
        { error: 'Invalid assistance type' },
        { status: 400 }
      );
    }

    // Build conversation history
    const conversationHistory = await BonsaiAIService.getConversationHistory(
      body.userId,
      body.sessionId,
      5 // Last 5 exchanges
    );

    // Add current message
    const currentMessage: ChatMessage = {
      role: 'user',
      content: body.message,
      images: body.images,
    };

    const messages = [...conversationHistory, currentMessage];

    // Build AI interaction context
    const aiContext: AIInteractionContext = {
      userId: body.userId,
      sessionId: body.sessionId,
      subject: body.context?.subject,
      difficulty: body.context?.difficulty,
      questionType: body.context?.questionType,
      voiceInput: body.context?.voiceInput,
      voiceIntent: body.context?.voiceIntent,
      screenContext: body.context?.screenContext,
      detectedPlatform: body.context?.detectedPlatform,
    };

    // Enhanced context analysis if screen context is provided
    if (body.context?.screenContext) {
      try {
        // If we have detected questions, use the first one for context
        const detectedQuestion = body.context.screenContext.detectedQuestions?.[0];
        if (detectedQuestion) {
          aiContext.subject = detectedQuestion.subject;
          aiContext.difficulty = detectedQuestion.difficulty;
          aiContext.questionType = detectedQuestion.contextData.section;
        }
        
        // Set detected platform
        aiContext.detectedPlatform = body.context.screenContext.platform;
      } catch (error) {
        console.error('Error processing screen context:', error);
      }
    }

    // Generate AI response
    const response = await BonsaiAIService.chat(
      messages,
      body.assistanceType,
      aiContext
    );

    // Return response with additional metadata
    return NextResponse.json({
      success: true,
      response: {
        content: response.content,
        assistanceType: response.assistanceType,
        provider: response.provider,
        experienceGained: response.experienceGained,
        levelUpOccurred: response.levelUpOccurred,
        usageRemaining: response.usageRemaining,
        confidence: response.confidence,
        responseTimeMs: response.responseTimeMs,
        spiralQuestions: response.spiralQuestions,
      },
      metadata: {
        timestamp: new Date().toISOString(),
        sessionId: body.sessionId,
        platform: aiContext.detectedPlatform,
        subject: aiContext.subject,
        difficulty: aiContext.difficulty,
      }
    });

  } catch (error) {
    console.error('AI Chat API error:', error);
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('limit reached') || error.message.includes('not available')) {
        return NextResponse.json(
          { 
            success: false,
            error: error.message,
            errorType: 'usage_limit'
          },
          { status: 403 }
        );
      }
      
      if (error.message.includes('AI service')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'AI service temporarily unavailable. Please try again.',
            errorType: 'service_unavailable'
          },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        errorType: 'internal_error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for retrieving conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const history = await BonsaiAIService.getConversationHistory(
      userId,
      sessionId || undefined,
      limit
    );

    return NextResponse.json({
      success: true,
      history,
      count: history.length,
    });

  } catch (error) {
    console.error('Get conversation history error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to retrieve conversation history'
      },
      { status: 500 }
    );
  }
}