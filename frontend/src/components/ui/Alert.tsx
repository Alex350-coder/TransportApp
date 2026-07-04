import type { ReactNode } from 'react'

type AlertTone = 'error' | 'info' | 'success'

interface AlertProps {
  tone?: AlertTone
  children: ReactNode
}

const TONE_CLASSES: Record<AlertTone, string> = {
  error: 'border-danger/30 bg-danger/8 text-danger',
  info: 'border-primary/25 bg-primary-soft text-primary-deep',
  success: 'border-nature/30 bg-nature/10 text-[#2e7d3c]',
}

export function Alert({ tone = 'info', children }: AlertProps) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-2xl border-2 px-4 py-3 text-sm font-medium ${TONE_CLASSES[tone]}`}
    >
      {children}
    </div>
  )
}
