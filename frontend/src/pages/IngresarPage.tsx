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

const loginSchema = z.object({
  email: z.email('Ingresa un correo válido.'),
  password: z.string().min(1, 'Escribe tu contraseña.'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function IngresarPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })
  const errors = form.formState.errors
  const next = searchParams.get('next') ?? '/mi-cuenta'

  const handleSubmit = form.handleSubmit(async (values) => {
    setServerError('')
    try {
      await login(values.email, values.password)
      navigate(next, { replace: true })
    } catch (error: unknown) {
      if (error instanceof ApiRequestError && error.status === 401) {
        setServerError('Correo o contraseña incorrectos.')
        return
      }
      setServerError(
        error instanceof ApiRequestError
          ? error.message
          : 'No pudimos iniciar tu sesión. Inténtalo de nuevo.',
      )
    }
  })

  return (
    <AuthLayout title="¡Hola de nuevo!" subtitle="Ingresa para ver tus viajes y envíos.">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" aria-label="Iniciar sesión">
        {serverError && <Alert tone="error">{serverError}</Alert>}

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

        <Field label="Contraseña" error={errors.password?.message}>
          {(fieldProps) => (
            <div className="relative">
              <Input
                {...fieldProps}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                className="pr-20"
                {...form.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-bold text-primary"
                aria-pressed={showPassword}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          )}
        </Field>

        <Button type="submit" size="lg" isLoading={form.formState.isSubmitting}>
          Ingresar
        </Button>

        <p className="text-center text-sm text-ink-soft">
          ¿Aún no tienes cuenta?{' '}
          <Link
            to={`/registrarse?next=${encodeURIComponent(next)}`}
            className="font-semibold text-primary"
          >
            Regístrate gratis
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
