# CLAUDE.md

> Project context for Claude Code. See [CONTEXT.md](CONTEXT.md) for the full
> product/design context and [PLAN.md](PLAN.md) for the phase plan.

## Project

RUTEX Transportes — Spanish-language transport web app: seat booking (reservas)
and parcel shipping (encomiendas). UI copy is Spanish; code/comments/commits are English.
The `output/` folder is ignored entirely — never read or write it.

## Stack

- Frontend: React 19 + Vite + TypeScript, Tailwind CSS v4, Framer Motion (`motion`),
  TanStack Query v5, React Router v8, React Hook Form + Zod. Package manager: **pnpm only**.
- Backend: Django 5 + DRF + SimpleJWT + drf-spectacular, in `backend/` with venv at `backend/.venv`.
- DB: SQLite by default (`DATABASE_ENGINE=sqlite`), PostgreSQL 16 via `docker compose up -d`.

## Commands

```bash
# Frontend (run inside frontend/)
pnpm dev            # dev server at :5173
pnpm build          # typecheck + production build
pnpm lint           # oxlint
pnpm test           # vitest

# Backend (run inside backend/; use the venv python)
.venv/Scripts/python manage.py runserver     # API at :8000
.venv/Scripts/python manage.py migrate
.venv/Scripts/python manage.py seed_demo     # demo cities/routes/trips
.venv/Scripts/python -m pytest               # tests (settings: config.settings.test)
.venv/Scripts/python -m pytest --cov=apps    # with coverage
```

## Architecture

- `backend/apps/core` — response envelope (`EnvelopeJSONRenderer`), pagination, throttles.
  ALL API responses are `{"success", "data", "error"}`; paginated lists are `{"items", "meta"}`.
- `backend/apps/{accounts,catalog,bookings,parcels}` — domain apps. API mounted at `/api/v1/`.
- `frontend/src/` — `components/` (by feature + `ui/` primitives), `pages/`, `hooks/`,
  `lib/` (api client), `styles/` (tokens.css = design tokens, source of truth).
- Auth: JWT (30-min access + 7-day refresh, rotation). Custom user `accounts.User` (email login).

## Rules

- ES modules, functional components + hooks, no `any` without a justifying comment.
- `camelCase` variables/functions, `PascalCase` components/types, `kebab-case` filenames
  (React component files are `PascalCase.tsx`).
- API error messages shown to users are Spanish; error `code`s are stable English slugs.
- Seats invariant: `UNIQUE(trip, seat_number)` + `select_for_update()` — never bypass.
- Run `pnpm build` (frontend) / `python -m pytest` (backend) before calling work done.
- Never commit `.env`, credentials, or API keys. No `git push` unless explicitly asked.
- Commits in English, short imperative (`Add seat map component`).

## Gotchas

- Windows dev machine; PowerShell 5.1 (no `&&` chaining). Backend venv python:
  `backend/.venv/Scripts/python.exe`.
- Custom user model means `accounts` migration 0001 must always precede others.
- Brand art lives in `Frames/` (source) and `frontend/public/img/` (served copies).
