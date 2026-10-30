import { useState, type ReactNode } from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ConfirmDialog } from './confirm-dialog'
import { describe, expect, it, vi } from 'vitest'
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

  it('asks to discard dirty changes in the same dialog and can keep editing', async () => {
    function DirtyHarness() {
      const [open, setOpen] = useState(false)
      const [dirty, setDirty] = useState(true)
      const close = () => {
        if (dirty) return
        else setOpen(false)
      }
      return <>
        <button onClick={() => setOpen(true)}>Abrir</button>
        <Modal open={open} onClose={close} title="Editar" dirty={dirty}
          onKeepEditing={() => {}} onDiscardChanges={() => { setDirty(false); setOpen(false) }}>
          <input aria-label="Borrador" />
        </Modal>
      </>
    }
    render(<DirtyHarness />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.getByRole('dialog', { name: 'Editar' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Seguir editando' }))
    expect(screen.getByRole('textbox', { name: 'Borrador' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Descartar cambios' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('blocks Escape and outside close while confirmation is pending, then closes on success', async () => {
    let finish!: () => void
    const onConfirm = vi.fn(() => new Promise<void>((resolve) => { finish = resolve }))
    function ConfirmHarness() {
      const [open, setOpen] = useState(true)
      return <ConfirmDialog open={open} title="Borrar" description="Confirmar" onConfirm={onConfirm} onClose={() => setOpen(false)} />
    }
    render(<ConfirmHarness />)
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(screen.getByRole('button', { name: 'Procesando…' })).toBeDisabled()
    fireEvent.keyDown(window, { key: 'Escape' })
    fireEvent.mouseDown(screen.getByRole('dialog').parentElement!, { target: screen.getByRole('dialog').parentElement })
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    finish()
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
