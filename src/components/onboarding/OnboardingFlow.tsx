'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Target,
  BookOpen,
  Calendar,
  Award,
  TrendingUp,
  User,
  GraduationCap,
  TreePine,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface OnboardingData {
  // Personal Information
  firstName: string;
  lastName: string;
  grade: string;
  school: string;
  
  // SAT Goals
  targetScore: number;
  testDate: string;
  previousScore?: number;
  
  // Study Preferences
  studyHours: number;
  studyDays: string[];
  preferredTime: string;
  
  // Subject Focus
  strongSubjects: string[];
  weakSubjects: string[];
  
  // Learning Style
  learningStyle: string;
  motivationFactors: string[];
  
  // Background
  mathBackground: string;
  readingLevel: string;
  hasAccommodations: boolean;
  accommodations?: string;
  
  // Goals & Motivation
  collegeGoals: string[];
  studyMotivation: string;
}

const ONBOARDING_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Bonsai SAT Prep',
    description: 'Let\'s personalize your learning experience',
    icon: TreePine,
  },
  {
    id: 'personal',
    title: 'Personal Information',
    description: 'Tell us about yourself',
    icon: User,
  },
  {
    id: 'goals',
    title: 'SAT Goals',
    description: 'Set your target score and test date',
    icon: Target,
  },
  {
    id: 'assessment',
    title: 'Quick Assessment',
    description: 'Help us understand your current level',
    icon: GraduationCap,
  },
  {
    id: 'study-plan',
    title: 'Study Preferences',
    description: 'Create your personalized study schedule',
    icon: Calendar,
  },
  {
    id: 'motivation',
    title: 'Goals & Motivation',
    description: 'What drives your success?',
    icon: Award,
  },
  {
    id: 'complete',
    title: 'Setup Complete',
    description: 'Your Bonsai is ready to grow!',
    icon: Sparkles,
  },
];

const STUDY_DAYS = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

const SAT_SUBJECTS = [
  { id: 'math', label: 'Math' },
  { id: 'reading', label: 'Reading & Writing' },
  { id: 'grammar', label: 'Grammar' },
  { id: 'essay', label: 'Essay Writing' },
];

const LEARNING_STYLES = [
  { id: 'visual', label: 'Visual', description: 'Charts, diagrams, and images' },
  { id: 'auditory', label: 'Auditory', description: 'Listening and discussion' },
  { id: 'kinesthetic', label: 'Kinesthetic', description: 'Hands-on practice' },
  { id: 'reading', label: 'Reading/Writing', description: 'Text-based learning' },
];

