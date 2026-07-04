# RUTEX Transportes 🚌

Web app de transporte en español: **reserva de asientos** y **envío de encomiendas**
con rastreo público. Proyecto full-stack de demostración.

## 📌 About this project / Sobre este proyecto

**EN** — This is a **personal prototype**, built as a portfolio piece for software
development recruiters. It was created **with AI assistance** (Claude Code), driven by
iterative instruction prompts, and complemented with **manual testing** on my side plus
the automated test suites in the repo. It is **not a production system**: some features
are intentionally not implemented — most notably **payments are simulated** (no real
payment gateway), and there are no email/SMS notifications. The goal is to showcase
full-stack architecture, testing discipline, and AI-assisted development workflow.

**ES** — Este es un **prototipo personal**, creado como pieza de portafolio para
reclutadores de posiciones de desarrollo de software. Fue construido **con asistencia de
IA** (Claude Code), guiado por prompts de instrucciones iterativos, y complementado con
**pruebas manuales** de mi parte además de las suites automatizadas del repo. **No es un
sistema de producción**: algunas funcionalidades no están implementadas a propósito — en
particular **los pagos son simulados** (sin pasarela real) y no hay notificaciones por
correo/SMS. El objetivo es mostrar arquitectura full-stack, disciplina de testing y un
flujo de desarrollo asistido por IA.

> Documentación de contexto: [CONTEXT.md](CONTEXT.md) · Plan de construcción: [PLAN.md](PLAN.md)

| Capa | Stack |
|---|---|
| Frontend | React 19 · Vite · TypeScript · Tailwind CSS v4 · Framer Motion · TanStack Query · React Router · RHF + Zod |
| Backend | Django 5 · Django REST Framework · SimpleJWT · drf-spectacular |
| Base de datos | SQLite (dev por defecto) o PostgreSQL 16 vía Docker |
| Tests | pytest (backend) · Vitest + RTL (frontend) · Playwright (E2E) |

## Puesta en marcha

Requisitos: Python 3.12+, Node 20+, pnpm. (Docker solo si quieres Postgres.)

```bash
# 1. Variables de entorno
cp .env.example .env

# 2. Backend
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt   # Windows (.venv/bin/pip en Unix)
.venv/Scripts/python manage.py migrate
.venv/Scripts/python manage.py seed_demo        # ciudades, rutas, buses y 2 semanas de viajes
.venv/Scripts/python manage.py createsuperuser  # para el panel /admin
.venv/Scripts/python manage.py runserver        # http://localhost:8000

# 3. Frontend (en otra terminal)
cd frontend
pnpm install
pnpm dev                                        # http://localhost:5173
```

¿Prefieres PostgreSQL? `docker compose up -d` y pon `DATABASE_ENGINE=postgres` en `.env`.

## URLs útiles

| URL | Qué hay |
|---|---|
| `http://localhost:5173` | La app |
| `http://localhost:8000/api/docs/` | Swagger UI (OpenAPI) |
| `http://localhost:8000/admin/` | Back-office de operaciones (rutas, viajes, encomiendas) |

Para avanzar el estado de una encomienda (En tránsito → Entregado): panel admin →
Encomiendas → acción **"Avanzar al siguiente estado"**.

## Tests

```bash
# Backend (desde backend/)
.venv/Scripts/python -m pytest                 # 38 tests
.venv/Scripts/python -m pytest --cov=apps      # con cobertura

# Frontend (desde frontend/)
pnpm test              # unit + componentes (Vitest)
pnpm e2e               # E2E (Playwright levanta ambos servidores solo)
pnpm lint              # oxlint
pnpm build             # typecheck + build de producción
```

## Arquitectura en 30 segundos

- **API** en `/api/v1/` con envelope uniforme `{"success", "data", "error"}` y
  errores en español con códigos estables (`seat_taken`, `validation_error`…).
- **Asientos sin doble reserva**: constraint `UNIQUE(trip, seat_number)` +
  `select_for_update()` transaccional (`backend/apps/bookings/services.py`).
- **Rastreo público** por código `RTX-ENV-XXXXXX`, sin exponer datos personales.
- **Auth JWT** (access 30 min + refresh 7 días con rotación); usuario por email.
- **Frontend** organizado por feature (`components/booking`, `components/parcels`,
  `components/landing`, `ui/` primitivas) con design tokens en `src/styles/tokens.css`.
- Los frames de marca (`Frames/`) se sirven optimizados como WebP desde
  `frontend/public/img/` (script: `frontend/scripts/optimize-images.mjs`).

## Notas de seguridad

Revisión hecha con agentes de seguridad y code review (sin hallazgos críticos). Estado actual:

- **Aplicado**: rotación de refresh tokens **con blacklist**, throttling global
  (`anon 60/min`, `user 120/min`) además de los scopes `auth`/`tracking`,
  `SECRET_KEY` obligatorio y fuerte en producción (falla al arrancar si falta),
  Swagger/`/api/schema/` solo en desarrollo, validación del parámetro `next`
  en el frontend (solo rutas internas), CORS restringido al origen del frontend,
  headers de seguridad (HSTS, nosniff, X-Frame-Options DENY) en `prod.py`.
- **Tradeoff aceptado (demo)**: JWT en `localStorage` — mitigado con access token
  de 30 min y rotación con blacklist.
- **Pendiente antes de producción real**: protección de fuerza bruta en el login
  de `/admin/` (p. ej. `django-axes` o rate limit en el reverse proxy),
  `SECURE_PROXY_SSL_HEADER` según tu proxy, y `CSRF_TRUSTED_ORIGINS` si el admin
  se sirve desde otro origen.
