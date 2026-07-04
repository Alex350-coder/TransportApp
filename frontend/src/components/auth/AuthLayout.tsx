import type { ReactNode } from 'react'

import { PictureFallback } from '@/components/ui/PictureFallback'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
}

/** Split card: form on the left, brand art on the right. */
export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="grid overflow-hidden rounded-card shadow-[0_24px_50px_-20px_rgb(27_63_168/0.35)] md:grid-cols-2">
        <div className="bg-white p-8 sm:p-10">
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-ink-soft">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
        <div className="relative hidden md:block">
          <PictureFallback
            name="Segundo_frame"
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-primary-deep/70 to-transparent"
          />
          <p className="absolute bottom-8 left-8 max-w-[220px] font-display text-2xl font-extrabold text-white">
            Conecta tu mundo con RUTEX
          </p>
        </div>
      </div>
    </div>
  )
}
