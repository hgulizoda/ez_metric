# Phase 3A: Shift Management

## Overview
Admin can create, view, edit, and delete shifts. Managers can view shifts. Each shift has a name, start/end time, and status. Workers can be assigned to shifts via worker_shifts (covered in 3B alongside clock records).

## Dependencies
- Phase 2 (Worker Management) must be complete

## User Stories
- As an admin, I can create a new shift with a name, start time, and end time
- As an admin, I can edit or delete an existing shift
- As an admin or manager, I can view the list of all shifts
- As an admin or manager, I can view a single shift's details

## API Endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/shifts` | List all shifts (with optional status filter) | admin, manager |
| GET | `/api/shifts/:id` | Get single shift (with assigned workers) | admin, manager |
| POST | `/api/shifts` | Create a new shift | admin |
| PUT | `/api/shifts/:id` | Update a shift | admin |
| DELETE | `/api/shifts/:id` | Delete a shift | admin |

### GET `/api/shifts`
**Query params:**
- `status` (optional) — filter by shift status: `active`, `completed`, `missed`

**Success response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Morning Shift",
      "start_time": "2026-03-23T06:00:00.000Z",
      "end_time": "2026-03-23T14:00:00.000Z",
      "status": "active",
      "created_at": "2026-03-23T00:00:00.000Z"
    }
  ],
  "error": null
}
```

### GET `/api/shifts/:id`
**Success response:** Single shift object with `worker_shifts` included (workers assigned to this shift).
**Error (404):** `"Shift not found"`

### POST `/api/shifts`
**Request body:**
```json
{
  "name": "Morning Shift",
  "start_time": "2026-03-23T06:00:00.000Z",
  "end_time": "2026-03-23T14:00:00.000Z"
}
```
- `name`, `start_time`, `end_time` are required
- `start_time` must be before `end_time`

**Success (201):** Returns the created shift.
**Error (400):** `"name, start_time, and end_time are required"` or `"start_time must be before end_time"`

### PUT `/api/shifts/:id`
**Request body:** Same as POST (all fields optional).
**Success:** Returns updated shift.
**Error (404):** `"Shift not found"`

### DELETE `/api/shifts/:id`
**Success:** `{ "success": true, "data": null, "error": null }`
**Error (404):** `"Shift not found"`

## Database Tables
Already defined in Prisma schema:
```
shifts
├── id (PK)
├── name
├── start_time (DateTime)
├── end_time (DateTime)
├── status (enum: active, completed, missed) — default: active
└── created_at

worker_shifts
├── id (PK)
├── worker_id (FK -> workers)
├── shift_id (FK -> shifts)
├── date (Date)
└── status (enum: scheduled, completed, missed, late) — default: scheduled
```

## Business Rules
- Only admin can create, update, or delete shifts
- Deleting a shift cascades to its worker_shifts and clock_records
- start_time must be before end_time
- Default shift status is `active`

## Backend Deliverables
- [ ] Shift service (CRUD)
- [ ] Shift controller (thin handlers)
- [ ] Shift routes with auth + role middleware
- [ ] Register routes in app.ts

## Out of Scope
- Worker assignment UI (frontend phase)
- Clock in/out logic (Phase 3B)
- Shift scheduling/recurring shifts
