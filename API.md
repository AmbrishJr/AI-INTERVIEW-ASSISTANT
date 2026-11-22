# Backend API Documentation

## Base URL
`http://localhost:3000`

## Authentication Endpoints

### Register User
- **POST** `/api/register`
- **Body**: 
  ```json
  {
    "username": "string",
    "password": "string (min 6 characters)"
  }
  ```
- **Response**: 
  ```json
  {
    "user": {
      "id": "string",
      "username": "string"
    }
  }
  ```

### Login User
- **POST** `/api/login`
- **Body**: 
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```
- **Response**: 
  ```json
  {
    "user": {
      "id": "string",
      "username": "string"
    }
  }
  ```
- **Sets session cookie**

### Logout User
- **POST** `/api/logout`
- **Response**: 
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

### Get Current User
- **GET** `/api/me`
- **Requires**: Authentication
- **Response**: 
  ```json
  {
    "user": {
      "id": "string",
      "username": "string"
    }
  }
  ```

### Protected Route Example
- **GET** `/api/protected`
- **Requires**: Authentication
- **Response**: 
  ```json
  {
    "message": "This is a protected route",
    "user": {
      "id": "string",
      "username": "string"
    }
  }
  ```

## Features Implemented

✅ **Database Integration**: PostgreSQL with Drizzle ORM
✅ **Authentication**: Passport.js with local strategy
✅ **Password Security**: bcrypt hashing
✅ **Session Management**: Express sessions with memory store
✅ **Input Validation**: Zod schemas
✅ **Error Handling**: Comprehensive error responses
✅ **Type Safety**: TypeScript throughout

## Security Features

- Password hashing with bcrypt (salt rounds: 10)
- Session-based authentication
- Input validation and sanitization
- CORS ready (configure as needed)
- Secure cookie settings in production

## Database Schema

```sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);
```

## Usage Examples

### Register a new user:
```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"password123"}'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"password123"}' \
  -c cookies.txt
```

### Access protected route:
```bash
curl -X GET http://localhost:3000/api/me \
  -b cookies.txt
```

## Interview and discovery APIs

All requests use the same origin as the frontend. JSON bodies are limited to 128 KB. User responses expose only `id` and `username`. Logout destroys the server session and expires the cookie. Cookies are HTTP-only, SameSite=Lax, and secure in production.

| Endpoint | Contract |
| --- | --- |
| `POST /api/chat` | `{ message: string }`, 1–8,000 characters. Returns `{ response }`. Missing AI configuration returns 503. |
| `GET /api/news` | Optional category/search/source/sortBy. `limit` is an integer 1–100 (default 20); `offset` is 0–10,000. Returns `{ news, total, hasMore, source }`, where source is `live` or `unavailable`. Trending uses source scores with publication date as a tie-breaker. |
| `POST /api/news/summarize` | `{ content: string }`, 1–20,000 characters. Returns the existing summary fields; fallback results include `source: "fallback"`. |
| `POST /api/analytics/insights` | Requires login. `{ data: object or array, type: "general" | "trend" | "anomaly" | "recommendation", timeframe?: string }`. Returns validated `insights`; invalid AI output returns 502. |
| `POST /api/analytics/explain` | Requires login. `{ chartType: string, data: object or array, question?: string }`. Returns a validated `explanation` and optional `nextSteps`. |
| `POST /api/ai/insights` | Existing general insight endpoint; fallbacks include `source: "fallback"`. |
| `GET /api/product/pulse` | `{ kpis: null, insights: [], source: "unavailable", lastUpdated: null }` until product telemetry is connected. |

Registration trims usernames (1–80 characters) and requires passwords of at least 6 characters and at most 72 UTF-8 bytes. Passwords are never trimmed. Registration does not sign in automatically at the API layer; the frontend follows it with login.

Session summaries, notes, goals, and bookmarks remain client-local; no server persistence endpoints were introduced for them. Clients must not interpret absent measurements as zero or treat fallback content as personalized analysis.
