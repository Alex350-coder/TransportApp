import { zodResolver } from '@hookform/resolvers/zod'
import { motion, useReducedMotion } from 'motion/react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router'
import { z } from 'zod'

import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useCities } from '@/hooks/use-catalog'
import { useCreateShipment, useQuoteParcel } from '@/hooks/use-parcels'
import { ApiRequestError } from '@/lib/api-client'
import { useAuth } from '@/lib/auth-context'
import { easeOutExpo } from '@/lib/motion'
import { formatPrice } from '@/lib/format'
import type { Quote, Shipment } from '@/types/api'

const MIN_WEIGHT_KG = 0.1
const MAX_WEIGHT_KG = 50

const shipmentSchema = z
  .object({
    origin: z.string().min(1, 'Elige la ciudad de origen.'),
    destination: z.string().min(1, 'Elige la ciudad de destino.'),
    weight_kg: z.coerce
      .number({ message: 'Ingresa el peso en kilogramos.' })
      .min(MIN_WEIGHT_KG, `El peso mínimo es ${MIN_WEIGHT_KG} kg.`)
      .max(MAX_WEIGHT_KG, `El peso máximo es ${MAX_WEIGHT_KG} kg.`),
    recipient_name: z.string().trim().min(3, 'Escribe el nombre del destinatario.'),
    recipient_document: z
      .string()
      .trim()
      .regex(/^[0-9A-Za-z-]{6,20}$/, 'Ingresa un documento válido (6 a 20 caracteres).'),
    recipient_phone: z.string().trim().max(20, 'El teléfono es demasiado largo.').optional(),
  })
  .refine((values) => values.origin !== values.destination, {
    message: 'El origen y el destino deben ser distintos.',
    path: ['destination'],
  })

// z.coerce makes input (raw form strings) and output (parsed numbers) differ.
type ShipmentFormInput = z.input<typeof shipmentSchema>
type ShipmentFormOutput = z.output<typeof shipmentSchema>

