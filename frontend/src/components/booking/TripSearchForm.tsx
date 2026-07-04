import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useCities } from '@/hooks/use-catalog'
import { todayISODate } from '@/lib/format'

interface TripSearchFormProps {
  initialOrigin?: string
  initialDestination?: string
  initialDate?: string
}

export function TripSearchForm({
  initialOrigin = '',
  initialDestination = '',
  initialDate = '',
}: TripSearchFormProps) {
  const navigate = useNavigate()
  const { data: cities, isLoading } = useCities()
  const [origin, setOrigin] = useState(initialOrigin)
  const [destination, setDestination] = useState(initialDestination)
  const [date, setDate] = useState(initialDate || todayISODate())
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (!origin || !destination) {
      setError('Elige la ciudad de origen y de destino.')
      return
    }
    if (origin === destination) {
      setError('El origen y el destino deben ser distintos.')
      return
    }
    setError('')
    navigate(`/reservar?origin=${origin}&destination=${destination}&date=${date}`)
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Buscar viajes"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto] lg:items-end"
    >
      <Field label="Origen" error={error || undefined}>
        {(fieldProps) => (
          <Select
            {...fieldProps}
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            disabled={isLoading}
          >
            <option value="">¿Desde dónde viajas?</option>
            {cities?.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Destino">
        {(fieldProps) => (
          <Select
            {...fieldProps}
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            disabled={isLoading}
          >
            <option value="">¿A dónde vas?</option>
            {cities?.map((city) => (
              <option key={city.id} value={city.id}>
                {city.name}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Fecha de viaje">
        {(fieldProps) => (
          <Input
            {...fieldProps}
            type="date"
            value={date}
            min={todayISODate()}
            onChange={(event) => setDate(event.target.value)}
          />
        )}
      </Field>
      <Button type="submit" size="lg" className="w-full lg:w-auto">
        Buscar viajes
      </Button>
    </form>
  )
}