const MOTIVATION_FACTORS = [
  { id: 'college', label: 'College Admission' },
  { id: 'scholarships', label: 'Scholarships' },
  { id: 'personal', label: 'Personal Achievement' },
  { id: 'parents', label: 'Family Expectations' },
  { id: 'competition', label: 'Competitive Spirit' },
  { id: 'career', label: 'Career Goals' },
];

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<Partial<OnboardingData>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  const currentStepData = ONBOARDING_STEPS[currentStep];
  const CurrentIcon = currentStepData.icon;

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    try {
      // Save onboarding data
      const response = await fetch('/api/onboarding/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      const result = await response.json();
      toast.success('Welcome to Bonsai SAT Prep! Your personalized study plan is ready.');
      onComplete(data as OnboardingData);
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return true;
      case 'personal':
        return data.firstName && data.lastName && data.grade;
      case 'goals':
        return data.targetScore && data.testDate;
      case 'assessment':
        return data.strongSubjects?.length && data.weakSubjects?.length;
      case 'study-plan':
        return data.studyHours && data.studyDays?.length && data.preferredTime;
      case 'motivation':
        return data.learningStyle && data.motivationFactors?.length;
      default:
        return true;
    }
  };

  const renderStepContent = () => {
    switch (currentStepData.id) {
      case 'welcome':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <TreePine className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Bonsai SAT Prep
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                Your AI-powered SAT tutor that grows with you. Let's create a personalized 
                learning experience that adapts to your unique needs and goals.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">What we'll cover:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Your SAT goals and timeline</li>
                <li>• Current skill assessment</li>
                <li>• Personalized study schedule</li>
                <li>• Learning preferences</li>
                <li>• Your motivation and goals</li>
              </ul>
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={data.firstName || ''}
                  onChange={(e) => updateData({ firstName: e.target.value })}
                  placeholder="Enter your first name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={data.lastName || ''}
                  onChange={(e) => updateData({ lastName: e.target.value })}
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="grade">Grade Level</Label>
                <Select value={data.grade} onValueChange={(value) => updateData({ grade: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">9th Grade</SelectItem>
                    <SelectItem value="10">10th Grade</SelectItem>
                    <SelectItem value="11">11th Grade</SelectItem>
                    <SelectItem value="12">12th Grade</SelectItem>
                    <SelectItem value="gap">Gap Year</SelectItem>
                    <SelectItem value="adult">Adult Learner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="school">School (Optional)</Label>
                <Input
                  id="school"
                  value={data.school || ''}
                  onChange={(e) => updateData({ school: e.target.value })}
                  placeholder="Enter your school name"
                />
              </div>
            </div>
          </div>
        );

      case 'goals':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="targetScore">Target SAT Score</Label>
              <Select 
                value={data.targetScore?.toString()} 
                onValueChange={(value) => updateData({ targetScore: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1200">1200+ (Good)</SelectItem>
                  <SelectItem value="1300">1300+ (Above Average)</SelectItem>
                  <SelectItem value="1400">1400+ (Excellent)</SelectItem>
                  <SelectItem value="1500">1500+ (Outstanding)</SelectItem>
                  <SelectItem value="1600">1600 (Perfect)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="testDate">Planned Test Date</Label>
              <Input
                id="testDate"
                type="date"
                value={data.testDate || ''}
                onChange={(e) => updateData({ testDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="previousScore">Previous SAT Score (Optional)</Label>
              <Input
                id="previousScore"
                type="number"
                value={data.previousScore || ''}
                onChange={(e) => updateData({ 
                  previousScore: e.target.value ? parseInt(e.target.value) : undefined 
                })}
                placeholder="Enter previous score if taken"
                min="400"
                max="1600"
              />
            </div>
          </div>
        );

      case 'assessment':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Which subjects do you feel strongest in?</Label>
              <p className="text-sm text-gray-600 mb-3">Select all that apply</p>
              <div className="grid grid-cols-2 gap-3">
                {SAT_SUBJECTS.map((subject) => (
                  <div key={subject.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`strong-${subject.id}`}
                      checked={data.strongSubjects?.includes(subject.id) || false}
                      onCheckedChange={(checked) => {
                        const current = data.strongSubjects || [];
                        if (checked) {
                          updateData({ strongSubjects: [...current, subject.id] });
                        } else {
                          updateData({ 
                            strongSubjects: current.filter(s => s !== subject.id) 
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`strong-${subject.id}`}>{subject.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-base font-medium">Which subjects need the most improvement?</Label>
              <p className="text-sm text-gray-600 mb-3">Select all that apply</p>
              <div className="grid grid-cols-2 gap-3">
                {SAT_SUBJECTS.map((subject) => (
                  <div key={subject.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`weak-${subject.id}`}
                      checked={data.weakSubjects?.includes(subject.id) || false}
                      onCheckedChange={(checked) => {
                        const current = data.weakSubjects || [];
                        if (checked) {
                          updateData({ weakSubjects: [...current, subject.id] });
                        } else {
                          updateData({ 
                            weakSubjects: current.filter(s => s !== subject.id) 
                          });
                        }
                      }}
                    />
                    <Label htmlFor={`weak-${subject.id}`}>{subject.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'study-plan':
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="studyHours">Hours per week for SAT prep</Label>
              <Select 
                value={data.studyHours?.toString()} 
                onValueChange={(value) => updateData({ studyHours: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select study hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 hours (Light)</SelectItem>
                  <SelectItem value="5">5 hours (Moderate)</SelectItem>
                  <SelectItem value="8">8 hours (Intensive)</SelectItem>
                  <SelectItem value="12">12+ hours (Intensive+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-base font-medium">Preferred study days</Label>
              <p className="text-sm text-gray-600 mb-3">Select your available days</p>
              <div className="grid grid-cols-3 gap-3">
                {STUDY_DAYS.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.id}
                      checked={data.studyDays?.includes(day.id) || false}
                      onCheckedChange={(checked) => {
                        const current = data.studyDays || [];
                        if (checked) {
                          updateData({ studyDays: [...current, day.id] });
                        } else {
                          updateData({ 
                            studyDays: current.filter(d => d !== day.id) 
                          });
                        }
                      }}
                    />
                    <Label htmlFor={day.id}>{day.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="preferredTime">Preferred study time</Label>
              <Select 
                value={data.preferredTime} 
                onValueChange={(value) => updateData({ preferredTime: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select preferred time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (6 AM - 10 AM)</SelectItem>
                  <SelectItem value="midday">Midday (10 AM - 2 PM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (2 PM - 6 PM)</SelectItem>
                  <SelectItem value="evening">Evening (6 PM - 10 PM)</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 'motivation':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-base font-medium">Learning Style</Label>
              <p className="text-sm text-gray-600 mb-3">How do you learn best?</p>
              <RadioGroup
                value={data.learningStyle}
                onValueChange={(value) => updateData({ learningStyle: value })}
                className="space-y-3"
              >
                {LEARNING_STYLES.map((style) => (
                  <div key={style.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={style.id} id={style.id} />
                    <Label htmlFor={style.id} className="cursor-pointer">
                      <div>
                        <div className="font-medium">{style.label}</div>
                        <div className="text-sm text-gray-600">{style.description}</div>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label className="text-base font-medium">What motivates you to study?</Label>
              <p className="text-sm text-gray-600 mb-3">Select all that apply</p>
              <div className="grid grid-cols-2 gap-3">
                {MOTIVATION_FACTORS.map((factor) => (
                  <div key={factor.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={factor.id}
                      checked={data.motivationFactors?.includes(factor.id) || false}
                      onCheckedChange={(checked) => {
                        const current = data.motivationFactors || [];
                        if (checked) {
                          updateData({ motivationFactors: [...current, factor.id] });
                        } else {
                          updateData({ 
                            motivationFactors: current.filter(f => f !== factor.id) 
                          });
                        }
                      }}
                    />
                    <Label htmlFor={factor.id}>{factor.label}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="studyMotivation">Personal motivation (Optional)</Label>
              <Textarea
                id="studyMotivation"
                value={data.studyMotivation || ''}
                onChange={(e) => updateData({ studyMotivation: e.target.value })}
                placeholder="What's your personal motivation for achieving your SAT goals?"
                rows={3}
              />
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Your Bonsai is Ready to Grow!
              </h2>
              <p className="text-gray-600 max-w-md mx-auto">
                We've created a personalized study plan based on your goals and preferences. 
                Your AI tutor is ready to help you succeed.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">What's next:</h3>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• Access your personalized dashboard</li>
                <li>• Start with recommended practice questions</li>
                <li>• Watch your Bonsai grow as you learn</li>
                <li>• Get AI-powered insights and tips</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Progress Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <CurrentIcon className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">{currentStepData.title}</h1>
              <p className="text-gray-600 text-sm">{currentStepData.description}</p>
            </div>
          </div>
          <Badge variant="secondary">
            {currentStep + 1} of {ONBOARDING_STEPS.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Content */}
      <Card>
        <CardContent className="p-8">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 0}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </Button>
        
        {currentStep === ONBOARDING_STEPS.length - 1 ? (
          <Button
            onClick={completeOnboarding}
            disabled={loading}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Complete Setup
          </Button>
        ) : (
          <Button
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  );
}