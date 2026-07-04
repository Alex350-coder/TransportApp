import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { AREQUIPA, LIMA } from '@/test/fixtures'

import { TripSearchForm } from './TripSearchForm'

function renderForm(children?: ReactNode) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<TripSearchForm />} />
          <Route path="/reservar" element={<p>Página de resultados</p>} />
        </Routes>
        {children}
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

function mockCitiesFetch() {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify({ success: true, data: [LIMA, AREQUIPA], error: null }), {
      status: 200,
    }),
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('TripSearchForm', () => {
  test('requires both cities before searching', async () => {
    mockCitiesFetch()
    const user = userEvent.setup()
    renderForm()

    await user.click(screen.getByRole('button', { name: 'Buscar viajes' }))

    expect(
      await screen.findByText('Elige la ciudad de origen y de destino.'),
    ).toBeInTheDocument()
  })

  test('rejects identical origin and destination', async () => {
    mockCitiesFetch()
    const user = userEvent.setup()
    renderForm()

    await screen.findAllByRole('option', { name: 'Lima' })
    await user.selectOptions(screen.getByLabelText(/Origen/), 'Lima')
    await user.selectOptions(screen.getByLabelText('Destino'), 'Lima')
    await user.click(screen.getByRole('button', { name: 'Buscar viajes' }))

    expect(
      await screen.findByText('El origen y el destino deben ser distintos.'),
    ).toBeInTheDocument()
  })

  test('navigates to /reservar with the chosen params', async () => {
    mockCitiesFetch()
    const user = userEvent.setup()
    renderForm()

    await screen.findAllByRole('option', { name: 'Lima' })
    await user.selectOptions(screen.getByLabelText(/Origen/), 'Lima')
    await user.selectOptions(screen.getByLabelText('Destino'), 'Arequipa')
    await user.click(screen.getByRole('button', { name: 'Buscar viajes' }))

    expect(await screen.findByText('Página de resultados')).toBeInTheDocument()
  })
})
