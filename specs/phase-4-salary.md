# Phase 4: Salary Calculation

## Overview
Configure salary rules per worker (hourly/percentage/flat), set overtime thresholds, manage charges (loans, prepayments, distribution of charge, time misuse), and preview calculated salary per worker for a given period. Admin-only section — managers have no access.

## Dependencies
- Phase 3 (Check-in System) must be complete

## User Stories
- As an admin, I can set a salary rule for each worker (hourly rate, percentage, or flat amount)
- As an admin, I can configure overtime thresholds and multipliers per worker
- As an admin, I can add charges (loan, prepayment, distribution, time misuse) against a worker
- As an admin, I can view, edit, and delete charges
- As an admin, I can preview a worker's calculated salary for a given date range

## API Endpoints

| Method | Path | Description | Role |
|--------|------|-------------|------|
| GET | `/api/salary/rules` | List all salary rules (with worker info) | admin |
| GET | `/api/salary/rules/:worker_id` | Get a specific worker's salary rule | admin |
| POST | `/api/salary/rules` | Create or update (upsert) a salary rule for a worker | admin |
| GET | `/api/charges` | List charges (filter by worker_id, type) | admin |
| POST | `/api/charges` | Add a charge | admin |
| PUT | `/api/charges/:id` | Update a charge | admin |
| DELETE | `/api/charges/:id` | Delete a charge | admin |
| GET | `/api/salary/calculate/:worker_id` | Calculate salary for period (query: from, to) | admin |

### GET `/api/salary/rules`
**Success response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "worker_id": 1,
      "type": "hourly",
      "rate": "25.00",
      "overtime_multiplier": "1.50",
      "overtime_threshold_hours": 40,
      "created_at": "2026-03-23T00:00:00.000Z",
      "worker": { "id": 1, "name": "Alex Johnson", "base_id": "W001" }
    }
  ],
  "error": null
}
```

### POST `/api/salary/rules`
**Request body:**
```json
{
  "worker_id": 1,
  "type": "hourly",
  "rate": 25.00,
  "overtime_multiplier": 1.5,
  "overtime_threshold_hours": 40
}
```
- `worker_id`, `type`, `rate` are required
- `overtime_multiplier` defaults to 1.5
- `overtime_threshold_hours` defaults to 40
- Upsert: if a rule already exists for the worker, update it

### GET `/api/charges`
**Query params:**
- `worker_id` (optional) — filter by worker
- `type` (optional) — filter by charge type

### POST `/api/charges`
**Request body:**
```json
{
  "worker_id": 1,
  "type": "loan",
  "amount": 500.00,
  "distributed_over_periods": null,
  "description": "Tool purchase advance"
}
```
- `worker_id`, `type`, `amount`, `description` are required
- `distributed_over_periods` only for distribution type
- `remaining` is set equal to `amount` on creation

### GET `/api/salary/calculate/:worker_id`
**Query params:** `from`, `to` (date strings, required)
**Success response:**
```json
{
  "success": true,
  "data": {
    "worker_id": 1,
    "worker_name": "Alex Johnson",
    "period": { "from": "2026-03-01", "to": "2026-03-31" },
    "salary_type": "hourly",
    "rate": "25.00",
    "regular_hours": 40,
    "overtime_hours": 5,
    "base_pay": "1000.00",
    "overtime_pay": "187.50",
    "gross_pay": "1187.50",
    "total_charges": "100.00",
    "net_pay": "1087.50",
    "charges": [
      { "id": 1, "type": "loan", "amount": "100.00", "description": "Tool purchase advance" }
    ]
  },
  "error": null
}
```

## Frontend Pages

| Route | Component | Role |
|-------|-----------|------|
| `/salary/rules` | SalaryRulesPage | admin |
| `/salary/charges` | ChargesPage | admin |
| `/salary/charges/new` | ChargeFormPage | admin |
| `/salary/charges/:id/edit` | ChargeFormPage | admin |
| `/salary/preview/:worker_id` | SalaryPreviewPage | admin |

### Salary Rules Page (`/salary/rules`)
- Table of all workers with columns: Worker Name, Base ID, Type, Rate, OT Multiplier, OT Threshold
- Workers without a rule show "Not configured" with a "Configure" button
- Click row or "Edit" to open edit modal with fields: type (dropdown), rate, overtime_multiplier, overtime_threshold_hours
- Save triggers upsert

### Charges Page (`/salary/charges`)
- Table: Worker, Type, Amount, Remaining, Description, Created
- Filters: worker dropdown, type dropdown
- "Add Charge" button -> `/salary/charges/new`
- Edit/Delete actions per row

### Charge Form Page (`/salary/charges/new`, `/salary/charges/:id/edit`)
- Fields: worker (dropdown), type (dropdown), amount, distributed_over_periods (shown only when type=distribution), description
- Validation: all required fields

### Salary Preview Page (`/salary/preview/:worker_id`)
- Accessible from salary rules table (link per worker row)
- Date range picker (from/to)
- Shows calculated breakdown: regular hours, overtime hours, base pay, overtime pay, gross, charges deducted, net
- Charges listed individually below the summary

## Database Tables
Already exist in Prisma schema: `salary_rules`, `charges`.

## Business Rules
- Hourly: rate x hours worked (from clock records in period)
- Percentage: rate% x manual base amount (for MVP, use rate as flat amount — simplification)
- Flat: fixed amount per period (rate = the flat amount)
- Overtime: hours beyond threshold x overtime_multiplier x rate (hourly only)
- Charges with remaining > 0 are deducted from salary
- Distribution charges: deduct (amount / distributed_over_periods) per period, decrement remaining
- One salary rule per worker (upsert)

## Nav Update
Add "SALARY" section to sidebar with items:
- Salary Rules (`/salary/rules`)
- Charges (`/salary/charges`)

Only visible to admin users.

## Out of Scope
- Actual payroll processing / payments
- Percentage salary base revenue tracking (simplified to flat for MVP)
- Batch salary calculation for all workers at once
- Charge payment tracking / installment history
