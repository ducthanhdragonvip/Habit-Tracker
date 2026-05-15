# Habit Tracker

A full-stack web app for building and tracking daily habits with streaks, completion history, and progress stats.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Django 5 + Django REST Framework |
| Auth | JWT (djangorestframework-simplejwt) |
| Frontend | React 19 + TypeScript + Vite |
| Data Fetching | TanStack React Query |
| Styling | Tailwind CSS (dark theme, IBM Plex Mono) |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Deployment | Railway (BE) + Vercel (FE) |

## Features

- Register and log in with JWT-based authentication
- Create habits with a custom color and icon
- Mark habits complete each day with one click
- Track current and longest streaks per habit
- Dashboard with today's completion rate and per-habit summary
- Log or toggle completion for any past date
- Django admin interface for database inspection

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 20+
- Docker (optional, for PostgreSQL)

### Backend

```bash
cd be
pip install -r requirements.txt
cp .env.example .env        # edit values as needed
python manage.py migrate
python manage.py runserver  # http://localhost:8000
```

### Frontend

```bash
cd fe
npm install
# create fe/.env.local with: VITE_API_BASE_URL=http://localhost:8000
npm run dev                 # http://localhost:5173
```

### PostgreSQL via Docker (optional)

```bash
docker compose up -d        # PostgreSQL on :5432, Adminer on :8080
```

Set `DATABASE_URL=postgres://habit:habit@localhost:5432/habittracker` in `be/.env` to use it.

## Environment Variables

### Backend (`be/.env`)

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | Django secret key |
| `DEBUG` | `True` for development |
| `ALLOWED_HOSTS` | Comma-separated allowed hosts |
| `DATABASE_URL` | Leave empty for SQLite, or set a PostgreSQL URL |
| `CORS_ALLOWED_ORIGINS` | Frontend origin, e.g. `http://localhost:5173` |

### Frontend (`fe/.env.local`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend URL, e.g. `http://localhost:8000` |

## API Overview

All habit endpoints require `Authorization: Bearer <access_token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/` | Create account |
| POST | `/api/auth/login/` | Get JWT tokens |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET | `/api/auth/me/` | Current user info |
| GET/POST | `/api/habits/` | List / create habits |
| GET/PATCH/DELETE | `/api/habits/:id/` | Read / update / delete habit |
| POST | `/api/habits/:id/check/` | Toggle today's completion |
| POST | `/api/habits/:id/log/` | Toggle completion for any date |
| GET | `/api/habits/:id/logs/` | Full log history |
| GET | `/api/habits/:id/streak/` | Current and longest streaks |
| GET | `/api/habits/today/` | All habits with today's status |
| GET | `/api/dashboard/` | Aggregate stats |

## Running Tests

```bash
cd be
python manage.py test --verbosity 2
```

## Deployment

Push to `main` triggers GitHub Actions:

- **Backend** → tested with SQLite, then deployed to Railway (requires `RAILWAY_TOKEN` secret)
- **Frontend** → built with Vite, then deployed to Vercel (requires `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets and `VITE_API_BASE_URL` set in Vercel)
