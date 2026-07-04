import { motion, useReducedMotion } from 'motion/react'
import { useNavigate } from 'react-router'

import { TripSearchForm } from '@/components/booking/TripSearchForm'
import { Button } from '@/components/ui/Button'
import { PictureFallback } from '@/components/ui/PictureFallback'
import { easeOutExpo } from '@/lib/motion'

const FLOATING_CHIPS = [
  { icon: '📍', label: 'Rastreo en vivo', position: 'top-6 -left-4 lg:-left-10' },
  { icon: '⏱️', label: 'Salidas puntuales', position: 'top-1/2 -right-3 lg:-right-8' },
  { icon: '🎫', label: 'Boleto digital', position: '-bottom-4 left-10' },
]

export function Hero() {
  const navigate = useNavigate()
  const shouldReduceMotion = useReducedMotion()

  const entrance = (delay: number) =>
    shouldReduceMotion
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.4, delay } }
      : {
          initial: { opacity: 0, y: 28 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: easeOutExpo },
        }

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-x-clip bg-gradient-to-b from-sky-light via-surface to-surface"
    >
      {/* Low-poly sky atmosphere */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_80%_0%,rgb(62_230_240/0.18),transparent_70%),radial-gradient(40%_40%_at_10%_10%,rgb(37_87_214/0.12),transparent_70%)]"
      />

      <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-14 pb-24 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pt-20">
        <div className="flex flex-col items-start gap-6">
          <motion.span
            {...entrance(0)}
            className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/80 px-4 py-1.5 text-sm font-semibold text-primary-deep shadow-sm"
          >
            <span aria-hidden="true">🚌</span> Viajes y encomiendas a todo el país
          </motion.span>

          <motion.h1
            {...entrance(0.08)}
            id="hero-heading"
            className="text-[clamp(2.6rem,2rem+3.5vw,4.5rem)] leading-[1.05] font-extrabold text-ink"
          >
            Conecta <span className="text-primary">tu mundo</span>
          </motion.h1>

          <motion.p {...entrance(0.16)} className="max-w-lg text-lg text-ink-soft">
            Reserva tu asiento en segundos y envía encomiendas con rastreo en línea.
            RUTEX te lleva — y lleva lo que más quieres — a su destino.
          </motion.p>

          <motion.div {...entrance(0.24)} className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate('/reservar')}>
              Reservar asiento
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/encomiendas')}>
              Enviar encomienda
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 20 }}
          animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: easeOutExpo }}
          className="relative"
        >
          <motion.div
            animate={shouldReduceMotion ? undefined : { y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="overflow-hidden rounded-[2rem] border-4 border-white shadow-[0_30px_60px_-20px_rgb(27_63_168/0.45)]"
          >
            <PictureFallback
              name="Primer_frame"
              alt="Bus RUTEX azul recorriendo una carretera entre montañas, con el mensaje Conecta tu mundo"
              fetchPriority="high"
              loading="eager"
              className="h-auto w-full"
            />
          </motion.div>

          {FLOATING_CHIPS.map((chip, index) => (
            <motion.span
              key={chip.label}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + index * 0.15, ...(!shouldReduceMotion && { type: 'spring', stiffness: 260, damping: 18 }) }}
              className={`absolute ${chip.position} hidden items-center gap-2 rounded-2xl bg-white/95 px-3.5 py-2 text-xs font-bold text-ink shadow-[0_12px_24px_-8px_rgb(37_87_214/0.4)] sm:inline-flex`}
            >
              <span className="text-base" aria-hidden="true">
                {chip.icon}
              </span>
              {chip.label}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* Search widget, overlapping the hero bottom edge */}
      <motion.div
        {...entrance(0.35)}
        className="relative z-10 mx-auto -mt-12 mb-[-3.5rem] w-full max-w-5xl px-4"
      >
        <div className="rounded-card border border-sky-light/70 bg-white/95 p-6 shadow-[0_24px_50px_-20px_rgb(27_63_168/0.35)] backdrop-blur">
          <h2 className="mb-4 font-display text-lg font-bold text-ink">
            ¿A dónde viajamos hoy?
          </h2>
          <TripSearchForm />
        </div>
      </motion.div>
    </section>
  )
}
