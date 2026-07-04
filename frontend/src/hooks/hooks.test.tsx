import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { AREQUIPA, LIMA, TRIP } from '@/test/fixtures'

import { useBooking, useCreateBooking, useMyBookings, useSeatMap } from './use-booking'
import { useCities, useTripSearch } from './use-catalog'
import { useMyShipments, useQuoteParcel, useTracking } from './use-parcels'
import { useReveal } from './use-reveal'

function wrapper({ children }: { children: ReactNode }) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

function mockEnvelope(data: unknown, status = 200) {
  return vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ success: status < 400, data, error: null }), { status }),
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('useCities', () => {
  test('loads the city list', async () => {
    mockEnvelope([LIMA, AREQUIPA])
    const { result } = renderHook(() => useCities(), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toHaveLength(2)
  })
})

describe('useTripSearch', () => {
  test('builds the query string from the search params', async () => {
    const fetchSpy = mockEnvelope({ items: [TRIP], meta: { total: 1, page: 1, pages: 1, page_size: 20 } })
    const { result } = renderHook(
      () => useTripSearch({ origin: '1', destination: '2', date: '2026-08-01' }),
      { wrapper },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const url = String(fetchSpy.mock.calls[0][0])
    expect(url).toContain('origin=1')
    expect(url).toContain('destination=2')
    expect(url).toContain('date=2026-08-01')
  })
})

describe('useSeatMap', () => {
  test('is disabled without a trip id', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { result } = renderHook(() => useSeatMap(null), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  test('loads the seat map for a trip', async () => {
    mockEnvelope({ trip_id: 10, layout: TRIP.bus, seats_total: 40, taken: [1] })
    const { result } = renderHook(() => useSeatMap(10), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.taken).toEqual([1])
  })
})

describe('useCreateBooking', () => {
  test('posts the booking payload', async () => {
    const fetchSpy = mockEnvelope({ code: 'RTX-AB2CD3' }, 201)
    const { result } = renderHook(() => useCreateBooking(), { wrapper })

    result.current.mutate({
      trip: 10,
      seats: [{ seat_number: 1, passenger_name: 'Ana', passenger_document: '45128799' }],
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    const [url, init] = fetchSpy.mock.calls[0]
    expect(String(url)).toContain('/bookings/')
    expect(init?.method).toBe('POST')
  })
})

describe('useMyBookings / useMyShipments', () => {
  test('stay idle until enabled', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    renderHook(() => useMyBookings(false), { wrapper })
    renderHook(() => useMyShipments(false), { wrapper })

    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('useBooking', () => {
  test('fetches a booking by code', async () => {
    mockEnvelope({ code: 'RTX-AB2CD3' })
    const { result } = renderHook(() => useBooking('RTX-AB2CD3'), { wrapper })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
  })
})

describe('useQuoteParcel', () => {
  test('returns the quote payload', async () => {
    mockEnvelope({ price: '69.00', currency: 'PEN', estimated_days: 2 })
    const { result } = renderHook(() => useQuoteParcel(), { wrapper })

    result.current.mutate({ origin: 1, destination: 2, weight_kg: '4.5' })

    await waitFor(() => expect(result.current.data?.price).toBe('69.00'))
  })
})

describe('useTracking', () => {
  test('is disabled for empty codes', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
    const { result } = renderHook(() => useTracking(''), { wrapper })

    expect(result.current.fetchStatus).toBe('idle')
    expect(fetchSpy).not.toHaveBeenCalled()
  })
})

describe('useReveal', () => {
  test('provides variants and viewport config', () => {
    const { result } = renderHook(() => useReveal())

    expect(result.current.item).toBeDefined()
    expect(result.current.container).toBeDefined()
    expect(result.current.viewport.once).toBe(true)
  })
})
