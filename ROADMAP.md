# Efficiency Tracker — Spec-Driven Development Roadmap

**Project Owner:** Davlatbek Absattarov
**Tech Stack:** React + Vite + TypeScript (frontend) + Node.js/Express + TypeScript (backend) + PostgreSQL (database)
**UI Library:** shadcn/ui + Tailwind CSS + Radix primitives
**Scope:** Production-ready app, deployed to Vercel (frontend) + Railway/Render (backend) for demo
**Estimated worker scale:** ~20-50 workers (small trucking company)
**Excluded:** Telegram bot

---

## How Spec-Driven Development Works

For **every phase** below, follow this cycle before writing any code:

1. **Write the spec** — Define what the feature does, UI layout, API endpoints, database tables, business rules.
2. **Review the spec** — You and Davlatbek approve it. "Is anything missing? Is anything wrong?"
3. **Build to the spec** — Code only what the spec says. Nothing more, nothing less.
4. **Test against the spec** — Does it match? If not, fix it or update the spec.

---

## Pages & Routes Tree

```
├── /login                                (admin & manager login)
│
├── /dashboard                            (home — progress bars)
│   ├── Worker Information                (summary cards)
│   ├── Worked Hours                      (hours overview)
│   └── Bonus Progress                    (bonus threshold visualization)
│
├── /workers                              [Admin + Manager]
│   ├── /workers                          (list all workers)
│   ├── /workers/new                      (add new worker)           [Admin only]
│   │     └── fields: name, base ID, picture, salary type, position, language
│   ├── /workers/:id                      (worker profile)
│   └── /workers/:id/edit                 (edit worker)              [Admin only]
│
├── /shifts                               [Admin + Manager]
│   ├── /shifts                           (list/manage shifts)
│   │     └── shows: working time management, status tracking, clock records
│   ├── /shifts/new                       (create shift — shift CRUD) [Admin only]
│   └── /shifts/:id/edit                  (edit shift)               [Admin only]
│
├── /clock                                [Admin + Manager]
│   ├── /clock                            (clock in/out dashboard)
│   │     └── handles: store times with timestamps, handle invalid clock entries
│   ├── /clock/history                    (clock records with filters)
│   │     └── shows: grace period rules applied
│   └── /clock/history/:id/edit           (manual edits & notes)     [Admin only]
│
├── /salary                               [Admin only]
│   ├── /salary/rules                     (salary rules: hourly, percentage, flat)
│   ├── /salary/overtime                  (overtime hours config)
│   ├── /salary/charges                   (charge management list)
│   │     └── types: loan, pre payment, distribution of charge, charged for time misuse
│   ├── /salary/charges/new               (add new charge)
│   └── /salary/preview/:worker_id        (salary preview per worker)
│
├── /efficiency                           [Admin + Manager]
│   ├── /efficiency                       (displaying all workers progress)
│   ├── /efficiency/:worker_id            (single worker + manual bonus input)
│   └── /efficiency/bonus-rules           (bonus formula config)     [Admin only]
│
├── /reports                              [Admin + Manager]
│   ├── /reports                          (salary amount overview + filter parameters)
│   ├── /reports/excel                    (Excel report generation)
│   ├── /reports/weekly                   (weekly statements)
│   ├── /reports/:worker_id               (per worker inspection)
│   │     └── shows: clock in times, marked hours, billed hours, efficiency, salary
│   ├── /reports/statements               (payment statements list)
│   ├── /reports/statements/:id           (single statement preview)
│   └── /reports/statements/:id/gmail     (send to Gmail — fake)
│
├── /settings                             [Admin only]
│   ├── /settings/grace-periods           (manage grace period rules)
│   └── /settings/managers                (manage manager accounts)
```

### Role Access Summary

