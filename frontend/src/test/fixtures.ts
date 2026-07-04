/** Shared test fixtures mirroring API payloads. */
import type { Booking, City, TrackedShipment, Trip } from '@/types/api'

export const LIMA: City = { id: 1, name: 'Lima', region: 'Lima' }
export const AREQUIPA: City = { id: 2, name: 'Arequipa', region: 'Arequipa' }

export const TRIP: Trip = {
  id: 10,
  route: {
    id: 5,
    origin: LIMA,
    destination: AREQUIPA,
    distance_km: 1010,
    duration_minutes: 960,
  },
  bus: { id: 3, model: 'Scania Touring', seat_rows: 10, seat_cols: 4, aisle_after_col: 2 },
  departure_at: '2026-08-01T08:00:00-05:00',
  arrival_at: '2026-08-02T00:00:00-05:00',
  price: '95.00',
  status: 'scheduled',
  seats_total: 40,
  seats_taken: 2,
}

export const BOOKING: Booking = {
  id: 1,
  code: 'RTX-AB2CD3',
  status: 'confirmed',
  total: '190.00',
  created_at: '2026-07-04T10:00:00-05:00',
  trip: TRIP,
  seats: [
    { seat_number: 1, passenger_name: 'Ana Torres', passenger_document: '45128799' },
    { seat_number: 2, passenger_name: 'Luis Quispe', passenger_document: '41887702' },
  ],
}

export const TRACKED_SHIPMENT: TrackedShipment = {
  tracking_code: 'RTX-ENV-XY12ZW',
  status: 'in_transit',
  status_label: 'En tránsito',
  origin: LIMA,
  destination: AREQUIPA,
  created_at: '2026-07-01T09:00:00-05:00',
  events: [
    {
      status: 'registered',
      status_label: 'Registrado',
      description: 'Encomienda registrada en agencia RUTEX.',
      location: 'Lima',
      created_at: '2026-07-01T09:00:00-05:00',
    },
    {
      status: 'in_transit',
      status_label: 'En tránsito',
      description: 'Encomienda en tránsito hacia su destino.',
      location: '',
      created_at: '2026-07-02T08:00:00-05:00',
    },
  ],
}
