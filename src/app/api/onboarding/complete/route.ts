import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { BonsaiAIService } from '@/lib/ai/service';

interface OnboardingData {
  firstName: string;
  lastName: string;
  grade: string;
  school?: string;
  targetScore: number;
  testDate: string;
  previousScore?: number;
  studyHours: number;
  studyDays: string[];
  preferredTime: string;
  strongSubjects: string[];
  weakSubjects: string[];
  learningStyle: string;
  motivationFactors: string[];
  mathBackground?: string;
  readingLevel?: string;
  hasAccommodations?: boolean;
  accommodations?: string;
  collegeGoals?: string[];
  studyMotivation?: string;
}

export async function POST(request: NextRequest) {
  try {
    const onboardingData: OnboardingData = await request.json();

    // Get authenticated user
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Update user profile with onboarding data
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        first_name: onboardingData.firstName,
        last_name: onboardingData.lastName,
        grade: onboardingData.grade,
        school: onboardingData.school,
        onboarding_completed: true,
        onboarding_data: onboardingData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (profileError) {
      throw new Error('Failed to update user profile');
    }

    // Create initial user goals
    const { error: goalsError } = await supabase
      .from('user_goals')
      .insert({
        user_id: user.id,
        target_score: onboardingData.targetScore,
        test_date: onboardingData.testDate,
        current_score: onboardingData.previousScore,
        target_math_score: Math.floor(onboardingData.targetScore / 2),
        target_verbal_score: Math.floor(onboardingData.targetScore / 2),
        weekly_study_hours: onboardingData.studyHours,
        preferred_study_days: onboardingData.studyDays,
        preferred_study_time: onboardingData.preferredTime,
      });

    if (goalsError) {
      console.error('Error creating user goals:', goalsError);
      // Continue even if goals creation fails
    }

    // Initialize Bonsai state
    const { error: bonsaiError } = await supabase
      .from('bonsai_states')
      .insert({
        user_id: user.id,
        level: 1,
        experience: 0,
        experience_to_next: 100,
        total_experience: 0,
        growth_stage: 'seed',
        trunk_color: '#8B4513',
        leaf_color: '#228B22',
        flower_color: '#FFB6C1',
        size: 'small',
        animation: 'gentle_sway',
        effects: [],
        unlocked_features: ['basic_ai', 'progress_tracking'],
        personality_traits: generateBonsaiPersonality(onboardingData),
      });

    if (bonsaiError) {
      console.error('Error creating Bonsai state:', bonsaiError);
      // Continue even if Bonsai creation fails
    }

    // Generate personalized study plan
    const studyPlan = await generateStudyPlan(onboardingData);

    // Create study plan entries
    if (studyPlan.sessions.length > 0) {
      const { error: planError } = await supabase
        .from('study_plans')
        .insert({
          user_id: user.id,
          plan_data: studyPlan,
          start_date: new Date().toISOString(),
          end_date: onboardingData.testDate,
          is_active: true,
        });

      if (planError) {
        console.error('Error creating study plan:', planError);
      }
    }

    // Create initial achievements based on onboarding
    const achievements = generateOnboardingAchievements(onboardingData);
    if (achievements.length > 0) {
      const { error: achievementsError } = await supabase
        .from('user_achievements')
        .insert(
          achievements.map(achievementId => ({
            user_id: user.id,
            achievement_id: achievementId,
          }))
        );

      if (achievementsError) {
        console.error('Error creating achievements:', achievementsError);
      }
    }

    // Generate AI welcome message
    const welcomeMessage = await generateWelcomeMessage(onboardingData);

    return NextResponse.json({
      success: true,
      message: 'Onboarding completed successfully',
      studyPlan,
      welcomeMessage,
      bonsaiPersonality: generateBonsaiPersonality(onboardingData),
    });

  } catch (error) {
    console.error('Onboarding completion error:', error);
    return NextResponse.json(
      { error: 'Failed to complete onboarding' },
      { status: 500 }
    );
  }
}

