import { afterEach, describe, expect, test, vi } from 'vitest'

import { ApiRequestError, apiFetch, getAccessToken, setTokens } from './api-client'

function envelopeResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('apiFetch', () => {
  test('unwraps the data field of successful envelopes', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      envelopeResponse({ success: true, data: [{ id: 1, name: 'Lima' }], error: null }),
    )

    const cities = await apiFetch<{ id: number; name: string }[]>('/cities/')

    expect(cities).toEqual([{ id: 1, name: 'Lima' }])
  })

  test('throws ApiRequestError with Spanish detail on API errors', async () => {
    // A Response body can only be read once, so mint a fresh one per call.
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      envelopeResponse(
        {
          success: false,
          data: null,
          error: { detail: 'El asiento 7 ya fue reservado.', code: 'seat_taken', fields: null },
        },
        409,
      ),
    )

    const failing = apiFetch('/bookings/', { method: 'POST', body: {} })

    await expect(failing).rejects.toThrowError(ApiRequestError)
    await expect(
      apiFetch('/bookings/', { method: 'POST', body: {} }),
    ).rejects.toMatchObject({ code: 'seat_taken', status: 409 })
  })

  test('attaches the access token as Bearer header', async () => {
    setTokens({ access: 'token-abc', refresh: 'refresh-xyz' })
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(envelopeResponse({ success: true, data: {}, error: null }))

    await apiFetch('/auth/me/')

    const init = fetchSpy.mock.calls[0][1] as RequestInit
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer token-abc')
  })

  test('refreshes the token and retries once on 401', async () => {
    setTokens({ access: 'expired', refresh: 'refresh-ok' })
    const fetchSpy = vi
      .spyOn(globalThis, 'fetch')
      // 1) original request rejected
      .mockResolvedValueOnce(
        envelopeResponse(
          { success: false, data: null, error: { detail: 'Token inválido', code: 'token_not_valid' } },
          401,
        ),
      )
      // 2) refresh succeeds
      .mockResolvedValueOnce(
        envelopeResponse({
          success: true,
          data: { access: 'fresh-access', refresh: 'fresh-refresh' },
          error: null,
        }),
      )
      // 3) retried request succeeds
      .mockResolvedValueOnce(
        envelopeResponse({ success: true, data: { email: 'ana@example.com' }, error: null }),
      )

    const me = await apiFetch<{ email: string }>('/auth/me/')

    expect(me.email).toBe('ana@example.com')
    expect(fetchSpy).toHaveBeenCalledTimes(3)
    expect(getAccessToken()).toBe('fresh-access')
  })

  test('throws a network error in Spanish when fetch fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('failed'))

    await expect(apiFetch('/cities/')).rejects.toMatchObject({
      code: 'network_error',
    })
  })
})
