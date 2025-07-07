# Bonsai SAT Tutor - API Specification

## Overview

The Bonsai SAT Tutor API provides comprehensive endpoints for AI-powered SAT preparation, subscription management, progress tracking, and administrative functions. The API follows RESTful principles and uses JSON for data exchange.

## Base URLs

- **Production**: `https://bonsai-sat-tutor.vercel.app/api`
- **Staging**: `https://bonsai-sat-tutor-staging.vercel.app/api`
- **Development**: `http://localhost:3000/api`

## Authentication

### JWT Bearer Token Authentication
All protected endpoints require a valid JWT token in the Authorization header.

```http
Authorization: Bearer <jwt_token>
```

### Authentication Flow
```typescript
// Login request
POST /api/auth/signin
{
  "email": "student@example.com",
  "password": "secure_password"
}

// Response
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "student@example.com",
    "subscription_tier": "basic"
  }
}
```

## Rate Limiting

### Standard Rate Limits
- **Authentication endpoints**: 5 requests per minute per IP
- **Bonsai AI endpoints**: 100 requests per hour per user (tier-dependent)
- **General API endpoints**: 1000 requests per hour per user
- **Webhooks**: No rate limiting

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

### Rate Limit Response
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "retry_after": 60
  }
}
```

## Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details",
    "timestamp": "2024-01-01T00:00:00Z",
    "request_id": "req_123456789"
  }
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Authentication Endpoints

### Sign Up
Create a new user account.

```http
POST /api/auth/signup
```

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "secure_password",
  "target_score": 1400,
  "test_date": "2024-06-01",
  "grade_level": 11
}
```

**Response (201):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "subscription_tier": "free",
    "target_score": 1400,
    "test_date": "2024-06-01",
    "bonsai_level": 1
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Sign In
Authenticate existing user.

```http
POST /api/auth/signin
```

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "secure_password"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@example.com",
    "subscription_tier": "basic",
    "bonsai_level": 5
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Refresh Token
Refresh expired access token.

```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Sign Out
Invalidate user session.

```http
POST /api/auth/signout
```

**Headers:**
```http
Authorization: Bearer <access_token>
```

## Bonsai AI Endpoints

### Chat with Bonsai
Send a message to the Bonsai AI tutor.

```http
POST /api/bonsai/chat
```

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "message": "I need help solving this quadratic equation: x² + 5x + 6 = 0",
  "context": {
    "question_text": "Solve for x: x² + 5x + 6 = 0",
    "question_type": "math",
    "subject": "algebra",
    "difficulty": "medium",
    "assistance_level": "hint",
    "platform": "bluebook",
    "screen_context": {
      "url": "https://bluebook.collegeboard.org/practice",
      "page_title": "SAT Practice Test 1 - Question 15"
    }
  },
  "session_id": "session_123456789"
}
```

**Response (200):**
```json
{
  "response": "Great question! For quadratic equations like this, try factoring first. Look for two numbers that multiply to 6 and add to 5. What two numbers come to mind?",
  "response_type": "hint",
  "experience_gained": 15,
  "level_up": false,
  "usage_count": 1,
  "remaining_usage": 199,
  "follow_up_questions": [
    "Would you like me to show you the factoring method?",
    "Do you want to try the quadratic formula instead?"
  ],
  "metadata": {
    "ai_provider": "openai",
    "model": "gpt-4",
    "response_time_ms": 1250,
    "tokens_used": 45
  }
}
```

### Get Bonsai Growth Status
Retrieve current Bonsai level and progress.

```http
GET /api/bonsai/growth
```

**Response (200):**
```json
{
  "level": 5,
  "experience": 2150,
  "experience_to_next": 350,
  "total_experience": 2500,
  "growth_stage": "young_tree",
  "unlocked_features": [
    "voice_commands",
    "spiral_questions",
    "advanced_explanations"
  ],
  "achievements": [
    {
      "id": "first_hint",
      "name": "First Steps",
      "description": "Used your first hint",
      "unlocked_at": "2024-01-01T00:00:00Z"
    }
  ],
  "next_milestone": {
    "level": 6,
    "feature": "custom_bonsai_styling",
    "experience_needed": 350
  }
}
```

### Stream Bonsai Response
Get streaming response from Bonsai AI (Server-Sent Events).

```http
POST /api/bonsai/stream
```

**Request Body:** Same as `/api/bonsai/chat`

**Response (200):**
```http
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive

data: {"type": "start", "message": "Analyzing your question..."}

data: {"type": "chunk", "content": "Great question! For quadratic"}

data: {"type": "chunk", "content": " equations like this, try factoring"}

data: {"type": "end", "experience_gained": 15, "usage_count": 1}
```

### Voice Interaction
Process voice input for Bonsai interaction.

