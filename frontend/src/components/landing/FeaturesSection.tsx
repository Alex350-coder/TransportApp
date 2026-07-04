import { motion } from 'motion/react'

import { useReveal } from '@/hooks/use-reveal'

const FEATURES = [
  {
    icon: '🚌',
    title: 'Reservas en línea',
    description: 'Elige tu asiento en el plano del bus y paga en un par de clics.',
    accent: 'from-primary to-primary-deep',
  },
  {
    icon: '📦',
    title: 'Encomiendas seguras',
    description: 'Cotiza al instante y envía paquetes a más de 10 ciudades.',
    accent: 'from-sunset to-[#f28c38]',
  },
  {
    icon: '📍',
    title: 'Rastreo en vivo',
    description: 'Sigue cada encomienda con su código RTX, sin crear cuenta.',
    accent: 'from-accent to-sky',
  },
  {
    icon: '⏱️',
    title: 'Puntualidad real',
    description: 'Salidas programadas y duración estimada visible antes de comprar.',
    accent: 'from-nature to-[#3d9e4d]',
  },
]

export function FeaturesSection() {
  const { item, container, viewport } = useReveal()

  return (
    <section aria-labelledby="features-heading" className="mx-auto max-w-6xl px-4 py-24">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
      >
        <motion.p variants={item} className="text-sm font-bold tracking-[0.2em] text-primary uppercase">
          ¿Por qué RUTEX?
        </motion.p>
        <motion.h2
          variants={item}
          id="features-heading"
          className="mt-2 max-w-xl text-3xl font-extrabold text-ink sm:text-4xl"
        >
          Todo tu viaje en un solo lugar
        </motion.h2>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature) => (
            <motion.article
              key={feature.title}
              variants={item}
              className="group rounded-card border border-sky-light/60 bg-white p-6 shadow-[0_10px_30px_-12px_rgb(37_87_214/0.25)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-12px_rgb(37_87_214/0.35)]"
            >
              <span
                aria-hidden="true"
                className={`inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.accent} text-2xl shadow-[0_8px_16px_-6px_rgb(37_87_214/0.5)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}
              >
                {feature.icon}
              </span>
              <h3 className="mt-4 font-display text-lg font-bold text-ink">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{feature.description}</p>
            </motion.article>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
