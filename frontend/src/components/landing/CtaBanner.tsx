import { motion } from 'motion/react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/Button'
import { useReveal } from '@/hooks/use-reveal'

export function CtaBanner() {
  const navigate = useNavigate()
  const { item, viewport } = useReveal()

  return (
    <section aria-labelledby="cta-heading" className="mx-auto max-w-6xl px-4 pb-24">
      <motion.div
        variants={item}
        initial="hidden"
        whileInView="visible"
        viewport={viewport}
        className="relative overflow-hidden rounded-[2rem] shadow-[0_30px_60px_-20px_rgb(27_63_168/0.5)]"
      >
        <picture>
          <source srcSet="/img/Segundo_frame.webp" type="image/webp" />
          <img
            src="/img/Segundo_frame.png"
            alt=""
            width={1600}
            height={900}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-primary-deep/90 via-primary-deep/60 to-transparent"
        />
        <div className="relative flex flex-col items-start gap-5 px-8 py-16 sm:px-12">
          <h2 id="cta-heading" className="max-w-md text-3xl font-extrabold text-white sm:text-4xl">
            Tu próximo destino está a un clic
          </h2>
          <p className="max-w-sm text-white/85">
            Crea tu cuenta y guarda tus viajes y envíos en un solo lugar.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => navigate('/reservar')}>
              Reservar ahora
            </Button>
            <Button
              size="lg"
              variant="ghost"
              className="!text-white hover:!bg-white/15"
              onClick={() => navigate('/registrarse')}
            >
              Crear cuenta gratis
            </Button>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