```http
POST /api/bonsai/voice
```

**Request Body (multipart/form-data):**
```
audio: <audio_file_blob>
context: {
  "question_type": "math",
  "session_id": "session_123456789"
}
```

**Response (200):**
```json
{
  "transcription": "Hey Bonsai, can you help me with this math problem?",
  "response": "Of course! I'd be happy to help you with your math problem. Can you tell me what specific equation or concept you're working on?",
  "audio_response_url": "https://bonsai-sat-tutor.vercel.app/api/audio/response_123.mp3"
}
```

## Study Session Endpoints

### Start Study Session
Begin a new study session.

```http
POST /api/sessions/start
```

**Request Body:**
```json
{
  "session_type": "practice",
  "target_duration_minutes": 60,
  "subject_focus": "math",
  "platform": "bluebook"
}
```

**Response (201):**
```json
{
  "session": {
    "id": "session_123456789",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "started_at": "2024-01-01T10:00:00Z",
    "target_duration_minutes": 60,
    "session_type": "practice",
    "platform": "bluebook",
    "status": "active"
  }
}
```

### End Study Session
Complete an active study session.

```http
PUT /api/sessions/{session_id}/end
```

**Request Body:**
```json
{
  "questions_attempted": 25,
  "questions_correct": 20,
  "duration_minutes": 58,
  "difficulty_breakdown": {
    "easy": 8,
    "medium": 12,
    "hard": 5
  }
}
```

**Response (200):**
```json
{
  "session": {
    "id": "session_123456789",
    "ended_at": "2024-01-01T10:58:00Z",
    "duration_minutes": 58,
    "questions_attempted": 25,
    "questions_correct": 20,
    "accuracy_rate": 0.8,
    "experience_gained": 120,
    "bonsai_interactions": 8
  },
  "performance_summary": {
    "strengths": ["Algebra", "Geometry"],
    "areas_for_improvement": ["Statistics", "Complex Numbers"],
    "recommended_next_session": "Focus on Statistics practice"
  }
}
```

### Get Study Sessions
Retrieve user's study session history.

```http
GET /api/sessions?limit=20&offset=0&subject=math
```

**Query Parameters:**
- `limit` (optional): Number of sessions to return (default: 20, max: 100)
- `offset` (optional): Number of sessions to skip (default: 0)
- `subject` (optional): Filter by subject (math, reading, writing)
- `start_date` (optional): ISO date string
- `end_date` (optional): ISO date string

**Response (200):**
```json
{
  "sessions": [
    {
      "id": "session_123456789",
      "started_at": "2024-01-01T10:00:00Z",
      "ended_at": "2024-01-01T10:58:00Z",
      "duration_minutes": 58,
      "questions_attempted": 25,
      "questions_correct": 20,
      "experience_gained": 120
    }
  ],
  "total_count": 45,
  "has_more": true
}
```

## Progress Tracking Endpoints

### Get User Progress
Retrieve comprehensive progress analytics.

```http
GET /api/progress
```

**Response (200):**
```json
{
  "overall_progress": {
    "total_study_time_minutes": 1250,
    "total_questions_attempted": 450,
    "overall_accuracy": 0.78,
    "current_streak": 5,
    "longest_streak": 12,
    "bonsai_level": 5,
    "experience": 2150
  },
  "subject_breakdown": {
    "math": {
      "questions_attempted": 200,
      "accuracy": 0.75,
      "time_spent_minutes": 600,
      "improvement_trend": 0.15
    },
    "reading": {
      "questions_attempted": 150,
      "accuracy": 0.82,
      "time_spent_minutes": 400,
      "improvement_trend": 0.08
    },
    "writing": {
      "questions_attempted": 100,
      "accuracy": 0.80,
      "time_spent_minutes": 250,
      "improvement_trend": 0.12
    }
  },
  "weekly_progress": [
    {
      "week_start": "2024-01-01",
      "study_minutes": 180,
      "questions_attempted": 45,
      "accuracy": 0.78
    }
  ],
  "goal_tracking": {
    "target_score": 1400,
    "projected_score": 1320,
    "confidence_interval": [1280, 1360],
    "days_until_test": 45,
    "on_track": true
  }
}
```

### Get Performance Analytics
Detailed performance analysis by topic and difficulty.

```http
GET /api/progress/analytics
```

