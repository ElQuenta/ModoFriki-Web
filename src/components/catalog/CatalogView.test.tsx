import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CatalogView } from './CatalogView'
import { clearCatalogPageCache } from './catalog-page-cache'

const { listWorks } = vi.hoisted(() => ({ listWorks: vi.fn() }))
vi.mock('@/services/catalog', () => ({ listWorks }))
vi.mock('@/services/discovery', () => ({ listPopularWorks: vi.fn() }))
vi.mock('@/hooks/useCatalog', () => ({
  useGenres: () => ({ data: [] }),
  useWorkTypes: () => ({ data: [] }),
}))
vi.mock('./SeriesCard', () => ({ SeriesCard: ({ series }: { series: { title: string } }) => <div>{series.title}</div> }))

const work = (id: number) => ({ id: String(id), title: `Obra ${id}` })

describe('CatalogView continuation', () => {
  beforeEach(() => {
    listWorks.mockReset()
    clearCatalogPageCache()
  })

  it('loads the next bounded batch without losing existing results when it fails', async () => {
    listWorks.mockImplementation((filters: { page?: number } = {}) => {
      if (filters.page === 1) return Promise.resolve(Array.from({ length: 20 }, (_, index) => work(index + 1)))
      return Promise.reject(new Error('fallo de continuación'))
    })
    render(<MemoryRouter initialEntries={['/series']}><Routes><Route path="/series" element={<CatalogView />} /></Routes></MemoryRouter>)
    expect(await screen.findByText('Obra 1')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cargar más' }))
    await waitFor(() => expect(listWorks).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2, limit: 20 })))
    expect(await screen.findByRole('status')).toHaveTextContent('No pudimos cargar los datos.')
    expect(screen.getByText('Obra 1')).toBeInTheDocument()
    expect(screen.getByText('Obra 20')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('does not invent a total and stops when a final batch is short', async () => {
    listWorks.mockImplementation(() => {
      return Promise.resolve(Array.from({ length: 7 }, (_, index) => work(index + 1)))
    })
    render(<MemoryRouter initialEntries={['/series']}><Routes><Route path="/series" element={<CatalogView />} /></Routes></MemoryRouter>)
    expect(await screen.findByText('Obra 7')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cargar más' })).not.toBeInTheDocument()
  })

  it('continues beyond 100 works in order and removes duplicate IDs', async () => {
    listWorks.mockImplementation(({ page = 1 }: { page?: number } = {}) => {
      const start = page === 1 ? 1 : page === 2 ? 20 : (page - 1) * 20
      const count = page === 7 ? 2 : 20
      return Promise.resolve(Array.from({ length: count }, (_, index) => work(start + index)))
    })
    render(<MemoryRouter initialEntries={['/series']}><Routes><Route path="/series" element={<CatalogView />} /></Routes></MemoryRouter>)
    expect(await screen.findByText('Obra 20')).toBeInTheDocument()
    for (let page = 2; page <= 7; page += 1) {
      fireEvent.click(screen.getByRole('button', { name: 'Cargar más' }))
      await waitFor(() => expect(listWorks).toHaveBeenCalledWith(expect.objectContaining({ page })))
    }
    await waitFor(() => expect(screen.getAllByText(/^Obra \d+$/)).toHaveLength(121))
    const titles = screen.getAllByText(/^Obra \d+$/).map((element) => element.textContent)
    expect(titles[0]).toBe('Obra 1')
    expect(titles[19]).toBe('Obra 20')
    expect(titles.at(-1)).toBe('Obra 121')
    expect(screen.queryByRole('button', { name: 'Cargar más' })).not.toBeInTheDocument()
  })
})