function generateBonsaiPersonality(data: OnboardingData) {
  const traits = [];
  
  // Based on learning style
  if (data.learningStyle === 'visual') {
    traits.push('visual_learner', 'detail_oriented');
  } else if (data.learningStyle === 'auditory') {
    traits.push('verbal_processor', 'discussion_lover');
  } else if (data.learningStyle === 'kinesthetic') {
    traits.push('hands_on', 'practical');
  } else if (data.learningStyle === 'reading') {
    traits.push('analytical', 'methodical');
  }
  
  // Based on motivation
  if (data.motivationFactors.includes('competition')) {
    traits.push('competitive', 'achievement_focused');
  }
  if (data.motivationFactors.includes('personal')) {
    traits.push('self_motivated', 'growth_minded');
  }
  if (data.motivationFactors.includes('college')) {
    traits.push('goal_oriented', 'future_focused');
  }
  
  // Based on study intensity
  if (data.studyHours >= 10) {
    traits.push('dedicated', 'intensive');
  } else if (data.studyHours >= 5) {
    traits.push('balanced', 'consistent');
  } else {
    traits.push('efficient', 'focused');
  }
  
  return traits;
}

async function generateStudyPlan(data: OnboardingData) {
  const weeksUntilTest = Math.ceil(
    (new Date(data.testDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 7)
  );
  
  const totalStudyHours = weeksUntilTest * data.studyHours;
  const sessionsPerWeek = data.studyDays.length;
  const minutesPerSession = (data.studyHours * 60) / sessionsPerWeek;
  
  // Calculate subject allocation based on strengths and weaknesses
  const subjectAllocation = calculateSubjectAllocation(data);
  
  const plan = {
    totalWeeks: weeksUntilTest,
    totalHours: totalStudyHours,
    sessionsPerWeek,
    minutesPerSession: Math.round(minutesPerSession),
    subjectAllocation,
    phases: generateStudyPhases(weeksUntilTest, data),
    sessions: generateWeeklySchedule(data),
    milestones: generateMilestones(weeksUntilTest, data.targetScore),
  };
  
  return plan;
}

function calculateSubjectAllocation(data: OnboardingData) {
  const allocation: Record<string, number> = {
    math: 40,
    reading: 35,
    writing: 25,
  };
  
  // Adjust based on weak subjects
  data.weakSubjects.forEach(subject => {
    if (subject === 'math') allocation.math += 10;
    if (subject === 'reading') allocation.reading += 10;
    if (subject === 'grammar' || subject === 'essay') allocation.writing += 10;
  });
  
  // Reduce strong subjects slightly
  data.strongSubjects.forEach(subject => {
    if (subject === 'math') allocation.math -= 5;
    if (subject === 'reading') allocation.reading -= 5;
    if (subject === 'grammar' || subject === 'essay') allocation.writing -= 5;
  });
  
  // Normalize to 100%
  const total = Object.values(allocation).reduce((sum, val) => sum + val, 0);
  Object.keys(allocation).forEach(key => {
    allocation[key] = Math.round((allocation[key] / total) * 100);
  });
  
  return allocation;
}

function generateStudyPhases(weeks: number, data: OnboardingData) {
  if (weeks <= 4) {
    return [
      {
        name: 'Intensive Review',
        weeks: weeks,
        focus: 'practice_tests',
        description: 'Focus on practice tests and weak areas',
      },
    ];
  } else if (weeks <= 12) {
    return [
      {
        name: 'Foundation Building',
        weeks: Math.ceil(weeks * 0.4),
        focus: 'concepts',
        description: 'Build strong foundational knowledge',
      },
      {
        name: 'Skill Development',
        weeks: Math.ceil(weeks * 0.4),
        focus: 'practice',
        description: 'Develop problem-solving strategies',
      },
      {
        name: 'Test Preparation',
        weeks: Math.floor(weeks * 0.2),
        focus: 'practice_tests',
        description: 'Full-length practice tests and review',
      },
    ];
  } else {
    return [
      {
        name: 'Foundation Building',
        weeks: Math.ceil(weeks * 0.3),
        focus: 'concepts',
        description: 'Build strong foundational knowledge',
      },
      {
        name: 'Skill Development',
        weeks: Math.ceil(weeks * 0.4),
        focus: 'practice',
        description: 'Develop problem-solving strategies',
      },
      {
        name: 'Advanced Practice',
        weeks: Math.ceil(weeks * 0.2),
        focus: 'advanced',
        description: 'Advanced problems and strategies',
      },
      {
        name: 'Test Preparation',
        weeks: Math.floor(weeks * 0.1),
        focus: 'practice_tests',
        description: 'Full-length practice tests and review',
      },
    ];
  }
}

function generateWeeklySchedule(data: OnboardingData) {
  const timeSlots = {
    morning: '8:00 AM',
    midday: '12:00 PM',
    afternoon: '3:00 PM',
    evening: '7:00 PM',
    flexible: '6:00 PM',
  };
  
  const startTime = timeSlots[data.preferredTime as keyof typeof timeSlots] || '6:00 PM';
  const sessionDuration = Math.round((data.studyHours * 60) / data.studyDays.length);
  
  return data.studyDays.map(day => ({
    day,
    startTime,
    duration: sessionDuration,
    subjects: ['math', 'reading', 'writing'], // Will be rotated
  }));
}

function generateMilestones(weeks: number, targetScore: number) {
  const milestones = [];
  const scoreIncrement = Math.floor((targetScore - 1000) / Math.max(weeks / 4, 1));
  
  for (let i = 1; i <= Math.min(weeks / 4, 4); i++) {
    milestones.push({
      week: i * 4,
      targetScore: 1000 + (scoreIncrement * i),
      description: `Practice test ${i}`,
      type: 'practice_test',
    });
  }
  
  return milestones;
}

function generateOnboardingAchievements(data: OnboardingData): string[] {
  const achievements = ['first_steps']; // Everyone gets this
  
  if (data.targetScore >= 1500) {
    achievements.push('ambitious_goals');
  }
  
  if (data.studyHours >= 10) {
    achievements.push('dedicated_student');
  }
  
  if (data.motivationFactors.includes('scholarships')) {
    achievements.push('scholarship_seeker');
  }
  
  return achievements;
}

async function generateWelcomeMessage(data: OnboardingData): Promise<string> {
  try {
    const prompt = `Generate a personalized welcome message for a new SAT prep student with the following profile:
    - Name: ${data.firstName}
    - Target Score: ${data.targetScore}
    - Test Date: ${data.testDate}
    - Weak Subjects: ${data.weakSubjects.join(', ')}
    - Learning Style: ${data.learningStyle}
    - Study Hours: ${data.studyHours} per week
    
    Keep it encouraging, personalized, and under 100 words. Mention their Bonsai AI tutor.`;
    
    // This would use the AI service to generate a personalized message
    // For now, return a template message
    return `Welcome to Bonsai SAT Prep, ${data.firstName}! 🌱 I'm your AI tutor, and I'm excited to help you reach your goal of ${data.targetScore}. Based on your ${data.learningStyle} learning style and focus on ${data.weakSubjects.join(' and ')}, I've created a personalized study plan. With ${data.studyHours} hours per week until ${new Date(data.testDate).toLocaleDateString()}, we'll grow together and achieve your SAT dreams! Let's start this journey! 🚀`;
  } catch (error) {
    console.error('Error generating welcome message:', error);
    return `Welcome to Bonsai SAT Prep, ${data.firstName}! I'm excited to be your AI tutor and help you achieve your target score of ${data.targetScore}. Let's start your personalized learning journey!`;
  }
}