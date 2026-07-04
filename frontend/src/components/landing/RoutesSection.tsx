import { motion } from 'motion/react'
import { Link } from 'react-router'

import { useTripSearch } from '@/hooks/use-catalog'
import { useReveal } from '@/hooks/use-reveal'
import { formatDuration, formatPrice } from '@/lib/format'
import type { Trip } from '@/types/api'

const MAX_ROUTES = 4

/** First upcoming trip per distinct route. */
function pickPopularRoutes(trips: Trip[]): Trip[] {
  const seen = new Set<number>()
  const routes: Trip[] = []
  for (const trip of trips) {
    if (seen.has(trip.route.id)) continue
    seen.add(trip.route.id)
    routes.push(trip)
    if (routes.length === MAX_ROUTES) break
  }
  return routes
}

export function RoutesSection() {
  const { data, isLoading } = useTripSearch({})
  const { item, container, viewport } = useReveal()

  // The landing highlight only needs the first page of upcoming trips.
  const routes = data ? pickPopularRoutes(data.pages[0]?.items ?? []) : []
  if (!isLoading && routes.length === 0) return null

  return (
    <section aria-labelledby="routes-heading" className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-4">
        <motion.div variants={container} initial="hidden" whileInView="visible" viewport={viewport}>
          <motion.p variants={item} className="text-sm font-bold tracking-[0.2em] text-primary uppercase">
            Rutas populares
          </motion.p>
          <motion.h2
            variants={item}
            id="routes-heading"
            className="mt-2 text-3xl font-extrabold text-ink sm:text-4xl"
          >
            ¿A dónde te llevamos?
          </motion.h2>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {isLoading &&
              Array.from({ length: MAX_ROUTES }, (_, index) => (
                <div
                  key={index}
                  className="h-44 animate-pulse rounded-card bg-surface"
                  aria-hidden="true"
                />
              ))}
            {routes.map((trip) => (
              <motion.div key={trip.route.id} variants={item}>
                <Link
                  to={`/reservar?origin=${trip.route.origin.id}&destination=${trip.route.destination.id}`}
                  className="group block rounded-card border border-sky-light/60 bg-surface p-6 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_rgb(37_87_214/0.35)]"
                >
                  <p className="flex items-center gap-2 font-display text-lg font-bold text-ink">
                    {trip.route.origin.name}
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 24 24"
                      className="size-5 fill-none stroke-primary stroke-2 transition-transform duration-300 group-hover:translate-x-1"
                    >
                      <path d="M4 12h16m-6-6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {trip.route.destination.name}
                  </p>
                  <p className="mt-2 text-sm text-ink-soft">
                    {formatDuration(trip.route.duration_minutes)} de viaje
                  </p>
                  <p className="mt-4 text-sm text-ink-soft">
                    Desde{' '}
                    <span className="font-display text-xl font-extrabold text-primary">
                      {formatPrice(trip.price)}
                    </span>
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
