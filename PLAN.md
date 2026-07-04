# PLAN — RUTEX Transportes

**Source context**: [CONTEXT.md](CONTEXT.md)
**Complexity**: Large (full-stack greenfield)
**Stack**: React 19 + Vite + TS + Tailwind v4 + Framer Motion · Django 5 + DRF + PostgreSQL

Each phase ends with a working, verifiable state. Do not start a phase until
the previous one's validation passes.

---

## Phase 0 — Scaffolding & tooling

**Goal:** monorepo skeleton, both dev servers boot, DB runs.

1. Create `docker-compose.yml` with PostgreSQL 16 (volume, healthcheck) — `.env.example` with DB credentials placeholders.
2. Scaffold backend: `backend/` Django 5 project (`config/` settings split base/dev/prod, `django-environ`), apps `accounts`, `catalog`, `bookings`, `parcels`. Install DRF, simplejwt, drf-spectacular, django-cors-headers, pytest-django.
3. Scaffold frontend: `frontend/` via `pnpm create vite` (react-ts). Install tailwindcss v4, motion, @tanstack/react-query, react-router, react-hook-form, zod. Configure ESLint + Prettier + strict tsconfig.
4. Copy `Frames/*.png` → `frontend/public/img/` (optimize to WebP/AVIF with PNG fallback; hero image gets explicit dimensions + `fetchpriority="high"`).
5. Root scripts documented; update `CLAUDE.md` placeholders with the real stack/commands.
6. `.gitignore` (node_modules, venv, .env, output/), `git init` + initial commit.

**Validate:** `docker compose up -d` healthy · `python manage.py runserver` responds · `pnpm dev` renders starter page · `pnpm lint && pnpm typecheck` pass.

---

## Phase 1 — Backend: auth & users

**Goal:** JWT auth works end-to-end via HTTP.

1. **TDD:** tests first for register/login/me (pytest).
2. Custom `User` model (email as username, nombre, teléfono) — must land in the **first** migration of `accounts`.
3. Endpoints: `POST /auth/register/`, `POST /auth/token/`, `POST /auth/token/refresh/`, `GET /auth/me/`. Response envelope + Spanish error messages (`detail` in Spanish, codes stable).
4. Throttling on auth endpoints; password validation; CORS locked to the Vite origin.
5. OpenAPI schema exposed at `/api/schema/` + Swagger UI.

**Validate:** `pytest` green, coverage ≥80% on `accounts`; manual curl register→login→me.

---

## Phase 2 — Backend: catalog domain (cities, routes, buses, trips)

**Goal:** searchable trip data with realistic seeds.

1. **TDD:** model + endpoint tests first.
2. Models: `City`, `Route`, `Bus` (seat layout: rows/cols/aisle JSON), `Trip` (route, bus, datetime, price, estado). Indexes on `(origin, destination)` and trip date.
3. Endpoints: `GET /cities/`, `GET /trips/?origin&destination&date` (paginated, `select_related` to avoid N+1), `GET /trips/{id}/seats/` (layout + taken seat numbers).
4. Django admin registration for all catalog models (operator back-office).
5. Seed command `manage.py seed_demo`: ~10 Peruvian/generic cities, routes, buses (40-seat coach + 20-seat minibus layouts), 2 weeks of trips.

**Validate:** `pytest` green ≥80%; search returns seeded trips; admin usable.

---

## Phase 3 — Backend: bookings (seat reservation)

**Goal:** transactional, double-booking-proof reservations.

1. **TDD first — including a concurrency test** (two parallel bookings for the same seat: exactly one succeeds).
2. Models: `Booking` (user, trip, estado, unique human code `RTX-XXXXXX`, total), `BookingSeat` with **`UNIQUE(trip, seat_number)`** constraint.
3. `POST /bookings/`: validate seats exist in layout & trip is future → `transaction.atomic()` + `select_for_update()` on trip → create booking + seats → return ticket payload. IntegrityError → friendly Spanish "asiento ya ocupado" 409.
4. `GET /bookings/mine/`, `GET /bookings/{code}/` (owner-only). Mock payment = booking created directly as `confirmada`.

