import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createWorkMediaSlot } from '@/services/work-media'
import { WorkImageField } from './WorkImageField'

describe('WorkImageField preview fallback', () => {
  it('distinguishes a failed persisted preview from a missing media reference', () => {
    const onSelect = vi.fn()
    const persisted = createWorkMediaSlot({ id: 'cover', url: '/cover.png' })
    const { rerender } = render(<WorkImageField label="Portada" slot={persisted} onSelect={onSelect} />)

    fireEvent.error(screen.getByRole('img', { name: 'Vista previa: Portada' }))
    expect(screen.getByRole('status')).toHaveTextContent('La referencia guardada sigue disponible.')

    const absent = createWorkMediaSlot(null)
    rerender(<WorkImageField label="Banner de ficha" slot={absent} onSelect={onSelect} />)
    expect(screen.getByRole('status')).toHaveTextContent('Sin medio guardado ni vista previa.')
  })
})
