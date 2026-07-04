import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'

import { TrackingTimeline } from '@/components/parcels/TrackingTimeline'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useTracking } from '@/hooks/use-parcels'

export function RastrearPage() {
  const { code: codeParam } = useParams<{ code?: string }>()
  const navigate = useNavigate()
  const [inputCode, setInputCode] = useState(codeParam ?? '')
  const activeCode = codeParam?.trim().toUpperCase() ?? ''
  const tracking = useTracking(activeCode)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const cleaned = inputCode.trim().toUpperCase()
    if (cleaned) navigate(`/rastrear/${cleaned}`)
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-extrabold text-ink sm:text-4xl">Rastrea tu encomienda</h1>
      <p className="mt-2 text-ink-soft">
        Ingresa el código que recibiste al registrar el envío (ej.{' '}
        <code className="rounded bg-primary-soft px-1.5 py-0.5 font-mono text-xs text-primary-deep">
          RTX-ENV-AB12CD
        </code>
        ).
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex items-end gap-3" aria-label="Buscar envío">
        <div className="flex-1">
          <Field label="Código de rastreo">
            {(fieldProps) => (
              <Input
                {...fieldProps}
                value={inputCode}
                onChange={(event) => setInputCode(event.target.value)}
                placeholder="RTX-ENV-…"
                autoCapitalize="characters"
                spellCheck={false}
              />
            )}
          </Field>
        </div>
        <Button type="submit" size="lg">
          Rastrear
        </Button>
      </form>

      <div className="mt-8">
        {tracking.isLoading && <Spinner label="Buscando tu encomienda…" />}
        {tracking.isError && (
          <Alert tone="error">
            No encontramos un envío con el código <strong>{activeCode}</strong>. Revisa que esté
            escrito exactamente como te lo entregamos.
          </Alert>
        )}
        {tracking.data && <TrackingTimeline shipment={tracking.data} />}
        {!activeCode && !tracking.data && (
          <EmptyState
            icon="🔍"
            title="Aún no buscas ningún envío"
            description="Escribe tu código RTX-ENV arriba para ver el estado y el historial completo."
          />
        )}
      </div>
    </div>
  )
}
