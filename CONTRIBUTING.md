# Contributing to MindfulPrep

Thank you for your interest in contributing to MindfulPrep! As an open-source mental wellness companion, we welcome contributions that improve the lives of students.

## Tech Stack
- **Frontend**: Next.js 14 App Router, Tailwind CSS, shadcn/ui, Zustand, React Query
- **Backend**: Fastify, Prisma (PostgreSQL), Upstash Redis, Google Gemini 2.0 SDK
- **Monorepo**: Turborepo

## Local Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in the required keys (Database URL, Redis URL, Gemini API Key)
4. Push Prisma schema: `npm run db:push`
5. Start development server: `npm run dev`

## Development Guidelines
- **Type Safety**: Ensure strict TypeScript typings. Do not use `any`.
- **Security**: Be mindful of PII (Personally Identifiable Information). Never expose JWT tokens to localStorage. Ensure Face-API models are executed strictly client-side.
- **Testing**: We use Vitest and React Testing Library. Ensure your changes are covered by tests (`npm run test`).
- **Formatting**: We use Prettier and ESLint. Run `npm run lint` before committing.

## Pull Request Process
1. Fork the repo and create your branch from `main`.
2. Write tests for any new functionality.
3. Update documentation if necessary (`docs/API.md`).
4. Ensure the test suite passes.
5. Open a PR with a clear description of the problem and the solution.
