# AICoach — AI Interview Assistant

AICoach is a full-stack web app for practicing job interviews. It runs mock interview sessions with live, in-browser feedback on your camera presence and speaking habits, and includes an AI coach chatbot, performance analytics, and tech news and job listings.

## Features

- **Mock interview sessions**: pick a domain and difficulty, answer timed questions, take notes, and review notes from saved sessions, and replay measurements immediately after a session.
- **Live coaching**: real-time tips while you answer.
  - **Face and framing detection**: MediaPipe BlazeFace runs entirely in the browser and checks whether you're visible, centered, and looking at the camera.
  - **Speech analysis**: the Web Speech API transcribes your answers and tracks speaking pace (WPM), filler words, and silences.
- **AI Coach chatbot**: interview-prep assistant powered by Groq (`openai/gpt-oss-20b` by default).
- **Analytics dashboard**: charts of session performance, plus AI-generated insights and explanations.
- **Tech news**: aggregated from Hacker News and Reddit, with AI summaries.
- **Jobs and projects**: clearly labeled sample job listings, market trends, project ideas, and research papers.
- **Authentication**: real username/password registration and login with server sessions (Passport + bcrypt).
- **Appearance**: choose Light, Dark, or System from the sun/moon menu. The preference is saved in this browser, shared across tabs, and applied before the app loads. System mode follows changes to your device theme.
- **Local account data**: summaries, notes, goals, bookmarks, and display names are stored in this browser, separately for each account. Legacy unscoped data can be explicitly imported once.

## Tech Stack

| Layer    | Technologies |
| -------- | ------------ |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Radix UI, Framer Motion, Recharts, TanStack Query, Wouter |
| Backend  | Node.js, Express, Passport (local strategy), express-session |
| AI / ML  | Groq SDK, MediaPipe Tasks Vision, Web Speech API |
| Database | PostgreSQL with Drizzle ORM (optional; falls back to in-memory storage) |

## Project Structure

```
├── client/                 # React frontend (Vite root)
│   ├── public/             # Static assets, incl. the BlazeFace model
│   └── src/
│       ├── components/     # Feature-based components (interview, dashboard, analytics, ...)
│       │   └── ui/         # Shared UI primitives (shadcn-style)
│       ├── contexts/       # Auth and theme contexts
│       ├── data/           # Question banks and static content
│       ├── hooks/          # Face detection, speech analysis, live coaching, session recording
│       ├── lib/            # Utilities and query client
│       └── pages/          # Route-level pages
├── server/                 # Express backend
│   ├── index.ts            # Entry point
│   ├── routes.ts           # API routes and auth setup
│   ├── ai-config.ts        # Groq model settings
│   └── services/           # AI insights, news aggregation, caching
├── shared/schema.ts        # Drizzle schema and Zod types shared by client and server
└── script/build.ts         # Production build script
```

## Getting Started

### Prerequisites

