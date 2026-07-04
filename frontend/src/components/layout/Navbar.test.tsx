import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, test } from 'vitest'

import { AuthProvider } from '@/lib/auth-context'

import { Navbar } from './Navbar'

function renderNavbar() {
  return render(
    <AuthProvider>
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    </AuthProvider>,
  )
}

describe('Navbar', () => {
  test('shows the main navigation links in Spanish', () => {
    renderNavbar()

    const nav = screen.getByRole('navigation', { name: 'Navegación principal' })
    expect(nav).toHaveTextContent('Inicio')
    expect(nav).toHaveTextContent('Reservar')
    expect(nav).toHaveTextContent('Encomiendas')
    expect(nav).toHaveTextContent('Rastrear')
  })

  test('offers login when there is no session', () => {
    renderNavbar()

    expect(screen.getByRole('link', { name: 'Ingresar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument()
  })

  test('mobile menu toggles open and closed', async () => {
    const user = userEvent.setup()
    renderNavbar()

    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    await user.click(toggle)

    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
  })
})
