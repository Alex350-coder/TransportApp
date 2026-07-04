# RUTEX Transportes 🚌

Web app de transporte en español: **reserva de asientos** y **envío de encomiendas**
con rastreo público. Proyecto full-stack de demostración.

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
