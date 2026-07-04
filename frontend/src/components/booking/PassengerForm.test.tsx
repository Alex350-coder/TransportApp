import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { PassengerForm } from './PassengerForm'

describe('PassengerForm', () => {
  test('renders one fieldset per selected seat', () => {
    render(
      <PassengerForm seatNumbers={[3, 7]} isSubmitting={false} onSubmit={() => {}} onBack={() => {}} />,
    )

    expect(screen.getByRole('group', { name: 'Asiento 3' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Asiento 7' })).toBeInTheDocument()
  })

  test('validates passenger data in Spanish before submitting', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <PassengerForm seatNumbers={[3]} isSubmitting={false} onSubmit={onSubmit} onBack={() => {}} />,
    )

    await user.click(screen.getByRole('button', { name: 'Confirmar y pagar (simulado)' }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(await screen.findByText('Escribe el nombre completo del pasajero.')).toBeInTheDocument()
  })

  test('submits normalized passenger data per seat', async () => {
    const onSubmit = vi.fn()
    const user = userEvent.setup()
    render(
      <PassengerForm seatNumbers={[3]} isSubmitting={false} onSubmit={onSubmit} onBack={() => {}} />,
    )

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Torres Ríos')
    await user.type(screen.getByLabelText('DNI o documento'), '45128799')
    await user.click(screen.getByRole('button', { name: 'Confirmar y pagar (simulado)' }))

    expect(onSubmit).toHaveBeenCalledWith([
      { seat_number: 3, passenger_name: 'Ana Torres Ríos', passenger_document: '45128799' },
    ])
  })

  test('back button returns to seat selection', async () => {
    const onBack = vi.fn()
    const user = userEvent.setup()
    render(
      <PassengerForm seatNumbers={[3]} isSubmitting={false} onSubmit={() => {}} onBack={onBack} />,
    )

    await user.click(screen.getByRole('button', { name: '← Cambiar asientos' }))

    expect(onBack).toHaveBeenCalledOnce()
  })
})