| Area | Admin | Manager |
|------|-------|---------|
| Dashboard | Full | Full |
| Workers | CRUD | View only |
| Shifts | CRUD | View only |
| Clock in/out | Full + manual edits | Clock in/out only |
| Salary Config | Full | No access |
| Efficiency | Full + bonus config | View only |
| Reports | Full + export + Gmail | View only |
| Settings | Full | No access |

---

## Phase 0: Project Setup & Architecture

### Goal
Get the project skeleton running locally — frontend, backend, database, and dev tooling.

### Spec checklist
- [ ] Project folder structure finalized
- [ ] Database schema overview (all tables, high-level)
- [ ] API design conventions (REST, naming, error format, auth headers)
- [ ] Dev environment setup documented
- [ ] Deployment target documented (Vercel + Railway/Render)
- [ ] UI component library chosen and initialized (shadcn/ui)

### Deliverables
- [ ] React + Vite + TypeScript app initialized
- [ ] Tailwind CSS + shadcn/ui installed and configured
- [ ] Node.js/Express + TypeScript backend initialized
- [ ] PostgreSQL database created with Prisma (ORM + migrations)
- [ ] Project runs locally (frontend :5173, backend :3001)
- [ ] Standard API response format: `{ success: bool, data: ..., error: ... }`
- [ ] Git repo initialized, `.gitignore` set up
- [ ] Environment variables setup (`.env.example` for both frontend and backend)
- [ ] CORS configured for local dev + production origins
- [ ] ESLint + Prettier configured for both packages

### Database tables to create (empty, just structure)
All tables listed in later phases — create them all now so the schema is visible upfront.

### UI Foundation
- [ ] shadcn/ui components initialized (Button, Input, Card, Table, Dialog, Sheet, Toast, Form)
- [ ] Global layout: responsive sidebar + topbar shell
- [ ] Tailwind theme tokens: brand colors, spacing, typography
- [ ] Dark mode support (optional toggle)
- [ ] Loading skeletons and empty state components

---

## Phase 1: Authentication

### Goal
Admin and Manager can log in, get a JWT, and be routed to the correct dashboard.

### Spec checklist
- [ ] Login flow: username + password -> JWT
- [ ] Roles: admin, manager
- [ ] Base ID system for workers
- [ ] Protected routes (frontend + backend)

### Pages
- `/login`

### API Endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | `/api/auth/login` | Login, returns JWT | No |
| GET | `/api/auth/me` | Current user info | Yes |

### Database Tables
```
users
├── id (PK)
├── username (unique)
├── password_hash
├── role (enum: admin, manager)
└── created_at
```

### Deliverables
- [ ] Spec document written and approved
- [ ] Login page UI
- [ ] JWT auth backend
- [ ] Role-based route guards (frontend)
- [ ] Auth middleware (backend)
- [ ] Seed: 1 admin + 2 managers

---

## Phase 2: Worker Management

### Goal
Admin can add, edit, delete workers. Managers can view them.

### Spec checklist
- [ ] Worker CRUD
- [ ] Fields: name, base ID, picture, salary type, position, language, resume
- [ ] Image upload for worker picture
- [ ] Resume/document file upload

### Pages
- `/workers` — list
- `/workers/new` — add form
- `/workers/:id` — profile
- `/workers/:id/edit` — edit form

### API Endpoints
| Method | Path | Description | Role |
|--------|------|-------------|------|
| GET | `/api/workers` | List all workers | Admin, Manager |
| POST | `/api/workers` | Create worker | Admin |
| GET | `/api/workers/:id` | Get single worker | Admin, Manager |
| PUT | `/api/workers/:id` | Update worker | Admin |
| DELETE | `/api/workers/:id` | Delete worker | Admin |

### Database Tables
```
workers
├── id (PK)
├── base_id (unique)
├── name
├── picture_url
├── resume_url (nullable)
├── salary_type (enum: hourly, percentage, flat)
├── position
├── language
├── created_at
└── updated_at
```

