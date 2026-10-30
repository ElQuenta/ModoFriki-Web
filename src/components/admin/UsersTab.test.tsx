import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { UsersTab } from '@/components/admin/UsersTab'
import { createFakeUserAdminGateway } from '@/test/fixtures/user-admin'
import type { AdminUser, UUID } from '@/types/user-admin'

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'admin-id', username: 'admin', role: 'ADMIN', timezone: 'UTC' },
    revalidateSession: vi.fn().mockResolvedValue({ id: 'admin-id', role: 'ADMIN' }),
    revalidating: false,
    sessionError: undefined,
  }),
}))

const account = (id: string, username: string, role: AdminUser['role'], kind: AdminUser['sanction']['kind']): AdminUser => ({
  id: id as UUID,
  username,
  role,
  sanction: kind === 'active-temporary'
    ? { kind, endsAt: '2030-01-01T00:00:00.000Z' }
    : { kind } as AdminUser['sanction'],
})

describe('UsersTab', () => {
  it('lists only injected server-style rows and keeps unknown distinct from no sanction', async () => {
    const users = [account('reader-id', 'ana', 'BASIC', 'unknown')]
    const getSanction = vi.fn().mockResolvedValue({ kind: 'none' })
    const gateway = createFakeUserAdminGateway({
      listUsers: vi.fn().mockResolvedValue({ items: users, nextCursor: null }),
      getSanction,
    })
    render(<UsersTab gateway={gateway} />)

    expect(await screen.findByText('ana')).toBeInTheDocument()
    expect(screen.getByText('Estado no disponible')).toBeInTheDocument()
    expect(screen.queryByText('Sin sanción')).not.toBeInTheDocument()
    expect(gateway.listUsers).toHaveBeenCalledWith({ limit: 20 })
    fireEvent.click(screen.getByRole('button', { name: 'Consultar sanción' }))
    await waitFor(() => expect(getSanction).toHaveBeenCalledWith('reader-id'))
  })

  it('does not show mutation actions for the acting account or an ADMIN subject', async () => {
    const users = [
      account('admin-id', 'admin', 'ADMIN', 'none'),
      account('other-admin', 'admin-dos', 'ADMIN', 'none'),
    ]
    const gateway = createFakeUserAdminGateway({
      listUsers: vi.fn().mockResolvedValue({ items: users, nextCursor: null }),
    })
    render(<UsersTab gateway={gateway} />)

    await waitFor(() => expect(screen.getByText('admin-dos')).toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'Cambiar rol' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Sancionar' })).not.toBeInTheDocument()
    expect(screen.getAllByText('Solo consulta')).toHaveLength(2)
  })

  it('shows the unavailable state without a sample table or fake HTTP', () => {
    const gateway = createFakeUserAdminGateway()
    const unavailable = { ...gateway, capabilities: { ...gateway.capabilities, listUsers: { available: false } } }
    render(<UsersTab gateway={unavailable} />)
    expect(screen.getByText(/todavía no está conectada al servicio/)).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('asks before discarding a selected role and keeps it when continuing to edit', async () => {
    const changeRole = vi.fn()
    const gateway = createFakeUserAdminGateway({
      listUsers: vi.fn().mockResolvedValue({ items: [account('reader-id', 'ana', 'BASIC', 'none')], nextCursor: null }),
      getUser: vi.fn().mockResolvedValue(account('reader-id', 'ana', 'BASIC', 'none')),
      changeRole,
    })
    render(<UsersTab gateway={gateway} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Cambiar rol' }))
    fireEvent.change(screen.getByLabelText('Nuevo rol'), { target: { value: 'EDITOR' } })
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.getByRole('heading', { name: 'Descartar cambios' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Seguir editando' }))
    expect(screen.getByLabelText('Nuevo rol')).toHaveValue('EDITOR')
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    fireEvent.click(screen.getByRole('button', { name: 'Descartar cambios' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(changeRole).not.toHaveBeenCalled()
  })

  it('rechecks the target role and refuses a change if the account became ADMIN', async () => {
    const target = account('reader-id', 'ana', 'BASIC', 'none')
    const listUsers = vi.fn()
      .mockResolvedValueOnce({ items: [target], nextCursor: null })
      .mockResolvedValueOnce({ items: [{ ...target, role: 'ADMIN' }], nextCursor: null })
    const changeRole = vi.fn()
    const gateway = createFakeUserAdminGateway({ listUsers, getUser: vi.fn().mockResolvedValue({ ...target, role: 'ADMIN' }), changeRole })
    render(<UsersTab gateway={gateway} />)
    fireEvent.click(await screen.findByRole('button', { name: 'Cambiar rol' }))
    fireEvent.change(screen.getByLabelText('Nuevo rol'), { target: { value: 'EDITOR' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar cambio' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('La cuenta cambió o ya no está disponible')
    expect(changeRole).not.toHaveBeenCalled()
  })
})
