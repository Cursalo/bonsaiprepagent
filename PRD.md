# Bonsai SAT Tutor - Product Requirements Document

## Executive Summary

Bonsai SAT Tutor is a revolutionary SaaS platform that combines the contextual awareness capabilities of Glass with specialized SAT preparation features. The platform features an always-visible, Glass-inspired 3D Bonsai tree AI tutor that provides real-time, contextual assistance during SAT practice sessions on College Board's Bluebook platform and other study environments.

## Product Vision

**Mission**: Democratize access to personalized, AI-powered SAT preparation that adapts to each student's learning style and provides contextual assistance exactly when needed.

**Vision**: Become the leading AI-powered SAT preparation platform that seamlessly integrates with existing study workflows, providing students with an always-available, intelligent tutor that grows with their progress.

## Target Market Analysis

### Primary Personas

#### 1. High School Students (Ages 15-18)
- **Demographics**: Junior and Senior high school students preparing for college admissions
- **Pain Points**:
  - Overwhelmed by SAT preparation complexity
  - Need for immediate feedback and explanations
  - Difficulty maintaining study motivation
  - Expensive traditional tutoring options
- **Goals**: Achieve target SAT scores for college admissions
- **Usage Patterns**: Study sessions of 30-120 minutes, 3-5 times per week

#### 2. Parents of High School Students
- **Demographics**: Ages 40-55, household income $50K-$200K+
- **Pain Points**:
  - Want to ensure their child is well-prepared
  - Concerned about tutoring costs
  - Need visibility into their child's progress
- **Goals**: Support their child's college preparation within budget
- **Usage Patterns**: Monitor progress weekly, purchase subscriptions

#### 3. Educational Institutions
- **Demographics**: High schools, tutoring centers, educational nonprofits
- **Pain Points**:
  - Need scalable SAT preparation solutions
  - Limited budget for individual tutoring
  - Requirement for progress tracking and reporting
- **Goals**: Improve student SAT performance at scale
- **Usage Patterns**: Deploy for multiple students, require administrative oversight

### Market Size
- **Total Addressable Market (TAM)**: $7.8B (Global test preparation market)
- **Serviceable Addressable Market (SAM)**: $2.1B (US SAT preparation market)
- **Serviceable Obtainable Market (SOM)**: $210M (AI-powered test prep segment)

## Competitive Analysis

### Direct Competitors
1. **Khan Academy SAT Practice** (Free)
   - Strengths: Free, official partnership with College Board
   - Weaknesses: Limited personalization, no real-time assistance
   
2. **Kaplan SAT Prep** ($199-$1,299)
   - Strengths: Established brand, comprehensive content
   - Weaknesses: Expensive, traditional teaching methods

3. **Princeton Review SAT** ($149-$1,599)
   - Strengths: Strong brand recognition, proven track record
   - Weaknesses: High cost, limited AI features

### Indirect Competitors
- General AI tutoring platforms (Socratic, Photomath)
- Traditional tutoring services (Wyzant, Tutor.com)
- SAT preparation books and materials

### Competitive Advantages
1. **Real-time Contextual Assistance**: Glass-inspired technology provides immediate help
2. **Visual Progress Representation**: on student dashboard
3. **Seamless Integration**: Works with existing study platforms (Bluebook)
4. **Multi-tier Pricing**: Accessible options from free to enterprise
5. **Voice Activation**: "Hey Bonsai" commands for hands-free assistance

## Product Features

### Core Features (MVP)

#### 1. Bonsai Glass AI Assistant
- **Always-visible CSS-only floating glass bubble** with animated 3D Bonsai tree
- **Context-aware assistance** adapted from Glass technology
- **Multi-tier responses**:
  - **Hints**: Gentle nudges in the right direction
  - **Explanations**: Detailed concept breakdowns
  - **Spiral Questions**: Follow-up questions to reinforce learning
- **Visual growth system**: Bonsai tree evolves based on student progress
- **Voice activation**: "Hey Bonsai" wake word for hands-free interaction

#### 2. SAT Question Recognition
- **Screen context analysis** to identify SAT questions and content
- **Real-time question parsing** for Math, Reading, and Writing sections
- **Automatic difficulty assessment** and appropriate assistance level
- **Integration with College Board Bluebook** platform

#### 3. Progress Tracking

- **Performance analytics** by section and topic
- **Study streak tracking** and motivation features
- **Detailed session reports** with improvement recommendations

#### 4. Subscription Management
- **Four-tier pricing structure**:
  - **Free**: Basic hints, limited daily usage
  - **Basic ($19.99/month)**: Unlimited hints, explanations, progress tracking
  - **Pro ($39.99/month)**: All features, advanced analytics, voice commands
  - **Enterprise ($299/month)**: Multi-student management, institutional features
- **Stripe integration** with automated billing and usage tracking
- **Free trial periods** with seamless conversion

### Advanced Features

#### 1. Adaptive Learning Engine
- **Personalized difficulty adjustment** based on performance patterns
- **Learning style detection** and content adaptation
- **Weakness identification** and targeted practice recommendations
- **Spaced repetition algorithms** for optimal retention

