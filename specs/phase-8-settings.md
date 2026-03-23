# Phase 8: Settings (Backend Only)

## Overview
Manager account management (admin creates/edits/deletes manager accounts). Grace period rules CRUD is already built.

## Dependencies
- Phase 1 (Auth) must be complete

## API Endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/managers` | List all manager accounts | admin |
| POST | `/api/managers` | Create manager account | admin |
| PUT | `/api/managers/:id` | Update manager account | admin |
| DELETE | `/api/managers/:id` | Delete manager account | admin |

### GET `/api/managers`
Returns all users with role=manager.

### POST `/api/managers`
**Request body:**
```json
{
  "username": "manager3",
  "password": "securepass123"
}
```
- `username` and `password` required
- Creates user with role=manager
- Hashes password with bcrypt

**Error (400):** `"Username already exists"`

### PUT `/api/managers/:id`
**Request body:**
```json
{
  "username": "new_name",
  "password": "new_password"
}
```
- Both optional — only provided fields update
- If password provided, hash it
- Cannot change role

**Error (404):** `"Manager not found"`

### DELETE `/api/managers/:id`
- Only deletes users with role=manager (cannot delete admin)

**Error (404):** `"Manager not found"`
**Error (400):** `"Cannot delete admin accounts"`

## Business Rules
- Only admin can manage manager accounts
- Admin accounts cannot be deleted or modified through this endpoint
- Passwords are hashed with bcrypt (salt rounds = 10)
- Username must be unique

## Already Done
- Grace period rules CRUD (`/api/grace-period-rules`) — built in Phase 3B

## Backend Deliverables
- [ ] Manager service (CRUD for manager users)
- [ ] Manager controller
- [ ] Manager routes with auth + admin-only middleware
- [ ] Register routes in app.ts
- [ ] Enhanced seed data with realistic demo records
