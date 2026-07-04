/** Parcel queries and mutations. */
import { useMutation, useQuery } from '@tanstack/react-query'

import { apiFetch } from '@/lib/api-client'
import type { Paginated, Quote, Shipment, TrackedShipment } from '@/types/api'

export interface QuoteInput {
  origin: number
  destination: number
  weight_kg: string
}

export function useQuoteParcel() {
  return useMutation({
    mutationFn: (input: QuoteInput) =>
      apiFetch<Quote>('/parcels/quote/', { method: 'POST', body: input, anonymous: true }),
  })
}

export interface CreateShipmentInput extends QuoteInput {
  recipient_name: string
  recipient_document: string
  recipient_phone?: string
}

export function useCreateShipment() {
  return useMutation({
    mutationFn: (input: CreateShipmentInput) =>
      apiFetch<Shipment>('/parcels/', { method: 'POST', body: input }),
  })
}

export function useMyShipments(enabled: boolean) {
  return useQuery({
    queryKey: ['shipments', 'mine'],
    queryFn: () => apiFetch<Paginated<Shipment>>('/parcels/mine/'),
    enabled,
  })
}

export function useTracking(code: string) {
  return useQuery({
    queryKey: ['tracking', code],
    queryFn: () => apiFetch<TrackedShipment>(`/parcels/track/${code}/`, { anonymous: true }),
    enabled: code.length > 0,
    retry: false,
  })
}
