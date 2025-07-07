# Bonsai SAT Tutor - Technical Architecture

## Technology Stack Overview

Bonsai SAT Tutor leverages a modern, scalable technology stack designed for performance, security, and developer productivity. The architecture is built around the Glass project's contextual awareness capabilities, adapted for SAT preparation workflows.

## Core Technology Decisions

### Frontend Framework: Next.js 14
**Rationale**: Next.js 14 provides the latest React features with App Router, server components, and excellent TypeScript support.

**Key Features Used**:
- App Router for file-based routing
- Server Components for improved performance
- API Routes for backend functionality
- Static Site Generation (SSG) for marketing pages
- Incremental Static Regeneration (ISR) for dynamic content

**Configuration**:
```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  images: {
    domains: ['bonsai-sat-tutor.vercel.app'],
    formats: ['image/webp', 'image/avif']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
};
module.exports = nextConfig;
```

### Backend as a Service: Supabase
**Rationale**: Supabase provides PostgreSQL database, real-time subscriptions, authentication, and edge functions in a single platform.

**Services Used**:
- **PostgreSQL Database**: Primary data storage with ACID compliance
- **Real-time Engine**: Live updates for Bonsai growth and progress
- **Authentication**: JWT-based auth with Row Level Security (RLS)
- **Edge Functions**: Serverless functions for AI processing
- **Storage**: File uploads for user avatars and progress screenshots

### Hosting and Deployment: Vercel
**Rationale**: Seamless integration with Next.js, global CDN, and automatic deployments.

**Features**:
- Edge Functions for low-latency AI requests
- Automatic HTTPS and security headers
- Preview deployments for testing
- Analytics and performance monitoring

### Payment Processing: Stripe
**Rationale**: Industry-leading payment platform with comprehensive subscription management.

**Integration Points**:
- Subscription creation and management
- Webhook handling for subscription events
- Customer portal for self-service
- Tax calculation and compliance
- Revenue reporting and analytics

### AI Integration: OpenAI + Google Gemini
**Rationale**: Dual AI provider strategy ensures reliability and provides different AI capabilities.

**OpenAI GPT-4 Features**:
- Advanced reasoning for complex SAT questions
- High-quality explanations and tutoring
- Consistent response format
- Strong context understanding

**Google Gemini Features**:
- Cost-effective for high-volume requests
- Multimodal capabilities (text + images)
- Fast response times
- Alternative to reduce vendor lock-in

## Database Architecture

### PostgreSQL Schema Design

#### Core Tables

```sql
-- Users table with authentication integration
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  trial_ends_at TIMESTAMP WITH TIME ZONE,
  bonsai_level INTEGER DEFAULT 1,
  bonsai_experience BIGINT DEFAULT 0,
  study_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  target_sat_score INTEGER,
  test_date DATE,
  preferences JSONB DEFAULT '{}'::jsonb
);

-- Subscription tracking
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL,
  tier TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Study sessions for tracking usage and progress
CREATE TABLE study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  questions_attempted INTEGER DEFAULT 0,
  questions_correct INTEGER DEFAULT 0,
  bonsai_interactions INTEGER DEFAULT 0,
  experience_gained BIGINT DEFAULT 0,
  session_type TEXT DEFAULT 'practice',
  platform TEXT DEFAULT 'web',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI interactions for analytics and improvement
CREATE TABLE bonsai_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE,
  question_context TEXT,
  question_type TEXT, -- math, reading, writing
  difficulty_level TEXT, -- easy, medium, hard
  assistance_type TEXT, -- hint, explanation, spiral_question
  ai_provider TEXT, -- openai, gemini
  request_text TEXT,
  response_text TEXT,
  response_time_ms INTEGER,
  user_rating INTEGER, -- 1-5 star rating
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking for billing and analytics
CREATE TABLE usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- bonsai_request, session_start, etc.
  quantity INTEGER DEFAULT 1,
  tier_at_time TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin configuration for API keys and settings
CREATE TABLE admin_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value_encrypted TEXT,
  description TEXT,
  updated_by UUID REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature flags for gradual rollouts
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  enabled BOOLEAN DEFAULT false,
  rollout_percentage INTEGER DEFAULT 0,
  conditions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Indexes for Performance

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);

-- Subscription queries
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Session analytics
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_created_at ON study_sessions(created_at);

-- AI interaction analysis
CREATE INDEX idx_bonsai_interactions_user_id ON bonsai_interactions(user_id);
CREATE INDEX idx_bonsai_interactions_created_at ON bonsai_interactions(created_at);
CREATE INDEX idx_bonsai_interactions_ai_provider ON bonsai_interactions(ai_provider);

-- Usage tracking
CREATE INDEX idx_usage_events_user_id ON usage_events(user_id);
CREATE INDEX idx_usage_events_created_at ON usage_events(created_at);
CREATE INDEX idx_usage_events_type ON usage_events(event_type);
```

#### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonsai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_events ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Subscription policies
CREATE POLICY "Users can view own subscription" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Session policies
CREATE POLICY "Users can manage own sessions" ON study_sessions
  FOR ALL USING (auth.uid() = user_id);

-- AI interaction policies
CREATE POLICY "Users can manage own interactions" ON bonsai_interactions
  FOR ALL USING (auth.uid() = user_id);

-- Usage event policies
CREATE POLICY "Users can view own usage" ON usage_events
  FOR SELECT USING (auth.uid() = user_id);

-- Admin-only policies for configuration
CREATE POLICY "Admin can manage config" ON admin_config
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.subscription_tier = 'admin'
    )
  );
```

## API Architecture

### RESTful API Design

#### Authentication Endpoints
```typescript
// POST /api/auth/signin
interface SignInRequest {
  email: string;
  password: string;
}

interface SignInResponse {
  user: User;
  session: Session;
  subscription: Subscription;
}

// POST /api/auth/signup
interface SignUpRequest {
  email: string;
  password: string;
  targetScore?: number;
  testDate?: string;
}
```

#### Bonsai AI Endpoints
```typescript
// POST /api/bonsai/chat
interface BonsaiChatRequest {
  message: string;
  context: {
    questionText?: string;
    questionType: 'math' | 'reading' | 'writing';
    difficulty: 'easy' | 'medium' | 'hard';
    assistanceLevel: 'hint' | 'explanation' | 'spiral_question';
  };
  sessionId: string;
}

interface BonsaiChatResponse {
  response: string;
  experienceGained: number;
  levelUp: boolean;
  usageCount: number;
  remainingUsage: number;
}

// GET /api/bonsai/growth
interface BonsaiGrowthResponse {
  level: number;
  experience: number;
  experienceToNext: number;
  growthStage: string;
  unlockedFeatures: string[];
}
```

#### Subscription Management
```typescript
// POST /api/subscriptions/create
interface CreateSubscriptionRequest {
  tier: 'basic' | 'pro' | 'enterprise';
  paymentMethodId: string;
}

// POST /api/subscriptions/update
interface UpdateSubscriptionRequest {
  subscriptionId: string;
  tier: 'basic' | 'pro' | 'enterprise';
}

// GET /api/subscriptions/usage
interface UsageResponse {
  currentPeriod: {
    bonsaiRequests: number;
    studyMinutes: number;
    sessionsCount: number;
  };
  limits: {
    bonsaiRequestsLimit: number;
    studyMinutesLimit: number;
  };
}
```

### Webhook Handling

#### Stripe Webhooks
```typescript
// POST /api/webhooks/stripe
interface StripeWebhookEvent {
  type: string;
  data: {
    object: any;
  };
}

// Handled events:
// - customer.subscription.created
// - customer.subscription.updated
// - customer.subscription.deleted
// - invoice.payment_succeeded
// - invoice.payment_failed
```

## Authentication and Authorization

### Supabase Auth Integration
```typescript
// Client-side auth utilities
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const createClient = () => {
  return createClientComponentClient<Database>();
};

// Server-side auth utilities
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies });
};
```

### Role-Based Access Control
```typescript
export enum UserRole {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
  ADMIN = 'admin'
}

export const permissions = {
  [UserRole.FREE]: {
    bonsaiRequestsPerDay: 10,
    studyMinutesPerMonth: 300,
    features: ['basic_hints', 'progress_tracking']
  },
  [UserRole.BASIC]: {
    bonsaiRequestsPerDay: 100,
    studyMinutesPerMonth: 1800,
    features: ['all_hints', 'explanations', 'progress_tracking', 'voice_commands']
  },
  [UserRole.PRO]: {
    bonsaiRequestsPerDay: -1, // unlimited
    studyMinutesPerMonth: -1,
    features: ['all_features', 'advanced_analytics', 'priority_support']
  }
};
```

## AI Integration Architecture

### Multi-Provider AI Service
```typescript
// AI provider abstraction
interface AIProvider {
  name: string;
  makeRequest(params: AIRequestParams): Promise<AIResponse>;
  supportsStreaming: boolean;
  costPerRequest: number;
}

class OpenAIProvider implements AIProvider {
  name = 'openai';
  
  async makeRequest(params: AIRequestParams): Promise<AIResponse> {
    // OpenAI-specific implementation
  }
}

