interface SpinnerProps {
  label?: string
}

export function Spinner({ label = 'Cargando…' }: SpinnerProps) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-10 text-ink-soft">
      <span
        aria-hidden="true"
        className="size-6 animate-spin rounded-full border-[3px] border-sky-light border-t-primary"
      />
      <span className="text-sm font-medium">{label}</span>
    </div>
  )
}
