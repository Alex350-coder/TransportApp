import { describe, expect, test } from 'vitest'

import { formatDuration, formatPrice } from './format'

describe('formatPrice', () => {
  test('formats string amounts as Peruvian soles', () => {
    expect(formatPrice('95.00')).toMatch(/S\/\s?95\.00/)
  })

  test('formats numeric amounts', () => {
    expect(formatPrice(39.5)).toMatch(/S\/\s?39\.50/)
  })
})

describe('formatDuration', () => {
  test('renders hours and minutes', () => {
    expect(formatDuration(990)).toBe('16 h 30 min')
  })

  test('renders exact hours without minutes', () => {
    expect(formatDuration(120)).toBe('2 h')
  })

  test('renders short trips as minutes only', () => {
    expect(formatDuration(45)).toBe('45 min')
  })
})
