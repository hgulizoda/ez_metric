# Phase 1: Authentication

## Overview
Admin and Manager can log in with username + password, receive a JWT, and access protected routes based on their role.

## User Stories
- As an admin, I can log in and access all features
- As a manager, I can log in and access view-only features
- As an unauthenticated user, I am rejected from protected endpoints

## API Endpoints

| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/login` | Login with username + password, returns JWT + user info | No |
| GET | `/api/auth/me` | Get current authenticated user info | Yes |

### POST `/api/auth/login`
**Request:**
```json
{ "username": "admin", "password": "password123" }
```
**Success response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt-string",
    "user": { "id": 1, "username": "admin", "role": "admin" }
  },
  "error": null
}
```
**Error response (401):**
```json
{ "success": false, "data": null, "error": "Invalid username or password" }
```

### GET `/api/auth/me`
**Headers:** `Authorization: Bearer <token>`
**Success:** returns `{ id, username, role }`
**Error (401):** `"No token provided"` or `"Invalid token"`

## Database
Uses existing `users` table from Phase 0 schema.

## Middleware
- **`authenticate`** — verifies JWT from `Authorization: Bearer` header, attaches `req.user`
- **`authorize(...roles)`** — checks `req.user.role` against allowed roles, returns 403 if not permitted

## Seed Data
| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | admin |
| manager1 | manager123 | manager |
| manager2 | manager123 | manager |

Passwords stored as bcrypt hashes.

## Dependencies
- `bcrypt` for password hashing
- `jsonwebtoken` for JWT sign/verify

## Out of Scope
- Frontend login page (separate task)
- Password reset / change password
- Refresh tokens
