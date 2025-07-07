import React from 'react';
import { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Smartphone
} from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Bonsai SAT Tutor - AI-Powered SAT Preparation',
  description: 'Master the SAT with Bonsai, your intelligent AI tutor. Real-time help, personalized learning, and gamified progress tracking.',
  keywords: 'SAT prep, AI tutor, test preparation, college board, SAT practice, study assistant',
  openGraph: {
    title: 'Bonsai SAT Tutor - AI-Powered SAT Preparation',
    description: 'Master the SAT with Bonsai, your intelligent AI tutor featuring real-time help and personalized learning.',
    type: 'website',
    url: 'https://bonsai-sat-tutor.com',
  }
};

export default function HomePage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Get instant, contextual help from our advanced AI tutor that understands your specific struggles.',
      color: 'text-blue-500'
    },
    {
      icon: Zap,
      title: 'Real-Time Assistance',
      description: 'Bonsai detects when you\'re stuck and offers hints, explanations, or step-by-step solutions.',
      color: 'text-yellow-500'
    },
    {
      icon: BarChart3,
      title: 'Progress Tracking',
      description: 'Watch your Bonsai tree grow as you learn, with detailed analytics and achievement systems.',
      color: 'text-green-500'
    },
    {
      icon: BookOpen,
      title: 'Comprehensive Coverage',
      description: 'Master all SAT sections: Math, Evidence-Based Reading, and Writing & Language.',
      color: 'text-purple-500'
    },
    {
      icon: Users,
      title: 'Multi-Platform Support',
      description: 'Study anywhere with web app, browser extension, and desktop application.',
      color: 'text-indigo-500'
    },
    {
      icon: Trophy,
      title: 'Proven Results',
      description: 'Students see average score improvements of 150+ points with consistent practice.',
      color: 'text-orange-500'
    }
  ];

  const subscriptionPlans = [
    {
      name: 'Free',
      price: 0,
      description: 'Perfect for getting started',
      features: [
        '5 AI interactions per day',
        '30-minute study sessions',
        'Basic progress tracking',
        'Web app access'
      ],
      limitations: [
        'Limited advanced features',
        'No voice commands',
        'Basic analytics only'
      ]
    },
    {
      name: 'Basic',
      price: 19.99,
      description: 'Great for regular studying',
      features: [
        '50 AI interactions per day',
        'Unlimited study sessions',
        'Detailed progress analytics',
        'Browser extension',
        'Voice commands',
        'Priority support'
      ],
      popular: true
    },
    {
      name: 'Pro',
      price: 39.99,
      description: 'Maximum learning potential',
      features: [
        'Unlimited AI interactions',
        'Desktop application',
        'Advanced analytics',
        'Custom Bonsai styling',
        'Spiral questions',
        'Predictive modeling',
        'Export features'
      ]
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      score: '1480',
      improvement: '+180',
      text: 'Bonsai helped me understand math concepts I struggled with for months. The real-time hints were game-changing!',
      avatar: '👩‍🎓'
    },
    {
      name: 'Marcus Johnson',
      score: '1520',
      improvement: '+220',
      text: 'The voice feature is amazing. I could ask questions while practicing without breaking my flow.',
      avatar: '👨‍🎓'
    },
    {
      name: 'Emily Rodriguez',
      score: '1450',
      improvement: '+160',
      text: 'Watching my Bonsai tree grow motivated me to study consistently. The gamification really works!',
      avatar: '👩‍💻'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="relative z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-bonsai-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌱</span>
              </div>
              <span className="text-white font-bold text-xl">Bonsai</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-white/80 hover:text-white transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-white/80 hover:text-white transition-colors">
                Pricing
              </Link>
              <Link href="#testimonials" className="text-white/80 hover:text-white transition-colors">
                Reviews
              </Link>
              <Link href="/auth/signin" className="text-white/80 hover:text-white transition-colors">
                Sign In
              </Link>
              <Button asChild className="bg-bonsai-gradient hover:opacity-90">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-bonsai-500/20 text-bonsai-300 border-bonsai-500/30">
                  🚀 AI-Powered SAT Preparation
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                  Master the SAT with{' '}
                  <span className="bg-bonsai-gradient bg-clip-text text-transparent">
                    Bonsai
                  </span>
                </h1>
                <p className="text-xl text-white/80 leading-relaxed">
                  Your intelligent AI tutor that provides real-time help, personalized learning paths, 
                  and gamified progress tracking. Watch your knowledge grow like a beautiful bonsai tree.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="bg-bonsai-gradient hover:opacity-90 text-lg px-8">
                  <Link href="/auth/signup">
                    Start Learning Free
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Play className="mr-2 h-5 w-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 text-white/60">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-semibold">4.9/5</span>
                  <span>rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span className="font-semibold">10,000+</span>
                  <span>students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span className="font-semibold">150+</span>
                  <span>avg improvement</span>
                </div>
              </div>
            </div>

            {/* Right side - Bonsai Visualization */}
            <div className="relative">
              <div className="relative mx-auto w-80 h-80 lg:w-96 lg:h-96">
                {/* Glass container */}
                <div className="absolute inset-0 bonsai-glass rounded-3xl shadow-bonsai-lg">
                  {/* Animated Bonsai Tree */}
                  <div className="flex items-center justify-center h-full">
                    <div className="relative">
                      {/* Simple animated tree representation */}
                      <svg width="200" height="200" viewBox="0 0 200 200" className="animate-float">
                        {/* Trunk */}
                        <rect x="95" y="140" width="10" height="60" fill="#8B4513" rx="5" />
                        
                        {/* Branches */}
                        <path d="M100 160 Q80 150 70 140" stroke="#8B4513" strokeWidth="3" fill="none" />
                        <path d="M100 150 Q120 140 130 130" stroke="#8B4513" strokeWidth="3" fill="none" />
                        <path d="M100 140 Q90 130 85 120" stroke="#8B4513" strokeWidth="2" fill="none" />
                        
                        {/* Leaves */}
                        <circle cx="70" cy="140" r="12" fill="#22c55e" opacity="0.8" className="animate-pulse-gentle" />
                        <circle cx="130" cy="130" r="10" fill="#16a34a" opacity="0.9" />
                        <circle cx="85" cy="120" r="8" fill="#15803d" opacity="0.7" />
                        <circle cx="75" cy="125" r="6" fill="#22c55e" opacity="0.8" />
                        <circle cx="125" cy="115" r="7" fill="#16a34a" opacity="0.9" />
                        
                        {/* Flowers */}
                        <circle cx="72" cy="135" r="3" fill="#ec4899" />
                        <circle cx="128" cy="125" r="3" fill="#f472b6" />
                      </svg>
                      
                      {/* Floating particles */}
                      <div className="absolute inset-0 pointer-events-none">
                        {Array.from({ length: 6 }, (_, i) => (
                          <div
                            key={i}
                            className="absolute w-2 h-2 bg-bonsai-400 rounded-full opacity-60 animate-float"
                            style={{
                              left: `${20 + Math.random() * 60}%`,
                              top: `${20 + Math.random() * 60}%`,
                              animationDelay: `${i * 0.5}s`,
                              animationDuration: `${3 + Math.random() * 2}s`
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating UI elements */}
                <div className="absolute -top-4 -right-4 glass rounded-lg p-3 animate-bounce-gentle">
                  <div className="text-green-400 text-sm font-semibold">+25 XP</div>
                </div>
                
                <div className="absolute -bottom-4 -left-4 glass rounded-lg p-3 animate-bounce-gentle" style={{animationDelay: '1s'}}>
                  <div className="text-blue-400 text-sm font-semibold">Level 7</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-bonsai-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-black/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose Bonsai?
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Experience the future of SAT preparation with AI-powered learning 
              that adapts to your needs and grows with your progress.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/70">
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
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              How Bonsai Works
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Get started in minutes and experience personalized AI tutoring
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-bonsai-gradient rounded-full flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Install & Setup</h3>
              <p className="text-white/70">
                Add our browser extension or use the web app. Bonsai automatically detects SAT questions on any platform.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-bonsai-gradient rounded-full flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Ask for Help</h3>
              <p className="text-white/70">
                When you're stuck, simply click the floating Bonsai or say "Hey Bonsai" for instant, contextual assistance.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-bonsai-gradient rounded-full flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white">Watch & Grow</h3>
              <p className="text-white/70">
                Your Bonsai tree grows as you learn. Track progress, earn achievements, and watch your scores improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 bg-black/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Start free and upgrade as you grow. All plans include core AI tutoring features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {subscriptionPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative bg-white/5 border-white/10 hover:bg-white/10 transition-all ${
                  plan.popular ? 'ring-2 ring-bonsai-500 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-bonsai-gradient">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                  <div className="py-4">
                    <span className="text-4xl font-bold text-white">
                      ${plan.price}
                    </span>
                    <span className="text-white/60">/month</span>
                  </div>
                  <CardDescription className="text-white/70">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-bonsai-400" />
                        <span className="text-white/80 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-bonsai-gradient hover:opacity-90' 
                        : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                    asChild
                  >
                    <Link href="/auth/signup">
                      {plan.price === 0 ? 'Start Free' : 'Start Trial'}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Student Success Stories
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              See how Bonsai has helped thousands of students achieve their SAT goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/5 border-white/10">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="text-3xl">{testimonial.avatar}</div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-white/60">
                        SAT Score: {testimonial.score} ({testimonial.improvement})
                      </div>
                    </div>
                  </div>
                  <p className="text-white/80 italic">"{testimonial.text}"</p>
                  <div className="flex mt-4">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section className="py-20 px-4 bg-black/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Study Anywhere, Anytime
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Access Bonsai across all your devices and platforms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-white/10 text-center">
              <CardContent className="pt-8">
                <Chrome className="h-16 w-16 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Browser Extension</h3>
                <p className="text-white/70 mb-4">
                  Works seamlessly with Khan Academy, College Board, and any SAT prep platform
                </p>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Download className="mr-2 h-4 w-4" />
                  Add to Chrome
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 text-center">
              <CardContent className="pt-8">
                <div className="h-16 w-16 mx-auto mb-4 bg-bonsai-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">💻</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Web Application</h3>
                <p className="text-white/70 mb-4">
                  Full-featured web app with advanced analytics and progress tracking
                </p>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                  <Link href="/dashboard">Launch App</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 text-center">
              <CardContent className="pt-8">
                <Smartphone className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Mobile App</h3>
                <p className="text-white/70 mb-4">
                  Study on the go with our mobile app featuring voice commands and offline mode
                </p>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Download className="mr-2 h-4 w-4" />
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-white">
              Ready to Grow Your SAT Scores?
            </h2>
            <p className="text-xl text-white/70">
              Join thousands of students who have improved their SAT scores with Bonsai's AI-powered tutoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-bonsai-gradient hover:opacity-90 text-lg px-8" asChild>
                <Link href="/auth/signup">
                  Start Your Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                <Link href="/demo">
                  Schedule Demo
                </Link>
              </Button>
            </div>
            <p className="text-sm text-white/50">
              No credit card required • 7-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-bonsai-gradient rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">🌱</span>
                </div>
                <span className="text-white font-bold text-lg">Bonsai</span>
              </div>
              <p className="text-white/60 text-sm">
                AI-powered SAT preparation that grows with you.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <div className="space-y-2 text-sm">
                <Link href="/features" className="block text-white/60 hover:text-white transition-colors">Features</Link>
                <Link href="/pricing" className="block text-white/60 hover:text-white transition-colors">Pricing</Link>
                <Link href="/download" className="block text-white/60 hover:text-white transition-colors">Download</Link>
                <Link href="/api" className="block text-white/60 hover:text-white transition-colors">API</Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <Link href="/help" className="block text-white/60 hover:text-white transition-colors">Help Center</Link>
                <Link href="/contact" className="block text-white/60 hover:text-white transition-colors">Contact</Link>
                <Link href="/community" className="block text-white/60 hover:text-white transition-colors">Community</Link>
                <Link href="/status" className="block text-white/60 hover:text-white transition-colors">Status</Link>
              </div>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-sm">
                <Link href="/about" className="block text-white/60 hover:text-white transition-colors">About</Link>
                <Link href="/blog" className="block text-white/60 hover:text-white transition-colors">Blog</Link>
                <Link href="/careers" className="block text-white/60 hover:text-white transition-colors">Careers</Link>
                <Link href="/privacy" className="block text-white/60 hover:text-white transition-colors">Privacy</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 text-center">
            <p className="text-white/60 text-sm">
              © 2024 Bonsai Education. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}