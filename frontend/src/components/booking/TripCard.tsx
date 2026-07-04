import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, formatDuration, formatPrice, formatTime } from '@/lib/format'
import type { Trip } from '@/types/api'

interface TripCardProps {
  trip: Trip
  onSelect: (trip: Trip) => void
}

export function TripCard({ trip, onSelect }: TripCardProps) {
  const seatsFree = trip.seats_total - trip.seats_taken
  const isSoldOut = seatsFree <= 0

  return (
    <article className="flex flex-col gap-4 rounded-card border border-sky-light/60 bg-white p-6 shadow-[0_10px_30px_-12px_rgb(37_87_214/0.2)] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          {formatDate(trip.departure_at)}
        </p>
        <p className="font-display text-xl font-bold text-ink">
          {formatTime(trip.departure_at)}
          <span className="mx-2 text-ink-soft" aria-hidden="true">
            →
          </span>
          {formatTime(trip.arrival_at)}
        </p>
        <p className="text-sm text-ink-soft">
          {trip.route.origin.name} → {trip.route.destination.name} ·{' '}
          {formatDuration(trip.route.duration_minutes)} · {trip.bus.model}
        </p>
        <div className="mt-1">
          {isSoldOut ? (
            <Badge tone="danger">Agotado</Badge>
          ) : seatsFree <= 5 ? (
            <Badge tone="warning">Últimos {seatsFree} asientos</Badge>
          ) : (
            <Badge tone="success">{seatsFree} asientos libres</Badge>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-6 sm:flex-col sm:items-end">
        <p className="font-display text-2xl font-extrabold text-primary">
          {formatPrice(trip.price)}
        </p>
        <Button onClick={() => onSelect(trip)} disabled={isSoldOut}>
          Elegir asientos
        </Button>
      </div>
    </article>
  )
}
