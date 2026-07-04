interface LogoProps {
  /** Wordmark next to the icon. */
  withWordmark?: boolean
  className?: string
}

export function Logo({ withWordmark = true, className = '' }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 64 64" className="size-9" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="#2557D6" />
        <text
          x="32"
          y="45"
          fontFamily="Sora Variable, Sora, sans-serif"
          fontSize="38"
          fontWeight="800"
          fill="#FFFFFF"
          textAnchor="middle"
        >
          R
        </text>
        <rect x="10" y="52" width="44" height="4" rx="2" fill="#3EE6F0" />
      </svg>
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span className="font-display text-lg font-extrabold tracking-wide text-primary-deep">
            RUTEX
          </span>
          <span className="text-[0.6rem] font-semibold tracking-[0.28em] text-ink-soft uppercase">
            Transportes
          </span>
        </span>
      )}
    </span>
  )
}