### Deliverables
- [ ] Spec document written and approved
- [ ] Worker list page with search/filter
- [ ] Add/Edit worker forms with image + resume upload
- [ ] Worker profile page
- [ ] Backend CRUD endpoints
- [ ] Seed: 5-10 sample workers

---

## Phase 3: Check-in System

### 3A: Shift Management

#### Goal
Admin can create and manage shifts. Track working time, status, and clock records per shift.

#### Pages
- `/shifts` — list with status tracking, working time management, clock records
- `/shifts/new` — create
- `/shifts/:id/edit` — edit

#### API Endpoints
| Method | Path | Description | Role |
|--------|------|-------------|------|
| GET | `/api/shifts` | List shifts | Admin, Manager |
| POST | `/api/shifts` | Create shift | Admin |
| GET | `/api/shifts/:id` | Get shift | Admin, Manager |
| PUT | `/api/shifts/:id` | Update shift | Admin |
| DELETE | `/api/shifts/:id` | Delete shift | Admin |

#### Database Tables
```
shifts
├── id (PK)
├── name
├── start_time
├── end_time
├── status (enum: active, completed, missed)
└── created_at

worker_shifts
├── id (PK)
├── worker_id (FK -> workers)
├── shift_id (FK -> shifts)
├── date
└── status (enum: scheduled, completed, missed, late)
```

### 3B: Clock In/Out Management

#### Goal
Workers clock in/out. System stores timestamps, handles invalid entries, applies grace periods. Admin can manually edit with notes.

#### Pages
- `/clock` — clock in/out dashboard
- `/clock/history` — records with filters, grace period info
- `/clock/history/:id/edit` — manual edit modal (admin only)

#### API Endpoints
| Method | Path | Description | Role |
|--------|------|-------------|------|
| POST | `/api/clock/in` | Clock in | Admin, Manager |
| POST | `/api/clock/out` | Clock out | Admin, Manager |
| GET | `/api/clock/records` | Get records (filter by worker, date) | Admin, Manager |
| PUT | `/api/clock/records/:id` | Manual edit with note | Admin |

#### Database Tables
```
clock_records
├── id (PK)
├── worker_id (FK -> workers)
├── shift_id (FK -> shifts)
├── clock_in (timestamp)
├── clock_out (timestamp)
├── is_manual_edit (bool)
├── edit_note (text, nullable)
├── grace_period_applied (bool)
└── created_at

grace_period_rules
├── id (PK)
├── name
├── minutes_allowed (int)
└── created_at
```

#### Business Rules
- If worker clocks in twice without clocking out -> flag as invalid
- If worker forgets to clock out -> flag for admin review
- Grace period: configurable (e.g., 5 min late = still on time)
- Manual edits require a note explaining why

### Deliverables (Phase 3 combined)
- [ ] Spec document written and approved
- [ ] Shift management UI + API
- [ ] Clock in/out dashboard
- [ ] Clock history with filters
- [ ] Invalid entry handling
- [ ] Grace period logic
- [ ] Manual edit with notes (admin only)

---

## Phase 4: Salary Calculation

### Goal
Configure salary rules per worker, handle overtime, manage charges (loans, prepayments, charge distribution, time misuse charges).

### Spec checklist
- [ ] Salary rules: hourly, percentage, flat
- [ ] Overtime calculation
- [ ] Charge management: loan, pre payment, distribution of charge, charged for time misuse

### Pages
- `/salary/rules` — config per worker (hourly/percentage/flat rates)
- `/salary/overtime` — overtime threshold and multiplier
- `/salary/charges` — list all charges
- `/salary/charges/new` — add loan, prepayment, charge distribution, time misuse charge
- `/salary/preview/:worker_id` — calculated salary preview

