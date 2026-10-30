import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Field } from './Field'

describe('Field', () => {
  it('associates label, hint, and error with its control', () => {
    const { rerender } = render(
      <Field label="Nombre" hint="Usa tu nombre público">
        <input />
      </Field>,
    )
    const input = screen.getByRole('textbox', { name: 'Nombre' })
    const hintId = input.getAttribute('aria-describedby')
    expect(hintId).toBeTruthy()
    expect(document.getElementById(hintId!)).toHaveTextContent('Usa tu nombre público')
    expect(input).toHaveAttribute('aria-describedby', hintId)

    rerender(<Field label="Nombre" error="Campo obligatorio"><input /></Field>)
    const errored = screen.getByRole('textbox', { name: 'Nombre' })
    const errorId = errored.getAttribute('aria-describedby')
    expect(errored).toHaveAttribute('aria-invalid', 'true')
    expect(document.getElementById(errorId!)).toHaveTextContent('Campo obligatorio')
  })
})
