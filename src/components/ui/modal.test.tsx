import { useState, type ReactNode } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Modal } from './modal'

function ModalHarness({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Abrir diálogo
      </button>
      <button type="button">Control externo</button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Confirmar acción"
        description="Revisa antes de continuar."
      >
        {children ?? <button type="button">Último control</button>}
      </Modal>
    </>
  )
}

describe('Modal', () => {
  it('moves focus into the dialog, traps it, and restores it after Escape', async () => {
    render(
      <ModalHarness>
        <button type="button">Primer control</button>
        <button type="button">Último control</button>
      </ModalHarness>,
    )

    const opener = screen.getByRole('button', { name: 'Abrir diálogo' })
    opener.focus()
    fireEvent.click(opener)

    const dialog = screen.getByRole('dialog', { name: 'Confirmar acción' })
    const close = screen.getByRole('button', { name: 'Cerrar' })
    const last = screen.getByRole('button', { name: 'Último control' })
    expect(dialog).toHaveAttribute('aria-describedby')
    expect(close).toHaveFocus()

    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true })
    expect(last).toHaveFocus()
    fireEvent.keyDown(window, { key: 'Tab' })
    expect(close).toHaveFocus()

    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => expect(opener).toHaveFocus())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('keeps keyboard focus inside when focus starts outside the dialog', () => {
    render(<ModalHarness />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir diálogo' }))
    const outside = screen.getByRole('button', { name: 'Control externo' })
    const close = screen.getByRole('button', { name: 'Cerrar' })

    outside.focus()
    fireEvent.keyDown(window, { key: 'Tab' })

    expect(close).toHaveFocus()
  })
})