### API Endpoints
| Method | Path | Description | Role |
|--------|------|-------------|------|
| GET | `/api/salary/rules` | List all salary rules | Admin |
| POST | `/api/salary/rules` | Create/update rule | Admin |
| GET | `/api/salary/rules/:worker_id` | Get worker's rule | Admin |
| GET | `/api/charges` | List charges | Admin |
| POST | `/api/charges` | Add charge | Admin |
| PUT | `/api/charges/:id` | Update charge | Admin |
| DELETE | `/api/charges/:id` | Delete charge | Admin |
| GET | `/api/salary/calculate/:worker_id` | Calculate salary for period | Admin |

### Database Tables
```
salary_rules
├── id (PK)
├── worker_id (FK -> workers)
├── type (enum: hourly, percentage, flat)
├── rate (decimal)
├── overtime_multiplier (decimal, default 1.5)
├── overtime_threshold_hours (int, default 40)
└── created_at

charges
├── id (PK)
├── worker_id (FK -> workers)
├── type (enum: loan, prepayment, distribution, time_misuse)
├── amount (decimal)
├── remaining (decimal)
├── distributed_over_periods (int, nullable)
├── description (text)
├── created_at
└── updated_at
```

### Business Rules
- Hourly: rate x hours worked
- Percentage: % of revenue/jobs completed
- Flat: fixed amount per pay period
- Overtime: hours beyond threshold x overtime_multiplier x rate
- Charges are deducted from salary
- Distribution of charge: spread across N pay periods
- Time misuse: penalty charge for misusing company time

### Deliverables
- [ ] Spec document written and approved
- [ ] Salary rules config UI
- [ ] Overtime config UI
- [ ] Charge management UI (all 4 types)
- [ ] Salary calculation engine (backend)
- [ ] Salary preview per worker

---

## Phase 5: Efficiency Calculator

### Goal
Show all workers' progress, configure bonus formulas, allow manual bonus input.

### Pages
- `/efficiency` — all workers progress table/grid
- `/efficiency/:worker_id` — single worker detail + manual bonus input
- `/efficiency/bonus-rules` — bonus formula config (admin only)

### API Endpoints
| Method | Path | Description | Role |
|--------|------|-------------|------|
| GET | `/api/efficiency` | All workers efficiency | Admin, Manager |
| GET | `/api/efficiency/:worker_id` | Single worker efficiency | Admin, Manager |
| GET | `/api/bonus-rules` | List bonus rules | Admin |
| POST | `/api/bonus-rules` | Create/update bonus rule | Admin |
| POST | `/api/bonus/manual` | Manual bonus input | Admin |

### Database Tables
```
bonus_rules
├── id (PK)
├── position (or applies_to)
├── formula (text — e.g., "efficiency > 90% = $200 bonus")
├── min_efficiency_threshold (decimal)
└── created_at

bonuses
├── id (PK)
├── worker_id (FK -> workers)
├── amount (decimal)
├── type (enum: formula, manual)
├── period (date)
├── note (text, nullable)
└── created_at
```

### Business Rules
- Efficiency = billed hours / total marked hours x 100
- Bonus formula applied automatically when efficiency meets threshold
- Admin can override with manual bonus + note
- Dashboard shows all workers ranked by efficiency

### Deliverables
- [ ] Spec document written and approved
- [ ] Efficiency dashboard (all workers, sortable)
- [ ] Single worker efficiency detail page
- [ ] Bonus formula configuration (admin)
- [ ] Manual bonus input (admin)
- [ ] Efficiency calculation engine (backend)

---

## Phase 6: Reports

### Goal
Comprehensive reporting: salary amounts, filters, Excel reports, weekly statements, per-worker inspection, payment statements, fake Gmail send.

### Pages
- `/reports` — salary amount overview with filter parameters
- `/reports/excel` — Excel report download
- `/reports/weekly` — weekly statements list
- `/reports/:worker_id` — per worker inspection (clock in times, marked hours, billed hours, efficiency, salary)
- `/reports/statements` — payment statements list
- `/reports/statements/:id` — single statement preview
- `/reports/statements/:id/gmail` — send to Gmail (fake toast)