class GeminiProvider implements AIProvider {
  name = 'gemini';
  
  async makeRequest(params: AIRequestParams): Promise<AIResponse> {
    // Gemini-specific implementation
  }
}

// AI service with fallback logic
class BonsaiAIService {
  private providers: AIProvider[];
  
  async getBonsaiResponse(request: BonsaiRequest): Promise<BonsaiResponse> {
    // Try primary provider first, fallback on error
    for (const provider of this.providers) {
      try {
        return await provider.makeRequest(request);
      } catch (error) {
        console.error(`Provider ${provider.name} failed:`, error);
        continue;
      }
    }
    throw new Error('All AI providers failed');
  }
}
```

### Glass Context Awareness Integration
```typescript
// Adapted from Glass repository
interface ContextAwareness {
  captureContext(): Promise<ScreenContext>;
  analyzeQuestion(context: ScreenContext): Promise<SAT QuestionAnalysis>;
  generateResponse(question: SATQuestionAnalysis, assistanceLevel: string): Promise<string>;
}

interface ScreenContext {
  text: string;
  images: string[];
  platform: 'bluebook' | 'khan_academy' | 'other';
  questionType: 'math' | 'reading' | 'writing';
  timestamp: Date;
}

interface SATQuestionAnalysis {
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  concepts: string[];
  commonMistakes: string[];
  hints: string[];
}
```

## Third-Party Integrations

### Stripe Integration
```typescript
// Server-side Stripe configuration
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

// Subscription tier pricing
export const SUBSCRIPTION_TIERS = {
  basic: {
    priceId: 'price_basic_monthly',
    features: ['unlimited_hints', 'explanations', 'progress_tracking']
  },
  pro: {
    priceId: 'price_pro_monthly',
    features: ['all_basic', 'voice_commands', 'advanced_analytics']
  },
  enterprise: {
    priceId: 'price_enterprise_monthly',
    features: ['all_pro', 'multi_student', 'admin_dashboard']
  }
};
```

### Real-time Features with Supabase
```typescript
// Real-time Bonsai growth updates
export function useBonsaiGrowth(userId: string) {
  const [bonsaiState, setBonsaiState] = useState<BonsaiState>();
  const supabase = createClient();
  
  useEffect(() => {
    const channel = supabase
      .channel(`bonsai_growth_${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'users',
        filter: `id=eq.${userId}`
      }, (payload) => {
        setBonsaiState(prev => ({
          ...prev,
          level: payload.new.bonsai_level,
          experience: payload.new.bonsai_experience
        }));
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
  
  return { bonsaiState };
}
```

## Infrastructure and Deployment

### Vercel Configuration
```json
{
  "functions": {
    "app/api/bonsai/chat/route.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key"
  },
  "build": {
    "env": {
      "NEXT_TELEMETRY_DISABLED": "1"
    }
  }
}
```

### Environment Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Stripe Configuration
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxx

# AI Providers
OPENAI_API_KEY=sk-xxx
GEMINI_API_KEY=xxx

# Security
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=https://bonsai-sat-tutor.vercel.app

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=xxx
```

## Security Architecture

### Data Protection
- **Encryption at Rest**: All sensitive data encrypted in Supabase
- **Encryption in Transit**: HTTPS everywhere with TLS 1.3
- **API Key Security**: Keys stored in Vercel environment variables
- **Row Level Security**: Database-level access control

### Privacy Compliance
```typescript
// GDPR compliance utilities
export class PrivacyManager {
  async exportUserData(userId: string): Promise<UserDataExport> {
    // Export all user data in machine-readable format
  }
  
  async deleteUserData(userId: string): Promise<void> {
    // Permanently delete all user data
  }
  
  async anonymizeUserData(userId: string): Promise<void> {
    // Replace PII with anonymous identifiers
  }
}
```

### Rate Limiting
```typescript
// API rate limiting middleware
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'), // 100 requests per hour
});

export async function rateLimitMiddleware(request: Request) {
  const identifier = getClientIdentifier(request);
  const { success } = await ratelimit.limit(identifier);
  
  if (!success) {
    throw new Error('Rate limit exceeded');
  }
}
```

## Performance Optimization

### Caching Strategy
```typescript
// Multi-level caching
export class CacheManager {
  // Browser cache for static assets
  private browserCache = new Map();
  
  // Edge cache for API responses
  private edgeCache = new Map();
  
  // Database query cache
  private dbCache = new Map();
  
  async get(key: string, level: 'browser' | 'edge' | 'db'): Promise<any> {
    switch (level) {
      case 'browser':
        return this.browserCache.get(key);
      case 'edge':
        return this.edgeCache.get(key);
      case 'db':
        return this.dbCache.get(key);
    }
  }
}
```

### Bundle Optimization
```typescript
// Dynamic imports for code splitting
const BonsaiAssistant = dynamic(() => import('@/components/bonsai/BonsaiAssistant'), {
  loading: () => <BonsaiSkeleton />,
  ssr: false
});

// Tree shaking for AI providers
export const aiProviders = {
  openai: () => import('./openai-provider'),
  gemini: () => import('./gemini-provider')
};
```

## Monitoring and Analytics

### Application Monitoring
```typescript
// Custom analytics events
export function trackBonsaiInteraction(event: BonsaiEvent) {
  // Send to Vercel Analytics
  va.track('bonsai_interaction', {
    type: event.type,
    assistanceLevel: event.assistanceLevel,
    userTier: event.userTier
  });
  
  // Send to custom analytics
  analytics.track({
    userId: event.userId,
    event: 'bonsai_interaction',
    properties: event
  });
}
```

### Error Tracking
```typescript
// Global error boundary
export class BonsaiErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error tracking service
    errorTracker.captureException(error, {
      tags: {
        section: 'bonsai_ai'
      },
      extra: errorInfo
    });
  }
}
```

## Browser Extension Architecture

### Manifest V3 Configuration
```json
{
  "manifest_version": 3,
  "name": "Bonsai SAT Tutor",
  "version": "1.0.0",
  "permissions": [
    "activeTab",
    "storage",
    "background"
  ],
  "content_scripts": [
    {
      "matches": ["*://*.collegeboard.org/*", "*://*.khanacademy.org/*"],
      "js": ["content.js"],
      "css": ["bonsai.css"]
    }
  ],
  "background": {
    "service_worker": "background.js"
  },
  "action": {
    "default_popup": "popup.html"
  }
}
```

### Content Script Integration
```typescript
// Content script for SAT question detection
class SATQuestionDetector {
  private observer: MutationObserver;
  
