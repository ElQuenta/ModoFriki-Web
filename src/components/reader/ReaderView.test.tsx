import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Chapter, Series } from '@/types'
import { ReaderView } from './ReaderView'
import { recordReadEvent } from '@/services/reading'

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
beforeEach(() => {
  localStorage.clear()
  vi.mocked(recordReadEvent).mockClear()
})

const renderReader = (readerSeries = series) =>
  render(
    <MemoryRouter>
      <ReaderView series={readerSeries} chapter={chapter} chapters={[chapter]} />
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

  it('shows the chapter banner before pages in both modes without changing page progress or read events', () => {
    renderReader({ ...series, chapterBannerUrl: 'https://assets.test/chapter-banner.png' })
    const banner = screen.getByRole('img', { name: 'Banner del capítulo 1' })
    expect(banner).toHaveAttribute('src', 'https://assets.test/chapter-banner.png')
    expect(banner.compareDocumentPosition(screen.getByRole('img', { name: 'Página 1 del capítulo 1' })) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')
    expect(screen.getAllByText(/1\s*\/\s*3/).length).toBeGreaterThan(0)
    expect(recordReadEvent).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Cambiar modo de lectura' }))
    expect(screen.getByRole('img', { name: 'Banner del capítulo 1' })).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')
    expect(pageImages()).toHaveLength(1)
    expect(recordReadEvent).toHaveBeenCalledTimes(1)
  })
})
