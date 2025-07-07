# Bonsai SAT Tutor - Claude Code Integration Guide

## Project Overview

Bonsai SAT Tutor is a production-ready SaaS platform for SAT preparation featuring a Glass-inspired 3D Bonsai AI tutor. This document provides comprehensive instructions for developing, testing, and deploying the platform using Claude Code.

## Development Workflow

### Initial Setup Commands

```bash
# Navigate to project directory
cd bonsai-sat-tutor

# Install dependencies for web application
npm install

# Install Supabase CLI
npm install -g supabase

# Start development environment
npm run dev

# Start Supabase local development
supabase start

# Apply database migrations
supabase db reset
```

### Daily Development Commands

```bash
# Start full development stack
npm run dev:all

# Watch for changes and hot reload
npm run dev:watch

# Run type checking
npm run type-check

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Build for production
npm run build

# Deploy to Vercel
npm run deploy
```

## Project Structure and Conventions

### Directory Structure
```
bonsai-sat-tutor/
├── PRD.md                          # Product Requirements Document
├── CLAUDE.md                       # This file - Claude Code integration
├── TECHSTACK.md                    # Technical architecture details
├── BUSINESS_MODEL.md               # Monetization and subscription strategy
├── INSTALLATION.md                 # Distribution and installation guide
├── API_SPEC.md                     # Complete API documentation
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── (auth)/                 # Authentication routes
│   │   ├── (dashboard)/            # Protected dashboard routes
│   │   ├── admin/                  # Admin panel routes
│   │   ├── api/                    # API routes and webhooks
│   │   ├── globals.css             # Global styles
│   │   ├── layout.tsx              # Root layout component
│   │   └── page.tsx                # Landing page
│   ├── components/                 # React components
│   │   ├── ui/                     # Base UI components (shadcn/ui)
│   │   ├── bonsai/                 # Bonsai AI assistant components
│   │   ├── dashboard/              # Dashboard-specific components
│   │   ├── admin/                  # Admin panel components
│   │   └── auth/                   # Authentication components
│   ├── lib/                        # Utility functions and integrations
│   │   ├── supabase/               # Supabase client and utilities
│   │   ├── stripe/                 # Stripe integration
│   │   ├── ai/                     # AI provider integrations
│   │   ├── glass/                  # Glass-inspired context awareness
│   │   └── utils.ts                # General utilities
│   └── types/                      # TypeScript type definitions
│       ├── database.ts             # Supabase database types
│       ├── stripe.ts               # Stripe-related types
│       └── bonsai.ts               # Bonsai AI types
├── supabase/
│   ├── migrations/                 # Database migrations
│   ├── functions/                  # Edge functions
│   ├── config.toml                 # Supabase configuration
│   └── seed.sql                    # Database seed data
├── browser-extension/              # Chrome/Firefox extension
├── desktop-app/                    # Electron desktop application
├── docs/                           # Additional documentation
└── tests/                          # Test files
```

### Code Conventions

#### TypeScript Standards
- Use strict TypeScript configuration
- Prefer interfaces over types for object shapes
- Use enums for constants with multiple values
- Always define return types for functions
- Use generic types for reusable components

#### React Component Patterns
```typescript
// Component naming: PascalCase
export function BonsaiAssistant({ userId, subscriptionTier }: BonsaiAssistantProps) {
  // Use custom hooks for complex logic
  const { bonsaiState, growBonsai } = useBonsaiGrowth(userId);
  
  // Event handlers: handle[Action]
  const handleQuestionRequest = useCallback((question: string) => {
    // Implementation
  }, []);
  
  return (
    <div className="bonsai-assistant">
      {/* JSX */}
    </div>
  );
}
```

#### File Naming Conventions
- Components: `PascalCase.tsx` (e.g., `BonsaiAssistant.tsx`)
- Utilities: `camelCase.ts` (e.g., `apiClient.ts`)
- Types: `camelCase.ts` (e.g., `database.ts`)
- Pages: `kebab-case.tsx` (e.g., `subscription-settings.tsx`)

#### CSS/Styling Standards
- Use Tailwind CSS for all styling
- Create custom CSS variables for brand colors
- Use CSS modules for component-specific styles when needed
- Follow mobile-first responsive design

## Testing and Quality Assurance

### Testing Commands

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run component tests
npm run test:components

# Run API tests
npm run test:api

# Test Bonsai AI integration
npm run test:bonsai

# Test Stripe webhooks
npm run test:webhooks
```

### Testing Strategy

#### Unit Tests
- Test all utility functions in `src/lib/`
- Test React components with React Testing Library
- Test AI integration functions
- Test subscription logic

#### Integration Tests
- Test API endpoints with Supabase
- Test Stripe webhook handling
- Test authentication flows
- Test subscription tier changes

#### E2E Tests
- Test complete user onboarding flow
- Test Bonsai assistant interactions
- Test subscription upgrade/downgrade
- Test admin dashboard functionality

### Code Quality Tools

```bash
# TypeScript type checking
npm run type-check

# ESLint for code quality
npm run lint

# Prettier for formatting
npm run format

# Pre-commit hooks (automatically run)
npm run pre-commit
```

## Database Management

### Supabase Commands

```bash
# Start local Supabase
supabase start

# Create new migration
supabase migration new <migration_name>

# Apply migrations
supabase db reset

# Generate TypeScript types
supabase gen types typescript --local > src/types/database.ts

# Seed database with test data
supabase db seed

