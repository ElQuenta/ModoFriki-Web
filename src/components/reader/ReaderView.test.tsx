import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Chapter, Series } from '@/types'
import { ReaderView } from './ReaderView'

vi.mock('@/hooks/useLibrary', () => ({
  useLibrary: () => ({ getProgress: () => undefined, updateProgress: vi.fn() }),
}))
vi.mock('@/services/reading', () => ({
  recordReadEvent: vi.fn(async () => ({ counted: true })),
}))
vi.mock('@/services/catalog', () => ({ getChapter: vi.fn() }))
vi.mock('@/components/detail/CommentSection', () => ({ CommentSection: () => null }))

const series = {
  id: 'w1',
  slug: 'obra',
  title: 'Obra',
  alternativeTitles: [],
  coverUrl: '',
  bannerUrl: '',
  type: 'Manhwa',
  synopsis: '',
  genres: [],
} as Series
const chapter: Chapter = {
  id: 'c1',
  seriesId: 'w1',
  number: '1',
  title: 'Inicio',
  releaseDate: '2026-01-01T00:00:00.000Z',
  pages: [1, 2, 3].map((n) => ({
    id: `p${n}`,
    pageNumber: n,
    imageUrl: `https://blob.test/p${n}.png`,
  })),
}
const pageImages = () =>
  screen.queryAllByRole('img', { name: /^Página \d del capítulo 1$/ })

beforeAll(() => {
  // jsdom no implementa estas APIs del navegador.
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    },
  )
  window.scrollTo = vi.fn()
  Element.prototype.scrollIntoView = vi.fn()
})
beforeEach(() => localStorage.clear())

const renderReader = () =>
  render(
    <MemoryRouter>
      <ReaderView series={series} chapter={chapter} chapters={[chapter]} />
    </MemoryRouter>,
  )

describe('ReaderView: modo de lectura', () => {
  it('en cascada muestra todas las páginas y en paginado una sola', () => {
    renderReader()
    expect(pageImages()).toHaveLength(3)
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar modo de lectura' }))
    expect(pageImages()).toHaveLength(1)
    expect(
      screen.getByRole('img', { name: 'Página 1 del capítulo 1' }),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar modo de lectura' }))
    expect(pageImages()).toHaveLength(3)
  })

  it('en paginado avanza con "Página siguiente" y recuerda el modo', () => {
    const { unmount } = renderReader()
    fireEvent.click(screen.getByRole('button', { name: 'Cambiar modo de lectura' }))
    fireEvent.click(screen.getAllByRole('button', { name: 'Página siguiente' })[0])
    expect(
      screen.getByRole('img', { name: 'Página 2 del capítulo 1' }),
    ).toBeInTheDocument()
    unmount()
    renderReader()
    expect(pageImages()).toHaveLength(1)
  })
})
