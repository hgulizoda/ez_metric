# Phase 3B: Clock In/Out Management

## Overview
Workers clock in and out of shifts. The system stores timestamps, handles invalid entries (double clock-in, missed clock-out), and applies grace period rules. Admin can manually edit clock records with notes.

## Dependencies
- Phase 3A (Shift Management) must be complete

## User Stories
- As an admin or manager, I can clock a worker in to a shift
- As an admin or manager, I can clock a worker out of a shift
- As an admin or manager, I can view clock records filtered by worker and/or date range
- As an admin, I can manually edit a clock record with a required note
- As an admin, I can manage grace period rules (CRUD)

## API Endpoints

### Clock Operations

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| POST | `/api/clock/in` | Clock a worker in | admin, manager |
| POST | `/api/clock/out` | Clock a worker out | admin, manager |
| GET | `/api/clock/records` | List clock records (with filters) | admin, manager |
| PUT | `/api/clock/records/:id` | Manual edit with note | admin |

### Grace Period Rules

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/grace-period-rules` | List all rules | admin |
| POST | `/api/grace-period-rules` | Create a rule | admin |
| PUT | `/api/grace-period-rules/:id` | Update a rule | admin |
| DELETE | `/api/grace-period-rules/:id` | Delete a rule | admin |

---

### POST `/api/clock/in`
**Request body:**
```json
{
  "worker_id": 1,
  "shift_id": 1
}
```
**Success (201):** Returns created clock record.
**Error (400):**
- `"worker_id and shift_id are required"`
- `"Worker already clocked in to this shift"` (if open record exists — no clock_out)

### POST `/api/clock/out`
**Request body:**
```json
{
  "worker_id": 1,
  "shift_id": 1
}
```
**Success:** Returns updated clock record with clock_out set.
**Error (400):**
- `"worker_id and shift_id are required"`
- `"No active clock-in found for this worker and shift"`

### GET `/api/clock/records`
**Query params:**
- `worker_id` (optional) — filter by worker
- `shift_id` (optional) — filter by shift
- `from` (optional) — filter records from this date (inclusive)
- `to` (optional) — filter records to this date (inclusive)

**Success response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "worker_id": 1,
      "shift_id": 1,
      "clock_in": "2026-03-23T06:02:00.000Z",
      "clock_out": "2026-03-23T14:01:00.000Z",
      "is_manual_edit": false,
      "edit_note": null,
      "grace_period_applied": true,
      "created_at": "2026-03-23T06:02:00.000Z",
      "worker": { "id": 1, "name": "Alex Johnson", "base_id": "W001" },
      "shift": { "id": 1, "name": "Morning Shift" }
    }
  ],
  "error": null
}
```

### PUT `/api/clock/records/:id`
**Request body:**
```json
{
  "clock_in": "2026-03-23T06:00:00.000Z",
  "clock_out": "2026-03-23T14:00:00.000Z",
  "edit_note": "Corrected missed clock-out"
}
```
- `edit_note` is required for manual edits
- Sets `is_manual_edit` to `true` automatically

**Success:** Returns updated record.
**Error (400):** `"edit_note is required for manual edits"`
**Error (404):** `"Clock record not found"`

---

### Grace Period Rules CRUD

### GET `/api/grace-period-rules`
**Success:** Returns array of all grace period rules.

### POST `/api/grace-period-rules`
**Request body:**
```json
{
  "name": "Standard Grace",
  "minutes_allowed": 5
}
```
**Success (201):** Returns created rule.

### PUT `/api/grace-period-rules/:id`
**Request body:** Same as POST (partial update).
**Success:** Returns updated rule.
**Error (404):** `"Grace period rule not found"`

### DELETE `/api/grace-period-rules/:id`
**Success:** `{ "success": true, "data": null, "error": null }`
**Error (404):** `"Grace period rule not found"`

## Database Tables
Already defined in Prisma schema:
```
clock_records
├── id (PK)
├── worker_id (FK -> workers)
├── shift_id (FK -> shifts)
├── clock_in (timestamp)
├── clock_out (timestamp, nullable)
├── is_manual_edit (bool, default false)
├── edit_note (text, nullable)
├── grace_period_applied (bool, default false)
└── created_at

grace_period_rules
├── id (PK)
├── name
├── minutes_allowed (int)
└── created_at
```

## Business Rules
- If a worker clocks in twice to the same shift without clocking out, reject with error
- If a worker forgets to clock out, the record stays open (clock_out = null) for admin review
- Grace period: if clock_in is within `minutes_allowed` after shift start_time, `grace_period_applied = true` (worker is considered on time)
- Manual edits require an `edit_note` — the system sets `is_manual_edit = true`
- Clock records include related worker (name, base_id) and shift (name) in list responses

## Backend Deliverables
- [ ] Clock service (clock in, clock out, list records, manual edit)
- [ ] Clock controller
- [ ] Clock routes with auth + role middleware
- [ ] Grace period rule service (CRUD)
- [ ] Grace period rule controller
- [ ] Grace period rule routes with auth + role middleware
- [ ] Register routes in app.ts

## Out of Scope
- Automatic shift status updates based on clock records
- Worker shift assignment (manage which workers are in which shifts)
- Notification system for missed clock-outs
- Grace period auto-application during clock-in (keep it simple — just flag it)
