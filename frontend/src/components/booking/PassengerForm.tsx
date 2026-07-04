import { zodResolver } from '@hookform/resolvers/zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import type { BookingSeat } from '@/types/api'

const passengerSchema = z.object({
  seat_number: z.number(),
  passenger_name: z
    .string()
    .trim()
    .min(3, 'Escribe el nombre completo del pasajero.')
    .max(150, 'El nombre es demasiado largo.'),
  passenger_document: z
    .string()
    .trim()
    .regex(/^[0-9A-Za-z-]{6,20}$/, 'Ingresa un DNI o documento válido (6 a 20 caracteres).'),
})

const passengersSchema = z.object({
  passengers: z.array(passengerSchema).min(1),
})

type PassengersFormValues = z.infer<typeof passengersSchema>

interface PassengerFormProps {
  seatNumbers: number[]
  isSubmitting: boolean
  onSubmit: (seats: BookingSeat[]) => void
  onBack: () => void
}

export function PassengerForm({ seatNumbers, isSubmitting, onSubmit, onBack }: PassengerFormProps) {
  const form = useForm<PassengersFormValues>({
    resolver: zodResolver(passengersSchema),
    defaultValues: {
      passengers: seatNumbers.map((seatNumber) => ({
        seat_number: seatNumber,
        passenger_name: '',
        passenger_document: '',
      })),
    },
  })
  const { fields } = useFieldArray({ control: form.control, name: 'passengers' })

  return (
    <form
      onSubmit={form.handleSubmit((values) => onSubmit(values.passengers))}
      className="flex flex-col gap-6"
      aria-label="Datos de los pasajeros"
    >
      {fields.map((field, index) => {
        const errors = form.formState.errors.passengers?.[index]
        return (
          <fieldset
            key={field.id}
            className="rounded-card border border-sky-light/60 bg-white p-5"
          >
            <legend className="px-2 font-display text-sm font-bold text-primary-deep">
              Asiento {field.seat_number}
            </legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nombre completo" error={errors?.passenger_name?.message}>
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    placeholder="Ej. Ana Torres Ríos"
                    autoComplete="name"
                    {...form.register(`passengers.${index}.passenger_name`)}
                  />
                )}
              </Field>
              <Field label="DNI o documento" error={errors?.passenger_document?.message}>
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    placeholder="Ej. 45128799"
                    inputMode="numeric"
                    {...form.register(`passengers.${index}.passenger_document`)}
                  />
                )}
              </Field>
            </div>
          </fieldset>
        )
      })}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack}>
          ← Cambiar asientos
        </Button>
        <Button type="submit" size="lg" isLoading={isSubmitting}>
          Confirmar y pagar (simulado)
        </Button>
      </div>
    </form>
  )
}
