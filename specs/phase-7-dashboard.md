# Phase 7: Dashboard (Backend Only)

## Overview
Aggregation endpoints for the dashboard home page: worker summary stats, worked hours overview, and bonus progress per worker.

## Dependencies
- Phase 6 (Reports) should be complete

## API Endpoints

| Method | Path | Description | Roles |
|--------|------|-------------|-------|
| GET | `/api/dashboard/summary` | Aggregated worker stats | admin, manager |
| GET | `/api/dashboard/worked-hours` | Hours summary (today, week, month) | admin, manager |
| GET | `/api/dashboard/bonus-progress` | Bonus progress per worker | admin, manager |

### GET `/api/dashboard/summary`
Returns:
```json
{
  "success": true,
  "data": {
    "total_workers": 5,
    "active_today": 3,
    "total_shifts": 2,
    "active_shifts": 1,
    "open_clock_records": 2
  },
  "error": null
}
```

### GET `/api/dashboard/worked-hours`
Returns hours aggregated across all workers:
```json
{
  "success": true,
  "data": {
    "today": 24.5,
    "this_week": 156.75,
    "this_month": 620.0
  },
  "error": null
}
```

### GET `/api/dashboard/bonus-progress`
Returns per-worker bonus progress relative to their position's threshold:
```json
{
  "success": true,
  "data": [
    {
      "worker_id": 1,
      "worker_name": "Alex Johnson",
      "position": "Driver",
      "efficiency": 92.5,
      "threshold": 90.0,
      "progress_percent": 102.78,
      "bonus_eligible": true
    }
  ],
  "error": null
}
```

## Business Rules
- `active_today` = workers with a clock record today (clock_in today)
- `open_clock_records` = records where clock_out is null
- Worked hours = sum of (clock_out - clock_in) for completed records
- Bonus progress reuses efficiency calculation from Phase 5
- Workers without a bonus rule for their position show threshold=0 and are not eligible

## Backend Deliverables
- [ ] Dashboard service
- [ ] Dashboard controller
- [ ] Dashboard routes with auth middleware
- [ ] Register routes in app.ts
