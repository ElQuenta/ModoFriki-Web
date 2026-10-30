import { fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { CommentEditor } from './CommentEditor'

vi.mock('./CommentMarkdown', () => ({
  CommentMarkdown: ({ source }: { source: string }) => <div>{source}</div>,
}))

function setup(overrides: Partial<ComponentProps<typeof CommentEditor>> = {}) {
  const onSourceChange = vi.fn()
  const onSubmit = vi.fn()
  const onCancel = vi.fn()
  const props: ComponentProps<typeof CommentEditor> = {
    source: 'Hola',
    onSourceChange,
    onSubmit,
    onCancel,
    ...overrides,
  }
  render(<CommentEditor {...props} />)
  return { onSourceChange, onSubmit, onCancel }
}

describe('CommentEditor', () => {
  it('inserta formato en la selección conservando su contenido', () => {
    const { onSourceChange } = setup()
    const textarea = screen.getByRole('textbox', { name: 'Escribe un comentario' }) as HTMLTextAreaElement
    textarea.focus()
    textarea.setSelectionRange(0, 4)
    fireEvent.select(textarea)

    fireEvent.click(screen.getByRole('button', { name: 'Negrita' }))

    expect(onSourceChange).toHaveBeenCalledWith('**Hola**')
  })

  it('muestra la vista previa con el renderer compartido', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Vista previa' }))

    expect(screen.getByLabelText('Vista previa del comentario')).toHaveTextContent('Hola')
  })

  it('envía la fuente actual al callback de guardado', () => {
    const { onSubmit } = setup()
    fireEvent.click(screen.getByRole('button', { name: /Publicar/ }))

    expect(onSubmit).toHaveBeenCalledWith('Hola')
  })

  it('cuenta unidades UTF-16 y deshabilita publicación si excede el límite', () => {
    setup({ source: '😀'.repeat(5_001) })

    expect(screen.getByText('10.002 / 10 000 caracteres')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Publicar/ })).toBeDisabled()
  })

  it('permite exactamente 10 000 unidades UTF-16 y rechaza solo blanco', () => {
    setup({ source: 'x'.repeat(10_000) })
    expect(screen.getByRole('button', { name: /Publicar/ })).toBeEnabled()
  })

  it('solicita confirmación inline antes de descartar un borrador editado', () => {
    const { onCancel } = setup({ source: 'nuevo', initialSource: 'anterior' })
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))

    expect(onCancel).not.toHaveBeenCalled()
    expect(screen.getByRole('group', { name: 'Confirmar descarte' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Seguir editando' }))
    expect(screen.queryByRole('group', { name: 'Confirmar descarte' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Descartar cambios' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('conserva la fuente y bloquea acciones durante envío', () => {
    const { onSubmit, onSourceChange } = setup({ pending: true })

    expect(screen.getByRole('textbox', { name: 'Escribe un comentario' })).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: 'Negrita' }))
    fireEvent.click(screen.getByRole('button', { name: /Guardando/ }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(onSourceChange).not.toHaveBeenCalled()
  })
})
