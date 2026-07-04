import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'

import { Field } from './Field'
import { Input } from './Input'

describe('Field', () => {
  test('associates label and control', () => {
    render(<Field label="Correo electrónico">{(props) => <Input {...props} />}</Field>)

    expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument()
  })

  test('wires the error message via aria-describedby and aria-invalid', () => {
    render(
      <Field label="Correo" error="Ingresa un correo válido.">
        {(props) => <Input {...props} />}
      </Field>,
    )

    const input = screen.getByLabelText('Correo')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    const messageId = input.getAttribute('aria-describedby')
    expect(messageId).toBeTruthy()
    expect(document.getElementById(messageId!)).toHaveTextContent('Ingresa un correo válido.')
  })

  test('shows the hint when there is no error', () => {
    render(
      <Field label="Peso" hint="Máximo 50 kg.">
        {(props) => <Input {...props} />}
      </Field>,
    )

    expect(screen.getByText('Máximo 50 kg.')).toBeInTheDocument()
    expect(screen.getByLabelText('Peso')).toHaveAttribute('aria-invalid', 'false')
  })
})
