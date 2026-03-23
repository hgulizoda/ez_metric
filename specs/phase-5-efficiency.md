# Phase 5: Efficiency Calculator

## Overview
Display all workers' efficiency (billed hours vs. marked hours), configure bonus formulas per position, and allow admin to input manual bonuses. Efficiency drives the bonus system — workers who exceed a threshold earn automatic bonuses.

## Dependencies
- Phase 4 (Salary Calculation) must be complete — needs clock records and salary data

## User Stories
- As an admin or manager, I can view all workers ranked by efficiency percentage
- As an admin or manager, I can view a single worker's efficiency detail with hours breakdown
- As an admin, I can configure bonus rules (formula per position, min efficiency threshold)
- As an admin, I can manually add a bonus for a worker with a note

## API Endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/efficiency` | All workers efficiency for a period | admin, manager |
| GET | `/api/efficiency/:worker_id` | Single worker efficiency detail | admin, manager |
| GET | `/api/bonus-rules` | List all bonus rules | admin |
| POST | `/api/bonus-rules` | Create bonus rule | admin |
| PUT | `/api/bonus-rules/:id` | Update bonus rule | admin |
| DELETE | `/api/bonus-rules/:id` | Delete bonus rule | admin |
| POST | `/api/bonuses/manual` | Add manual bonus | admin |
| GET | `/api/bonuses` | List bonuses (filter by worker, period) | admin |

### GET `/api/efficiency`
**Query params:**
- `from` (required) — period start date
- `to` (required) — period end date

**Success response:**
```json
{
  "success": true,
  "data": [
    {
      "worker_id": 1,
      "worker_name": "Alex Johnson",
      "base_id": "W001",
      "position": "Driver",
      "total_hours": 42.5,
      "billed_hours": 38.0,
      "efficiency": 89.41,
      "bonus_eligible": false
    }
  ],
  "error": null
}
```

### GET `/api/efficiency/:worker_id`
**Query params:**
- `from` (required) — period start date
- `to` (required) — period end date

**Success response:** Same as list item plus `bonuses` array for this worker in the period.

### GET `/api/bonus-rules`
**Success response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "position": "Driver",
      "formula": "efficiency > 90% = $200 bonus",
      "min_efficiency_threshold": "90.00",
      "created_at": "2026-03-23T00:00:00.000Z"
    }
  ],
  "error": null
}
```

### POST `/api/bonus-rules`
**Request body:**
```json
{
  "position": "Driver",
  "formula": "efficiency > 90% = $200 bonus",
  "min_efficiency_threshold": 90.00
}
```
- All fields required.
**Success (201):** Returns created rule.

### PUT `/api/bonus-rules/:id`
**Request body:** Same as POST (partial).
**Success:** Returns updated rule.
**Error (404):** `"Bonus rule not found"`

### DELETE `/api/bonus-rules/:id`
**Success:** `{ "success": true, "data": null, "error": null }`
**Error (404):** `"Bonus rule not found"`

### POST `/api/bonuses/manual`
**Request body:**
```json
{
  "worker_id": 1,
  "amount": 200,
  "period": "2026-03-01",
  "note": "Outstanding performance"
}
```
- `worker_id`, `amount`, `period` are required. `note` is optional.
**Success (201):** Returns created bonus.

### GET `/api/bonuses`
**Query params:**
- `worker_id` (optional)
- `period` (optional) — date string for the pay period

**Success response:** Array of bonus records with worker info.

## Database Tables
Already in Prisma schema:
```
bonus_rules
├── id (PK)
├── position
├── formula (text)
├── min_efficiency_threshold (decimal)
└── created_at

bonuses
├── id (PK)
├── worker_id (FK -> workers)
├── amount (decimal)
├── type (enum: formula, manual)
├── period (date)
├── note (nullable)
└── created_at
```

## Business Rules
- Efficiency = (billed_hours / total_hours) × 100
  - `total_hours` = sum of all clock record durations (clock_out - clock_in) for the period
  - `billed_hours` = total_hours (for this MVP, billed = total since there's no separate billing system)
  - Note: In the MVP, efficiency will always be 100% since billed = total. The UI and calculation engine are built to support future differentiation.
- A worker is `bonus_eligible` if their efficiency >= the min_efficiency_threshold for their position's bonus rule
- Admin can override with manual bonuses (type = "manual") with an optional note
- Formula bonuses (type = "formula") are informational — the admin reviews and confirms

## Frontend Pages

| Route | Component | Auth | Roles |
|-------|-----------|------|-------|
| `/efficiency` | EfficiencyPage | Yes | admin, manager |
| `/efficiency/:worker_id` | EfficiencyDetailPage | Yes | admin, manager |
| `/efficiency/bonus-rules` | BonusRulesPage | Yes | admin |

### Efficiency Page (`/efficiency`)
- Date range picker (from/to) defaulting to current month
- Table of all workers: name, position, total hours, billed hours, efficiency %, bonus eligible badge
- Sortable by efficiency
- Click row to go to worker detail

### Efficiency Detail Page (`/efficiency/:worker_id`)
- Worker info header
- Efficiency stats for the selected period
- Bonus history for this worker
- Manual bonus form (admin only): amount, period, note

### Bonus Rules Page (`/efficiency/bonus-rules`)
- Table: position, formula, threshold
- Add/Edit/Delete bonus rules (admin only)

## Backend Deliverables
- [ ] Efficiency service (calculate efficiency per worker)
- [ ] Efficiency controller + routes
- [ ] Bonus rule service (CRUD)
- [ ] Bonus rule controller + routes
- [ ] Bonus service (manual add, list)
- [ ] Register routes in app.ts

## Frontend Deliverables
- [ ] EfficiencyPage with date picker and sortable table
- [ ] EfficiencyDetailPage with bonus history and manual bonus form
- [ ] BonusRulesPage with CRUD
- [ ] efficiencyService and bonusService
- [ ] Routes in App.tsx
- [ ] Sidebar nav item (EFFICIENCY section)
- [ ] Breadcrumbs in Layout

## Out of Scope
- Automatic bonus application (admin manually reviews)
- Separate billed hours tracking (billed = total for MVP)
- Efficiency notifications or alerts