#### 2. Study Session Management
- **Pomodoro timer integration** with Bonsai visual cues
- **Session goal setting** and achievement tracking

- **Study plan generation** based on test dates and target scores

#### 3. Social Features

- **Achievement badges** and milestone celebrations

- **Peer tutoring connections** for collaborative learning

#### 4. Institutional Features (Enterprise)
- **Multi-student dashboards** for teachers and administrators
- **Progress reporting** and analytics for educational institutions
- **Custom branding** and white-label options
- **Bulk user management** and provisioning
- **FERPA compliance** and student data protection

## User Journey Flows

### New User Onboarding
1. **Discovery**: User finds Bonsai through search, social media, or referral
2. **Landing Page**: Clear value proposition and feature overview
3. **Sign-up**: Simple account creation with email/Google/Apple
4. **Platform Selection**: Choose installation method (browser extension, desktop app, web app)
5. **Goal Setting**: Input target SAT score and test date
6. **Bonsai Customization**: Select Bonsai tree style and growth preferences
7. **First Session**: Guided tutorial with sample SAT questions
8. **Subscription Choice**: Present tier options based on usage in trial

### Daily Study Session
1. **Session Start**: Open SAT practice platform (Bluebook, Khan Academy, etc.)
2. **Bonsai Activation**: Floating glass bubble appears with sleeping Bonsai
3. **Question Encounter**: Student encounters difficult SAT question
4. **Assistance Request**: 
   - Voice: "Hey Bonsai, can you help with this?"
   - Click: Tap on Bonsai bubble
   - Auto: Bonsai detects struggle after extended time
5. **Contextual Help**: Bonsai analyzes question and provides appropriate assistance, spiral new questions 
6. **Learning Confirmation**: Student demonstrates understanding through follow-up

8. **Session End**: Summary of progress and next session recommendations

### Progress Monitoring
1. **Dashboard Access**: Student opens Bonsai web dashboard

3. **Analytics Review**: Performance trends by section and topic
4. **Goal Adjustment**: Modify study plans based on progress
5
6. **Next Steps**: Receive personalized study recommendations

## Success Metrics and KPIs

### Product Metrics
- **Daily Active Users (DAU)**: Target 50K within 12 months
- **Monthly Active Users (MAU)**: Target 200K within 12 months
- **User Retention**: 70% Day 7, 40% Day 30, 20% Day 90
- **Session Duration**: Average 45 minutes per study session
- **Questions Assisted**: Average 15 questions per session

### Business Metrics
- **Monthly Recurring Revenue (MRR)**: Target $500K within 12 months
- **Customer Acquisition Cost (CAC)**: <$25 for organic, <$50 for paid
- **Customer Lifetime Value (CLV)**: Target $120 (6-month average subscription)
- **Conversion Rate**: 15% free to paid within 30 days
- **Churn Rate**: <5% monthly for paid subscribers

### Educational Impact Metrics
- **SAT Score Improvement**: Average 100+ point increase after 60 days
- **Study Consistency**: 80% of users maintain 3+ sessions per week
- **Question Accuracy**: 25% improvement in practice question performance
- **Concept Mastery**: 90% of explained concepts retained after 1 week

### Technical Performance Metrics
- **Response Time**: <500ms for Bonsai assistance requests
- **Uptime**: 99.9% platform availability
- **Integration Success**: 95% successful integration with Bluebook platform
- **Voice Recognition Accuracy**: 95% for "Hey Bonsai" wake word

## User Experience Requirements

### Design Principles
1. **Minimally Invasive**: Bonsai should enhance, not distract from study sessions
2. **Contextually Aware**: Assistance should be relevant to current question/topic
3. **Progressively Helpful**: Start with hints, escalate to explanations as needed
4. **Visually Appealing**: 3D Bonsai should be beautiful and motivating
5. **Accessible**: Support for screen readers and accessibility standards

### Interface Requirements
- **Floating Glass Bubble**: 80x80px default size, scalable, always on top

- **Voice Interface**: Clear audio feedback, noise cancellation
- **Dark/Light Mode**: Automatic adaptation to system preferences
- **Mobile Responsive**: Optimized for tablet and mobile study sessions

### Performance Requirements
- **Load Time**: <2 seconds for initial Bonsai appearance
- **Memory Usage**: <50MB RAM footprint for browser extension
- **Battery Impact**: <5% additional battery drain on laptops
- **Offline Capability**: Basic hints available without internet connection

## Technical Constraints

### Browser Compatibility
- **Chrome**: Version 90+ (primary target)
- **Safari**: Version 14+ (macOS support)
- **Firefox**: Version 88+ (secondary priority)
- **Edge**: Version 90+ (Windows support)

### Platform Integration
- **College Board Bluebook**: Full integration with question detection
- **Khan Academy**: Context awareness for SAT practice sections
- **Other Platforms**: Generic text recognition and assistance

### Privacy and Security
- **Student Data Protection**: FERPA and COPPA compliance
- **Screen Content**: No persistent storage of screen captures
- **Voice Data**: Local processing only, no cloud storage
- **Encrypted Storage**: All user data encrypted at rest and in transit