**Response (200):**
```json
{
  "topic_performance": {
    "algebra": {
      "mastery_level": 0.85,
      "questions_attempted": 75,
      "accuracy": 0.83,
      "average_time_per_question": 95,
      "difficulty_breakdown": {
        "easy": 0.95,
        "medium": 0.85,
        "hard": 0.70
      }
    }
  },
  "learning_patterns": {
    "peak_performance_hours": [14, 15, 16],
    "preferred_session_length": 45,
    "most_effective_assistance_type": "hint",
    "bonsai_interaction_frequency": 0.3
  },
  "predictions": {
    "score_projection": {
      "current_estimate": 1320,
      "confidence": 0.78,
      "factors": [
        "Consistent daily practice",
        "Strong algebra performance",
        "Needs improvement in statistics"
      ]
    },
    "recommended_focus_areas": [
      "Statistics and Probability",
      "Reading Comprehension Speed",
      "Writing Mechanics"
    ]
  }
}
```

## Subscription Management Endpoints

### Get Current Subscription
Retrieve user's current subscription details.

```http
GET /api/subscriptions/current
```

**Response (200):**
```json
{
  "subscription": {
    "id": "sub_123456789",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "tier": "pro",
    "status": "active",
    "current_period_start": "2024-01-01T00:00:00Z",
    "current_period_end": "2024-02-01T00:00:00Z",
    "trial_end": null,
    "cancel_at_period_end": false,
    "stripe_subscription_id": "sub_1234567890"
  },
  "usage": {
    "current_period": {
      "bonsai_interactions": 150,
      "study_minutes": 890,
      "sessions_count": 25
    },
    "limits": {
      "bonsai_interactions_limit": -1,
      "daily_interaction_limit": -1,
      "features": [
        "unlimited_hints",
        "explanations",
        "spiral_questions",
        "voice_commands",
        "priority_support"
      ]
    }
  }
}
```

### Create Subscription
Create a new subscription for the user.

```http
POST /api/subscriptions/create
```

**Request Body:**
```json
{
  "tier": "pro",
  "payment_method_id": "pm_1234567890",
  "billing_cycle": "monthly"
}
```

**Response (201):**
```json
{
  "subscription": {
    "id": "sub_123456789",
    "tier": "pro",
    "status": "active",
    "client_secret": "seti_1234567890_secret_abc123"
  },
  "next_payment_date": "2024-02-01T00:00:00Z",
  "amount": 3999
}
```

### Update Subscription
Modify existing subscription (upgrade/downgrade).

```http
PUT /api/subscriptions/{subscription_id}
```

**Request Body:**
```json
{
  "tier": "basic",
  "prorate": true
}
```

**Response (200):**
```json
{
  "subscription": {
    "id": "sub_123456789",
    "tier": "basic",
    "status": "active",
    "proration_amount": -1500
  },
  "effective_date": "2024-01-15T00:00:00Z"
}
```

### Cancel Subscription
Cancel subscription at period end.

```http
DELETE /api/subscriptions/{subscription_id}
```

**Request Body:**
```json
{
  "cancel_at_period_end": true,
  "cancellation_reason": "too_expensive"
}
```

**Response (200):**
```json
{
  "subscription": {
    "id": "sub_123456789",
    "status": "active",
    "cancel_at_period_end": true,
    "canceled_at": "2024-01-15T10:30:00Z",
    "current_period_end": "2024-02-01T00:00:00Z"
  },
  "retention_offer": {
    "discount_percentage": 50,
    "duration_months": 3,
    "offer_expires_at": "2024-01-22T10:30:00Z"
  }
}
```

## User Management Endpoints

### Get User Profile
Retrieve user profile information.

```http
GET /api/users/profile
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@example.com",
    "created_at": "2024-01-01T00:00:00Z",
    "subscription_tier": "pro",
    "target_score": 1400,
    "test_date": "2024-06-01",
    "grade_level": 11,
    "bonsai_level": 5,
    "study_streak": 7,
    "preferences": {
      "notifications_enabled": true,
      "voice_enabled": true,
      "study_reminders": true,
      "bonsai_personality": "encouraging"
    }
  }
}
```

### Update User Profile
Modify user profile settings.

```http
PUT /api/users/profile
```

**Request Body:**
```json
{
  "target_score": 1450,
  "test_date": "2024-08-01",
  "preferences": {
    "notifications_enabled": false,
    "study_reminders": true,
    "bonsai_personality": "challenging"
  }
}
```

**Response (200):**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "target_score": 1450,
    "test_date": "2024-08-01",
    "preferences": {
      "notifications_enabled": false,
      "study_reminders": true,
      "bonsai_personality": "challenging"
    },
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Delete User Account
Permanently delete user account and all associated data.

```http
DELETE /api/users/account
```

**Request Body:**
```json
{
  "confirmation": "DELETE",
  "reason": "no_longer_needed"
}
```

**Response (200):**
```json
{
  "message": "Account successfully deleted",
  "deleted_at": "2024-01-15T10:30:00Z",
  "data_retention_period_days": 30
}
```

## Admin Endpoints

### Get Platform Analytics
Retrieve system-wide analytics (Admin only).

