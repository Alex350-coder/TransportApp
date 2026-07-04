import { useId, type ReactNode } from 'react'

interface FieldProps {
  label: string
  error?: string
  hint?: string
  children: (props: {
    id: string
    'aria-invalid': boolean
    'aria-describedby': string | undefined
  }) => ReactNode
}

/** Accessible label + control + error wiring for form inputs. */
export function Field({ label, error, hint, children }: FieldProps) {
  const id = useId()
  const messageId = `${id}-message`
  const hasMessage = Boolean(error || hint)

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': hasMessage ? messageId : undefined,
      })}
      {hasMessage && (
        <p
          id={messageId}
          className={`text-xs ${error ? 'font-medium text-danger' : 'text-ink-soft'}`}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  )
}
