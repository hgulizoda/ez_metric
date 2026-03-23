# Phase 0: Project Setup & Architecture

## Overview
Bootstrap the full-stack project skeleton so that frontend, backend, and database all run locally with proper tooling, linting, and conventions in place. No features — just infrastructure.

## Backend Deliverables

| Item | Detail |
|------|--------|
| Runtime | Node.js + Express + TypeScript |
| ORM | Prisma (PostgreSQL) |
| Port | `:3001` |
| API response format | `{ success: boolean, data: T \| null, error: string \| null }` |
| CORS | Allow `http://localhost:5173` + configurable production origin |
| Health check | `GET /api/health` -> `{ success: true, data: { status: "ok" } }` |
| Env vars | `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN` |
| `.env.example` | All vars listed with placeholder values |
| Linting | ESLint + Prettier |
| Scripts | `dev`, `build`, `start`, `lint`, `prisma:migrate`, `prisma:seed` |

## Database (Docker Compose)

- PostgreSQL via `docker-compose.yml` at project root
- Port: `5432`
- Database: `ez_metric`
- User: `postgres`, Password: `postgres`
- `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/ez_metric`

## Database Tables (all phases, empty structure)

- `users` (id, username, password_hash, role, created_at)
- `workers` (id, base_id, name, picture_url, resume_url, salary_type, position, language, created_at, updated_at)
- `shifts` (id, name, start_time, end_time, status, created_at)
- `worker_shifts` (id, worker_id, shift_id, date, status)
- `clock_records` (id, worker_id, shift_id, clock_in, clock_out, is_manual_edit, edit_note, grace_period_applied, created_at)
- `grace_period_rules` (id, name, minutes_allowed, created_at)
- `salary_rules` (id, worker_id, type, rate, overtime_multiplier, overtime_threshold_hours, created_at)
- `charges` (id, worker_id, type, amount, remaining, distributed_over_periods, description, created_at, updated_at)
- `bonus_rules` (id, position, formula, min_efficiency_threshold, created_at)
- `bonuses` (id, worker_id, amount, type, period, note, created_at)

## Folder Structure

```
backend/
├── src/
│   ├── routes/
│   ├── controllers/
│   ├── services/
│   ├── middleware/
│   ├── types/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── .env.example
├── tsconfig.json
├── .eslintrc.json
├── .prettierrc
└── package.json
```

## Out of Scope
- Frontend (separate task)
- Seed data (Phase 1+)
- Auth middleware logic (Phase 1)
- Any feature endpoints

## Open Questions
None — all resolved.
