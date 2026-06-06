# API Reference

The MindfulPrep API is built on Fastify and uses JSON Web Tokens (JWT) for authentication. All protected endpoints expect an `Authorization: Bearer <token>` header.

## Base URL
Production: `https://api.mindfulprep.com/api/v1`
Local: `http://localhost:3001/api/v1`

## Rate Limits
- **Global**: 100 requests / 15 minutes per IP
- **Auth (Login)**: 5 requests / 15 minutes per IP
- **Auth (Register)**: 3 requests / 1 hour per IP
- **Mood**: 30 requests / 1 hour per IP
- **Session**: 10 requests / 1 hour per IP

## Endpoints

### Authentication
- `POST /auth/register` - Create a new user account
- `POST /auth/login` - Authenticate and receive JWT tokens
- `POST /auth/refresh` - Issue new access token using refresh token
- `POST /auth/logout` - Invalidate refresh token (Requires Auth)

### Mood Tracking
- `POST /mood` - Log a new mood entry (Requires Auth)
- `GET /mood/history` - Retrieve paginated mood history (Requires Auth)
- `GET /mood/patterns` - Retrieve AI-analyzed mood patterns (Requires Auth)

### Pomodoro & Study Sessions
- `POST /session/start` - Start a new study session (Requires Auth)
- `POST /session/heartbeat` - Send session heartbeat every 60s (Requires Auth)
- `POST /session/end` - Finalize session and calculate wellness score (Requires Auth)
- `GET /session/history` - Retrieve paginated session history (Requires Auth)
- `POST /session/:sessionId/fatigue-event` - Record an on-device camera fatigue event (Requires Auth)

### Wellness Suggestions
- `GET /wellness/suggest` - Get a personalized Gemini 2.0 / Rule-based suggestion (Requires Auth)
- `POST /wellness/:id/act` - Mark a suggestion as acted upon for points (Requires Auth)
- `POST /wellness/:id/dismiss` - Dismiss a suggestion (Requires Auth)

### Gamification & Profile
- `GET /gamification/profile` - Get points, streak, and badges (Requires Auth)
- `POST /gamification/streak-freeze` - Consume a streak freeze (Requires Auth)
- `GET /dashboard/metrics` - Aggregated dashboard metrics (Requires Auth)
- `GET /user/profile` - Get user profile (Requires Auth)
- `PATCH /user/profile` - Update user profile (Requires Auth)
- `DELETE /user` - Delete account and all data (Requires Auth)
