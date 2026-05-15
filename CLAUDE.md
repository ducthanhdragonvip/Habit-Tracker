# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack habit tracking app. Django REST API backend (`be/`) + React TypeScript frontend (`fe/`). Deployed to Railway (BE) and Vercel (FE). Local dev uses SQLite (BE) and a Docker-managed PostgreSQL for production parity.

---

## Commands

### Backend (`be/`)

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver          # http://localhost:8000
python manage.py test --verbosity 2 # run all tests
python manage.py test habits.tests.TestClassName.test_method  # single test
```

CI uses `DATABASE_URL=sqlite:///test.db` — no Docker needed for tests.

### Frontend (`fe/`)

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run lint
```

### Docker (PostgreSQL for local prod parity)

```bash
docker compose up -d    # starts PostgreSQL on :5432, Adminer on :8080
docker compose down
```

Adminer: http://localhost:8080 — server `db`, user/password `habit`, database `habittracker`.

---

## Environment Variables

**Backend** (copy `be/.env.example` → `be/.env`):
- `SECRET_KEY`, `DEBUG`, `ALLOWED_HOSTS`
- `DATABASE_URL` — leave empty for SQLite, set to `postgres://habit:habit@localhost:5432/habittracker` for Docker PG
- `CORS_ALLOWED_ORIGINS=http://localhost:5173`

**Frontend** (`fe/.env.local`):
- `VITE_API_BASE_URL=http://localhost:8000`

---

## Architecture

### Backend

Two Django apps under `be/`:

- **`accounts/`** — register, login (JWT), `/api/auth/me/`
- **`habits/`** — Habit and HabitLog models, all habit endpoints

**Models:**
- `Habit` — UUID PK, FK to User, name/description/color(hex)/icon, timestamps
- `HabitLog` — UUID PK, FK to Habit, date; unique_together `(habit, date)` prevents duplicates

**Key view patterns:**
- `HabitViewSet` (DRF ViewSet) handles CRUD + custom actions: `check/` (toggle today), `log/` (toggle any date), `logs/`, `streak/`, `today/`
- `DashboardView` — aggregate stats: total habits, today's completion rate, best streak, per-habit summary
- Streaks are computed on-demand (`_current_streak`, `_longest_streak` helpers in views.py)

**Auth:** JWT via `djangorestframework-simplejwt`. Access token: 12 h. Refresh token: 14 days. All habit/dashboard endpoints require `Authorization: Bearer <token>`.

### Frontend

**Data flow:**
1. `AuthContext` holds user + tokens, stored in `localStorage` (`habit_access`, `habit_refresh`, `habit_user`). Validates on startup via `/api/auth/me/`.
2. `src/api/auth.ts` and `src/api/habits.ts` are plain fetch wrappers — they handle 401 → auto-refresh → retry logic.
3. TanStack React Query (stale time 30 s, no refetch-on-focus, 1 retry) wraps all API calls in pages/components.

**Routing** (React Router v7):
- Public: `/login`, `/register`
- Protected (via `ProtectedRoute`): `/`, `/dashboard`, `/habits/new`, `/habits/:id`, `/habits/:id/edit`

**Styling:** Tailwind CSS 3 with a custom dark theme (`bg #0f0f0f`), primary pink (`#db2777`), IBM Plex Mono font. Custom utility classes (`.card`, `.btn`, `.btn-primary`, etc.) defined in `index.css`.

### CI/CD

- **`backend.yml`**: triggers on pushes to `main` touching `be/`; runs Django tests, then deploys to Railway via `RAILWAY_TOKEN`.
- **`frontend.yml`**: triggers on pushes to `main` touching `fe/`; runs `npm ci && npm run build`, then deploys to Vercel via `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. Requires `VITE_API_BASE_URL` set in Vercel environment.
