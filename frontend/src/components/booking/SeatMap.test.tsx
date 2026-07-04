import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import type { SeatMap as SeatMapData } from '@/types/api'

import { SeatMap } from './SeatMap'

const SEAT_MAP: SeatMapData = {
  trip_id: 1,
  layout: { rows: 2, cols: 4, aisle_after_col: 2 },
  seats_total: 8,
  taken: [3],
}

describe('SeatMap', () => {
  test('renders one accessible button per seat with its state', () => {
    render(<SeatMap seatMap={SEAT_MAP} selected={[5]} onToggle={() => {}} />)

    expect(screen.getByRole('button', { name: 'Asiento 1, libre' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Asiento 3, ocupado' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Asiento 5, seleccionado' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
  })

  test('invokes onToggle when clicking a free seat', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<SeatMap seatMap={SEAT_MAP} selected={[]} onToggle={onToggle} />)

    await user.click(screen.getByRole('button', { name: 'Asiento 2, libre' }))

    expect(onToggle).toHaveBeenCalledWith(2)
  })

  test('does not toggle taken seats', async () => {
    const onToggle = vi.fn()
    const user = userEvent.setup()
    render(<SeatMap seatMap={SEAT_MAP} selected={[]} onToggle={onToggle} />)

    await user.click(screen.getByRole('button', { name: 'Asiento 3, ocupado' }))

    expect(onToggle).not.toHaveBeenCalled()
  })
})
