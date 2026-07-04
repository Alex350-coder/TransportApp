import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { AuthLayout } from './AuthLayout'

describe('AuthLayout', () => {
  test('renders title, subtitle and form content', () => {
    render(
      <AuthLayout title="Crea tu cuenta" subtitle="Guarda tus viajes.">
        <p>Formulario</p>
      </AuthLayout>,
    )

    expect(screen.getByRole('heading', { name: 'Crea tu cuenta' })).toBeInTheDocument()
    expect(screen.getByText('Guarda tus viajes.')).toBeInTheDocument()
    expect(screen.getByText('Formulario')).toBeInTheDocument()
  })
})