**Validate:** `pytest` green ≥80%; concurrency test passes; 409 on seat collision.

---

## Phase 4 — Backend: parcels (encomiendas)

**Goal:** quote, create, and publicly track shipments.

1. **TDD first.**
2. Models: `Shipment` (tracking code `RTX-ENV-XXXXXX`, sender, destinatario, cities, peso/dimensiones, precio, estado), `TrackingEvent` (auto-created "Registrado" on creation).
3. Pricing rule (named constants, no magic numbers): base by route distance + weight tiers. `POST /parcels/quote/` is pure calculation.
4. Endpoints: quote, create (auth), mine (auth), `GET /parcels/track/{code}/` — **public**, throttled, returns timeline; 404 without leaking existence details.
5. Admin action to advance shipment estado (creates TrackingEvent).

**Validate:** `pytest` green ≥80%; full quote→create→track flow via curl.

---

## Phase 5 — Frontend: foundation & design system

**Goal:** tokens, layout shell, API plumbing — no pages yet.

1. `styles/tokens.css`: the CONTEXT.md palette, fluid type scale (`clamp`), spacing, radii, durations/easings as CSS custom properties wired into Tailwind v4 `@theme`.
2. Fonts: Sora (headings) + Inter (body), self-hosted subsets, `font-display: swap`, preload critical weight.
3. `ui/` primitives: `Button` (pill, glow-on-hover), `Input`, `Select`, `SurfaceCard` (floating cube aesthetic), `Badge`, `Spinner`, `EmptyState` — all with designed hover/focus/active states, Spanish labels via props.
4. `lib/api-client.ts`: typed fetch wrapper honoring the response envelope; JWT storage + auto-refresh interceptor; TanStack Query provider.
5. Auth context (`useAuth`) + protected route wrapper; React Router shell: `Navbar` (glassy, logo RUTEX), `Footer`; routes stubbed.
6. `useReducedMotion` hook wired into a shared motion config.

**Validate:** `pnpm lint && pnpm typecheck && pnpm build` pass; Vitest for api-client + hooks.

---

## Phase 6 — Frontend: landing page (hero + animations)

**Goal:** the showpiece — brand landing in Spanish.

