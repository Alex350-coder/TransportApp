import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'

import { AuthLayout } from '@/components/auth/AuthLayout'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { ApiRequestError } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import { safeInternalPath } from '@/lib/navigation'

const MIN_PASSWORD_LENGTH = 8

const registerSchema = z
  .object({
    first_name: z.string().trim().min(2, 'Escribe tus nombres.'),
    last_name: z.string().trim().min(2, 'Escribe tus apellidos.'),
    email: z.email('Ingresa un correo válido.'),
    phone: z.string().trim().max(20, 'El teléfono es demasiado largo.').optional(),
    password: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `Usa al menos ${MIN_PASSWORD_LENGTH} caracteres.`),
    password_confirm: z.string(),
  })
  .refine((values) => values.password === values.password_confirm, {
    message: 'Las contraseñas no coinciden.',
    path: ['password_confirm'],
  })

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegistrarsePage() {
  const { register: registerAccount } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [serverError, setServerError] = useState('')

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      password_confirm: '',
    },
  })
  const errors = form.formState.errors
  const next = safeInternalPath(searchParams.get('next'), '/mi-cuenta')

  const handleSubmit = form.handleSubmit(async (values) => {
    setServerError('')
    try {
      await registerAccount({
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone || undefined,
        password: values.password,
      })
      navigate(next, { replace: true })
    } catch (error: unknown) {
      if (error instanceof ApiRequestError && error.fields) {
        // Surface backend field errors (e.g. duplicate email, weak password).
        for (const [field, messages] of Object.entries(error.fields)) {
          if (field === 'email' || field === 'password' || field === 'phone') {
            form.setError(field, { message: messages.join(' ') })
          }
        }
        setServerError('Revisa los campos marcados.')
        return
      }
      setServerError(
        error instanceof ApiRequestError
          ? error.message
          : 'No pudimos crear tu cuenta. Inténtalo de nuevo.',
      )
    }
  })

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Guarda tus viajes y encomiendas en un solo lugar."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label="Crear cuenta">
        {serverError && <Alert tone="error">{serverError}</Alert>}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nombres" error={errors.first_name?.message}>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                autoComplete="given-name"
                placeholder="Ana"
                {...form.register('first_name')}
              />
            )}
          </Field>
          <Field label="Apellidos" error={errors.last_name?.message}>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                autoComplete="family-name"
                placeholder="Torres Ríos"
                {...form.register('last_name')}
              />
            )}
          </Field>
        </div>

        <Field label="Correo electrónico" error={errors.email?.message}>
          {(fieldProps) => (
            <Input
              {...fieldProps}
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              {...form.register('email')}
            />
          )}
        </Field>

        <Field label="Teléfono (opcional)" error={errors.phone?.message}>
          {(fieldProps) => (
            <Input
              {...fieldProps}
              type="tel"
              autoComplete="tel"
              placeholder="988 777 666"
              {...form.register('phone')}
            />
          )}
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contraseña" error={errors.password?.message}>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...form.register('password')}
              />
            )}
          </Field>
          <Field label="Repite la contraseña" error={errors.password_confirm?.message}>
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                {...form.register('password_confirm')}
              />
            )}
          </Field>
        </div>

        <Button type="submit" size="lg" isLoading={form.formState.isSubmitting}>
          Crear cuenta
        </Button>

        <p className="text-center text-sm text-ink-soft">
          ¿Ya tienes cuenta?{' '}
          <Link
            to={`/ingresar?next=${encodeURIComponent(next)}`}
            className="font-semibold text-primary"
          >
            Ingresa aquí
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
