# MindfulPrep

> AI-powered student mental wellness companion for competitive exam preparation in India (JEE, NEET, UPSC, CAT, GATE, CUET, Boards)

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![Fastify](https://img.shields.io/badge/Fastify-5-green)](https://fastify.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://typescriptlang.org)
[![Prisma](https://img.shields.io/badge/Prisma-5-purple)](https://prisma.io)

---

## Architecture

```
MindfulPrep (Turborepo Monorepo)
├── apps/
│   ├── web/          → Next.js 14 (Vercel)
│   └── api/          → Fastify + Node.js (Render Free)
├── packages/
│   ├── shared/       → Zod schemas, TypeScript types, enums
│   ├── ai/           → Claude prompt templates & response parsers
│   └── ui/           → Shared Tailwind preset
└── prisma/           → Shared database schema
```

## Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- PostgreSQL (via Supabase)
- Upstash Redis account
- Anthropic API key

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
# Backend
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your values

# Frontend
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local with your values
```

### 3. Setup Database
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (dev)
npm run db:push

# Or run migrations
npm run db:migrate
```

### 4. Start Development Servers
```bash
npm run dev
# Frontend → http://localhost:3000
# Backend  → http://localhost:3001
```

---

## Environment Variables

### Backend (`apps/api/.env`)

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | Supabase pooled connection URL | ✅ |
| `DIRECT_DATABASE_URL` | Supabase direct connection URL (migrations) | ✅ |
| `JWT_ACCESS_SECRET` | JWT signing secret (min 32 chars) | ✅ |
| `JWT_REFRESH_SECRET` | JWT refresh signing secret (min 32 chars) | ✅ |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL | ✅ |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token | ✅ |
| `GEMINI_API_KEY` | Gemini API key | ✅ |
| `FRONTEND_URL` | Vercel frontend URL for CORS | ✅ |

### Frontend (`apps/web/.env.local`)

| Variable | Description | Required |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend Render URL | ✅ |
| `NEXT_PUBLIC_APP_URL` | Frontend Vercel URL | ✅ |

---

## Deployment

### Backend → Render (Free Tier)

1. Connect your GitHub repo to Render
2. Create a new **Web Service**
3. Root directory: `apps/api`
4. Build command: `npm install && npm run db:generate && npm run build`
5. Start command: `npm start`
6. Add all environment variables from `.env.example`
7. Set Health Check path: `/health`

> **Cold Start Mitigation**: Configure UptimeRobot to ping your Render URL every 12 minutes to prevent sleep.

### Frontend → Vercel

1. Import your GitHub repo on Vercel
2. Framework preset: **Next.js**
3. Root directory: `apps/web`
4. Add environment variables from `.env.example`
5. Deploy!

---

## API Reference

Base URL: `https://your-render-app.onrender.com/api/v1`

All protected endpoints require: `Authorization: Bearer <accessToken>`

### Auth
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | ❌ | Register new student |
| POST | `/auth/login` | ❌ | Login and get tokens |
| POST | `/auth/refresh` | ❌ | Refresh access token |
| POST | `/auth/logout` | ✅ | Logout and clear session |

### Mood
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/mood` | ✅ | Log a mood check-in |
| GET | `/mood/history` | ✅ | Paginated mood history |
| GET | `/mood/patterns` | ✅ | Stress pattern analysis |

### Study Sessions
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/session/start` | ✅ | Start a Pomodoro session |
| POST | `/session/heartbeat` | ✅ | Send 60s heartbeat |
| POST | `/session/end` | ✅ | End session + compute score |
| GET | `/session/history` | ✅ | Session history |
| POST | `/session/:id/fatigue-event` | ✅ | Log camera fatigue signal |

### Wellness
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/wellness/suggest` | ✅ | Get personalized suggestion |
| POST | `/wellness/:id/act` | ✅ | Mark suggestion as acted |
| POST | `/wellness/:id/dismiss` | ✅ | Dismiss suggestion |

### Dashboard
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/dashboard/metrics` | ✅ | Full dashboard data |

### Gamification
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/gamification/profile` | ✅ | Gamification state |
| POST | `/gamification/streak-freeze` | ✅ | Use streak freeze token |

---

## Privacy & Compliance

- **Camera data**: Processed 100% on-device using face-api.js. No video or image data is ever transmitted to any server.
- **Journal entries**: AES-256 encrypted at rest.
- **DPDP Act 2023**: Right to erasure via one-click account deletion.
- **Minors**: Parental consent flow for users under 18.

---

## Tech Stack

| Layer | Technology |
- **Frontend**: Next.js 14 App Router, Tailwind CSS, shadcn/ui, Zustand, React Query
- **Backend**: Fastify, Prisma (PostgreSQL), Upstash Redis, Google Gemini 2.0
- **Testing**: Vitest, React Testing Library
- **Monorepo**: Turborepo
- **Deployment**: Vercel (Frontend), Render Free Tier (Backend)
