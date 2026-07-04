# CONTEXT — RUTEX Transportes

> Living context document for the project. Read this before touching code.
> Companion file: [PLAN.md](PLAN.md) (step-by-step implementation plan).

## 1. What we are building

A **transport company web app, fully in Spanish (UI)**, for the fictional brand
**RUTEX Transportes** — tagline: **"Conecta tu mundo"**.

Two core products:

1. **Reserva de asientos (seat booking)** — search trips between cities, pick a
   seat on an interactive seat map, confirm the booking, get a ticket with a code.
2. **Envío de encomiendas (parcel shipping)** — quote a parcel, create a
   shipment, and track it publicly with a tracking code and status timeline.

Plus: **user accounts** (register / login / "Mis viajes" / "Mis envíos") and a
marketing **landing page** with an animated hero.

## 2. Brand & design direction (from `Frames/`)

The three PNGs in `Frames/` are the official brand art and MUST drive the visual
language (they are used as hero/section imagery):

| File | Content | Use |
|---|---|---|
| `Frames/Primer_frame.png` | Front view of RUTEX minibus on a highway, "Conecta tu mundo" on the display | **Hero** background/visual |
| `Frames/Segundo_frame.png` | Rear view of long-distance coach at sunset, floating UI icon cubes (pin, clock, arrows) | Features / booking section |
| `Frames/Tercer_frame.png` | Minibus + floating 3D icon blocks (alerts, clock, location, traffic) | Tracking / parcels section |

**Extracted design tokens (source of truth for the UI):**

- **Style direction:** playful low-poly 3D / "toy world" — rounded geometry,
  glassy blue surfaces, soft depth, glowing cyan edge-light accents. NOT a
  generic corporate template. Light theme is the primary theme (the art is bright).
- **Palette:**
  - `--color-primary`: royal blue `#2557D6` (RUTEX logo blue)
  - `--color-primary-deep`: `#1B3FA8`
  - `--color-accent`: glow cyan `#3EE6F0` (edge lights on the buses)
  - `--color-sky`: `#8EC5F2` / gradients toward `#BFE3FF`
  - `--color-surface`: near-white `#F7FAFF`; cards white with soft blue shadows
  - `--color-nature`: low-poly green `#5FBF6E` (support/illustrative only)
  - `--color-sunset`: warm amber `#FFB65C` (sparingly, e.g. parcels accent)
- **Shape language:** large radii (16–24px), pill buttons, floating "cube" icon
  chips like the frames, layered cards with depth.
- **Typography:** geometric rounded sans. Pairing: **Sora** (display/headings)
  + **Inter** (body). Max 2 families, `font-display: swap`.
- **Motion:** Framer Motion. Hero entrance (bus art slides/parallax in),
  scroll-reveal sections, seat-map micro-interactions, animated tracking
  timeline. Compositor-friendly properties only (`transform`, `opacity`);
  respect `prefers-reduced-motion`.

**All user-facing copy is Spanish** (es-PE/es-419 neutral). Code, comments,
commits: English.

## 3. Tech stack (decided)

| Layer | Choice | Why |
|---|---|---|
| Frontend | **React 19 + Vite + TypeScript** | Modern SPA, fast DX |
| Styling | **Tailwind CSS v4** + CSS custom-property design tokens | Speed + enforceable token system |
| Animation | **Framer Motion (`motion`)** | Declarative, reduced-motion support |
| Server state | **TanStack Query v5** | Caching, retries, no hand-rolled fetching |
| Client state | React context (auth) + component state; **no Redux** | YAGNI |
| Routing | **React Router v7** | Standard |
| Forms | **React Hook Form + Zod** | Validation at the boundary |
| Backend | **Django 5 + Django REST Framework** | Batteries included: ORM, migrations, auth, and free **admin panel** for operating routes/trips. (Spring Boot was the alternative; Django wins on solo-dev speed and built-in admin.) |
| Auth | **djangorestframework-simplejwt** (JWT access+refresh) | Stateless SPA auth |
| API docs | **drf-spectacular** (OpenAPI) | Contract-first frontend work |
| Database | **PostgreSQL 16** (Docker) — SQLite fallback for quick local runs | Relational integrity for seats/bookings |
| Package managers | **pnpm** (frontend — per CLAUDE.md, never npm/yarn), **uv or pip+venv** (backend) | |
| Testing | Backend: **pytest + pytest-django** · Frontend: **Vitest + React Testing Library** · E2E: **Playwright** | 80% coverage target |

## 4. Repository layout (target)