1. **Hero**: `Primer_frame` art as full-bleed visual; headline "Conecta tu mundo", sub "Viaja y envía con RUTEX Transportes"; dual CTA («Reservar asiento» / «Enviar encomienda»). Framer Motion entrance: staggered text reveal + subtle parallax/float on the art; sky-gradient background matching the frame.
2. **Search widget** embedded in hero: origin/destination/date → navigates to `/reservar` with query params (URL as state).
3. **Features section**: floating cube-chip cards (echoing the frames' 3D icon cubes) — Reservas, Encomiendas, Rastreo, Puntualidad — scroll-reveal with stagger; `Segundo_frame` as section visual.
4. **Rutas populares**: cards fed by `GET /trips` popular routes; **CTA banner** + footer.
5. Reduced-motion: all reveals collapse to opacity-only or none.
6. SEO: Spanish meta/OG tags, semantic landmarks (`header/main/section[aria-labelledby]`).

**Validate:** build passes; Lighthouse on `/` ≥90 perf & a11y; screenshots at 320/768/1024/1440; no layout shift from images (explicit dims).

---

## Phase 7 — Frontend: booking flow

**Goal:** search → seat map → passenger → ticket, fully wired.

1. `/reservar`: search form (reads URL params) + results list (trip cards: hora, duración, bus, precio) — TanStack Query, loading skeletons, Spanish empty states («No encontramos viajes para esa fecha»).
2. **Seat map component**: renders bus layout from API (grid + aisle), states libre/ocupado/seleccionado with micro-animations (scale+glow on select), legend, keyboard-navigable + ARIA labels («Asiento 12, libre»). Availability refetched on focus/interval.
3. Passenger details form (RHF+Zod, Spanish validation messages) → mock payment confirm step.
4. `POST /bookings/` with optimistic UI care: on 409 «asiento ocupado», refetch seat map and show friendly toast.
5. Confirmation page `/reservar/confirmacion/:code`: animated ticket card (código, QR-style block, detalles), «Descargar / Ver mis viajes».
6. Requires auth: redirect to `/ingresar?next=…` preserving state.

**Validate:** Vitest on seat-map logic + forms; Playwright happy path (search→seat→book→ticket) against seeded backend.

---

## Phase 8 — Frontend: parcels & tracking

**Goal:** encomiendas end-to-end + public tracking.

1. `/encomiendas`: quote form (ciudades, peso, dimensiones) → live price display (animated count-up), then create shipment (auth) → success screen with tracking code + copy button. `Tercer_frame` as section visual.
2. `/rastrear/:code?`: public page — input for code + **animated vertical timeline** of TrackingEvents (estado icons echoing the cube chips; motion-staggered). Friendly Spanish error for unknown codes.
3. Empty/loading/error states designed, not default.

**Validate:** Vitest for quote form logic; Playwright: quote→create→track.

---

## Phase 9 — Frontend: auth pages & account

**Goal:** login/register + «Mi cuenta».

1. `/ingresar` & `/registrarse`: split-layout cards (brand art side), RHF+Zod, Spanish errors, password visibility toggle, redirect handling.
2. `/mi-cuenta`: profile info, tabs «Mis viajes» (booking cards with estado badges) and «Mis envíos» (shipment cards linking to tracking).
3. Navbar reflects session (avatar/menu, «Cerrar sesión»); token refresh handled silently.

**Validate:** Vitest auth hooks/forms; Playwright register→login→book→see in Mis viajes.

---

## Phase 10 — Hardening, tests to 80%, polish

1. Coverage sweep both sides to ≥80% (`pytest --cov`, `vitest --coverage`); fill gaps (esp. bookings concurrency + api-client).
2. Full Playwright suite: booking, parcels, tracking, auth (Chrome/Firefox/WebKit).
3. A11y pass: keyboard nav, focus rings, contrast (blue-on-white AA), reduced-motion audit.
4. Performance: bundle check (landing <150 kb gz JS), lazy-load below-fold routes (`React.lazy` per page), image audit.
5. Security review checklist (security-reviewer agent): auth endpoints, input validation, CORS/headers, no leaked secrets.
6. `README.md` (setup, seeds, commands) + final `CLAUDE.md` accuracy pass.

**Validate:** full suites green; Lighthouse ≥90 across pages; checklist done.

---

## Dependencies between phases

```
0 → 1 → 2 → 3 → 4          (backend chain)
0 → 5 → 6                   (frontend foundation → landing)
2 → 6 (rutas populares)     3 → 7      4 → 8      1 → 9
7,8,9 → 10
```
Phases 5–6 can start in parallel with 2–4 once Phase 1 is done.

## Risks

| Risk | Level | Mitigation |
|---|---|---|
| Seat double-booking under concurrency | HIGH | DB unique constraint + `select_for_update` + dedicated concurrency test (Phase 3.1) |
| Hero art (large PNGs) tanks LCP | MEDIUM | Convert to AVIF/WebP, explicit dims, preload, `fetchpriority=high` |
| Windows dev friction (Docker/Postgres) | MEDIUM | SQLite fallback setting for quick local runs; Postgres for tests-that-matter |
| Scope creep (payments, notifications) | MEDIUM | Explicitly out of scope in CONTEXT.md §9 |
| JWT in localStorage (XSS surface) | LOW/MED | Short-lived access token, refresh rotation; strict CSP in prod config |

## Estimated effort

Backend ~10–14 h · Frontend ~14–18 h · Testing/polish ~5–7 h → **~30–40 h** total, split across the 11 phases.

## Acceptance

- [ ] All phases validated with their commands
- [ ] UI 100% Spanish, brand-faithful to `Frames/`
- [ ] Booking + parcels + tracking + auth work end-to-end (Playwright green)
- [ ] Coverage ≥80% both sides; no CRITICAL/HIGH review findings
