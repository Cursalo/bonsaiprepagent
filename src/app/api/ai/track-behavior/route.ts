/**
 * Behavior Tracking API
 * Tracks user behavior patterns for predictive assistance
 */

import { NextRequest, NextResponse } from 'next/server';
import { BonsaiAIService } from '@/lib/ai/service';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { userId, sessionId, pattern, timestamp } = await request.json();

    if (!userId || !pattern) {
      return NextResponse.json(
        { error: 'UserId and pattern are required' },
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

    // Track the behavior pattern
    await BonsaiAIService.trackBehavior({
      userId,
      sessionId: sessionId || `behavior_${Date.now()}`,
      timestamp: new Date(timestamp || Date.now()),
      ...pattern
    });

    return NextResponse.json({
      success: true,
      message: 'Behavior pattern tracked successfully'
    });

  } catch (error) {
    console.error('Behavior tracking failed:', error);
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