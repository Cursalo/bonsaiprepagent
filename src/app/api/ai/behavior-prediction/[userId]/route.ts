/**
 * Behavioral Prediction API
 * Provides predictive insights about when students need help
 */

import { NextRequest, NextResponse } from 'next/server';
import { BonsaiAIService } from '@/lib/ai/service';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Get behavioral prediction
    const prediction = await BonsaiAIService.getBehavioralPrediction(userId);

    if (!prediction) {
      return NextResponse.json({
        needsHelp: false,
        confidence: 0,
        suggestedAction: 'wait',
        timeUntilIntervention: 0,
        reasoning: ['Insufficient data for prediction']
      });
    }

    return NextResponse.json(prediction);

  } catch (error) {
    console.error('Behavioral prediction failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}