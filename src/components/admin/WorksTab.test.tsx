import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Series } from '@/types'

const state = vi.hoisted(() => ({ pageOne: [] as Series[], listWorks: vi.fn(), updateWork: vi.fn(), latestVersion: 'v1' }))
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: 'admin-1', role: 'ADMIN' } }) }))
vi.mock('@/hooks/useAsync', async () => {
  const React = await import('react')
  return { useAsync: () => {
    const [revision, setRevision] = React.useState(0)
    const data = state.pageOne.map((item) => ({ ...item, updatedAt: revision ? state.latestVersion : item.updatedAt }))
    return { data, loading: false, error: undefined, reload: () => setRevision((value) => value + 1), setData: vi.fn() }
  } }
})
vi.mock('@/services/catalog', () => ({ listWorks: (...args: unknown[]) => state.listWorks(...args) }))
vi.mock('@/services/admin', () => ({ createWork: vi.fn(), deleteWork: vi.fn(), updateWork: (...args: unknown[]) => state.updateWork(...args) }))
vi.mock('@/components/admin/WorkForm', () => ({ WorkForm: ({ work, onSubmit }: { work?: Series; onSubmit: (input: never, files: never) => Promise<void> }) => <div><span data-testid="form-version">{work?.updatedAt}</span><button type="button" onClick={() => void onSubmit({} as never, {} as never)}>Simular guardar</button></div> }))
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
    state.updateWork.mockReset()
    state.latestVersion = 'v1'
  })

  it('loads pages after the first 100 works without dropping earlier rows', async () => {
    state.listWorks.mockResolvedValue(Array.from({ length: 21 }, (_, index) => work(`p2-${index}`)))
    render(<MemoryRouter><WorksTab /></MemoryRouter>)
    expect(screen.getAllByText('Obra p1-0').length).toBeGreaterThan(0)
    fireEvent.click(screen.getByRole('button', { name: 'Cargar más' }))
    await waitFor(() => expect(screen.getAllByText('Obra p2-20').length).toBeGreaterThan(0))
    expect(screen.getAllByText('Obra p1-0').length).toBeGreaterThan(0)
    expect(state.listWorks).toHaveBeenCalledWith(expect.objectContaining({ page: 2, limit: 100, includeDrafts: true }))
  }, 10000)

  it('keeps the edit form mounted and uses the refreshed version after a 409', async () => {
    const { ApiError } = await import('@/lib/api')
    state.pageOne = [{ ...work('conflict'), updatedAt: 'v0' }]
    state.latestVersion = 'v1'
    state.updateWork.mockRejectedValueOnce(new ApiError('Conflicto', 409)).mockResolvedValue({ ...state.pageOne[0], updatedAt: 'v2' })
    render(<MemoryRouter><WorksTab /></MemoryRouter>)
    fireEvent.click(screen.getByRole('button', { name: 'Editar Obra conflict' }))
    expect(screen.getByTestId('form-version')).toHaveTextContent('v0')
    fireEvent.click(screen.getByRole('button', { name: 'Simular guardar' }))
    await waitFor(() => expect(screen.getByTestId('form-version')).toHaveTextContent('v1'))
    fireEvent.click(screen.getByRole('button', { name: 'Simular guardar' }))
    await waitFor(() => expect(state.updateWork).toHaveBeenLastCalledWith('conflict', {}, {}, 'v1'))
  })
})
