import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { getAccessToken, setTokens } from './api-client'
import { AuthProvider, useAuth } from './auth-context'

const USER = {
  id: 1,
  email: 'ana@example.com',
  first_name: 'Ana',
  last_name: 'Torres',
  phone: '',
}

function envelope(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({ success: status < 400, data, error: null }), { status })
}

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useAuth', () => {
  test('throws when used outside the provider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used inside')
  })

  test('starts logged out when no token is stored', () => {
    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.user).toBeNull()
    expect(result.current.isLoading).toBe(false)
  })

  test('login stores tokens and loads the profile', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(envelope({ access: 'acc-1', refresh: 'ref-1' }))
      .mockResolvedValueOnce(envelope(USER))

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(() => result.current.login('ana@example.com', 'secreta-123'))

    expect(result.current.user?.first_name).toBe('Ana')
    expect(getAccessToken()).toBe('acc-1')
  })

  test('logout clears the session', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(envelope({ access: 'acc-1', refresh: 'ref-1' }))
      .mockResolvedValueOnce(envelope(USER))

    const { result } = renderHook(() => useAuth(), { wrapper })
    await act(() => result.current.login('ana@example.com', 'secreta-123'))
    act(() => result.current.logout())

    expect(result.current.user).toBeNull()
    expect(getAccessToken()).toBeNull()
  })

  test('restores the session from a stored token on mount', async () => {
    setTokens({ access: 'acc-9', refresh: 'ref-9' })
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(envelope(USER))

    const { result } = renderHook(() => useAuth(), { wrapper })

    expect(result.current.isLoading).toBe(true)
    await waitFor(() => expect(result.current.user?.email).toBe('ana@example.com'))
    expect(result.current.isLoading).toBe(false)
  })
})
