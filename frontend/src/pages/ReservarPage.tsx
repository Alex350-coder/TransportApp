import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'

import { PassengerForm } from '@/components/booking/PassengerForm'
import { SeatMap } from '@/components/booking/SeatMap'
import { toggleSeat } from '@/components/booking/seat-map-utils'
import { TripCard } from '@/components/booking/TripCard'
import { TripSearchForm } from '@/components/booking/TripSearchForm'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Spinner } from '@/components/ui/Spinner'
import { useCreateBooking, useSeatMap } from '@/hooks/use-booking'
import { useTripSearch } from '@/hooks/use-catalog'
import { ApiRequestError } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import { formatDateTime, formatPrice } from '@/lib/format'
import type { BookingSeat, Trip } from '@/types/api'

const MAX_SEATS_PER_BOOKING = 6

type Step = 'results' | 'seats' | 'passengers'

export function ReservarPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()

  const origin = searchParams.get('origin') ?? ''
  const destination = searchParams.get('destination') ?? ''
  const date = searchParams.get('date') ?? ''
  const hasSearch = Boolean(origin && destination)
  const searchKey = `${origin}|${destination}|${date}`

  const [step, setStep] = useState<Step>('results')
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<number[]>([])
  const [bookingError, setBookingError] = useState('')

  const tripsQuery = useTripSearch(
    { origin, destination, date: date || undefined },
    { enabled: hasSearch },
  )
  const seatMapQuery = useSeatMap(selectedTrip?.id ?? null)
  const createBooking = useCreateBooking()

  // A new search resets any selection in progress.
  useEffect(() => {
    setStep('results')
    setSelectedTrip(null)
    setSelectedSeats([])
    setBookingError('')
  }, [searchKey])

  const handleSelectTrip = (trip: Trip) => {
    setSelectedTrip(trip)
    setSelectedSeats([])
    setBookingError('')
    setStep('seats')
  }

  const handleToggleSeat = (seatNumber: number) => {
    setSelectedSeats((seats) => toggleSeat(seats, seatNumber, MAX_SEATS_PER_BOOKING))
  }

  const handleSubmitPassengers = (seats: BookingSeat[]) => {
    if (!selectedTrip) return
    setBookingError('')
    createBooking.mutate(
      { trip: selectedTrip.id, seats },
      {
        onSuccess: (booking) => {
          navigate(`/reservar/confirmacion/${booking.code}`)
        },
        onError: (error) => {
          if (error instanceof ApiRequestError && error.code === 'seat_taken') {
            setBookingError(`${error.message} El plano se actualizó con los asientos ocupados.`)
            setSelectedSeats([])
            setStep('seats')
            return
          }
          setBookingError(
            error instanceof ApiRequestError
              ? error.message
              : 'No pudimos completar tu reserva. Inténtalo de nuevo.',
          )
        },
      },
    )
  }

  const total = selectedTrip ? Number(selectedTrip.price) * selectedSeats.length : 0
  const loginNext = encodeURIComponent(location.pathname + location.search)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Reserva tu asiento</h1>

      <div className="mt-6 rounded-card border border-sky-light/70 bg-white p-6 shadow-[0_10px_30px_-12px_rgb(37_87_214/0.2)]">
        <TripSearchForm
          key={searchKey}
          initialOrigin={origin}
          initialDestination={destination}
          initialDate={date}
        />
      </div>

      {bookingError && (
        <div className="mt-6">
          <Alert tone="error">{bookingError}</Alert>
        </div>
      )}

      {/* Step: results */}
      {step === 'results' && hasSearch && (
        <section aria-label="Resultados de la búsqueda" className="mt-8 flex flex-col gap-4">
          {tripsQuery.isLoading && <Spinner label="Buscando viajes…" />}
          {tripsQuery.isError && (
            <Alert tone="error">No pudimos cargar los viajes. Inténtalo de nuevo.</Alert>
          )}
          {tripsQuery.data?.items.length === 0 && (
            <EmptyState
              icon="🚌"
              title="No encontramos viajes para esa fecha"
              description="Prueba con otra fecha u otra combinación de ciudades."
            />
          )}
          {tripsQuery.data?.items.map((trip) => (
            <TripCard key={trip.id} trip={trip} onSelect={handleSelectTrip} />
          ))}
        </section>
      )}

      {step === 'results' && !hasSearch && (
        <div className="mt-8">
          <EmptyState
            icon="🔎"
            title="Empieza buscando tu ruta"
            description="Elige origen, destino y fecha para ver los horarios disponibles."
          />
        </div>
      )}

      {/* Step: seats */}
      {step === 'seats' && selectedTrip && (
        <section aria-label="Selección de asientos" className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div>
            <Button variant="ghost" onClick={() => setStep('results')}>
              ← Volver a los horarios
            </Button>
            <div className="mt-4">
              {seatMapQuery.isLoading && <Spinner label="Cargando plano del bus…" />}
              {seatMapQuery.data && (
                <SeatMap
                  seatMap={seatMapQuery.data}
                  selected={selectedSeats}
                  onToggle={handleToggleSeat}
                />
              )}
            </div>
          </div>

          <aside className="h-fit rounded-card border border-sky-light/70 bg-white p-6 shadow-[0_10px_30px_-12px_rgb(37_87_214/0.2)]">
            <h2 className="font-display text-lg font-bold text-ink">Resumen</h2>
            <dl className="mt-3 flex flex-col gap-2 text-sm text-ink-soft">
              <div className="flex justify-between gap-4">
                <dt>Ruta</dt>
                <dd className="text-right font-semibold text-ink">
                  {selectedTrip.route.origin.name} → {selectedTrip.route.destination.name}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Salida</dt>
                <dd className="text-right font-semibold text-ink">
                  {formatDateTime(selectedTrip.departure_at)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Asientos</dt>
                <dd className="text-right font-semibold text-ink">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : '—'}
                </dd>
              </div>
              <div className="mt-2 flex justify-between gap-4 border-t border-sky-light/60 pt-3 text-base">
                <dt className="font-bold text-ink">Total</dt>
                <dd className="font-display font-extrabold text-primary">{formatPrice(total)}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-ink-soft">
              Máximo {MAX_SEATS_PER_BOOKING} asientos por reserva.
            </p>
            <div className="mt-5">
              {user ? (
                <Button
                  size="lg"
                  className="w-full"
                  disabled={selectedSeats.length === 0}
                  onClick={() => setStep('passengers')}
                >
                  Continuar
                </Button>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={() => navigate(`/ingresar?next=${loginNext}`)}
                  >
                    Inicia sesión para continuar
                  </Button>
                  <p className="text-center text-xs text-ink-soft">
                    ¿No tienes cuenta?{' '}
                    <Link to={`/registrarse?next=${loginNext}`} className="font-semibold text-primary">
                      Regístrate gratis
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </aside>
        </section>
      )}

      {/* Step: passengers */}
      {step === 'passengers' && selectedTrip && (
        <section aria-label="Datos de pasajeros" className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <PassengerForm
            seatNumbers={selectedSeats}
            isSubmitting={createBooking.isPending}
            onSubmit={handleSubmitPassengers}
            onBack={() => setStep('seats')}
          />
          <aside className="h-fit rounded-card border border-sky-light/70 bg-primary-soft p-6">
            <h2 className="font-display text-lg font-bold text-primary-deep">Pago simulado</h2>
            <p className="mt-2 text-sm text-ink-soft">
              Este es un proyecto de demostración: al confirmar, tu reserva se crea al instante
              sin ningún cobro real.
            </p>
            <p className="mt-4 font-display text-2xl font-extrabold text-primary">
              {formatPrice(total)}
            </p>
          </aside>
        </section>
      )}
    </div>
  )
}
