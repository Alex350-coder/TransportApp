/** Catalog queries: cities and trip search. */
import { useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api-client'
import type { City, Paginated, Trip } from '@/types/api'

export function useCities() {
  return useQuery({
    queryKey: ['cities'],
    queryFn: () => apiFetch<City[]>('/cities/'),
    staleTime: Infinity,
  })
}

export interface TripSearchParams {
  origin?: string
  destination?: string
  date?: string
}

export function useTripSearch(params: TripSearchParams, options: { enabled?: boolean } = {}) {
  const query = new URLSearchParams()
  if (params.origin) query.set('origin', params.origin)
  if (params.destination) query.set('destination', params.destination)
  if (params.date) query.set('date', params.date)
  const queryString = query.toString()

  return useQuery({
    queryKey: ['trips', queryString],
    queryFn: () => apiFetch<Paginated<Trip>>(`/trips/?${queryString}`),
    enabled: options.enabled ?? true,
  })
}
