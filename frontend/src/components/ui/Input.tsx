import type { InputHTMLAttributes, Ref } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  ref?: Ref<HTMLInputElement>
}

const INPUT_CLASSES =
  'w-full rounded-2xl border-2 border-sky-light bg-white px-4 py-2.5 text-sm text-ink ' +
  'placeholder:text-ink-soft/60 transition-colors duration-150 ' +
  'hover:border-sky focus:border-primary focus:outline-none ' +
  'aria-invalid:border-danger'

export function Input({ className = '', ...rest }: InputProps) {
  return <input className={`${INPUT_CLASSES} ${className}`} {...rest} />
}
