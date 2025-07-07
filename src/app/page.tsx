import React from 'react';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BonsaiWrapper } from '@/components/BonsaiWrapper';
import { 
  ArrowRight, 
  BookOpen, 
  Brain, 
  BarChart3, 
  Zap, 
  Users, 
  Trophy,
  CheckCircle,
  Star,
  Play,
  Download,
  Chrome,
  Smartphone,
  Target,
  Clock,
  MessageCircle,
  Sparkles,
  TrendingUp,
  Award,
  Shield,
  Lightbulb,
  Rocket,
  GraduationCap,
  Heart,
  Mic,
  Eye,
  Gamepad2
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Bonsai SAT Tutor - AI-Powered SAT Preparation That Grows With You',
  description: 'Master the SAT with Bonsai, your intelligent AI tutor. Get real-time help, personalized learning paths, and watch your knowledge grow like a beautiful bonsai tree. Join 10,000+ students who improved their scores by 150+ points.',
  keywords: 'SAT prep, AI tutor, test preparation, college board, SAT practice, study assistant, real-time help, personalized learning',
  openGraph: {
    title: 'Bonsai SAT Tutor - AI-Powered SAT Preparation That Grows With You',
    description: 'Master the SAT with Bonsai, your intelligent AI tutor featuring real-time help and personalized learning paths.',
    type: 'website',
    url: 'https://bonsai-sat-tutor.com',
  }
};

