import { useState } from 'react'
import { Link } from 'react-router'

import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { useMyBookings } from '@/hooks/use-booking'
import { useMyShipments } from '@/hooks/use-parcels'
import { useAuth } from '@/lib/auth-context'
import { formatDateTime, formatPrice } from '@/lib/format'
import type { BookingStatus, ShipmentStatus } from '@/types/api'

type Tab = 'viajes' | 'envios'

const BOOKING_BADGES: Record<BookingStatus, { tone: 'success' | 'warning' | 'danger'; label: string }> = {
  confirmed: { tone: 'success', label: 'Confirmada' },
  pending: { tone: 'warning', label: 'Pendiente' },
  cancelled: { tone: 'danger', label: 'Cancelada' },
}

const SHIPMENT_BADGES: Record<ShipmentStatus, { tone: 'primary' | 'success' | 'warning'; label: string }> = {
  registered: { tone: 'primary', label: 'Registrado' },
  in_transit: { tone: 'warning', label: 'En tránsito' },
  at_destination: { tone: 'primary', label: 'En destino' },
  delivered: { tone: 'success', label: 'Entregado' },
}

export function MiCuentaPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<Tab>('viajes')
  const bookings = useMyBookings(tab === 'viajes')
  const shipments = useMyShipments(tab === 'envios')

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <header className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-deep font-display text-xl font-extrabold text-white"
        >
          {user?.first_name.charAt(0)}
          {user?.last_name.charAt(0)}
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
            Hola, {user?.first_name} 👋
          </h1>
          <p className="text-sm text-ink-soft">{user?.email}</p>
        </div>
      </header>

      <div role="tablist" aria-label="Secciones de mi cuenta" className="mt-8 flex gap-2">
        <TabButton isActive={tab === 'viajes'} onClick={() => setTab('viajes')} id="tab-viajes">
          🚌 Mis viajes
        </TabButton>
        <TabButton isActive={tab === 'envios'} onClick={() => setTab('envios')} id="tab-envios">
          📦 Mis envíos
        </TabButton>
      </div>

      {tab === 'viajes' && (
        <section
          role="tabpanel"
          aria-labelledby="tab-viajes"
          className="mt-6 flex flex-col gap-4"
        >
          {bookings.isLoading && <Spinner label="Cargando tus viajes…" />}
          {bookings.data?.items.length === 0 && (
            <EmptyState
              icon="🚌"
              title="Todavía no tienes viajes"
              description="Cuando reserves un asiento, tu boleto aparecerá aquí."
              action={
                <Link to="/reservar" className="text-sm font-bold text-primary underline">
                  Reservar mi primer viaje
                </Link>
              }
            />
          )}
          {bookings.data?.items.map((booking) => {
            const badge = BOOKING_BADGES[booking.status]
            return (
              <Link
                key={booking.id}
                to={`/reservar/confirmacion/${booking.code}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-sky-light/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-[0_12px_30px_-12px_rgb(37_87_214/0.35)]"
              >
                <div>
                  <p className="font-display font-bold text-ink">
                    {booking.trip.route.origin.name} → {booking.trip.route.destination.name}
                  </p>
                  <p className="text-sm text-ink-soft">
                    {formatDateTime(booking.trip.departure_at)} · Asientos{' '}
                    {booking.seats.map((seat) => seat.seat_number).join(', ')}
                  </p>
                  <p className="mt-1 font-mono text-xs text-ink-soft">{booking.code}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={badge.tone}>{badge.label}</Badge>
                  <span className="font-display font-extrabold text-primary">
                    {formatPrice(booking.total)}
                  </span>
                </div>
              </Link>
            )
          })}
        </section>
      )}

      {tab === 'envios' && (
        <section role="tabpanel" aria-labelledby="tab-envios" className="mt-6 flex flex-col gap-4">
          {shipments.isLoading && <Spinner label="Cargando tus envíos…" />}
          {shipments.data?.items.length === 0 && (
            <EmptyState
              icon="📦"
              title="Todavía no tienes envíos"
              description="Cuando registres una encomienda, podrás seguirla desde aquí."
              action={
                <Link to="/encomiendas" className="text-sm font-bold text-primary underline">
                  Enviar mi primera encomienda
                </Link>
              }
            />
          )}
          {shipments.data?.items.map((shipment) => {
            const badge = SHIPMENT_BADGES[shipment.status]
            return (
              <Link
                key={shipment.id}
                to={`/rastrear/${shipment.tracking_code}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-sky-light/60 bg-white p-5 shadow-sm transition-shadow hover:shadow-[0_12px_30px_-12px_rgb(37_87_214/0.35)]"
              >
                <div>
                  <p className="font-display font-bold text-ink">
                    {shipment.origin.name} → {shipment.destination.name}
                  </p>
                  <p className="text-sm text-ink-soft">
                    Para {shipment.recipient_name} · {shipment.weight_kg} kg
                  </p>
                  <p className="mt-1 font-mono text-xs text-ink-soft">{shipment.tracking_code}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone={badge.tone}>{badge.label}</Badge>
                  <span className="font-display font-extrabold text-primary">
                    {formatPrice(shipment.price)}
                  </span>
                </div>
              </Link>
            )
          })}
        </section>
      )}
    </div>
  )
}

interface TabButtonProps {
  isActive: boolean
  onClick: () => void
  id: string
  children: React.ReactNode
}

function TabButton({ isActive, onClick, id, children }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      id={id}
      aria-selected={isActive}
      onClick={onClick}
      className={`rounded-full px-5 py-2.5 font-display text-sm font-semibold transition-colors ${
        isActive
          ? 'bg-primary text-white shadow-[0_8px_20px_-8px_rgb(37_87_214/0.6)]'
          : 'bg-white text-ink-soft hover:bg-primary-soft hover:text-primary-deep'
      }`}
    >
      {children}
    </button>
  )
}
