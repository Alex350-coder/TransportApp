/** Catalog queries: cities and trip search. */
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api-client'
import type { City, Paginated, Trip } from '@/types/api'

/** Next page number, or undefined when the API says we have everything. */
export function nextPageParam(lastPage: Paginated<unknown>): number | undefined {
  return lastPage.meta.page < lastPage.meta.pages ? lastPage.meta.page + 1 : undefined
}

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

  return useInfiniteQuery({
    queryKey: ['trips', queryString],
    queryFn: ({ pageParam }) => {
      const pageQuery = new URLSearchParams(query)
      pageQuery.set('page', String(pageParam))
      return apiFetch<Paginated<Trip>>(`/trips/?${pageQuery.toString()}`)
    },
    initialPageParam: 1,
    getNextPageParam: nextPageParam,
    enabled: options.enabled ?? true,
  })
}