## Regulatory and Compliance Requirements

### Educational Standards
- **FERPA Compliance**: Protection of student educational records
- **COPPA Compliance**: Additional protections for users under 13
- **Accessibility**: WCAG 2.1 AA compliance for disabled users
- **Academic Integrity**: Clear guidelines on appropriate assistance levels

### Data Protection
- **GDPR Compliance**: For international users
- **CCPA Compliance**: California privacy rights
- **SOC 2 Type II**: Security and availability controls
- **Regular Security Audits**: Quarterly penetration testing

## Go-to-Market Strategy

### Launch Phases

#### Phase 1: Closed Beta (Months 1-2)
- **Target**: 100 power users (SAT tutors, educators)
- **Features**: Core Bonsai assistant with basic question recognition
- **Goals**: Validate core value proposition, refine user experience

#### Phase 2: Open Beta (Months 3-4)
- **Target**: 1,000 students preparing for SAT
- **Features**: Full feature set, all subscription tiers
- **Goals**: Test scalability, gather usage data, optimize conversion

#### Phase 3: Public Launch (Month 5)
- **Target**: General market of SAT-prep students
- **Features**: Complete platform with all integrations
- **Goals**: Drive user acquisition, establish market presence

### Marketing Channels

#### Digital Marketing
1. **Content Marketing**: SEO-optimized blog posts about SAT preparation
2. **Social Media**: TikTok and Instagram content showcasing Bonsai
3. **YouTube**: Tutorial videos and student success stories
4. **Google Ads**: Targeted campaigns for SAT-related keywords
5. **Influencer Partnerships**: Collaborate with education influencers

#### Educational Partnerships
1. **High Schools**: Pilot programs with progressive schools
2. **Tutoring Centers**: B2B partnerships for enhanced services
3. **Educational Conferences**: Presence at NACAC, NCEA events
4. **Teacher Networks**: Referral programs for educators

#### Organic Growth
1. **Referral Program**: Students earn free months for successful referrals
2. **Word of Mouth**: Exceptional user experience drives organic sharing
3. **App Store Optimization**: High ratings and featured placements
4. **Community Building**: Discord server for Bonsai users

## Risk Analysis and Mitigation

### Technical Risks
1. **Integration Challenges**: College Board changes to Bluebook platform
   - *Mitigation*: Maintain close relationship with CB, flexible integration architecture
2. **Performance Issues**: Bonsai assistant causing system slowdowns
   - *Mitigation*: Extensive performance testing, resource monitoring
3. **Voice Recognition Accuracy**: "Hey Bonsai" not working reliably
   - *Mitigation*: Multiple activation methods, continuous ML model improvement

### Business Risks
1. **Competitive Response**: Khan Academy adds similar AI features
   - *Mitigation*: Focus on superior UX, faster innovation cycles
2. **Market Saturation**: Too many AI tutoring products
   - *Mitigation*: Strong brand differentiation, exclusive Glass-inspired features
3. **Economic Downturn**: Reduced spending on educational technology
   - *Mitigation*: Maintain free tier, focus on value demonstration

### Regulatory Risks
1. **Academic Integrity Concerns**: Schools ban AI assistance tools
   - *Mitigation*: Clear guidelines, educator-approved assistance levels
2. **Privacy Regulations**: Stricter student data protection laws
   - *Mitigation*: Privacy-by-design architecture, minimal data collection

## Future Roadmap

### 6-Month Roadmap
- **Enhanced AI Models**: GPT-4.1 integration for deeper explanations
- **Mobile Apps**: PWA iOS and Android applications
- **Advanced Analytics**: Predictive scoring and improvement forecasts


### 12-Month Roadmap
- **Multi-Subject Expansion**: ACT, AP, and other standardized tests
- **International Markets**: Support for SAT Subject Tests, international curricula
- **AI Voice Assistant**: Natural conversation with Bonsai tutor
- **VR/AR Integration**: Immersive study environments with 3D Bonsai

### 24-Month Roadmap
- **Institutional Platform**: Full LMS integration for schools and districts
- **AI-Generated Content**: Custom practice questions based on student needs
- **Predictive Analytics**: College admission probability calculations
- **Global Expansion**: Localization for international education markets

## Appendices

### A. Technical Architecture Overview
- Next.js 14 with TypeScript for web application
- Supabase for database, authentication, and real-time features
- Vercel for hosting and edge functions
- Stripe for payment processing and subscription management
- OpenAI and Gemini for AI-powered assistance

### B. Detailed Feature Specifications
- Comprehensive feature breakdown with technical requirements
- User interface mockups and interaction flows
- API endpoint specifications and data models

### C. Market Research Data
- Survey results from target student demographics
- Competitive pricing analysis and feature comparison
- Industry trend analysis and growth projections

### D. Financial Projections
- Detailed revenue projections by subscription tier
- Customer acquisition cost analysis by channel
- Unit economics and profitability timeline

---

*This PRD is a living document that will be updated based on user feedback, market research, and technical discoveries during development.*