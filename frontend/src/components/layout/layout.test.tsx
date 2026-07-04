import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, test } from 'vitest'

import { AuthProvider } from '@/lib/auth-context'

import { Footer } from './Footer'
import { ProtectedRoute } from './ProtectedRoute'
import { RootLayout } from './RootLayout'

describe('Footer', () => {
  test('shows service links and the demo disclaimer', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    )

    expect(screen.getByRole('navigation', { name: 'Servicios' })).toBeInTheDocument()
    expect(screen.getByText(/Proyecto de demostración/)).toBeInTheDocument()
  })
})

describe('ProtectedRoute', () => {
  test('redirects anonymous visitors to /ingresar preserving next', () => {
    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/mi-cuenta']}>
          <Routes>
            <Route
              path="/mi-cuenta"
              element={
                <ProtectedRoute>
                  <p>Contenido privado</p>
                </ProtectedRoute>
              }
            />
            <Route path="/ingresar" element={<p>Página de ingreso</p>} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(screen.getByText('Página de ingreso')).toBeInTheDocument()
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()
  })
})

describe('RootLayout', () => {
  test('renders navbar, page content and footer', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Routes>
            <Route element={<RootLayout />}>
              <Route index element={<p>Contenido de la página</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    )

    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
    expect(screen.getByText('Contenido de la página')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })
})