```
Transporte/
├── CONTEXT.md            ← this file
├── PLAN.md               ← implementation plan
├── CLAUDE.md
├── Frames/               ← brand art (source assets, copied into frontend/public)
├── output/               ← IGNORED (do not read/write)
├── docker-compose.yml    ← postgres (+ optional backend)
├── backend/
│   ├── manage.py
│   ├── pyproject.toml / requirements.txt
│   ├── config/           ← settings (base/dev/prod), urls, asgi
│   └── apps/
│       ├── accounts/     ← custom User, auth endpoints
│       ├── catalog/      ← City, Route, Bus, SeatLayout, Trip
│       ├── bookings/     ← Booking, BookingSeat, ticket codes
│       └── parcels/      ← Shipment, TrackingEvent, quotes
└── frontend/
    ├── package.json      ← pnpm
    ├── vite.config.ts
    └── src/
        ├── components/   ← by feature: hero/, booking/, parcels/, auth/, ui/
        ├── pages/        ← route-level components
        ├── hooks/
        ├── lib/          ← api client, utils
        ├── styles/       ← tokens.css, global.css
        └── types/
```

## 5. Domain model (core entities)

```
User            (email login, nombre, teléfono; roles: cliente / staff)
City            (nombre, región)
Route           (origin City → destination City, distance, duración, precio base)
Bus             (placa, modelo, seat_layout JSON: filas × columnas + pasillo)
Trip            (route, bus, fecha, hora salida/llegada, precio, estado)
Booking         (user, trip, estado: pendiente|confirmada|cancelada,
                 código único p.ej. RTX-8F3K2A, total)
BookingSeat     (booking, trip, seat_number) ← UNIQUE(trip, seat_number)
Shipment        (sender user, destinatario, origin/destination City, peso,
                 dimensiones, precio, tracking_code p.ej. RTX-ENV-93XK21,
                 estado: registrado|en_tránsito|en_destino|entregado)
TrackingEvent   (shipment, estado, descripción, timestamp, ubicación)
```

**Critical invariant:** a seat can never be double-booked →
`UNIQUE(trip, seat_number)` DB constraint **plus** `select_for_update()` inside
a transaction when confirming. The constraint is the last line of defense.

## 6. API surface (v1, `/api/v1/`)

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/auth/register/` | POST | — | Create account |
| `/auth/token/`, `/auth/token/refresh/` | POST | — | JWT login/refresh |
| `/auth/me/` | GET | ✓ | Current user profile |
| `/cities/` | GET | — | Cities for search selects |
| `/trips/?origin=&destination=&date=` | GET | — | Search trips |
| `/trips/{id}/seats/` | GET | — | Seat map + availability |
| `/bookings/` | POST | ✓ | Create booking (seats, passengers) |
| `/bookings/mine/` | GET | ✓ | "Mis viajes" |
| `/bookings/{code}/` | GET | ✓ | Booking detail / ticket |
| `/parcels/quote/` | POST | — | Price quote (no persistence) |
| `/parcels/` | POST | ✓ | Create shipment |
| `/parcels/mine/` | GET | ✓ | "Mis envíos" |
| `/parcels/track/{tracking_code}/` | GET | — | **Public** tracking timeline |

Consistent response envelope: `{ "success": bool, "data": ..., "error": ... }`
(pagination metadata where applicable).

## 7. Frontend pages

| Route | Page (Spanish UI) |
|---|---|
| `/` | Landing: hero animado (Primer_frame), features, rutas populares, CTA |
| `/reservar` | Search → results → **seat map** → passenger data → confirmation |
| `/reservar/confirmacion/:code` | Ticket / boleto with code |
| `/encomiendas` | Quote + create shipment (Tercer_frame visual) |
| `/rastrear/:code?` | Public tracking timeline |
| `/ingresar`, `/registrarse` | Auth |
| `/mi-cuenta` | Profile, "Mis viajes", "Mis envíos" |

## 8. Conventions & guardrails

- Follow root `CLAUDE.md` / `CLAUDE.local.md`: pnpm only, ES modules, no `any`
  without justification, functional components + hooks, `kebab-case` filenames,
  `camelCase`/`PascalCase` identifiers, commits in English imperative.
- Immutability, early returns, files <800 lines, functions <50 lines.
- Validate at boundaries: Zod on the frontend forms, DRF serializers on the API.
- Security: no secrets in code (`.env` + `django-environ`), CORS restricted to
  the frontend origin, rate limiting on auth endpoints, parameterized ORM
  queries only, DRF throttling.
- Payment is **mocked** (a "Pago simulado" confirm step) — real gateways out of scope.
- `output/` folder is ignored entirely.

## 9. Out of scope (v1)

Real payments, email/SMS notifications, multi-language UI (Spanish only),
operator dashboards beyond Django admin, mobile apps, real-time WebSocket seat
locking (poll/refetch on the seat map is enough for v1).
