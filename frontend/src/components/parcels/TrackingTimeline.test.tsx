import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { TRACKED_SHIPMENT } from '@/test/fixtures'

import { TrackingTimeline } from './TrackingTimeline'

describe('TrackingTimeline', () => {
  test('shows the tracking code and the route', () => {
    render(<TrackingTimeline shipment={TRACKED_SHIPMENT} />)

    expect(screen.getByText('RTX-ENV-XY12ZW')).toBeInTheDocument()
    expect(screen.getByText('Lima → Arequipa')).toBeInTheDocument()
  })

  test('lists every tracking event with its description', () => {
    render(<TrackingTimeline shipment={TRACKED_SHIPMENT} />)

    const history = screen.getByRole('list', { name: 'Historial de eventos' })
    expect(history).toHaveTextContent('Encomienda registrada en agencia RUTEX.')
    expect(history).toHaveTextContent('Encomienda en tránsito hacia su destino.')
  })

  test('marks progress steps up to the current status', () => {
    render(<TrackingTimeline shipment={TRACKED_SHIPMENT} />)

    const steps = screen.getByRole('list', { name: 'Progreso del envío' })
    expect(steps).toHaveTextContent('Registrado')
    expect(steps).toHaveTextContent('En tránsito')
    expect(steps).toHaveTextContent('Entregado')
  })
})
