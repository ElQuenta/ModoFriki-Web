import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ChaptersPanel } from './ChaptersPanel'
import type { Chapter, Series } from '@/types'

const mocks = vi.hoisted(() => ({
  role: 'ADMIN' as 'ADMIN' | 'EDITOR' | 'BASIC',
  deleteChapter: vi.fn(),
  getChapter: vi.fn(),
  setData: vi.fn(),
  reload: vi.fn(),
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'user-1', role: mocks.role } }),
}))

vi.mock('@/hooks/useAsync', () => ({
  useAsync: () => ({ data: [chapter], loading: false, error: undefined, reload: mocks.reload, setData: mocks.setData }),
}))

vi.mock('@/services/catalog', () => ({
  listChapters: vi.fn(),
  getChapter: mocks.getChapter,
}))

vi.mock('@/services/admin', () => ({
  createChapter: vi.fn(),
  updateChapter: vi.fn(),
  deleteChapter: mocks.deleteChapter,
}))

vi.mock('@/services/user-admin', () => ({
  userAdminGateway: {
    capabilities: { getManagementAccess: { available: false } },
    getManagementAccess: vi.fn(),
  },
}))

vi.mock('@/components/ui/modal', () => ({
  Modal: ({ open, title, children }: { open: boolean; title: string; children: ReactNode }) =>
    open ? <section role="dialog" aria-label={title}>{children}</section> : null,
}))

vi.mock('@/components/ui/confirm-dialog', () => ({
  ConfirmDialog: ({ open, onConfirm, onClose }: { open: boolean; onConfirm: () => unknown; onClose: () => void }) =>
    open ? <section role="dialog" aria-label="Confirmar eliminación"><button onClick={() => void onConfirm()}>Confirmar eliminación</button><button onClick={onClose}>Cancelar eliminación</button></section> : null,
}))

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const chapter: Chapter = {
  id: 'chapter-1',
  seriesId: 'work-1',
  number: '12.500',
  title: 'Capítulo de prueba',
  kind: 'NORMAL',
  status: 'PUBLISHED',
  version: 7,
  releaseDate: '2026-01-01T00:00:00.000Z',
  pages: [],
}
const work = { id: 'work-1', title: 'Obra de prueba' } as Series

describe('ChaptersPanel', () => {
  beforeEach(() => {
    mocks.role = 'ADMIN'
    mocks.deleteChapter.mockReset().mockResolvedValue(undefined)
    mocks.getChapter.mockReset()
    mocks.setData.mockReset()
    mocks.reload.mockReset()
  })

  it('lets only ADMIN open chapter deletion and sends the current version', async () => {
    render(<ChaptersPanel work={work} onBack={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: 'Eliminar el capítulo 12.5' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar eliminación' }))
    await waitFor(() => expect(mocks.deleteChapter).toHaveBeenCalledWith('work-1', 'chapter-1', 7))
  })

  it('keeps EDITOR management unknown and disables chapter mutations without assignment data', () => {
    mocks.role = 'EDITOR'
    render(<ChaptersPanel work={work} onBack={vi.fn()} />)

    expect(screen.getByRole('status')).toHaveTextContent(/No podemos confirmar tu asignación/)
    expect(screen.getByRole('button', { name: 'Nuevo capítulo' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Editar el capítulo 12.5' })).toBeDisabled()
    expect(screen.queryByRole('button', { name: 'Eliminar el capítulo 12.5' })).not.toBeInTheDocument()
  })
})
