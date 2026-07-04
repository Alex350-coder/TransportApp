import { describe, expect, test } from 'vitest'

import { safeInternalPath } from './navigation'

describe('safeInternalPath', () => {
  test('accepts app-internal absolute paths', () => {
    expect(safeInternalPath('/reservar?origin=1', '/mi-cuenta')).toBe('/reservar?origin=1')
  })

  test('falls back for external URLs', () => {
    expect(safeInternalPath('https://evil.example', '/mi-cuenta')).toBe('/mi-cuenta')
  })

  test('falls back for protocol-relative URLs', () => {
    expect(safeInternalPath('//evil.example', '/mi-cuenta')).toBe('/mi-cuenta')
  })

  test('falls back for null', () => {
    expect(safeInternalPath(null, '/mi-cuenta')).toBe('/mi-cuenta')
  })
})