  init() {
    this.observer = new MutationObserver(this.handleDOMChanges.bind(this));
    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  private handleDOMChanges(mutations: MutationRecord[]) {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        this.detectSATQuestions(mutation.target as Element);
      }
    }
  }
  
  private detectSATQuestions(element: Element) {
    // Platform-specific question detection logic
    if (this.isBluebookPlatform()) {
      return this.detectBluebookQuestions(element);
    } else if (this.isKhanAcademyPlatform()) {
      return this.detectKhanAcademyQuestions(element);
    }
  }
}
```

## Testing Architecture

### Testing Strategy
```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { BonsaiAssistant } from '@/components/bonsai/BonsaiAssistant';

describe('BonsaiAssistant', () => {
  it('should respond to voice commands', async () => {
    render(<BonsaiAssistant userId="test-user" />);
    
    // Simulate voice input
    const voiceButton = screen.getByRole('button', { name: /voice/i });
    fireEvent.click(voiceButton);
    
    // Mock speech recognition
    const mockSpeech = new SpeechRecognitionMock();
    mockSpeech.simulateResult('Hey Bonsai, help me with this math problem');
    
    // Assert AI response
    await screen.findByText(/I'd be happy to help/i);
  });
});
```

### API Testing
```typescript
// API route testing
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/bonsai/chat/route';

describe('/api/bonsai/chat', () => {
  it('should return AI response for valid request', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: {
        message: 'Help me solve this quadratic equation',
        context: {
          questionType: 'math',
          difficulty: 'medium'
        }
      }
    });
    
    await handler(req, res);
    
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.response).toBeDefined();
    expect(data.experienceGained).toBeGreaterThan(0);
  });
});
```

## Deployment Pipeline

### CI/CD Configuration
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel
on:
  push:
    branches: [main, develop]
    
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test
      - run: npm run type-check
      - run: npm run lint
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Future Architecture Considerations

### Scalability Planning
- **Database Sharding**: Prepare for horizontal scaling as user base grows
- **CDN Integration**: Global content delivery for reduced latency
- **Microservices**: Consider splitting into specialized services for AI, payments, etc.
- **Caching Layers**: Redis for session data and frequent queries

### Technology Evolution
- **AI Model Updates**: Architecture to support new AI models and providers
- **Real-time Features**: WebSocket or Server-Sent Events for live collaboration
- **Mobile Apps**: React Native for iOS and Android applications
- **Desktop Apps**: Electron app with native OS integration

This technical architecture provides a solid foundation for the Bonsai SAT Tutor platform while maintaining flexibility for future growth and feature additions.