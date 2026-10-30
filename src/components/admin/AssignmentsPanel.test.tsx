import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AssignmentsPanel } from '@/components/admin/AssignmentsPanel'
import { createFakeUserAdminGateway } from '@/test/fixtures/user-admin'
import type { AdminUser, UUID, WorkEditorAssignment } from '@/types/user-admin'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'admin-id', username: 'admin', role: 'ADMIN', timezone: 'UTC' },
    revalidateSession: vi.fn().mockResolvedValue({ id: 'admin-id', role: 'ADMIN' }),
    revalidating: false,
  }),
}))

const editor: AdminUser = {
  id: 'editor-id' as UUID,
  username: 'ana',
  role: 'EDITOR',
  sanction: { kind: 'none' },
}
const assignment: WorkEditorAssignment = {
  editorId: editor.id,
  workId: 'work-id' as UUID,
  assignedAt: '2026-01-01T00:00:00.000Z',
  revokedAt: null,
}

describe('AssignmentsPanel', () => {
  it('requires confirmation and checks for a current duplicate before assigning', async () => {
    const listAssignments = vi.fn()
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([assignment])
      .mockResolvedValue([assignment])
    const assignWork = vi.fn()
    const gateway = createFakeUserAdminGateway({
      listAssignments,
      listUsers: vi.fn().mockResolvedValue({ items: [editor], nextCursor: null }),
      listAssignableWorks: vi.fn().mockResolvedValue({
        items: [{ id: assignment.workId, title: 'Obra de prueba' }],
        nextCursor: null,
      }),
      assignWork,
    })
    render(<AssignmentsPanel open editor={editor} gateway={gateway} onClose={vi.fn()} />)

    fireEvent.click(await screen.findByRole('button', { name: 'Asignar' }))
    expect(screen.getByText(/Vas a asignar la obra seleccionada a ana/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Esta obra ya está asignada')
    expect(assignWork).not.toHaveBeenCalled()
    await waitFor(() => expect(listAssignments).toHaveBeenCalledTimes(3))
  })
})
