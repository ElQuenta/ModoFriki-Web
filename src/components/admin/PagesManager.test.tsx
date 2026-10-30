import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { PagesManager } from './PagesManager'
import type { Chapter } from '@/types'
import { ApiError } from '@/lib/api'

const services = vi.hoisted(() => ({ reorderPages: vi.fn(), getChapter: vi.fn() }))
vi.mock('@/services/admin', () => ({
  insertPages: vi.fn(), reorderPages: services.reorderPages, replacePages: vi.fn(), validateImages: vi.fn(() => undefined),
}))
vi.mock('@/services/catalog', () => ({ getChapter: services.getChapter }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const chapter: Chapter = {
  id: 'chapter-1', seriesId: 'work-1', number: '1.250', title: 'Test', kind: 'NORMAL',
  status: 'PUBLISHED', version: 7, releaseDate: '2026-01-01T00:00:00.000Z',
  pages: [
    { id: 'page-1', pageNumber: 1, imageUrl: '/one.jpg' },
    { id: 'page-2', pageNumber: 2, imageUrl: '/two.jpg' },
  ],
}

describe('PagesManager', () => {
  it('requires explicit confirmation before replacing all pages', () => {
    render(<PagesManager workId="work-1" chapter={chapter} onChange={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Reemplazar todas' }))
    expect(screen.getByRole('group', { name: 'Confirmar reemplazo de páginas' })).toBeInTheDocument()
  })

  it('refreshes the chapter version after 409 and keeps the local page order', async () => {
    services.reorderPages.mockReset().mockRejectedValueOnce(new ApiError('Conflicto', 409)).mockResolvedValue({ ...chapter, version: 9 })
    services.getChapter.mockReset().mockResolvedValue({ ...chapter, version: 8 })
    const onChange = vi.fn()
    function Harness() {
      const [current, setCurrent] = useState(chapter)
      return <PagesManager workId="work-1" chapter={current} onChange={(next) => { onChange(next); setCurrent(next) }} />
    }
    render(<Harness />)
    fireEvent.click(screen.getByRole('button', { name: 'Bajar la página 1' }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar orden' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/conservamos tus cambios/)
    expect(services.reorderPages).toHaveBeenCalledWith('work-1', 'chapter-1', ['page-2', 'page-1'], 7)
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ version: 8 }))
    fireEvent.click(screen.getByRole('button', { name: 'Guardar orden' }))
    await waitFor(() => expect(services.reorderPages).toHaveBeenLastCalledWith('work-1', 'chapter-1', ['page-2', 'page-1'], 8))
  })
})
