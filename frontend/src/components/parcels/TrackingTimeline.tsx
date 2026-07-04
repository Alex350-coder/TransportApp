import { motion } from 'motion/react'

import { useReveal } from '@/hooks/use-reveal'
import { formatDateTime } from '@/lib/format'
import type { ShipmentStatus, TrackedShipment } from '@/types/api'

const STATUS_ICONS: Record<ShipmentStatus, string> = {
  registered: '📋',
  in_transit: '🚚',
  at_destination: '🏢',
  delivered: '✅',
}

const STATUS_ORDER: ShipmentStatus[] = [
  'registered',
  'in_transit',
  'at_destination',
  'delivered',
]

export function TrackingTimeline({ shipment }: { shipment: TrackedShipment }) {
  const { item, container } = useReveal()
  const currentIndex = STATUS_ORDER.indexOf(shipment.status)

  return (
    <div className="rounded-card border border-sky-light/70 bg-white p-6 shadow-[0_10px_30px_-12px_rgb(37_87_214/0.2)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-sky-light pb-4">
        <div>
          <p className="text-xs font-semibold tracking-widest text-ink-soft uppercase">
            Encomienda
          </p>
          <p className="font-display text-xl font-extrabold tracking-wide text-primary-deep">
            {shipment.tracking_code}
          </p>
        </div>
        <p className="text-sm font-semibold text-ink">
          {shipment.origin.name} → {shipment.destination.name}
        </p>
      </div>

      {/* Progress steps */}
      <ol
        aria-label="Progreso del envío"
        className="mt-5 grid grid-cols-4 gap-2 text-center text-[0.65rem] font-semibold sm:text-xs"
      >
        {STATUS_ORDER.map((status, index) => {
          const isDone = index <= currentIndex
          return (
            <li key={status} className="flex flex-col items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`flex size-9 items-center justify-center rounded-xl text-base transition-colors ${
                  isDone ? 'bg-primary text-white shadow-[0_6px_14px_-4px_rgb(37_87_214/0.6)]' : 'bg-ink/5'
                }`}
              >
                {STATUS_ICONS[status]}
              </span>
              <span className={isDone ? 'text-primary-deep' : 'text-ink-soft/60'}>
                {statusLabel(status)}
              </span>
            </li>
          )
        })}
      </ol>

      {/* Event timeline */}
      <motion.ol
        variants={container}
        initial="hidden"
        animate="visible"
        className="mt-7 flex flex-col"
        aria-label="Historial de eventos"
      >
        {[...shipment.events].reverse().map((event, index) => (
          <motion.li key={`${event.status}-${event.created_at}`} variants={item} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={`mt-1 size-3.5 rounded-full ${index === 0 ? 'bg-accent shadow-[0_0_0_4px_rgb(62_230_240/0.3)]' : 'bg-sky'}`}
              />
              <span className="w-px flex-1 bg-sky-light" aria-hidden="true" />
            </div>
            <div className="pb-6">
              <p className="text-sm font-bold text-ink">{event.status_label}</p>
              <p className="text-sm text-ink-soft">{event.description}</p>
              <p className="mt-0.5 text-xs text-ink-soft/80">
                {formatDateTime(event.created_at)}
                {event.location && ` · ${event.location}`}
              </p>
            </div>
          </motion.li>
        ))}
      </motion.ol>
    </div>
  )
}

function statusLabel(status: ShipmentStatus): string {
  switch (status) {
    case 'registered':
      return 'Registrado'
    case 'in_transit':
      return 'En tránsito'
    case 'at_destination':
      return 'En destino'
    case 'delivered':
      return 'Entregado'
  }
}
