import type { ReactNode, Ref, SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  ref?: Ref<HTMLSelectElement>
  children: ReactNode
}

const SELECT_CLASSES =
  'w-full appearance-none rounded-2xl border-2 border-sky-light bg-white px-4 py-2.5 pr-10 ' +
  'text-sm text-ink transition-colors duration-150 hover:border-sky ' +
  'focus:border-primary focus:outline-none aria-invalid:border-danger'

export function Select({ className = '', children, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select className={`${SELECT_CLASSES} ${className}`} {...rest}>
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 fill-none stroke-ink-soft stroke-2"
      >
        <path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}
