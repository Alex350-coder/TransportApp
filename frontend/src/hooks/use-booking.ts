/** Booking queries and mutations. */
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { nextPageParam } from '@/hooks/use-catalog'
import { apiFetch } from '@/lib/api-client'
import type { Booking, BookingSeat, Paginated, SeatMap } from '@/types/api'

const SEAT_MAP_REFRESH_MS = 20_000

export function useSeatMap(tripId: number | null) {
  return useQuery({
    queryKey: ['seat-map', tripId],
    queryFn: () => apiFetch<SeatMap>(`/trips/${tripId}/seats/`),
    enabled: tripId !== null,
    refetchInterval: SEAT_MAP_REFRESH_MS,
    staleTime: 0,
  })
}

export interface CreateBookingInput {
  trip: number
  seats: BookingSeat[]
}

export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateBookingInput) =>
      apiFetch<Booking>('/bookings/', { method: 'POST', body: input }),
    onSettled: (_data, _error, input) => {
      // Success or seat conflict: the seat map may have changed either way.
      queryClient.invalidateQueries({ queryKey: ['seat-map', input.trip] })
    },
  })
}

export function useMyBookings(enabled: boolean) {
  return useInfiniteQuery({
    queryKey: ['bookings', 'mine'],
    queryFn: ({ pageParam }) =>
      apiFetch<Paginated<Booking>>(`/bookings/mine/?page=${pageParam}`),
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled,
  })
}

export function useBooking(code: string | undefined) {
  return useQuery({
    queryKey: ['bookings', code],
    queryFn: () => apiFetch<Booking>(`/bookings/${code}/`),
    enabled: Boolean(code),
  })
}
