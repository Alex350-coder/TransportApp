import { motion } from 'motion/react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/Button'
import { useReveal } from '@/hooks/use-reveal'

const PARCEL_POINTS = [
  'Cotiza el precio al instante, sin registrarte.',
  'Entrega en agencia con confirmación al destinatario.',
  'Rastreo público con tu código RTX-ENV.',
]

export function ParcelsSection() {
  const navigate = useNavigate()
  const { item, container, viewport } = useReveal()

  return (
    <section aria-labelledby="parcels-heading" className="mx-auto max-w-6xl px-4 py-24">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        className="grid items-center gap-10 lg:grid-cols-2"
      >
        <motion.div variants={item} className="order-2 lg:order-1">
          <picture>
            <source srcSet="/img/Tercer_frame.webp" type="image/webp" />
            <img
              src="/img/Tercer_frame.png"
              alt="Bus RUTEX junto a íconos flotantes de rastreo: ubicación, reloj y alertas"
              width={1600}
              height={900}
              loading="lazy"
              className="h-auto w-full rounded-[2rem] border-4 border-white shadow-[0_30px_60px_-20px_rgb(27_63_168/0.35)]"
            />
          </picture>
        </motion.div>

        <div className="order-1 flex flex-col items-start gap-5 lg:order-2">
          <motion.p variants={item} className="text-sm font-bold tracking-[0.2em] text-primary uppercase">
            Encomiendas
          </motion.p>
          <motion.h2
            variants={item}
            id="parcels-heading"
            className="text-3xl font-extrabold text-ink sm:text-4xl"
          >
            Tu paquete viaja con la misma puntualidad que tú
          </motion.h2>
          <motion.ul variants={item} className="flex flex-col gap-3">
            {PARCEL_POINTS.map((point) => (
              <li key={point} className="flex items-start gap-3 text-ink-soft">
                <span
                  aria-hidden="true"
                  className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-lg bg-accent/20 text-sm"
                >
                  ✓
                </span>
                {point}
              </li>
            ))}
          </motion.ul>
          <motion.div variants={item} className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate('/encomiendas')}>
              Cotizar envío
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/rastrear')}>
              Rastrear encomienda
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
