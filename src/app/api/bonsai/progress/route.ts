import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET endpoint - Retrieve user's Bonsai progress
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Get Bonsai state
    const { data: bonsaiState, error: bonsaiError } = await supabase
      .from('bonsai_states')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (bonsaiError) {
      console.error('Error fetching Bonsai state:', bonsaiError);
      return NextResponse.json(
        { error: 'Failed to fetch Bonsai progress' },
        { status: 500 }
      );
    }

    // Get user achievements
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select(`
        id,
        unlocked_at,
        achievements (
          id,
          name,
          description,
          icon,
          category,
          rarity,
          experience_reward
        )
      `)
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    // Get recent AI interactions for activity
    const { data: recentInteractions } = await supabase
      .from('ai_interactions')
      .select('created_at, experience_gained, assistance_type, level_up_occurred')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get weekly progress
    const { data: weeklyProgress } = await supabase
      .from('weekly_progress')
      .select('*')
      .eq('user_id', userId)
      .order('week_start', { ascending: false })
      .limit(4); // Last 4 weeks

    // Calculate progress statistics
    const stats = calculateProgressStats(bonsaiState, recentInteractions || []);

    return NextResponse.json({
      success: true,
      bonsaiState: {
        level: bonsaiState.level,
        experience: bonsaiState.experience,
        experienceToNext: bonsaiState.experience_to_next,
        totalExperience: bonsaiState.total_experience,
        growthStage: bonsaiState.growth_stage,
        appearance: {
          trunkColor: bonsaiState.trunk_color,
          leafColor: bonsaiState.leaf_color,
          flowerColor: bonsaiState.flower_color,
          size: bonsaiState.size,
          animation: bonsaiState.animation,
          effects: bonsaiState.effects,
        },
        unlockedFeatures: bonsaiState.unlocked_features,
        lastUpdated: bonsaiState.updated_at,
      },
      achievements: {
        unlocked: achievements || [],
        totalCount: achievements?.length || 0,
      },
      stats,
      weeklyProgress: weeklyProgress || [],
      recentActivity: recentInteractions || [],
    });

  } catch (error) {
    console.error('Bonsai progress API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint - Update Bonsai appearance or trigger growth
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, data } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, action' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'update_appearance':
        return await updateBonsaiAppearance(userId, data);
      
      case 'unlock_feature':
        return await unlockBonsaiFeature(userId, data.feature);
      
      case 'trigger_growth':
        return await triggerBonsaiGrowth(userId, data.experienceBonus);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Bonsai update API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateProgressStats(bonsaiState: any, recentInteractions: any[]) {
  const today = new Date();
  const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  // Filter interactions from last week
  const weeklyInteractions = recentInteractions.filter(
    interaction => new Date(interaction.created_at) >= oneWeekAgo
  );

  const totalExperienceThisWeek = weeklyInteractions.reduce(
    (sum, interaction) => sum + (interaction.experience_gained || 0),
    0
  );

  const interactionsByType = weeklyInteractions.reduce((acc, interaction) => {
    acc[interaction.assistance_type] = (acc[interaction.assistance_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const levelUpsThisWeek = weeklyInteractions.filter(
    interaction => interaction.level_up_occurred
  ).length;

  // Calculate progress percentage to next level
  const progressToNext = bonsaiState.experience_to_next > 0 
    ? (bonsaiState.experience / bonsaiState.experience_to_next) * 100 
    : 100;

  return {
    currentLevel: bonsaiState.level,
    progressToNext: Math.round(progressToNext),
    experienceThisWeek: totalExperienceThisWeek,
    interactionsThisWeek: weeklyInteractions.length,
    levelUpsThisWeek,
    favoriteAssistanceType: (() => {
      const entries = Object.entries(interactionsByType) as [string, number][];
      const max = entries.reduce(
        (max: { type?: string; count?: number }, [type, count]) => 
          count > (max.count || 0) ? { type, count } : max,
        {} as { type?: string; count?: number }
      );
      return max.type || 'hint';
    })(),
    growthStage: bonsaiState.growth_stage,
    totalExperience: bonsaiState.total_experience,
  };
}

async function updateBonsaiAppearance(userId: string, appearanceData: any) {
  const allowedUpdates = ['trunk_color', 'leaf_color', 'flower_color', 'size', 'animation', 'effects'];
  const updates: any = {};

  // Validate and filter appearance updates
  for (const [key, value] of Object.entries(appearanceData)) {
    if (allowedUpdates.includes(key)) {
      updates[key] = value;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json(
      { error: 'No valid appearance updates provided' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('bonsai_states')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating Bonsai appearance:', error);
    return NextResponse.json(
      { error: 'Failed to update appearance' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'Bonsai appearance updated successfully',
    updatedState: data,
  });
}

async function unlockBonsaiFeature(userId: string, feature: string) {
  // Get current unlocked features
  const { data: currentState } = await supabase
    .from('bonsai_states')
    .select('unlocked_features')
    .eq('user_id', userId)
    .single();

  if (!currentState) {
    return NextResponse.json(
      { error: 'Bonsai state not found' },
      { status: 404 }
    );
  }

  const currentFeatures = currentState.unlocked_features || [];
  
  // Check if feature is already unlocked
  if (currentFeatures.includes(feature)) {
    return NextResponse.json(
      { success: true, message: 'Feature already unlocked' }
    );
  }

  // Add new feature
  const updatedFeatures = [...currentFeatures, feature];

  const { data, error } = await supabase
    .from('bonsai_states')
    .update({ unlocked_features: updatedFeatures })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error unlocking Bonsai feature:', error);
    return NextResponse.json(
      { error: 'Failed to unlock feature' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Feature '${feature}' unlocked successfully`,
    unlockedFeatures: updatedFeatures,
  });
}

async function triggerBonsaiGrowth(userId: string, experienceBonus: number = 0) {
  const { data: currentState } = await supabase
    .from('bonsai_states')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!currentState) {
    return NextResponse.json(
      { error: 'Bonsai state not found' },
      { status: 404 }
    );
  }

  const newExperience = currentState.experience + experienceBonus;
  const newTotalExperience = currentState.total_experience + experienceBonus;
  
  let updates: any = {
    experience: newExperience,
    total_experience: newTotalExperience,
  };

  let levelUpOccurred = false;

  // Check for level up
  if (newExperience >= currentState.experience_to_next) {
    const newLevel = currentState.level + 1;
    const newExperienceToNext = Math.floor(100 * Math.pow(1.1, newLevel - 1));
    const newGrowthStage = getGrowthStageForLevel(newLevel);
    
    updates = {
      ...updates,
      level: newLevel,
      experience: 0,
      experience_to_next: newExperienceToNext,
      growth_stage: newGrowthStage,
    };
    
    levelUpOccurred = true;
  }

  const { data, error } = await supabase
    .from('bonsai_states')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error triggering Bonsai growth:', error);
    return NextResponse.json(
      { error: 'Failed to trigger growth' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    levelUpOccurred,
    experienceGained: experienceBonus,
    newState: data,
    message: levelUpOccurred 
      ? `Congratulations! Your Bonsai grew to level ${data.level}!`
      : 'Bonsai growth triggered successfully',
  });
}

function getGrowthStageForLevel(level: number): string {
  if (level < 5) return 'seed';
  if (level < 10) return 'sprout';
  if (level < 20) return 'sapling';
  if (level < 35) return 'young_tree';
  if (level < 50) return 'mature_tree';
  if (level < 75) return 'ancient_tree';
  return 'wisdom_tree';
}