import { describe, expect, test } from 'vitest'

import { seatNumberAt, seatState, toggleSeat } from './seat-map-utils'

const LAYOUT = { rows: 10, cols: 4, aisle_after_col: 2 }

describe('seatNumberAt', () => {
  test('numbers seats row-major starting at 1', () => {
    expect(seatNumberAt(LAYOUT, 1, 1)).toBe(1)
    expect(seatNumberAt(LAYOUT, 1, 4)).toBe(4)
    expect(seatNumberAt(LAYOUT, 2, 1)).toBe(5)
    expect(seatNumberAt(LAYOUT, 10, 4)).toBe(40)
  })
})

describe('seatState', () => {
  test('taken wins over free', () => {
    expect(seatState(7, [7], [])).toBe('taken')
  })

  test('selected seats are reported as selected', () => {
    expect(seatState(3, [7], [3])).toBe('selected')
  })

  test('otherwise free', () => {
    expect(seatState(1, [7], [3])).toBe('free')
  })
})

describe('toggleSeat', () => {
  test('adds a seat keeping the list sorted', () => {
    expect(toggleSeat([5], 2, 6)).toEqual([2, 5])
  })

  test('removes an already selected seat', () => {
    expect(toggleSeat([2, 5], 5, 6)).toEqual([2])
  })

  test('does not mutate the original selection', () => {
    const selected = [2]
    toggleSeat(selected, 5, 6)
    expect(selected).toEqual([2])
  })

  test('ignores additions beyond the seat limit', () => {
    expect(toggleSeat([1, 2, 3], 4, 3)).toEqual([1, 2, 3])
  })
})
