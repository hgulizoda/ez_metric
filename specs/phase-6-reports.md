# Phase 6: Reports (Backend Only)

## Overview
Comprehensive reporting APIs: payroll summary with filters, Excel export, weekly statements, per-worker inspection, payment statements with fake Gmail send.

## Dependencies
- Phase 5 (Efficiency) must be complete

## API Endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/reports` | Payroll summary (filterable) | admin, manager |
| GET | `/api/reports/export` | Download Excel report | admin |
| GET | `/api/reports/weekly` | Weekly statements | admin, manager |
| GET | `/api/reports/:worker_id` | Per worker inspection | admin, manager |
| GET | `/api/reports/statements` | Payment statements list | admin |
| GET | `/api/reports/statements/:id` | Single statement | admin |
| POST | `/api/reports/statements/:id/gmail` | Fake send to Gmail | admin |

### GET `/api/reports`
**Query params:**
- `from` (required) — period start
- `to` (required) — period end
- `worker_id` (optional) — filter by worker
- `position` (optional) — filter by position

Returns payroll summary per worker: name, hours, salary, charges, net pay.

### GET `/api/reports/export`
**Query params:** same as `/api/reports`
Returns Excel file (Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet).

### GET `/api/reports/weekly`
**Query params:**
- `week_start` (required) — Monday date of the week

Returns daily breakdown per worker for that week.

### GET `/api/reports/:worker_id`
**Query params:**
- `from` (required), `to` (required)

Returns detailed inspection: clock records, total/billed hours, efficiency, salary breakdown.

### GET `/api/reports/statements`
**Query params:**
- `from` (optional), `to` (optional)

Returns list of generated statement summaries.

### GET `/api/reports/statements/:id`
Returns single statement with full breakdown. Statement ID = worker_id (for this MVP, statements are computed on-the-fly per worker).

**Query params:**
- `from` (required), `to` (required)

### POST `/api/reports/statements/:id/gmail`
Fake endpoint — returns success immediately. No actual email sent.

## Business Rules
- Payroll summary reuses salary calculation logic from Phase 4
- Excel export uses `xlsx` library
- Weekly statements show Mon-Sun daily hours per worker
- Per-worker inspection combines clock records + efficiency + salary
- Statements are computed, not stored — worker_id serves as the statement ID

## Backend Deliverables
- [ ] Install `xlsx` dependency
- [ ] Report service (payroll summary, weekly, per-worker, Excel generation)
- [ ] Report controller
- [ ] Report routes with auth + role middleware
- [ ] Register routes in app.ts
