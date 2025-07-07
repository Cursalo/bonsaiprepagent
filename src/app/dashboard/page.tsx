'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Brain, 
  BarChart3, 
  Download,
  Chrome,
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  Trophy
} from 'lucide-react';
import Link from 'next/link';
import { BonsaiWrapper } from '@/components/BonsaiWrapper';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-bonsai-gradient rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">🌱</span>
              </div>
              <span className="text-white font-bold text-xl">Bonsai</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge className="bg-bonsai-500/20 text-bonsai-300 border-bonsai-500/30">
                Free Plan
              </Badge>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" asChild>
                <Link href="/">← Back to Home</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-white">
              Welcome to Bonsai! 🌱
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Your AI-powered SAT prep journey starts here. Choose how you'd like to study with Bonsai.
            </p>
          </div>
        </div>

        {/* Quick Setup Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {/* Browser Extension */}
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Chrome className="h-8 w-8 text-blue-400" />
              </div>
              <CardTitle className="text-white">Browser Extension</CardTitle>
              <CardDescription className="text-white/70">
                Get help while studying on Khan Academy, College Board, and other platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-bonsai-400" />
                  <span className="text-white/80 text-sm">Real-time assistance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-bonsai-400" />
                  <span className="text-white/80 text-sm">Context-aware hints</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-bonsai-400" />
                  <span className="text-white/80 text-sm">Floating AI assistant</span>
                </div>
              </div>
              <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/extension/install">
                  <Download className="mr-2 h-4 w-4" />
                  Install Extension
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Web App */}
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors ring-2 ring-bonsai-500">
            <CardHeader className="text-center">
              <Badge className="mx-auto mb-2 bg-bonsai-gradient">Recommended</Badge>
              <div className="w-16 h-16 mx-auto mb-4 bg-bonsai-gradient rounded-lg flex items-center justify-center">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-white">Web Application</CardTitle>
              <CardDescription className="text-white/70">
                Full-featured study environment with progress tracking and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-bonsai-400" />
                  <span className="text-white/80 text-sm">Interactive practice</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-bonsai-400" />
                  <span className="text-white/80 text-sm">Detailed analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-bonsai-400" />
                  <span className="text-white/80 text-sm">Bonsai tree growth</span>
                </div>
              </div>
              <Button className="w-full bg-bonsai-gradient hover:opacity-90" asChild>
                <Link href="/practice">
                  <Play className="mr-2 h-4 w-4" />
                  Start Practicing
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Study Resources */}
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-purple-400" />
              </div>
              <CardTitle className="text-white">Study Materials</CardTitle>
              <CardDescription className="text-white/70">
                Access curated SAT practice questions and study guides
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-bonsai-400" />
                  <span className="text-white/80 text-sm">Practice tests</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-bonsai-400" />
                  <span className="text-white/80 text-sm">Study guides</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-bonsai-400" />
                  <span className="text-white/80 text-sm">Video tutorials</span>
                </div>
              </div>
              <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10" asChild>
                <Link href="/resources">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Resources
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-white/5 border-white/10 text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-bonsai-400 mb-2">5</div>
              <div className="text-white/70 text-sm">Daily AI Interactions</div>
              <div className="text-white/50 text-xs">Free Plan</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-400 mb-2">0</div>
              <div className="text-white/70 text-sm">Practice Sessions</div>
              <div className="text-white/50 text-xs">Get started!</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-400 mb-2">1</div>
              <div className="text-white/70 text-sm">Bonsai Level</div>
              <div className="text-white/50 text-xs">Seedling 🌱</div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-400 mb-2">0</div>
              <div className="text-white/70 text-sm">Achievements</div>
              <div className="text-white/50 text-xs">Start practicing!</div>
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Guide */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Star className="mr-2 h-5 w-5 text-yellow-400" />
              Getting Started with Bonsai
            </CardTitle>
            <CardDescription className="text-white/70">
              Follow these steps to maximize your SAT prep experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-bonsai-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                <div>
                  <h4 className="text-white font-semibold">Install the Browser Extension</h4>
                  <p className="text-white/70 text-sm">Get real-time help while studying on Khan Academy, College Board, and other platforms.</p>
                  <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700" asChild>
                    <Link href="/extension/install">Install Now</Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-bonsai-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                <div>
                  <h4 className="text-white font-semibold">Take a Practice Test</h4>
                  <p className="text-white/70 text-sm">Start with a diagnostic test to identify your strengths and areas for improvement.</p>
                  <Button size="sm" className="mt-2" variant="outline" asChild>
                    <Link href="/practice">Start Test</Link>
                  </Button>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-bonsai-gradient rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                <div>
                  <h4 className="text-white font-semibold">Chat with Bonsai</h4>
                  <p className="text-white/70 text-sm">Click the floating Bonsai assistant to ask questions and get personalized help.</p>
                  <Button size="sm" className="mt-2" variant="outline">
                    Try It Now →
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Floating Bonsai AI Assistant */}
      <BonsaiWrapper className="fixed bottom-6 right-6 z-50" />
    </div>
  );
}