export default function HomePage() {
  const features = [
    {
      icon: Brain,
      title: 'Intelligent AI Tutoring',
      description: 'Our advanced AI understands your unique learning style and provides personalized guidance exactly when you need it.',
      color: 'text-blue-500',
      highlight: 'GPT-4 Powered'
    },
    {
      icon: Zap,
      title: 'Real-Time Smart Assistance',
      description: 'Bonsai automatically detects when you\'re struggling and offers contextual hints, explanations, or step-by-step solutions.',
      color: 'text-yellow-500',
      highlight: 'Instant Help'
    },
    {
      icon: Target,
      title: 'Adaptive Learning Path',
      description: 'Dynamic curriculum that adjusts to your strengths and weaknesses, ensuring optimal progress every step of the way.',
      color: 'text-green-500',
      highlight: 'Personalized'
    },
    {
      icon: BarChart3,
      title: 'Gamified Progress Tracking',
      description: 'Watch your beautiful Bonsai tree grow as you learn, with detailed analytics and achievement systems that keep you motivated.',
      color: 'text-purple-500',
      highlight: 'Engaging'
    },
    {
      icon: Mic,
      title: 'Voice-Activated Learning',
      description: 'Simply say "Hey Bonsai" to get instant help without breaking your study flow. Natural conversation with your AI tutor.',
      color: 'text-indigo-500',
      highlight: 'Voice Commands'
    },
    {
      icon: Eye,
      title: 'Visual Question Recognition',
      description: 'Advanced computer vision that can read and understand complex math problems, diagrams, and text from any platform.',
      color: 'text-orange-500',
      highlight: 'Vision AI'
    }
  ];

  const subscriptionPlans = [
    {
      name: 'Free Explorer',
      price: 0,
      description: 'Perfect for getting started with AI tutoring',
      emoji: '🌱',
      features: [
        '5 AI interactions per day',
        '30-minute study sessions',
        'Basic progress tracking',
        'Web app access',
        'Community support'
      ],
      limitations: [
        'Limited advanced features',
        'No voice commands',
        'Basic analytics only'
      ],
      ctaText: 'Start Free Today'
    },
    {
      name: 'Growth Accelerator',
      price: 19.99,
      description: 'Unlock your full potential with premium features',
      emoji: '🌿',
      features: [
        '50 AI interactions per day',
        'Unlimited study sessions',
        'Advanced progress analytics',
        'Browser extension access',
        'Voice commands & recognition',
        'Priority support',
        'Custom study schedules'
      ],
      popular: true,
      ctaText: 'Start 7-Day Free Trial'
    },
    {
      name: 'Mastery Pro',
      price: 39.99,
      description: 'Maximum learning potential for serious students',
      emoji: '🌳',
      features: [
        'Unlimited AI interactions',
        'Desktop application',
        'Advanced predictive analytics',
        'Custom Bonsai tree themes',
        'Spiral question generation',
        'Performance prediction modeling',
        'Export & sharing features',
        'White-glove onboarding'
      ],
      ctaText: 'Maximize Your Potential'
    }
  ];

  const successStories = [
    {
      name: 'Sarah Chen',
      school: 'Stanford University',
      score: '1520',
      improvement: '+220',
      text: 'Bonsai\'s real-time hints were game-changing. I went from struggling with math concepts to mastering them in weeks. The voice feature let me ask questions without breaking my flow.',
      avatar: '👩‍🎓',
      beforeScore: '1300',
      studyTime: '3 months'
    },
    {
      name: 'Marcus Johnson',
      school: 'MIT',
      score: '1540',
      improvement: '+240',
      text: 'The AI understood exactly where I was stuck and gave perfect explanations. My Bonsai tree growing motivated me to study consistently every day.',
      avatar: '👨‍🎓',
      beforeScore: '1300',
      studyTime: '4 months'
    },
    {
      name: 'Emily Rodriguez',
      school: 'Harvard University',
      score: '1480',
      improvement: '+180',
      text: 'The gamification aspect made studying actually fun. Watching my progress analytics helped me understand my learning patterns and optimize my study time.',
      avatar: '👩‍💻',
      beforeScore: '1300',
      studyTime: '2.5 months'
    }
  ];

  const platformStats = [
    { icon: Users, value: '15,000+', label: 'Active Students', color: 'text-blue-400' },
    { icon: Trophy, value: '165+', label: 'Avg Score Improvement', color: 'text-yellow-400' },
    { icon: Star, value: '4.9/5', label: 'Student Rating', color: 'text-green-400' },
    { icon: Clock, value: '2.5M+', label: 'Study Hours Logged', color: 'text-purple-400' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-bonsai-500/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-50 bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-bonsai-gradient rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                <span className="text-white font-bold text-xl">🌱</span>
              </div>
              <span className="text-white font-bold text-xl bg-gradient-to-r from-white to-bonsai-300 bg-clip-text text-transparent">Bonsai</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-white/80 hover:text-white transition-colors hover:scale-105 transform duration-200">
                Features
              </Link>
              <Link href="#pricing" className="text-white/80 hover:text-white transition-colors hover:scale-105 transform duration-200">
                Pricing
              </Link>
              <Link href="#success-stories" className="text-white/80 hover:text-white transition-colors hover:scale-105 transform duration-200">
                Success Stories
              </Link>
              <Link href="/auth/signin" className="text-white/80 hover:text-white transition-colors hover:scale-105 transform duration-200">
                Sign In
              </Link>
              <Button asChild className="bg-bonsai-gradient hover:opacity-90 hover:scale-105 transform transition-all duration-200">
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-6">
                <Badge className="bg-bonsai-500/20 text-bonsai-300 border-bonsai-500/30 hover:scale-105 transform transition-all duration-200">
                  🚀 The Future of SAT Preparation is Here
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  Master the SAT with{' '}
                  <span className="bg-bonsai-gradient bg-clip-text text-transparent animate-gradient">
                    Bonsai AI
                  </span>
                </h1>
                <p className="text-xl lg:text-2xl text-white/80 leading-relaxed">
                  Your intelligent AI tutor that provides <span className="text-bonsai-400 font-semibold">real-time help</span>, 
                  creates <span className="text-bonsai-400 font-semibold">personalized learning paths</span>, 
                  and features <span className="text-bonsai-400 font-semibold">gamified progress tracking</span>. 
                  Watch your knowledge grow like a beautiful bonsai tree.
                </p>
                
                {/* Key Benefits */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                    <Zap className="h-5 w-5 text-yellow-400" />
                    <span className="text-white font-medium">Instant AI Help</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                    <Mic className="h-5 w-5 text-blue-400" />
                    <span className="text-white font-medium">Voice Commands</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                    <Eye className="h-5 w-5 text-purple-400" />
                    <span className="text-white font-medium">Vision Recognition</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-colors">
                    <Gamepad2 className="h-5 w-5 text-green-400" />
                    <span className="text-white font-medium">Gamified Learning</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="bg-bonsai-gradient hover:opacity-90 text-lg px-8 hover:scale-105 transform transition-all duration-200 shadow-lg">
                  <Link href="/dashboard">
                    <Rocket className="mr-2 h-5 w-5" />
                    Start Learning Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 hover:scale-105 transform transition-all duration-200">
                  <Play className="mr-2 h-5 w-5" />
                  Watch 2-Min Demo
                </Button>
              </div>

              {/* Social Proof Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {platformStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="text-center group hover:scale-105 transform transition-all duration-200">
                      <Icon className={`h-6 w-6 ${stat.color} mx-auto mb-2 group-hover:animate-bounce`} />
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-sm text-white/60">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right side - Enhanced Bonsai Visualization */}
            <div className="relative animate-fade-in-right">
              <div className="relative mx-auto w-96 h-96 lg:w-[500px] lg:h-[500px]">
                {/* Glass container with enhanced styling */}
                <div className="absolute inset-0 bonsai-glass rounded-3xl shadow-bonsai-xl border border-white/20">
                  {/* Enhanced Animated Bonsai Tree */}
                  <div className="flex items-center justify-center h-full relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <svg width="100%" height="100%" viewBox="0 0 100 100">
                        <defs>
                          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    </div>
                    
                    <div className="relative z-10">
                      {/* Enhanced tree representation */}
                      <svg width="280" height="280" viewBox="0 0 280 280" className="animate-float">
                        {/* Trunk with gradient */}
                        <defs>
                          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#8B4513" />
                            <stop offset="50%" stopColor="#A0522D" />
                            <stop offset="100%" stopColor="#8B4513" />
                          </linearGradient>
                          <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#22c55e" />
                            <stop offset="100%" stopColor="#16a34a" />
                          </linearGradient>
                        </defs>
                        
                        <rect x="135" y="200" width="15" height="80" fill="url(#trunkGradient)" rx="7" />
                        
                        {/* Enhanced branches with curves */}
                        <path d="M142 220 Q120 210 100 200 Q95 195 90 190" stroke="url(#trunkGradient)" strokeWidth="4" fill="none" strokeLinecap="round" />
                        <path d="M142 210 Q165 200 185 190 Q190 185 195 180" stroke="url(#trunkGradient)" strokeWidth="4" fill="none" strokeLinecap="round" />
                        <path d="M142 200 Q130 190 125 180 Q120 175 115 170" stroke="url(#trunkGradient)" strokeWidth="3" fill="none" strokeLinecap="round" />
                        <path d="M142 190 Q155 180 160 170 Q165 165 170 160" stroke="url(#trunkGradient)" strokeWidth="3" fill="none" strokeLinecap="round" />
                        
                        {/* Enhanced leaves with gradients and animations */}
                        <circle cx="90" cy="190" r="18" fill="url(#leafGradient)" opacity="0.9" className="animate-pulse-gentle" />
                        <circle cx="195" cy="180" r="15" fill="url(#leafGradient)" opacity="0.85" className="animate-pulse-gentle" style={{animationDelay: '0.5s'}} />
                        <circle cx="125" cy="170" r="12" fill="url(#leafGradient)" opacity="0.8" className="animate-pulse-gentle" style={{animationDelay: '1s'}} />
                        <circle cx="170" cy="160" r="14" fill="url(#leafGradient)" opacity="0.9" className="animate-pulse-gentle" style={{animationDelay: '1.5s'}} />
                        <circle cx="105" cy="175" r="10" fill="url(#leafGradient)" opacity="0.7" className="animate-pulse-gentle" style={{animationDelay: '0.3s'}} />
                        <circle cx="180" cy="165" r="11" fill="url(#leafGradient)" opacity="0.8" className="animate-pulse-gentle" style={{animationDelay: '0.8s'}} />
                        
                        {/* Enhanced flowers */}
                        <circle cx="92" cy="185" r="4" fill="#ec4899" className="animate-pulse" />
                        <circle cx="193" cy="175" r="4" fill="#f472b6" className="animate-pulse" style={{animationDelay: '0.5s'}} />
                        <circle cx="127" cy="165" r="3" fill="#fbbf24" className="animate-pulse" style={{animationDelay: '1s'}} />
                        
                        {/* Fruits */}
                        <circle cx="88" cy="195" r="3" fill="#f59e0b" />
                        <circle cx="197" cy="185" r="3" fill="#f59e0b" />
                      </svg>
                      
                      {/* Enhanced floating particles */}
                      <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: 12 }, (_, i) => (
                          <div
                            key={i}
                            className="absolute w-3 h-3 bg-bonsai-400 rounded-full opacity-60 animate-float"
                            style={{
                              left: `${15 + Math.random() * 70}%`,
                              top: `${15 + Math.random() * 70}%`,
                              animationDelay: `${i * 0.3}s`,
                              animationDuration: `${2 + Math.random() * 3}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced floating UI elements */}
                <div className="absolute -top-6 -right-6 glass rounded-xl p-4 animate-bounce-gentle shadow-lg">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-yellow-400" />
                    <div className="text-green-400 text-sm font-semibold">+35 XP</div>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -left-6 glass rounded-xl p-4 animate-bounce-gentle shadow-lg" style={{animationDelay: '1s'}}>
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-4 w-4 text-yellow-400" />
                    <div className="text-blue-400 text-sm font-semibold">Level 12</div>
                  </div>
                </div>

                <div className="absolute top-1/2 -left-8 glass rounded-xl p-3 animate-bounce-gentle" style={{animationDelay: '2s'}}>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <div className="text-purple-400 text-xs font-semibold">+180 SAT</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section id="features" className="py-24 px-4 bg-black/20 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <Badge className="bg-bonsai-500/20 text-bonsai-300 border-bonsai-500/30 mb-6">
              ✨ Powered by Advanced AI
            </Badge>
            <h2 className="text-5xl font-bold text-white mb-6">
              Why Students Choose Bonsai
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Experience the future of SAT preparation with cutting-edge AI technology 
              that adapts to your learning style and accelerates your progress.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group hover:scale-105 hover:shadow-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`h-7 w-7 ${feature.color}`} />
                      </div>
                      <Badge className="bg-bonsai-500/20 text-bonsai-300 border-bonsai-500/30 text-xs">
                        {feature.highlight}
                      </Badge>
                    </div>
                    <CardTitle className="text-white text-xl group-hover:text-bonsai-300 transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/70 text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-6">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Begin your SAT mastery journey in minutes with our intuitive setup process
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: 1,
                title: 'Install & Connect',
                description: 'Add our browser extension or use the web app. Bonsai automatically integrates with Khan Academy, College Board, and other platforms.',
                icon: Download,
                color: 'from-blue-500 to-purple-500'
              },
              {
                step: 2,
                title: 'Start Learning',
                description: 'Begin studying on any platform. When you need help, simply click the floating Bonsai or say "Hey Bonsai" for instant assistance.',
                icon: Brain,
                color: 'from-purple-500 to-pink-500'
              },
              {
                step: 3,
                title: 'Watch Growth',
                description: 'Your beautiful Bonsai tree grows as you learn. Track detailed progress, earn achievements, and watch your SAT scores soar.',
                icon: TrendingUp,
                color: 'from-green-500 to-blue-500'
              }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center space-y-6 group">
                  <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300 shadow-xl`}>
                    <span className="text-white font-bold text-2xl">{step.step}</span>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-white group-hover:text-bonsai-300 transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-white/70 leading-relaxed text-lg">
                      {step.description}
                    </p>
                  </div>
                  <Icon className="h-8 w-8 text-white/40 mx-auto group-hover:text-bonsai-400 transition-colors" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <section id="pricing" className="py-24 px-4 bg-black/20 relative">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <Badge className="bg-bonsai-500/20 text-bonsai-300 border-bonsai-500/30 mb-6">
              💎 Choose Your Growth Plan
            </Badge>
            <h2 className="text-5xl font-bold text-white mb-6">
              Invest in Your Future
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Start free and upgrade as you grow. All plans include our core AI tutoring technology 
              with advanced features to accelerate your SAT success.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subscriptionPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group ${
                  plan.popular ? 'ring-2 ring-bonsai-500 scale-105 shadow-2xl' : 'hover:scale-105'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-bonsai-gradient text-white px-4 py-2 text-sm font-semibold">
                      🔥 Most Popular Choice
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8">
                  <div className="text-4xl mb-4">{plan.emoji}</div>
                  <CardTitle className="text-white text-2xl mb-2">{plan.name}</CardTitle>
                  <div className="py-4">
                    <span className="text-5xl font-bold text-white">
                      ${plan.price}
                    </span>
                    <span className="text-white/60 text-lg">/month</span>
                  </div>
                  <CardDescription className="text-white/70 text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-5 w-5 text-bonsai-400 flex-shrink-0" />
                        <span className="text-white/80">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full h-12 text-lg font-semibold ${
                      plan.popular 
                        ? 'bg-bonsai-gradient hover:opacity-90 text-white' 
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    } hover:scale-105 transition-all duration-200`}
                    asChild
                  >
                    <Link href="/dashboard">
                      {plan.ctaText}
                    </Link>
                  </Button>
                  
                  {plan.price > 0 && (
                    <p className="text-center text-white/50 text-sm">
                      7-day free trial • Cancel anytime
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-white/60 mb-4">
              Need help choosing? <Link href="/contact" className="text-bonsai-400 hover:underline">Talk to our education experts</Link>
            </p>
            <div className="flex items-center justify-center space-x-6">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-400" />
                <span className="text-white/70">30-day money-back guarantee</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-red-400" />
                <span className="text-white/70">Loved by 15,000+ students</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Success Stories Section */}
      <section id="success-stories" className="py-24 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <Badge className="bg-bonsai-500/20 text-bonsai-300 border-bonsai-500/30 mb-6">
              🎓 Real Results from Real Students
            </Badge>
            <h2 className="text-5xl font-bold text-white mb-6">
              Success Stories That Inspire
            </h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Join thousands of students who have transformed their SAT scores and achieved their college dreams with Bonsai
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {successStories.map((story, index) => (
              <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300 group hover:scale-105 hover:shadow-xl">
                <CardContent className="pt-8">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="text-4xl">{story.avatar}</div>
                    <div>
                      <div className="font-semibold text-white text-lg">{story.name}</div>
                      <div className="text-bonsai-400 font-medium">{story.school}</div>
                      <div className="text-sm text-white/60">
                        {story.beforeScore} → {story.score} ({story.improvement})
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-white/80 italic mb-6 leading-relaxed">
                    "{story.text}"
                  </p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <div className="flex space-x-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <div className="text-white/60 text-sm">
                      Study time: {story.studyTime}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Success Metrics */}
          <div className="bg-gradient-to-r from-bonsai-500/10 to-purple-500/10 rounded-3xl p-8 border border-white/10">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-white mb-2">15,000+</div>
                <div className="text-white/70">Students Helped</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-bonsai-400 mb-2">165+</div>
                <div className="text-white/70">Average Score Increase</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-purple-400 mb-2">2.5M+</div>
                <div className="text-white/70">Study Hours Logged</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-yellow-400 mb-2">98%</div>
                <div className="text-white/70">Would Recommend</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="py-24 px-4 bg-black/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Study Everywhere, Master Anywhere
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Access Bonsai across all your devices and favorite study platforms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-white/10 text-center hover:bg-white/10 transition-all duration-300 group hover:scale-105">
              <CardContent className="pt-8">
                <Chrome className="h-20 w-20 text-blue-400 mx-auto mb-6 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="text-xl font-semibold text-white mb-4">Browser Extension</h3>
                <p className="text-white/70 mb-6 leading-relaxed">
                  Seamlessly integrates with Khan Academy, College Board, and any SAT prep platform. 
                  Get contextual help without leaving your study environment.
                </p>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 group-hover:scale-105 transition-all duration-200" asChild>
                  <Link href="/extension/install">
                    <Download className="mr-2 h-4 w-4" />
                    Install Extension
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 text-center hover:bg-white/10 transition-all duration-300 group hover:scale-105 ring-2 ring-bonsai-500">
              <CardContent className="pt-8">
                <div className="h-20 w-20 mx-auto mb-6 bg-bonsai-gradient rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-3xl">💻</span>
                </div>
                <Badge className="mb-4 bg-bonsai-gradient">Recommended</Badge>
                <h3 className="text-xl font-semibold text-white mb-4">Web Application</h3>
                <p className="text-white/70 mb-6 leading-relaxed">
                  Full-featured study environment with advanced analytics, progress tracking, 
                  and your growing Bonsai tree visualization.
                </p>
                <Button className="bg-bonsai-gradient hover:opacity-90 group-hover:scale-105 transition-all duration-200" asChild>
                  <Link href="/dashboard">
                    <Rocket className="mr-2 h-4 w-4" />
                    Launch App
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 text-center hover:bg-white/10 transition-all duration-300 group hover:scale-105">
              <CardContent className="pt-8">
                <Smartphone className="h-20 w-20 text-green-400 mx-auto mb-6 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="text-xl font-semibold text-white mb-4">Mobile App</h3>
                <p className="text-white/70 mb-6 leading-relaxed">
                  Study on the go with our upcoming mobile app featuring voice commands, 
                  offline mode, and push notifications for study reminders.
                </p>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 group-hover:scale-105 transition-all duration-200" disabled>
                  <Download className="mr-2 h-4 w-4" />
                  Coming Q2 2024
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-bonsai-500/10 via-purple-500/10 to-blue-500/10" />
        <div className="container mx-auto max-w-5xl text-center relative z-10">
          <div className="space-y-8">
            <div className="space-y-6">
              <Badge className="bg-bonsai-500/20 text-bonsai-300 border-bonsai-500/30">
                🚀 Join 15,000+ Successful Students
              </Badge>
              <h2 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Ready to <span className="bg-bonsai-gradient bg-clip-text text-transparent">Transform</span> Your SAT Scores?
              </h2>
              <p className="text-xl lg:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                Start your journey to SAT mastery today. Join thousands of students who have achieved their college dreams with Bonsai's AI-powered tutoring.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="bg-bonsai-gradient hover:opacity-90 text-xl px-12 py-4 hover:scale-105 transform transition-all duration-200 shadow-xl" asChild>
                <Link href="/dashboard">
                  <GraduationCap className="mr-3 h-6 w-6" />
                  Start Your Free Trial
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-xl px-12 py-4 hover:scale-105 transform transition-all duration-200" asChild>
                <Link href="/demo">
                  <MessageCircle className="mr-3 h-6 w-6" />
                  Schedule Demo
                </Link>
              </Button>
            </div>
            
            <div className="grid md:grid-cols-3 gap-6 pt-8">
              <div className="flex items-center justify-center space-x-2 text-white/60">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-white/60">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>7-day free trial</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-white/60">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t border-white/10 bg-black/30 py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-bonsai-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">🌱</span>
                </div>
                <span className="text-white font-bold text-xl bg-gradient-to-r from-white to-bonsai-300 bg-clip-text text-transparent">Bonsai</span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed max-w-md">
                AI-powered SAT preparation that grows with you. Join thousands of students 
                who have transformed their test scores and achieved their college dreams.
              </p>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2 text-white/50">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-sm">4.9/5 rating</span>
                </div>
                <div className="flex items-center space-x-2 text-white/50">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">15,000+ students</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <div className="space-y-3 text-sm">
                <Link href="/features" className="block text-white/60 hover:text-white transition-colors">Features</Link>
                <Link href="/pricing" className="block text-white/60 hover:text-white transition-colors">Pricing</Link>
                <Link href="/extension/install" className="block text-white/60 hover:text-white transition-colors">Browser Extension</Link>
                <Link href="/api" className="block text-white/60 hover:text-white transition-colors">API</Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <div className="space-y-3 text-sm">
                <Link href="/help" className="block text-white/60 hover:text-white transition-colors">Help Center</Link>
                <Link href="/contact" className="block text-white/60 hover:text-white transition-colors">Contact Us</Link>
                <Link href="/community" className="block text-white/60 hover:text-white transition-colors">Community</Link>
                <Link href="/status" className="block text-white/60 hover:text-white transition-colors">Status</Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <div className="space-y-3 text-sm">
                <Link href="/about" className="block text-white/60 hover:text-white transition-colors">About</Link>
                <Link href="/blog" className="block text-white/60 hover:text-white transition-colors">Blog</Link>
                <Link href="/careers" className="block text-white/60 hover:text-white transition-colors">Careers</Link>
                <Link href="/privacy" className="block text-white/60 hover:text-white transition-colors">Privacy Policy</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">
              © 2024 Bonsai Education Technologies. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span className="text-white/60 text-sm">SOC 2 Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-yellow-400" />
                <span className="text-white/60 text-sm">EdTech Award Winner</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Bonsai AI Assistant */}
      <BonsaiWrapper className="fixed bottom-6 right-6 z-50" />
    </div>
  );
}