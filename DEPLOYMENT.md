# Bonsai SAT Tutor - Deployment Guide

## Vercel Deployment Setup

### Step 1: Set Up Environment Variables in Vercel

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your `bonsaiprepagent` project
3. Go to **Settings** → **Environment Variables**
4. Add the following environment variables:

#### Required Environment Variables

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://abcdefgh.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJ0eXAiOiJKV1QiLCJhbGc...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (keep secret) | `eyJ0eXAiOiJKV1QiLCJhbGc...` |
| `NEXTAUTH_SECRET` | NextAuth.js secret key | `your-secret-key-here` |
| `NEXTAUTH_URL` | Your deployment URL | `https://your-app.vercel.app` |

#### Optional Environment Variables (for full functionality)

| Variable Name | Description | Example Value |
|---------------|-------------|---------------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-proj-abc123...` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments | `sk_test_abc123...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_abc123...` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_abc123...` |

### Step 2: Get Your Supabase Credentials

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Create a new project or select existing project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → Use as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → Use as `SUPABASE_SERVICE_ROLE_KEY`

### Step 3: Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Use the output as your `NEXTAUTH_SECRET`

### Step 4: Quick Deployment (Minimal Setup)

For a quick deployment without full features, you only need these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=https://your-app.vercel.app
```

### Step 5: Deploy

After setting the environment variables:

1. Go to your Vercel project dashboard
2. Click **Deployments**
3. Click **Redeploy** on the latest deployment
4. Or push a new commit to trigger automatic deployment

## Environment Variables Setup Instructions

### For Development (.env.local)

Create a `.env.local` file in your project root:

```bash
cp .env.example .env.local
```

Fill in your actual values in `.env.local`.

### For Production (Vercel Dashboard)

1. **Vercel Dashboard Method:**
   - Go to Project Settings → Environment Variables
   - Add each variable with appropriate environment (Production, Preview, Development)

2. **Vercel CLI Method:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   ```

## Troubleshooting

### Common Issues

1. **"Secret does not exist" Error:**
   - Remove the `env` section from `vercel.json` (already done)
   - Set environment variables directly in Vercel dashboard

2. **Build Errors:**
   - Check that all required environment variables are set
   - Ensure TypeScript compilation passes locally

3. **Runtime Errors:**
   - Check Vercel function logs
   - Verify database connection and API keys

### Verification Steps

1. Check deployment logs in Vercel dashboard
2. Test API endpoints: `/api/health`
3. Verify database connection
4. Test authentication flow

## Database Setup (Supabase)

1. Create a new Supabase project
2. Run the database migrations:
   ```bash
   supabase link --project-ref your-project-id
   supabase db push
   ```
3. Set up Row Level Security (RLS) policies
4. Configure authentication providers if needed

## Quick Start Commands

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
vercel --prod
```

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify all environment variables are set correctly
3. Test locally with the same environment variables
4. Check Supabase project status and configuration

---

**Note:** This deployment guide assumes you have a Vercel account and a Supabase project. For first-time setup, create accounts at both services first.