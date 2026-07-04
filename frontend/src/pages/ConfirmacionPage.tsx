import { motion, useReducedMotion } from 'motion/react'
import { Link, useParams } from 'react-router'

import { Alert } from '@/components/ui/Alert'
import { Badge } from '@/components/ui/Badge'
import { Logo } from '@/components/ui/Logo'
import { Spinner } from '@/components/ui/Spinner'
import { useBooking } from '@/hooks/use-booking'
import { easeOutExpo } from '@/lib/motion'
import { formatDateTime, formatPrice } from '@/lib/format'

export function ConfirmacionPage() {
  const { code } = useParams<{ code: string }>()
  const { data: booking, isLoading, isError } = useBooking(code)
  const shouldReduceMotion = useReducedMotion()

  if (isLoading) return <Spinner label="Cargando tu boleto…" />

  if (isError || !booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Alert tone="error">
          No encontramos esa reserva. Revisa el código o entra a{' '}
          <Link to="/mi-cuenta" className="font-bold underline">
            Mi cuenta
          </Link>
          .
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <motion.div
        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.97 }}
        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: easeOutExpo }}
      >
        <p className="text-center text-4xl" aria-hidden="true">
          🎉
        </p>
        <h1 className="mt-2 text-center text-3xl font-extrabold text-ink">
          ¡Reserva confirmada!
        </h1>
        <p className="mt-2 text-center text-ink-soft">
          Presenta este boleto (o tu documento) al abordar.
        </p>

        <div className="mt-8 overflow-hidden rounded-card shadow-[0_24px_50px_-20px_rgb(27_63_168/0.4)]">
          <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary-deep px-6 py-4">
            <Logo withWordmark={false} />
            <div className="text-right">
              <p className="text-xs font-semibold tracking-widest text-white/70 uppercase">
                Código de reserva
              </p>
              <p className="font-display text-2xl font-extrabold tracking-wider text-white">
                {booking.code}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-white px-6 py-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-ink-soft uppercase">Origen</p>
                <p className="font-display text-xl font-bold text-ink">
                  {booking.trip.route.origin.name}
                </p>
              </div>
              <span aria-hidden="true" className="text-2xl text-primary">
                →
              </span>
              <div className="text-right">
                <p className="text-xs font-semibold text-ink-soft uppercase">Destino</p>
                <p className="font-display text-xl font-bold text-ink">
                  {booking.trip.route.destination.name}
                </p>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-4 border-t border-dashed border-sky-light pt-4 text-sm">
              <div>
                <dt className="text-xs font-semibold text-ink-soft uppercase">Salida</dt>
                <dd className="font-semibold text-ink">{formatDateTime(booking.trip.departure_at)}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink-soft uppercase">Bus</dt>
                <dd className="font-semibold text-ink">{booking.trip.bus.model}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink-soft uppercase">Pasajeros</dt>
                <dd className="flex flex-col gap-1 font-semibold text-ink">
                  {booking.seats.map((seat) => (
                    <span key={seat.seat_number}>
                      {seat.passenger_name} — asiento {seat.seat_number}
                    </span>
                  ))}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-ink-soft uppercase">Total pagado</dt>
                <dd className="font-display text-xl font-extrabold text-primary">
                  {formatPrice(booking.total)}
                </dd>
              </div>
            </dl>

            <div className="flex items-center justify-between border-t border-dashed border-sky-light pt-4">
              <Badge tone={booking.status === 'confirmed' ? 'success' : 'warning'}>
                {booking.status === 'confirmed' ? 'Confirmada' : booking.status}
              </Badge>
              {/* Decorative "barcode" */}
              <div aria-hidden="true" className="flex h-10 items-end gap-[3px]">
                {booking.code.split('').map((char, index) => (
                  <span
                    key={index}
                    className="w-[3px] bg-ink"
                    style={{ height: `${((char.charCodeAt(0) * 7) % 24) + 12}px` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-3">
          <Link
            to="/mi-cuenta"
            className="rounded-full bg-primary px-6 py-3 font-display text-sm font-semibold text-white shadow-lg hover:bg-primary-deep"
          >
            Ver mis viajes
          </Link>
          <Link
            to="/"
            className="rounded-full border-2 border-primary/20 bg-white px-6 py-3 font-display text-sm font-semibold text-primary hover:border-primary/60"
          >
            Volver al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
