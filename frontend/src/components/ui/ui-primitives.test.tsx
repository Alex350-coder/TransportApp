import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test, vi } from 'vitest'

import { Alert } from './Alert'
import { Badge } from './Badge'
import { Button } from './Button'
import { EmptyState } from './EmptyState'
import { Logo } from './Logo'
import { Select } from './Select'
import { Spinner } from './Spinner'
import { SurfaceCard } from './SurfaceCard'

describe('Button', () => {
  test('fires onClick', async () => {
    const onClick = vi.fn()
    const user = userEvent.setup()
    render(<Button onClick={onClick}>Reservar</Button>)

    await user.click(screen.getByRole('button', { name: 'Reservar' }))

    expect(onClick).toHaveBeenCalledOnce()
  })

  test('is disabled and non-interactive while loading', () => {
    render(<Button isLoading>Enviando</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  test('defaults to type=button to avoid accidental form submits', () => {
    render(<Button>Ok</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button')
  })
})

describe('Alert', () => {
  test('error tone announces as alert', () => {
    render(<Alert tone="error">Algo salió mal</Alert>)
    expect(screen.getByRole('alert')).toHaveTextContent('Algo salió mal')
  })

  test('info tone announces as status', () => {
    render(<Alert>Dato informativo</Alert>)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

describe('Badge', () => {
  test('renders its content', () => {
    render(<Badge tone="success">Confirmada</Badge>)
    expect(screen.getByText('Confirmada')).toBeInTheDocument()
  })
})

describe('Spinner', () => {
  test('is announced as status with a Spanish label', () => {
    render(<Spinner />)
    expect(screen.getByRole('status')).toHaveTextContent('Cargando…')
  })
})

describe('EmptyState', () => {
  test('renders title, description and action', () => {
    render(
      <EmptyState
        icon="🚌"
        title="Sin viajes"
        description="Aún no reservas."
        action={<a href="/reservar">Reservar</a>}
      />,
    )

    expect(screen.getByRole('heading', { name: 'Sin viajes' })).toBeInTheDocument()
    expect(screen.getByText('Aún no reservas.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Reservar' })).toBeInTheDocument()
  })
})

describe('Select', () => {
  test('renders options and supports selection', async () => {
    const user = userEvent.setup()
    render(
      <Select aria-label="Ciudad" defaultValue="">
        <option value="">Elige</option>
        <option value="1">Lima</option>
      </Select>,
    )

    await user.selectOptions(screen.getByLabelText('Ciudad'), 'Lima')

    expect(screen.getByLabelText('Ciudad')).toHaveValue('1')
  })
})

describe('SurfaceCard', () => {
  test('renders children', () => {
    render(<SurfaceCard isInteractive>Contenido</SurfaceCard>)
    expect(screen.getByText('Contenido')).toBeInTheDocument()
  })
})

describe('Logo', () => {
  test('shows the wordmark by default', () => {
    render(<Logo />)
    expect(screen.getByText('RUTEX')).toBeInTheDocument()
  })

  test('can hide the wordmark', () => {
    render(<Logo withWordmark={false} />)
    expect(screen.queryByText('RUTEX')).not.toBeInTheDocument()
  })
})