### API Endpoints
| Method | Path | Description | Role |
|--------|------|-------------|------|
| GET | `/api/reports` | Payroll summary (filterable) | Admin, Manager |
| GET | `/api/reports/export` | Download Excel report | Admin |
| GET | `/api/reports/weekly` | Weekly statements | Admin, Manager |
| GET | `/api/reports/:worker_id` | Per worker inspection | Admin, Manager |
| GET | `/api/reports/statements` | Payment statements list | Admin |
| GET | `/api/reports/statements/:id` | Single statement | Admin |
| POST | `/api/reports/statements/:id/gmail` | Fake send to Gmail | Admin |

### Per Worker Inspection Shows
- Clock in times
- Marked hours
- Billed hours
- Efficiency %
- Salary breakdown

### Deliverables
- [ ] Spec document written and approved
- [ ] Reports overview with filter parameters (date range, worker, position)
- [ ] Excel report generation (using `xlsx` library)
- [ ] Weekly statements view
- [ ] Per worker inspection drill-down
- [ ] Payment statement preview (printable)
- [ ] Fake "Send to Gmail" button with success toast

---

## Phase 7: Dashboard Home (Progress Bar)

### Goal
Main landing page after login. Shows worker information, worked hours overview, and bonus progress bars.

### Pages
- `/dashboard` — home with widgets

### API Endpoints
| Method | Path | Description | Role |
|--------|------|-------------|------|
| GET | `/api/dashboard/summary` | Aggregated stats | Admin, Manager |
| GET | `/api/dashboard/worked-hours` | Hours summary | Admin, Manager |
| GET | `/api/dashboard/bonus-progress` | Bonus progress per worker | Admin, Manager |

### Dashboard Widgets
1. **Worker Information** — quick stats cards (total workers, active today, etc.)
2. **Worked Hours** — hours overview (today, this week, this month)
3. **Bonus Progress** — progress bars per worker showing how close they are to bonus threshold

### Deliverables
- [ ] Spec document written and approved
- [ ] Dashboard layout with 3 widget sections
- [ ] Worker info summary cards
- [ ] Worked hours overview
- [ ] Bonus progress bars per worker
- [ ] All data pulled from existing APIs (aggregation endpoint)

---

## Phase 8: Settings & Polish

### Goal
Grace period config, manager account management, final UI polish.

### Pages
- `/settings/grace-periods`
- `/settings/managers`

### Deliverables
- [ ] Grace period rules CRUD
- [ ] Manager account CRUD (admin creates manager accounts)
- [ ] UI consistency pass (responsive, clean)
- [ ] Demo seed data: realistic workers, clock records, salary data, charges

---

## Suggested Folder Structure

```
efficiency-tracker/
├── frontend/                    # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui components (auto-generated)
│   │   │   ├── layout/          # Sidebar, Topbar, PageWrapper
│   │   │   └── shared/          # Reusable app components (DataTable, StatusBadge, etc.)
│   │   ├── pages/               # Page-level components (one per route)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API call functions (axios instances)
│   │   ├── context/             # Auth context, role context
│   │   ├── lib/                 # shadcn/ui utils, cn() helper
│   │   ├── types/               # Shared TypeScript types/interfaces
│   │   └── utils/               # Helpers (date formatting, etc.)
│   ├── .env.example
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   ├── components.json          # shadcn/ui config
│   └── package.json
├── backend/                     # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/              # Express route handlers
│   │   ├── controllers/         # Business logic
│   │   ├── middleware/          # Auth, role check, validation
│   │   ├── services/            # Salary calc, efficiency calc, report gen
│   │   ├── types/               # TypeScript types
│   │   └── utils/               # Helpers
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   ├── migrations/          # Auto-generated migrations
│   │   └── seed.ts              # Demo seed data
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
├── specs/                       # Spec documents per phase
│   ├── phase-0-setup.md
│   ├── phase-1-auth.md
│   ├── phase-2-workers.md
│   ├── phase-3a-shifts.md
│   ├── phase-3b-clock.md
│   ├── phase-4-salary.md
│   ├── phase-5-efficiency.md
│   ├── phase-6-reports.md
│   ├── phase-7-dashboard.md
│   └── phase-8-settings.md
└── ROADMAP.md                   # This file
```

