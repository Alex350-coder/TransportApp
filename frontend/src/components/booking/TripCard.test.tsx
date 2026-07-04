import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { TRIP } from '@/test/fixtures'

import { TripCard } from './TripCard'

describe('TripCard', () => {
  test('shows route, availability and price', () => {
    render(<TripCard trip={TRIP} onSelect={() => {}} />)

    expect(screen.getByText(/Lima → Arequipa/)).toBeInTheDocument()
    expect(screen.getByText('38 asientos libres')).toBeInTheDocument()
    expect(screen.getByText(/95\.00/)).toBeInTheDocument()
  })

  test('selecting the trip passes it to the callback', async () => {
    const onSelect = vi.fn()
    const user = userEvent.setup()
    render(<TripCard trip={TRIP} onSelect={onSelect} />)

    await user.click(screen.getByRole('button', { name: 'Elegir asientos' }))

    expect(onSelect).toHaveBeenCalledWith(TRIP)
  })

  test('sold out trips disable the CTA and warn', () => {
    render(<TripCard trip={{ ...TRIP, seats_taken: 40 }} onSelect={() => {}} />)

    expect(screen.getByRole('button', { name: 'Elegir asientos' })).toBeDisabled()
    expect(screen.getByText('Agotado')).toBeInTheDocument()
  })

  test('low availability shows the urgency badge', () => {
    render(<TripCard trip={{ ...TRIP, seats_taken: 37 }} onSelect={() => {}} />)

    expect(screen.getByText('Últimos 3 asientos')).toBeInTheDocument()
  })
})
