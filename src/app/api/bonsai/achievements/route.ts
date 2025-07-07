import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET endpoint - Retrieve achievements for user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const includeAll = searchParams.get('includeAll') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    if (includeAll) {
      // Get all achievements with unlock status
      const { data: allAchievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('rarity', { ascending: true });

      // Get user's unlocked achievements
      const { data: userAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at')
        .eq('user_id', userId);

      const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
      
      const achievementsWithStatus = allAchievements?.map(achievement => ({
        ...achievement,
        unlocked: unlockedIds.has(achievement.id),
        unlockedAt: userAchievements?.find(ua => ua.achievement_id === achievement.id)?.unlocked_at || null,
      })) || [];

      // Separate unlocked and locked achievements
      const unlocked = achievementsWithStatus.filter(a => a.unlocked);
      const locked = achievementsWithStatus.filter(a => !a.unlocked);

      // Calculate progress for locked achievements
      const lockedWithProgress = await Promise.all(
        locked.map(async (achievement) => {
          const progress = await calculateAchievementProgress(userId, achievement.requirements);
          return {
            ...achievement,
            progress,
            progressPercentage: Math.round((progress.current / progress.required) * 100),
          };
        })
      );

      return NextResponse.json({
        success: true,
        achievements: {
          unlocked,
          locked: lockedWithProgress,
          summary: {
            totalAchievements: achievementsWithStatus.length,
            unlockedCount: unlocked.length,
            lockedCount: locked.length,
            completionPercentage: Math.round((unlocked.length / achievementsWithStatus.length) * 100),
          }
        },
      });

    } else {
      // Get only unlocked achievements
      const { data: userAchievements } = await supabase
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

      return NextResponse.json({
        success: true,
        achievements: userAchievements || [],
        count: userAchievements?.length || 0,
      });
    }

  } catch (error) {
    console.error('Achievements API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint - Check and unlock achievements
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
      case 'check_achievements':
        return await checkAndUnlockAchievements(userId);
      
      case 'unlock_achievement':
        if (!data?.achievementId) {
          return NextResponse.json(
            { error: 'Missing achievementId' },
            { status: 400 }
          );
        }
        return await unlockSpecificAchievement(userId, data.achievementId);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Achievement unlock API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function calculateAchievementProgress(userId: string, requirements: any) {
  const progress = { current: 0, required: 1 };

  try {
    if (requirements.sessions_completed) {
      // Count completed practice sessions
      const { count } = await supabase
        .from('practice_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .not('completed_at', 'is', null);
      
      progress.current = count || 0;
      progress.required = requirements.sessions_completed;
    }

    if (requirements.consecutive_days) {
      // Calculate current streak
      const streak = await calculateStudyStreak(userId);
      progress.current = streak;
      progress.required = requirements.consecutive_days;
    }

    if (requirements.math_correct) {
      // Count correct math answers
      const { count } = await supabase
        .from('user_answers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_correct', true)
        .in('question_type', ['math']);
      
      progress.current = count || 0;
      progress.required = requirements.math_correct;
    }

    if (requirements.reading_correct) {
      // Count correct reading answers
      const { count } = await supabase
        .from('user_answers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_correct', true)
        .in('question_type', ['reading']);
      
      progress.current = count || 0;
      progress.required = requirements.reading_correct;
    }

    if (requirements.writing_correct) {
      // Count correct writing answers
      const { count } = await supabase
        .from('user_answers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_correct', true)
        .in('question_type', ['writing']);
      
      progress.current = count || 0;
      progress.required = requirements.writing_correct;
    }

    if (requirements.voice_commands) {
      // Count voice command usage
      const { count } = await supabase
        .from('ai_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('voice_input', true);
      
      progress.current = count || 0;
      progress.required = requirements.voice_commands;
    }

    if (requirements.ai_interactions) {
      // Count AI interactions
      const { count } = await supabase
        .from('ai_interactions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      
      progress.current = count || 0;
      progress.required = requirements.ai_interactions;
    }

    if (requirements.perfect_session) {
      // Check for perfect accuracy sessions
      const { data: sessions } = await supabase
        .from('practice_sessions')
        .select('total_questions, correct_answers')
        .eq('user_id', userId)
        .not('completed_at', 'is', null);
      
      const perfectSessions = sessions?.filter(s => 
        s.total_questions > 0 && s.correct_answers === s.total_questions
      ).length || 0;
      
      progress.current = perfectSessions;
      progress.required = requirements.perfect_session;
    }

    if (requirements.quick_session) {
      // Check for quick completion sessions (10 questions in < 5 minutes)
      const { data: sessions } = await supabase
        .from('practice_sessions')
        .select('total_questions, time_spent')
        .eq('user_id', userId)
        .gte('total_questions', 10)
        .lt('time_spent', 300); // 5 minutes = 300 seconds
      
      progress.current = sessions?.length || 0;
      progress.required = requirements.quick_session;
    }

  } catch (error) {
    console.error('Error calculating achievement progress:', error);
  }

  return progress;
}

async function calculateStudyStreak(userId: string): Promise<number> {
  try {
    // Get study sessions ordered by date
    const { data: sessions } = await supabase
      .from('practice_sessions')
      .select('started_at')
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .order('started_at', { ascending: false });

    if (!sessions || sessions.length === 0) return 0;

    // Group sessions by date
    const studyDates = new Set();
    sessions.forEach(session => {
      const date = new Date(session.started_at).toDateString();
      studyDates.add(date);
    });

    const sortedDates = Array.from(studyDates).sort((a, b) => 
      new Date(b as string).getTime() - new Date(a as string).getTime()
    );

    // Calculate consecutive streak from most recent date
    let streak = 0;
    const today = new Date().toDateString();
    
    for (let i = 0; i < sortedDates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (sortedDates[i] === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating study streak:', error);
    return 0;
  }
}

async function checkAndUnlockAchievements(userId: string) {
  try {
    // Get all achievements that user hasn't unlocked yet
    const { data: unlockedAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const unlockedIds = new Set(unlockedAchievements?.map(ua => ua.achievement_id) || []);

    const { data: allAchievements } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true);

    const lockedAchievements = allAchievements?.filter(a => !unlockedIds.has(a.id)) || [];

    const newlyUnlocked = [];

    // Check each locked achievement
    for (const achievement of lockedAchievements) {
      const progress = await calculateAchievementProgress(userId, achievement.requirements);
      
      // Check if achievement should be unlocked
      if (progress.current >= progress.required) {
        // Unlock the achievement
        const { error } = await supabase
          .from('user_achievements')
          .insert({
            user_id: userId,
            achievement_id: achievement.id,
          });

        if (!error) {
          newlyUnlocked.push(achievement);
          
          // Award experience if specified
          if (achievement.experience_reward > 0) {
            await awardAchievementExperience(userId, achievement.experience_reward);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      newlyUnlocked,
      message: newlyUnlocked.length > 0 
        ? `Congratulations! You unlocked ${newlyUnlocked.length} new achievement(s)!`
        : 'No new achievements unlocked',
    });

  } catch (error) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    );
  }
}

async function unlockSpecificAchievement(userId: string, achievementId: string) {
  try {
    // Check if already unlocked
    const { data: existing } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
      .eq('achievement_id', achievementId)
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Achievement already unlocked',
      });
    }

    // Get achievement details
    const { data: achievement } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single();

    if (!achievement) {
      return NextResponse.json(
        { error: 'Achievement not found' },
        { status: 404 }
      );
    }

    // Unlock the achievement
    const { error } = await supabase
      .from('user_achievements')
      .insert({
        user_id: userId,
        achievement_id: achievementId,
      });

    if (error) {
      console.error('Error unlocking achievement:', error);
      return NextResponse.json(
        { error: 'Failed to unlock achievement' },
        { status: 500 }
      );
    }

    // Award experience if specified
    if (achievement.experience_reward > 0) {
      await awardAchievementExperience(userId, achievement.experience_reward);
    }

    return NextResponse.json({
      success: true,
      achievement,
      experienceAwarded: achievement.experience_reward,
      message: `Achievement "${achievement.name}" unlocked successfully!`,
    });

  } catch (error) {
    console.error('Error unlocking specific achievement:', error);
    return NextResponse.json(
      { error: 'Failed to unlock achievement' },
      { status: 500 }
    );
  }
}

async function awardAchievementExperience(userId: string, experience: number) {
  try {
    const { data: currentState } = await supabase
      .from('bonsai_states')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!currentState) return;

    const newExperience = currentState.experience + experience;
    const newTotalExperience = currentState.total_experience + experience;
    
    let updates: any = {
      experience: newExperience,
      total_experience: newTotalExperience,
    };

    // Check for level up
    if (newExperience >= currentState.experience_to_next) {
      const newLevel = currentState.level + 1;
      const newExperienceToNext = Math.floor(100 * Math.pow(1.1, newLevel - 1));
      
      updates = {
        ...updates,
        level: newLevel,
        experience: 0,
        experience_to_next: newExperienceToNext,
      };
    }

    await supabase
      .from('bonsai_states')
      .update(updates)
      .eq('user_id', userId);

  } catch (error) {
    console.error('Error awarding achievement experience:', error);
  }
}