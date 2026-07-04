import type { ReactNode } from 'react'

type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'neutral'

interface BadgeProps {
  tone?: BadgeTone
  children: ReactNode
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  primary: 'bg-primary-soft text-primary-deep',
  success: 'bg-nature/15 text-[#2e7d3c]',
  warning: 'bg-sunset/20 text-[#9a5b12]',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-ink/5 text-ink-soft',
}

export function Badge({ tone = 'neutral', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  )
}
