import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import { MemoryRouter } from 'react-router'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { TRIP } from '@/test/fixtures'

import { CtaBanner } from './CtaBanner'
import { FeaturesSection } from './FeaturesSection'
import { Hero } from './Hero'
import { ParcelsSection } from './ParcelsSection'
import { RoutesSection } from './RoutesSection'

function renderWithProviders(children: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>,
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Hero', () => {
  test('shows the brand claim, CTAs and search widget', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ success: true, data: [], error: null })),
    )
    renderWithProviders(<Hero />)

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Conecta')
    expect(screen.getByRole('button', { name: 'Reservar asiento' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Enviar encomienda' })).toBeInTheDocument()
    expect(screen.getByRole('form', { name: 'Buscar viajes' })).toBeInTheDocument()
  })
})

describe('FeaturesSection', () => {
  test('lists the four product pillars', () => {
    renderWithProviders(<FeaturesSection />)

    expect(screen.getByText('Reservas en línea')).toBeInTheDocument()
    expect(screen.getByText('Encomiendas seguras')).toBeInTheDocument()
    expect(screen.getByText('Rastreo en vivo')).toBeInTheDocument()
    expect(screen.getByText('Puntualidad real')).toBeInTheDocument()
  })
})

describe('RoutesSection', () => {
  test('renders one card per distinct route', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: { items: [TRIP], meta: { total: 1, page: 1, pages: 1, page_size: 20 } },
          error: null,
        }),
      ),
    )
    renderWithProviders(<RoutesSection />)

    expect(await screen.findByText(/Arequipa/)).toBeInTheDocument()
    expect(screen.getByText(/16 h de viaje/)).toBeInTheDocument()
  })

  test('renders nothing when there are no trips', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          success: true,
          data: { items: [], meta: { total: 0, page: 1, pages: 1, page_size: 20 } },
          error: null,
        }),
      ),
    )
    const { container } = renderWithProviders(<RoutesSection />)

    await vi.waitFor(() => expect(container.querySelector('section')).toBeNull())
  })
})

describe('ParcelsSection', () => {
  test('shows parcel selling points and CTAs', () => {
    renderWithProviders(<ParcelsSection />)

    expect(screen.getByRole('button', { name: 'Cotizar envío' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Rastrear encomienda' })).toBeInTheDocument()
  })
})

describe('CtaBanner', () => {
  test('invites to book and register', () => {
    renderWithProviders(<CtaBanner />)

    expect(screen.getByRole('button', { name: 'Reservar ahora' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear cuenta gratis' })).toBeInTheDocument()
  })
})
