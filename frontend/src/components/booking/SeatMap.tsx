import { motion, useReducedMotion } from 'motion/react'

import type { SeatMap as SeatMapData } from '@/types/api'

import {
  SEAT_STATE_LABELS,
  seatNumberAt,
  seatState,
  type SeatState,
} from './seat-map-utils'

interface SeatMapProps {
  seatMap: SeatMapData
  selected: number[]
  onToggle: (seatNumber: number) => void
}

const SEAT_CLASSES: Record<SeatState, string> = {
  free: 'border-2 border-sky bg-white text-ink-soft hover:border-primary hover:text-primary cursor-pointer',
  taken: 'border-2 border-transparent bg-ink/10 text-ink/30 cursor-not-allowed',
  selected:
    'border-2 border-primary bg-primary text-white shadow-[0_0_0_3px_rgb(62_230_240/0.4)] cursor-pointer',
}

export function SeatMap({ seatMap, selected, onToggle }: SeatMapProps) {
  const shouldReduceMotion = useReducedMotion()
  const { layout, taken } = seatMap
  const rows = Array.from({ length: layout.rows }, (_, index) => index + 1)
  const cols = Array.from({ length: layout.cols }, (_, index) => index + 1)

  return (
    <div className="flex flex-col items-center gap-5">
      <div
        role="group"
        aria-label="Plano de asientos del bus"
        className="rounded-[2rem] border-4 border-sky-light bg-white p-5 shadow-[0_10px_30px_-12px_rgb(37_87_214/0.25)]"
      >
        {/* Driver row */}
        <div className="mb-4 flex justify-end border-b-2 border-dashed border-sky-light pb-3 pr-1">
          <span
            aria-hidden="true"
            className="inline-flex size-9 items-center justify-center rounded-xl bg-ink/5 text-lg"
            title="Conductor"
          >
            🛞
          </span>
        </div>

        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row} className="flex items-center gap-2">
              {cols.map((col) => {
                const seatNumber = seatNumberAt(layout, row, col)
                const state = seatState(seatNumber, taken, selected)
                const isAisleBefore = col === layout.aisle_after_col + 1
                return (
                  <div key={col} className={isAisleBefore ? 'ml-6' : ''}>
                    <motion.button
                      type="button"
                      whileTap={shouldReduceMotion || state === 'taken' ? undefined : { scale: 0.85 }}
                      onClick={() => state !== 'taken' && onToggle(seatNumber)}
                      disabled={state === 'taken'}
                      aria-pressed={state === 'selected'}
                      aria-label={`Asiento ${seatNumber}, ${SEAT_STATE_LABELS[state]}`}
                      className={`flex size-10 items-center justify-center rounded-t-xl rounded-b-md text-xs font-bold transition-all duration-150 ${SEAT_CLASSES[state]}`}
                    >
                      {seatNumber}
                    </motion.button>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <ul className="flex flex-wrap justify-center gap-5 text-xs font-semibold text-ink-soft">
        <li className="flex items-center gap-2">
          <span className="size-4 rounded-md border-2 border-sky bg-white" aria-hidden="true" />
          Libre
        </li>
        <li className="flex items-center gap-2">
          <span className="size-4 rounded-md bg-primary shadow-[0_0_0_2px_rgb(62_230_240/0.4)]" aria-hidden="true" />
          Seleccionado
        </li>
        <li className="flex items-center gap-2">
          <span className="size-4 rounded-md bg-ink/10" aria-hidden="true" />
          Ocupado
        </li>
      </ul>
    </div>
  )
}
