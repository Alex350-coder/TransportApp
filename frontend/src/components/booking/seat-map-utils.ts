/** Pure helpers for rendering the bus seat map. */

export interface SeatLayout {
  rows: number
  cols: number
  aisle_after_col: number
}

export type SeatState = 'free' | 'taken' | 'selected'

export function seatNumberAt(layout: SeatLayout, row: number, col: number): number {
  return (row - 1) * layout.cols + col
}

export function seatState(
  seatNumber: number,
  taken: number[],
  selected: number[],
): SeatState {
  if (taken.includes(seatNumber)) return 'taken'
  if (selected.includes(seatNumber)) return 'selected'
  return 'free'
}

export function toggleSeat(selected: number[], seatNumber: number, maxSeats: number): number[] {
  if (selected.includes(seatNumber)) {
    return selected.filter((number) => number !== seatNumber)
  }
  if (selected.length >= maxSeats) return selected
  return [...selected, seatNumber].sort((a, b) => a - b)
}

export const SEAT_STATE_LABELS: Record<SeatState, string> = {
  free: 'libre',
  taken: 'ocupado',
  selected: 'seleccionado',
}