# View database in browser
supabase dashboard
```

### Migration Best Practices
- Always test migrations locally first
- Include both up and down migration scripts
- Use descriptive migration names
- Review migration impact on existing data

## API Development

### API Route Structure
```
src/app/api/
├── auth/
│   ├── signin/route.ts
│   ├── signup/route.ts
│   └── signout/route.ts
├── bonsai/
│   ├── chat/route.ts
│   ├── progress/route.ts
│   └── growth/route.ts
├── subscriptions/
│   ├── create/route.ts
│   ├── update/route.ts
│   └── cancel/route.ts
├── webhooks/
│   ├── stripe/route.ts
│   └── supabase/route.ts
└── admin/
    ├── users/route.ts
    ├── analytics/route.ts
    └── config/route.ts
```

### API Development Guidelines
- Use Next.js App Router API routes
- Implement proper error handling and logging
- Add rate limiting for all endpoints
- Use middleware for authentication
- Document all endpoints in API_SPEC.md

## Deployment Procedures

### Environment Setup

```bash
# Set up environment variables
cp .env.example .env.local

# Required environment variables:
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
# OPENAI_API_KEY=
# GEMINI_API_KEY=
```

### Deployment Commands

```bash
# Deploy to Vercel
npm run deploy

# Deploy Supabase functions
supabase functions deploy

# Run production health checks
npm run health-check

# Monitor deployment
npm run monitor
```

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] No linting errors
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhooks configured
- [ ] Performance benchmarks met

## Environment Configuration

### Development Environment
```bash
# Install dependencies
npm install

# Set up local Supabase
supabase init
supabase start

# Configure local environment
cp .env.example .env.local

# Start development server
npm run dev
```

### Staging Environment
- Deployed automatically on push to `develop` branch
- Uses staging Supabase project
- Test Stripe keys for payment testing
- Limited AI API quotas

### Production Environment
- Deployed manually or on push to `main` branch
- Production Supabase project with backups
- Live Stripe keys and webhooks
- Full AI API quotas and monitoring

## Debugging and Troubleshooting

### Common Issues and Solutions

#### Bonsai Assistant Not Responding
```bash
# Check AI API keys
npm run check-ai-config

# Verify Supabase connection
npm run check-supabase

# Test Glass context awareness
npm run test:glass
```

#### Subscription Issues
```bash
# Verify Stripe configuration
npm run check-stripe

# Test webhook endpoints
npm run test:webhooks

# Check subscription states
npm run debug:subscriptions
```

#### Performance Issues
```bash
# Run performance analysis
npm run analyze

# Check bundle size
npm run bundle-analyzer

# Monitor runtime performance
npm run monitor:performance
```

### Logging and Monitoring

#### Development Logging
```typescript
import { logger } from '@/lib/logger';

// Use structured logging
logger.info('Bonsai growth updated', {
  userId,
  previousLevel,
  newLevel,
  timestamp: new Date().toISOString()
});
```

#### Production Monitoring
- Vercel Analytics for performance metrics
- Supabase Dashboard for database monitoring
- Stripe Dashboard for payment monitoring
- Custom logging for Bonsai AI interactions

## Security Considerations

### Authentication
- Supabase Auth with Row Level Security (RLS)
- JWT tokens for API authentication
- Secure session management
- Multi-factor authentication support

### Data Protection
- Encrypt sensitive user data
- Secure API key storage
- GDPR and COPPA compliance
- Regular security audits

### AI Safety
- Content filtering for inappropriate requests
- Rate limiting for AI API calls
- User context isolation
- Audit logging for AI interactions

## Performance Optimization

### Frontend Performance
```bash
# Analyze bundle size
npm run analyze

# Optimize images
npm run optimize-images

# Test Core Web Vitals
npm run test:performance
```

### Backend Performance
- Database query optimization
- API response caching
- Edge function deployment
- CDN configuration

## Integration Guidelines

### Glass Technology Integration
- Adapt screen context awareness from Glass repository
- Implement floating overlay component
- Real-time question detection
- Seamless platform integration

### Third-party Integrations
- OpenAI GPT-4 for advanced explanations
- Google Gemini for alternative AI responses
- Stripe for subscription management
- Supabase for real-time features

## Maintenance and Updates

### Regular Maintenance Tasks
```bash
# Update dependencies weekly
npm run update-deps

# Security audit monthly
npm audit

# Performance review monthly
npm run performance-audit

# Backup verification weekly
npm run backup-check
```

### Version Management
- Semantic versioning (major.minor.patch)
- Changelog maintenance for each release
- Database migration versioning
- API versioning strategy

## Support and Documentation

### User Support Features
- In-app help documentation
- Video tutorials for key features
- Community Discord server
- Email support system

### Developer Documentation
- Code comments for complex logic
- API documentation with examples
- Architecture decision records (ADRs)
- Regular documentation updates

---

## Quick Reference Commands

```bash
# Essential daily commands
npm run dev              # Start development server
npm run type-check       # Check TypeScript
npm run lint            # Run linting
npm run test            # Run tests
npm run build           # Build for production

# Database commands
supabase start          # Start local database
supabase db reset       # Reset with migrations
supabase gen types      # Generate TypeScript types

# Deployment commands
npm run deploy          # Deploy to Vercel
npm run health-check    # Verify deployment

# Debugging commands
npm run debug:bonsai    # Debug AI assistant
npm run debug:stripe    # Debug payments
npm run monitor         # Monitor performance
```

This document serves as the primary reference for all development activities on the Bonsai SAT Tutor platform. Keep it updated as the project evolves and new tools or procedures are introduced.