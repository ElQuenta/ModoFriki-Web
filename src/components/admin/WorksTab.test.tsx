import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Series } from '@/types'

const state = vi.hoisted(() => ({ pageOne: [] as Series[], listWorks: vi.fn() }))
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'admin-1', role: 'ADMIN' } }) }))
vi.mock('@/hooks/useAsync', () => ({ useAsync: () => ({ data: state.pageOne, loading: false, error: undefined, reload: vi.fn(), setData: vi.fn() }) }))
vi.mock('@/services/catalog', () => ({ listWorks: (...args: unknown[]) => state.listWorks(...args) }))
vi.mock('@/services/admin', () => ({ createWork: vi.fn(), deleteWork: vi.fn(), updateWork: vi.fn() }))
vi.mock('@/components/admin/WorkForm', () => ({ WorkForm: () => null }))
vi.mock('@/components/admin/ChaptersPanel', () => ({ ChaptersPanel: () => null }))

import { WorksTab } from './WorksTab'

const work = (id: string): Series => ({
  id, slug: id, title: `Obra ${id}`, alternativeTitles: [], coverUrl: '', bannerUrl: '',
  type: 'Manga', status: 'En emisión', publicationStatus: 'PUBLISHED', synopsis: '', genres: [],
})

describe('WorksTab continuation', () => {
  beforeEach(() => {
    state.pageOne = Array.from({ length: 100 }, (_, index) => work(`p1-${index}`))
    state.listWorks.mockReset()
  })

  it('loads pages after the first 100 works without dropping earlier rows', async () => {
    state.listWorks.mockResolvedValue(Array.from({ length: 21 }, (_, index) => work(`p2-${index}`)))
    render(<MemoryRouter><WorksTab /></MemoryRouter>)
    expect(screen.getAllByText('Obra p1-0').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Cargar más' }))
    await waitFor(() => expect(screen.getAllByText('Obra p2-20').length).toBeGreaterThan(0))
    expect(screen.getAllByText('Obra p1-0').length).toBeGreaterThan(0)
    expect(state.listWorks).toHaveBeenCalledWith(expect.objectContaining({ page: 2, limit: 100, includeDrafts: true }))
  })
})