---

## Spec Document Template

For each phase, create a spec file in `specs/` with this structure:

```markdown
# Phase X: Feature Name

## Overview
One paragraph — what does this feature do and why.

## User Stories
- As an admin, I can ...
- As a manager, I can ...

## UI Layout
- Page name: description of layout, key components
- Wireframe notes or screenshots

## API Endpoints
| Method | Path | Description | Auth | Role |
|--------|------|-------------|------|------|

## Database Tables
Table name, columns, types, constraints.

## Business Rules
- Rule 1: ...
- Rule 2: ...

## Out of Scope
Things explicitly NOT included in this phase.

## Open Questions
Things to clarify before building.
```

---

## Phase Dependencies

```
Phase 0 (Setup + UI Foundation)
  └── Phase 1 (Auth)
        └── Phase 2 (Workers)
              ├── Phase 3 (Check-in: Shifts + Clock)
              │     └── Phase 4 (Salary Calculation)
              │           └── Phase 5 (Efficiency Calculator)
              │                 └── Phase 6 (Reports)
              │                       └── Phase 7 (Dashboard)
              ├── Phase 8 (Settings) — can be done in parallel after Phase 1
              └── Phase 9 (Deployment) — can start after Phase 1, finalize after Phase 8
```

---

## Phase 9: Deployment & Production Readiness

### Goal
Deploy the app for demo: frontend on Vercel/Netlify, backend on Railway/Render, database on Railway/Neon/Supabase.

### Deployment Architecture
```
┌─────────────────┐     API calls     ┌──────────────────┐     Prisma     ┌──────────────┐
│  Vercel/Netlify  │ ───────────────── │  Railway/Render   │ ────────────── │  PostgreSQL   │
│  (React frontend)│   HTTPS + CORS    │  (Express API)    │               │  (Neon/Railway)│
└─────────────────┘                    └──────────────────┘               └──────────────┘
```

### Frontend Deployment (Vercel or Netlify)
- [ ] `vite build` produces optimized static bundle
- [ ] Environment variable: `VITE_API_URL` pointing to backend URL
- [ ] SPA fallback configured (all routes → `index.html`)
- [ ] Build command: `cd frontend && npm run build`
- [ ] Output directory: `frontend/dist`

### Backend Deployment (Railway or Render)
- [ ] Express app listens on `process.env.PORT`
- [ ] CORS whitelist: frontend production URL + localhost for dev
- [ ] Environment variables: `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, `PORT`
- [ ] Prisma migrations run on deploy (`prisma migrate deploy`)
- [ ] Health check endpoint: `GET /api/health`
- [ ] Seed script for demo data

### Database (Neon or Railway PostgreSQL)
- [ ] Production PostgreSQL instance provisioned
- [ ] Connection string set as `DATABASE_URL` in backend env
- [ ] Prisma schema matches production

### Production Checklist
- [ ] All secrets in environment variables (no hardcoded values)
- [ ] HTTPS enforced
- [ ] Rate limiting on auth endpoints
- [ ] Input validation with Zod on all API endpoints
- [ ] Error responses don't leak stack traces in production
- [ ] `NODE_ENV=production` set on backend
- [ ] File uploads use cloud storage (Cloudinary/S3) instead of local disk
- [ ] Proper logging (no `console.log` in production — use a logger like pino)

---

## Rules for Working with AI

1. **Never code without an approved spec** — spec first, code second.
2. **One phase at a time** — finish and test before moving on.
3. **Small increments** — each deliverable = 1 commit or PR.
4. **Test after each deliverable** — does it match the spec?
5. **Ask questions early** — unclear spec = wasted code.