- Node.js 20+
- npm
- A [Groq API key](https://console.groq.com/keys) for the AI features
- PostgreSQL (optional)

### Installation

```bash
git clone https://github.com/AmbrishJr/AI-INTERVIEW-ASSISTANT.git
cd AI-INTERVIEW-ASSISTANT
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
# Required for the AI coach, insights, and news summaries
GROQ_API_KEY=your_groq_api_key

# Optional
GROQ_MODEL=openai/gpt-oss-20b
DATABASE_URL=postgresql://user:password@localhost:5432/aicoach
SESSION_SECRET=a_long_random_string
PORT=3000
```

| Variable         | Required | Description |
| ---------------- | -------- | ----------- |
| `GROQ_API_KEY`   | Yes, for AI features | Groq API key. Without it, AI requests return a configuration error and the UI offers clearly labeled general guidance. |
| `GROQ_MODEL`     | No | Groq model ID. Defaults to `openai/gpt-oss-20b`. |
| `DATABASE_URL`   | No | PostgreSQL connection string. If unset, users are kept in memory and lost on restart. |
| `SESSION_SECRET` | Production | Required when `NODE_ENV=production`. Development generates a temporary secret if unset. |
| `PORT`           | No | Server port. Defaults to `3000`. |

> Never commit your `.env` file. It is already listed in `.gitignore`.

With a single trusted reverse proxy terminating HTTPS, set `TRUST_PROXY=1` so secure production session cookies work. Do not enable it for an untrusted proxy chain.

### Database Setup (optional)

If you set `DATABASE_URL`, create the tables with:

```bash
npm run db:push
```

### Run in Development

```bash
npm run dev
```

Create an account using the sign-in screen; there are no built-in demo credentials.

This starts the Express server with Vite middleware, so the API and the frontend are both served at **http://localhost:3000**.

> Camera and microphone features need a browser that supports MediaPipe and the Web Speech API (Chrome or Edge recommended). Allow camera and microphone access when prompted.

## Scripts

| Command            | Description |
| ------------------ | ----------- |
| `npm run dev`      | Start the development server (API + frontend) |
| `npm run dev:client` | Run only the Vite frontend on port 5000 |
| `npm run build`    | Build the client and server into `dist/` |
| `npm start`        | Run the production build |
| `npm run check`    | Type-check with TypeScript |
| `npm run db:push`  | Push the Drizzle schema to PostgreSQL |

## Production Build

```bash
npm run build
npm start
```

The build writes the frontend to `dist/public` and bundles the server to `dist/index.cjs`, which serves both.

## API Overview

| Method | Endpoint                  | Description |
| ------ | ------------------------- | ----------- |
| POST   | `/api/register`           | Create an account |
| POST   | `/api/login`              | Log in (sets a session cookie) |
| POST   | `/api/logout`             | Log out |
| GET    | `/api/me`                 | Get the current user |
| POST   | `/api/chat`               | Send a message to the AI coach |
| GET    | `/api/news`               | Get aggregated tech news |
| POST   | `/api/news/summarize`     | Summarize an article with AI |
| POST   | `/api/analytics/insights` | Generate AI insights from session data |
| POST   | `/api/analytics/explain`  | Explain a metric with AI |
| POST   | `/api/ai/insights`        | General AI insights |
| GET    | `/api/product/pulse`      | Product pulse data |

See [API.md](API.md) for request and response details and [AI_COACH_SETUP.md](AI_COACH_SETUP.md) for the AI coach setup.

## Design and data behavior

The interface uses a shared light theme, labeled navigation, responsive layouts, and accessible Radix controls. The primary flow is guided practice, session review, then measured progress.

Dashboard and analytics use the latest 10 session summaries retained in the browser. Missing measurements are shown as unmeasured; older records without completion status remain unknown. Camera-facing percentage is an estimate, not an attention or interview-quality score. AI insights are requested explicitly and exclude notes. MediaPipe camera analysis runs locally; browser speech recognition may use the browser provider’s service. Replays contain measurements and text, not recorded audio/video, and are available immediately after ending a session.

OAuth, password changes/recovery, account deletion, notifications, feedback submission, and newsletters are visibly unavailable until their backends are connected. Jobs/projects are sample catalogs; offline news is explicitly illustrative. Product-wide usage statistics and behavior tracking are not collected.

## Verification

```bash
npm run check
npm run test
npm run build
npm run test:e2e
```

Browser tests use Playwright and an isolated server on port 3100, with in-memory accounts and AI credentials disabled. Install a Playwright Chromium browser with `npx playwright install chromium`, or set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to an existing Chrome binary. Tests cover registration/session restoration, interview pause/resume and navigation guards, exports, bookmarks, service failures, and all routes at 320, 768, and 1440 pixels. Camera permission denial is simulated; live devices and paid AI calls are not exercised by these tests.

Production readiness remains separate: sessions are held in memory, browser-local history does not sync, and external AI endpoints need deployment-specific abuse controls. Compatible dependency security updates were applied; remaining audit findings requiring major Zod/Drizzle changes need a separate migration.

## Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/my-feature`.
3. Commit your changes and run `npm run check`.
4. Open a pull request.

## License

MIT