```http
GET /api/admin/analytics
```

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "user_metrics": {
    "total_users": 15420,
    "active_users_30d": 8750,
    "new_signups_30d": 1200,
    "churn_rate_30d": 0.05
  },
  "usage_metrics": {
    "total_bonsai_interactions": 125000,
    "avg_interactions_per_user": 14.3,
    "total_study_minutes": 890000,
    "avg_session_duration": 42
  },
  "revenue_metrics": {
    "mrr": 45780,
    "arr": 549360,
    "average_revenue_per_user": 31.50,
    "ltv_to_cac_ratio": 4.2
  },
  "subscription_breakdown": {
    "free": 9200,
    "basic": 4100,
    "pro": 1950,
    "enterprise": 170
  }
}
```

### Manage Feature Flags
Control feature rollouts and A/B tests.

```http
GET /api/admin/feature-flags
PUT /api/admin/feature-flags/{flag_name}
```

**PUT Request Body:**
```json
{
  "enabled": true,
  "rollout_percentage": 25,
  "conditions": {
    "subscription_tiers": ["pro", "enterprise"],
    "user_segments": ["beta_testers"]
  }
}
```

### Update System Configuration
Modify system-wide settings like AI provider keys.

```http
PUT /api/admin/config
```

**Request Body:**
```json
{
  "openai_api_key": "sk-...",
  "gemini_api_key": "...",
  "ai_fallback_enabled": true,
  "max_daily_usage_free": 10,
  "max_daily_usage_basic": 200
}
```

## Webhook Endpoints

### Stripe Webhooks
Handle Stripe subscription events.

```http
POST /api/webhooks/stripe
```

**Headers:**
```http
Stripe-Signature: t=1640995200,v1=abc123...
```

**Handled Events:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `customer.subscription.trial_will_end`

**Response (200):**
```json
{
  "received": true,
  "event_id": "evt_1234567890"
}
```

### Supabase Webhooks
Handle database changes and real-time updates.

```http
POST /api/webhooks/supabase
```

**Request Body:**
```json
{
  "type": "UPDATE",
  "table": "users",
  "record": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "bonsai_level": 6
  },
  "old_record": {
    "bonsai_level": 5
  }
}
```

## Real-time Functionality

### WebSocket Connection
Establish real-time connection for live updates.

```javascript
// WebSocket endpoint
wss://bonsai-sat-tutor.vercel.app/api/realtime

// Connection with authentication
const ws = new WebSocket('wss://bonsai-sat-tutor.vercel.app/api/realtime', [
  'authorization', 
  `Bearer ${access_token}`
]);

// Message types
{
  "type": "bonsai_growth",
  "data": {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "old_level": 5,
    "new_level": 6,
    "experience_gained": 150
  }
}
```

## SDK Examples

### JavaScript/TypeScript SDK
```typescript
import { BonsaiClient } from '@bonsai/sdk';

const client = new BonsaiClient({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Chat with Bonsai
const response = await client.bonsai.chat({
  message: 'Help me with this algebra problem',
  context: {
    questionType: 'math',
    difficulty: 'medium'
  }
});

// Start study session
const session = await client.sessions.start({
  type: 'practice',
  targetDuration: 60
});

// Get progress
const progress = await client.progress.get();
```

### Python SDK
```python
from bonsai_sdk import BonsaiClient

client = BonsaiClient(api_key='your_api_key')

# Chat with Bonsai
response = client.bonsai.chat(
    message='Help me with this algebra problem',
    context={
        'question_type': 'math',
        'difficulty': 'medium'
    }
)

# Get user progress
progress = client.progress.get()
```

## Testing

### Test Environment
- **Base URL**: `https://bonsai-sat-tutor-test.vercel.app/api`
- **Test API Keys**: Use `test_` prefixed keys
- **Test Data**: Automatically reset daily

### Example Test Requests
```bash
# Test authentication
curl -X POST https://bonsai-sat-tutor-test.vercel.app/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test Bonsai chat
curl -X POST https://bonsai-sat-tutor-test.vercel.app/api/bonsai/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test question","context":{"question_type":"math"}}'
```

## Versioning

### API Versioning Strategy
- **Current Version**: v1
- **Version Header**: `API-Version: v1`
- **Deprecation Notice**: 6 months before removal
- **Backward Compatibility**: Maintained for 1 year

### Version-specific Endpoints
```http
# Explicit versioning
GET /api/v1/bonsai/chat
GET /api/v2/bonsai/chat

# Header-based versioning (preferred)
GET /api/bonsai/chat
API-Version: v1
```

This comprehensive API specification provides all the necessary endpoints and documentation for building and integrating with the Bonsai SAT Tutor platform. The API is designed to be scalable, secure, and developer-friendly while supporting all the core features of the AI-powered SAT preparation system.