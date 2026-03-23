# Phase 2: Worker Management

## Overview
Admin can create, view, edit, and delete workers. Manager can only view the worker list and details. This is the foundation for all future phases (shifts, clock records, salary, etc.).

## Dependencies
- Phase 1 (Authentication) must be complete

## API Endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/workers` | List all workers (with search/filter) | admin, manager |
| GET | `/api/workers/:id` | Get single worker details | admin, manager |
| POST | `/api/workers` | Create a new worker | admin |
| PUT | `/api/workers/:id` | Update a worker | admin |
| DELETE | `/api/workers/:id` | Delete a worker | admin |

### GET `/api/workers`
**Query params:**
- `search` (optional) — filters by name or base_id (partial match)
- `position` (optional) — filters by exact position
- `salary_type` (optional) — filters by salary type (hourly | percentage | flat)

**Success response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "base_id": "W001",
      "name": "John Doe",
      "picture_url": null,
      "resume_url": null,
      "salary_type": "hourly",
      "position": "Driver",
      "language": "English",
      "created_at": "2026-03-23T00:00:00.000Z",
      "updated_at": "2026-03-23T00:00:00.000Z"
    }
  ],
  "error": null
}
```

### GET `/api/workers/:id`
**Success response:** Same shape as a single item from the list.
**Error (404):** `"Worker not found"`

### POST `/api/workers`
**Request body:**
```json
{
  "base_id": "W001",
  "name": "John Doe",
  "salary_type": "hourly",
  "position": "Driver",
  "language": "English",
  "picture_url": null,
  "resume_url": null
}
```
- `base_id`, `name`, `salary_type`, `position`, `language` are required
- `picture_url`, `resume_url` are optional

**Success (201):** Returns the created worker.
**Error (400):** `"base_id already exists"` if duplicate.

### PUT `/api/workers/:id`
**Request body:** Same as POST (all fields optional, only provided fields update).
**Success:** Returns updated worker.
**Error (404):** `"Worker not found"`

### DELETE `/api/workers/:id`
**Success:** `{ "success": true, "data": null, "error": null }`
**Error (404):** `"Worker not found"`

## Frontend Pages

| Route | Component | Auth | Roles |
|-------|-----------|------|-------|
| `/workers` | WorkersPage | Yes | admin, manager |
| `/workers/new` | WorkerFormPage | Yes | admin |
| `/workers/:id` | WorkerDetailPage | Yes | admin, manager |
| `/workers/:id/edit` | WorkerFormPage | Yes | admin |

### Workers List Page (`/workers`)
- Table with columns: Base ID, Name, Position, Salary Type, Language
- Search bar (filters by name or base_id)
- "Add Worker" button (admin only, hidden for managers)
- Click row to go to worker detail
- Responsive: table on desktop, cards on mobile

### Worker Detail Page (`/workers/:id`)
- Shows all worker fields
- "Edit" and "Delete" buttons (admin only)
- Delete shows confirmation dialog
- Back link to worker list

### Worker Form Page (`/workers/new` and `/workers/:id/edit`)
- Shared form component for create and edit
- Fields: base_id, name, position, salary_type (dropdown), language
- Validation: all required fields must be filled
- On success: redirect to worker list
- On error: show inline error message

## Seed Data
Add sample workers to the seed script:

| base_id | name | salary_type | position | language |
|---------|------|-------------|----------|----------|
| W001 | Alex Johnson | hourly | Driver | English |
| W002 | Maria Garcia | hourly | Driver | Spanish |
| W003 | James Wilson | percentage | Loader | English |
| W004 | Fatima Al-Rashid | flat | Dispatcher | Arabic |
| W005 | Chen Wei | hourly | Driver | Chinese |

## Out of Scope
- File upload for picture/resume (future phase)
- Pagination (not needed for 20-50 workers)
- Worker salary rules management (separate phase)
- Worker shift assignment (separate phase)
