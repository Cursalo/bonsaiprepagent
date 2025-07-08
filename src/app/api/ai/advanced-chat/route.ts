/**
 * Advanced AI Chat API
 * Provides revolutionary AI tutoring with behavioral analysis and response optimization
 */

import { NextRequest, NextResponse } from 'next/server';
import { BonsaiAIService } from '@/lib/ai/service';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { 
      messages, 
      assistanceType, 
      context, 
      screenshot, 
      behaviorMetrics 
    } = await request.json();

    if (!messages || !assistanceType || !context?.userId) {
      return NextResponse.json(
        { error: 'Messages, assistanceType, and userId are required' },
        { status: 400 }
      );
    }

    // Verify user authentication
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || session.user.id !== context.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Use advanced AI chat with all enhancements
    const response = await BonsaiAIService.advancedChat(
      messages,
      assistanceType,
      context,
      screenshot,
      behaviorMetrics
    );

    return NextResponse.json({
      success: true,
      ...response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Advanced AI chat failed:', error);
    
    // If advanced chat fails, try regular chat as fallback
    try {
      const { messages, assistanceType, context } = await request.json();
      const fallbackResponse = await BonsaiAIService.chat(messages, assistanceType, context);
      
      return NextResponse.json({
        success: true,
        ...fallbackResponse,
        fallback: true,
        timestamp: new Date().toISOString()
      });
    } catch (fallbackError) {
      console.error('Fallback chat also failed:', fallbackError);
      return NextResponse.json(
        { error: 'AI service temporarily unavailable' },
        { status: 503 }
      );
    }
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}