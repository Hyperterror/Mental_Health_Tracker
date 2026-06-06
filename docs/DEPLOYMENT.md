# MindfulPrep — Deployment Guide

## Prerequisites

- GitHub repository with the monorepo code
- Supabase project (PostgreSQL database)
- Upstash account (Redis)
- Anthropic API key
- Vercel account
- Render account
- UptimeRobot account (free, for keep-alive pings)

---

## Step 1: Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose **ap-south-1 (Singapore)** region for lowest latency from India
3. Once the project is created, navigate to **Settings > Database**
4. Copy both the **Connection string (pooled)** and **Direct connection** URLs
5. In your local repo, copy and fill `.env`:
   ```bash
   DATABASE_URL=<pooled-connection-string>?pgbouncer=true
   DIRECT_DATABASE_URL=<direct-connection-string>
   ```
6. Run migrations:
   ```bash
   npm run db:migrate
   ```

---

## Step 2: Upstash Redis Setup

1. Go to [upstash.com](https://upstash.com), create a new Redis database
2. Choose **AP-SOUTHEAST-1** region
3. Copy the REST URL and REST Token
4. Add to environment variables:
   ```
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```

---

## Step 3: Backend → Render (Free Tier)

1. Go to [render.com](https://render.com) and connect your GitHub repository
2. Select **New > Web Service**
3. Configure:
   - **Root Directory**: `apps/api`
   - **Runtime**: `Node`
   - **Region**: Singapore
   - **Build Command**: `npm install && npm run db:generate && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free
4. Add all environment variables from `apps/api/.env.example`
5. Under **Health Check Path**, enter `/health`
6. Deploy!

### Cold Start Mitigation (IMPORTANT for Free Tier)

1. After deployment, copy your Render service URL (e.g., `https://mindfulprep-api.onrender.com`)
2. Go to [uptimerobot.com](https://uptimerobot.com) and create a free account
3. Create a new monitor:
   - **Monitor Type**: HTTP(s)
   - **URL**: `https://your-render-url.onrender.com/health`
   - **Monitoring Interval**: 5 minutes
4. This keeps your Render instance warm

---

## Step 4: Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repository
2. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `apps/web`
3. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = Your Render backend URL
   - `NEXT_PUBLIC_APP_URL` = Your Vercel deployment URL (from Vercel dashboard)
4. Deploy!

---

## Step 5: Update CORS on Backend

After Vercel deployment, update your Render environment variable:
```
FRONTEND_URL=https://your-app.vercel.app
```
Then redeploy the Render service.

---

## Step 6: Verify Deployment

```bash
# Test backend health
curl https://your-render-url.onrender.com/health

# Expected response:
# { "success": true, "data": { "status": "ok", "timestamp": "...", "uptime": ... } }
```

---

## Environment Variable Reference

### Backend (Render)

| Variable | Source | Description |
|---|---|---|
| `DATABASE_URL` | Supabase Dashboard | Pooled connection (pgbouncer) |
| `DIRECT_DATABASE_URL` | Supabase Dashboard | Direct connection (for migrations) |
| `JWT_ACCESS_SECRET` | Generate: `openssl rand -hex 64` | Access token secret |
| `JWT_REFRESH_SECRET` | Generate: `openssl rand -hex 64` | Refresh token secret |
| `UPSTASH_REDIS_REST_URL` | Upstash Dashboard | Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Dashboard | Redis REST Token |
| `GEMINI_API_KEY` | Google AI Studio Console | Gemini API key |
| `FRONTEND_URL` | Vercel Dashboard | Your Vercel URL (for CORS) |

### Frontend (Vercel)

| Variable | Source | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Render Dashboard | Your Render service URL |
| `NEXT_PUBLIC_APP_URL` | Vercel Dashboard | Your Vercel URL |
