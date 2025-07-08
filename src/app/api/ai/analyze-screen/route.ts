/**
 * Advanced Screen Analysis API
 * Uses GPT-4 Vision and advanced AI to analyze SAT questions from screenshots
 */

import { NextRequest, NextResponse } from 'next/server';
import { BonsaiAIService } from '@/lib/ai/service';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { screenshot, userId, platform, behaviorMetrics } = await request.json();

    if (!screenshot || !userId) {
      return NextResponse.json(
        { error: 'Screenshot and userId are required' },
        { status: 400 }
      );
    }

    // Verify user authentication
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || session.user.id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Analyze the screenshot using advanced AI
    const questionAnalysis = await BonsaiAIService.analyzeScreenContext(
      screenshot,
      userId,
      platform
    );

    if (!questionAnalysis) {
      return NextResponse.json(
        { error: 'Failed to analyze screenshot' },
        { status: 500 }
      );
    }

    // Track behavior pattern if provided
    if (behaviorMetrics) {
      await BonsaiAIService.trackBehavior({
        userId,
        sessionId: `screen_analysis_${Date.now()}`,
        timestamp: new Date(),
        ...behaviorMetrics
      });
    }

    return NextResponse.json({
      success: true,
      questionAnalysis,
      platform,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Screen analysis failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}