export function EncomiendasPage() {
  const { data: cities } = useCities()
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  const quoteMutation = useQuoteParcel()
  const createShipment = useCreateShipment()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [created, setCreated] = useState<Shipment | null>(null)
  const [submitError, setSubmitError] = useState('')
  const [isCopied, setIsCopied] = useState(false)

  const form = useForm<ShipmentFormInput, unknown, ShipmentFormOutput>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      origin: '',
      destination: '',
      weight_kg: undefined,
      recipient_name: '',
      recipient_document: '',
      recipient_phone: '',
    },
  })
  const errors = form.formState.errors

  const handleQuote = async () => {
    const isValid = await form.trigger(['origin', 'destination', 'weight_kg'])
    if (!isValid) return
    const values = form.getValues()
    setSubmitError('')
    quoteMutation.mutate(
      {
        origin: Number(values.origin),
        destination: Number(values.destination),
        weight_kg: String(values.weight_kg),
      },
      {
        onSuccess: setQuote,
        onError: (error) => {
          setQuote(null)
          setSubmitError(
            error instanceof ApiRequestError
              ? flattenFieldErrors(error) ?? error.message
              : 'No pudimos cotizar tu envío. Inténtalo de nuevo.',
          )
        },
      },
    )
  }

  const handleSubmit = form.handleSubmit((values) => {
    setSubmitError('')
    createShipment.mutate(
      {
        origin: Number(values.origin),
        destination: Number(values.destination),
        weight_kg: String(values.weight_kg),
        recipient_name: values.recipient_name,
        recipient_document: values.recipient_document,
        recipient_phone: values.recipient_phone || undefined,
      },
      {
        onSuccess: (shipment) => setCreated(shipment),
        onError: (error) => {
          setSubmitError(
            error instanceof ApiRequestError
              ? flattenFieldErrors(error) ?? error.message
              : 'No pudimos registrar tu envío. Inténtalo de nuevo.',
          )
        },
      },
    )
  })

  const handleCopy = async () => {
    if (!created) return
    await navigator.clipboard.writeText(created.tracking_code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2_000)
  }

  if (created) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOutExpo }}
          className="rounded-card border border-sky-light/70 bg-white p-8 text-center shadow-[0_24px_50px_-20px_rgb(27_63_168/0.35)]"
        >
          <p className="text-4xl" aria-hidden="true">
            📦
          </p>
          <h1 className="mt-3 text-3xl font-extrabold text-ink">¡Encomienda registrada!</h1>
          <p className="mt-2 text-ink-soft">
            Guarda este código: con él cualquier persona puede rastrear el envío.
          </p>
          <div className="mx-auto mt-6 flex max-w-sm items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-primary/30 bg-primary-soft px-5 py-4">
            <span className="font-display text-xl font-extrabold tracking-wider text-primary-deep">
              {created.tracking_code}
            </span>
            <Button variant="secondary" onClick={handleCopy}>
              {isCopied ? '¡Copiado!' : 'Copiar'}
            </Button>
          </div>
          <p className="mt-4 text-sm text-ink-soft">
            Precio: <strong className="text-primary">{formatPrice(created.price)}</strong> ·
            Destinatario: <strong>{created.recipient_name}</strong>
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Button size="lg" onClick={() => navigate(`/rastrear/${created.tracking_code}`)}>
              Rastrear ahora
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                setCreated(null)
                setQuote(null)
                form.reset()
              }}
            >
              Enviar otra
            </Button>
          </div>
        </motion.div>
      </div>
    )
  }

  const loginNext = encodeURIComponent(location.pathname + location.search)

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Envía tu encomienda</h1>
      <p className="mt-2 max-w-xl text-ink-soft">
        Cotiza al instante y registra tu envío. El destinatario lo recoge en la agencia de destino.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6" aria-label="Registrar encomienda">
          <fieldset className="rounded-card border border-sky-light/70 bg-white p-6">
            <legend className="px-2 font-display text-sm font-bold text-primary-deep">
              1 · Ruta y peso
            </legend>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Origen" error={errors.origin?.message}>
                {(fieldProps) => (
                  <Select {...fieldProps} {...form.register('origin')}>
                    <option value="">Ciudad</option>
                    {cities?.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Destino" error={errors.destination?.message}>
                {(fieldProps) => (
                  <Select {...fieldProps} {...form.register('destination')}>
                    <option value="">Ciudad</option>
                    {cities?.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Field>
              <Field label="Peso (kg)" error={errors.weight_kg?.message}>
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    type="number"
                    step="0.1"
                    min={MIN_WEIGHT_KG}
                    max={MAX_WEIGHT_KG}
                    placeholder="Ej. 4.5"
                    {...form.register('weight_kg')}
                  />
                )}
              </Field>
            </div>
            <div className="mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handleQuote}
                isLoading={quoteMutation.isPending}
              >
                Cotizar precio
              </Button>
            </div>
          </fieldset>

          <fieldset className="rounded-card border border-sky-light/70 bg-white p-6">
            <legend className="px-2 font-display text-sm font-bold text-primary-deep">
              2 · Destinatario
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre completo" error={errors.recipient_name?.message}>
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    placeholder="Ej. Jorge Huamán"
                    autoComplete="off"
                    {...form.register('recipient_name')}
                  />
                )}
              </Field>
              <Field label="DNI o documento" error={errors.recipient_document?.message}>
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    placeholder="Ej. 45128799"
                    inputMode="numeric"
                    {...form.register('recipient_document')}
                  />
                )}
              </Field>
              <Field label="Teléfono (opcional)" error={errors.recipient_phone?.message}>
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    type="tel"
                    placeholder="Ej. 988 777 666"
                    {...form.register('recipient_phone')}
                  />
                )}
              </Field>
            </div>
          </fieldset>

          {submitError && <Alert tone="error">{submitError}</Alert>}

          {user ? (
            <Button type="submit" size="lg" isLoading={createShipment.isPending}>
              Registrar envío
            </Button>
          ) : (
            <div className="flex flex-col items-start gap-2">
              <Button type="button" size="lg" onClick={() => navigate(`/ingresar?next=${loginNext}`)}>
                Inicia sesión para enviar
              </Button>
              <p className="text-xs text-ink-soft">
                La cotización no requiere cuenta; el registro del envío sí.{' '}
                <Link to={`/registrarse?next=${loginNext}`} className="font-semibold text-primary">
                  Crear cuenta
                </Link>
              </p>
            </div>
          )}
        </form>

        <aside className="h-fit">
          {quote ? (
            <motion.div
              key={quote.price}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: easeOutExpo }}
              className="rounded-card bg-gradient-to-br from-primary to-primary-deep p-7 text-white shadow-[0_24px_50px_-20px_rgb(27_63_168/0.6)]"
            >
              <p className="text-sm font-semibold tracking-widest text-white/70 uppercase">
                Precio estimado
              </p>
              <p className="mt-1 font-display text-4xl font-extrabold">{formatPrice(quote.price)}</p>
              <p className="mt-3 text-sm text-white/85">
                Entrega estimada:{' '}
                <strong>
                  {quote.estimated_days} {quote.estimated_days === 1 ? 'día' : 'días'}
                </strong>
              </p>
              <p className="mt-4 border-t border-white/20 pt-3 text-xs text-white/70">
                El precio final se confirma al registrar el envío. Peso máximo {MAX_WEIGHT_KG} kg.
              </p>
            </motion.div>
          ) : (
            <div className="rounded-card border-2 border-dashed border-sky-light bg-white/60 p-7 text-center text-sm text-ink-soft">
              <p className="text-3xl" aria-hidden="true">
                🧮
              </p>
              <p className="mt-2">
                Completa la ruta y el peso, luego pulsa <strong>Cotizar precio</strong> para ver el
                costo al instante.
              </p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function flattenFieldErrors(error: ApiRequestError): string | null {
  if (!error.fields) return null
  const messages = Object.values(error.fields).flat()
  return messages.length > 0 ? messages.join(' ') : null
}
