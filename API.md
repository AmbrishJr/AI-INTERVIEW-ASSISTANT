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
