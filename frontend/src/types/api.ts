/** Shared API types mirroring the backend serializers. */

export interface ApiError {
  detail: string
  code: string
  fields?: Record<string, string[]> | null
}

export interface Envelope<T> {
  success: boolean
  data: T | null
  error: ApiError | null
}

export interface Paginated<T> {
  items: T[]
  meta: {
    total: number
    page: number
    pages: number
    page_size: number
  }
}

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  phone: string
}

export interface City {
  id: number
  name: string
  region: string
}

export interface RouteInfo {
  id: number
  origin: City
  destination: City
  distance_km: number
  duration_minutes: number
}

export interface BusInfo {
  id: number
  model: string
  seat_rows: number
  seat_cols: number
  aisle_after_col: number
}

export type TripStatus = 'scheduled' | 'cancelled' | 'completed'

export interface Trip {
  id: number
  route: RouteInfo
  bus: BusInfo
  departure_at: string
  arrival_at: string
  price: string
  status: TripStatus
  seats_total: number
  seats_taken: number
}

export interface SeatMap {
  trip_id: number
  layout: {
    rows: number
    cols: number
    aisle_after_col: number
  }
  seats_total: number
  taken: number[]
}

export interface BookingSeat {
  seat_number: number
  passenger_name: string
  passenger_document: string
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled'

export interface Booking {
  id: number
  code: string
  status: BookingStatus
  total: string
  created_at: string
  trip: Trip
  seats: BookingSeat[]
}

export type ShipmentStatus = 'registered' | 'in_transit' | 'at_destination' | 'delivered'

export interface Quote {
  price: string
  currency: string
  estimated_days: number
}

export interface Shipment {
  id: number
  tracking_code: string
  status: ShipmentStatus
  status_label: string
  origin: City
  destination: City
  weight_kg: string
  price: string
  recipient_name: string
  created_at: string
}

export interface TrackingEvent {
  status: ShipmentStatus
  status_label: string
  description: string
  location: string
  created_at: string
}

export interface TrackedShipment {
  tracking_code: string
  status: ShipmentStatus
  status_label: string
  origin: City
  destination: City
  created_at: string
  events: TrackingEvent[]
}

export interface TokenPair {
  access: string
  refresh: string
}
