import type { HTMLAttributes, ReactNode } from 'react'

interface SurfaceCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  /** Adds hover lift + glow, for interactive cards. */
  isInteractive?: boolean
}

const CARD_CLASSES =
  'rounded-card bg-white p-6 shadow-[0_10px_30px_-12px_rgb(37_87_214/0.25)] ' +
  'border border-sky-light/60'

const INTERACTIVE_CLASSES =
  ' transition-[transform,box-shadow] duration-300 ease-out ' +
  'hover:-translate-y-1 hover:shadow-[0_18px_40px_-12px_rgb(37_87_214/0.35),0_0_0_3px_rgb(62_230_240/0.2)]'

export function SurfaceCard({
  children,
  className = '',
  isInteractive = false,
  ...rest
}: SurfaceCardProps) {
  const classes = CARD_CLASSES + (isInteractive ? INTERACTIVE_CLASSES : '')
  return (
    <div className={`${classes} ${className}`} {...rest}>
      {children}
    </div>
  )
}
