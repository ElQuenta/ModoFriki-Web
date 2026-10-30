import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getUserAdminGateway, userAdminGateway } from '@/services/user-admin'
import { createFakeUserAdminGateway } from '@/test/fixtures/user-admin'

const api = vi.hoisted(() => ({ request: vi.fn(), listWorks: vi.fn() }))
vi.mock('@/lib/api', () => ({ request: api.request }))
vi.mock('@/services/catalog', () => ({ listWorks: api.listWorks }))

describe('userAdminGateway', () => {
  beforeEach(() => { api.request.mockReset(); api.listWorks.mockReset(); vi.stubGlobal('fetch', vi.fn()) })
  afterEach(() => vi.unstubAllGlobals())

  it('enables published user, assignment, and supported sanction operations while keeping extension unavailable', () => {
    for (const name of ['listUsers', 'getUser', 'changeRole', 'listAssignments', 'listAssignableWorks', 'assignWork', 'revokeAssignment'] as const) expect(userAdminGateway.capabilities[name].available).toBe(true)
    for (const name of ['getSanction', 'applySanction', 'revokeSanction', 'getMyCommentRestriction'] as const) expect(userAdminGateway.capabilities[name].available).toBe(true)
    expect(userAdminGateway.capabilities.extendSanction.available).toBe(false)
    expect(userAdminGateway.capabilities.getManagementAccess.available).toBe(false)
  })

  it.each([
    ['extendSanction', () => userAdminGateway.extendSanction({ subjectId: 'subject' as never, endsAt: '2027-01-01T00:00:00Z' })],
    ['getManagementAccess', () => userAdminGateway.getManagementAccess('work' as never)],
  ] as const)('rejects unsupported %s before HTTP', async (operation, invoke) => {
    await expect(invoke()).rejects.toMatchObject({ name: 'CapabilityUnavailable', code: 'CAPABILITY_UNAVAILABLE', operation })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('maps the published sanction history and preserves none versus invalid response', async () => {
    const active = {
      id: '00000000-0000-4000-8000-000000000021', userId: '00000000-0000-4000-8000-000000000001',
      reason: 'spam', startsAt: '2026-10-30T12:00:00.000Z', endsAt: '2026-10-31T12:00:00.000Z',
      permanent: false, status: 'ACTIVE', imposedById: '00000000-0000-4000-8000-000000000002',
      revokedAt: null, revokedById: null, evidence: null,
    }
    api.request.mockResolvedValueOnce({ current: active, history: { items: [active], hasMore: false, nextCursor: null } })
    await expect(userAdminGateway.getSanction(active.userId as never)).resolves.toEqual({
      kind: 'active-temporary', id: active.id, reason: 'spam', endsAt: active.endsAt,
    })
    expect(api.request).toHaveBeenCalledWith(`/admin/users/${active.userId}/comment-sanctions`)

    api.request.mockResolvedValueOnce({ current: null, history: { items: [], hasMore: false, nextCursor: null } })
    await expect(userAdminGateway.getSanction(active.userId as never)).resolves.toEqual({ kind: 'none' })
    api.request.mockResolvedValueOnce({ history: { items: [], hasMore: false, nextCursor: null } })
    await expect(userAdminGateway.getSanction(active.userId as never)).rejects.toThrow(/historial.*inválido/i)
  })

  it('posts the published temporary and permanent payloads and maps the confirmed sanction', async () => {
    const subjectId = '00000000-0000-4000-8000-000000000001'
    const sanction = {
      id: '00000000-0000-4000-8000-000000000021', userId: subjectId, reason: 'motivo',
      startsAt: '2026-10-30T12:00:00.000Z', endsAt: null, permanent: true, status: 'ACTIVE',
      imposedById: '00000000-0000-4000-8000-000000000002', revokedAt: null, revokedById: null, evidence: null,
    }
    api.request.mockResolvedValueOnce(sanction)
    await expect(userAdminGateway.applySanction({ subjectId: subjectId as never, reason: 'motivo', type: 'permanent' })).resolves.toMatchObject({ kind: 'active-permanent', id: sanction.id })
    expect(api.request).toHaveBeenLastCalledWith(`/admin/users/${subjectId}/comment-sanctions`, { method: 'POST', body: { reason: 'motivo', endsAt: null } })

    api.request.mockReset()
    api.request.mockResolvedValueOnce({ ...sanction, permanent: false, endsAt: '2026-11-01T00:00:00.000Z' })
    await userAdminGateway.applySanction({ subjectId: subjectId as never, reason: 'motivo', type: 'temporary', endsAt: '2026-11-01T00:00:00.000Z' })
    expect(api.request).toHaveBeenLastCalledWith(`/admin/users/${subjectId}/comment-sanctions`, { method: 'POST', body: { reason: 'motivo', endsAt: '2026-11-01T00:00:00.000Z' } })
    await expect(userAdminGateway.applySanction({ subjectId: subjectId as never, reason: 'motivo', type: 'temporary' })).rejects.toThrow(/vencimiento temporal/)
    expect(api.request).toHaveBeenCalledTimes(1)
  })

  it('revokes only the sanction returned as current and uses the backend PUT contract', async () => {
    const subjectId = '00000000-0000-4000-8000-000000000001'
    const sanctionId = '00000000-0000-4000-8000-000000000021'
    api.request.mockResolvedValueOnce({ current: {
      id: sanctionId, userId: subjectId, reason: 'motivo', startsAt: '2026-10-30T12:00:00.000Z',
      endsAt: null, permanent: true, status: 'ACTIVE', imposedById: '00000000-0000-4000-8000-000000000002',
      revokedAt: null, revokedById: null, evidence: null,
    }, history: { items: [], hasMore: false, nextCursor: null } }).mockResolvedValueOnce({
      id: sanctionId, userId: subjectId, reason: 'motivo', startsAt: '2026-10-30T12:00:00.000Z',
      endsAt: null, permanent: true, status: 'REVOKED', imposedById: '00000000-0000-4000-8000-000000000002',
      revokedAt: '2026-10-30T13:00:00.000Z', revokedById: '00000000-0000-4000-8000-000000000002', evidence: null,
    })
    await expect(userAdminGateway.revokeSanction(subjectId as never)).resolves.toMatchObject({ kind: 'revoked', id: sanctionId })
    expect(api.request).toHaveBeenNthCalledWith(2, `/admin/users/${subjectId}/comment-sanctions/${sanctionId}/revocation`, { method: 'PUT', body: {} })
  })

  it('maps the authenticated user restriction without converting invalid data to none', async () => {
    api.request.mockResolvedValueOnce({ active: false, reason: null, endsAt: null, permanent: false })
    await expect(userAdminGateway.getMyCommentRestriction()).resolves.toEqual({ kind: 'none' })
    expect(api.request).toHaveBeenLastCalledWith('/auth/me/comment-restriction')
    api.request.mockResolvedValueOnce({ active: true, reason: 'reincidencia', endsAt: '2026-11-01T00:00:00.000Z', permanent: false })
    await expect(userAdminGateway.getMyCommentRestriction()).resolves.toEqual({ kind: 'active-temporary', reason: 'reincidencia', endsAt: '2026-11-01T00:00:00.000Z' })
    api.request.mockResolvedValueOnce({ active: true, reason: null, endsAt: null, permanent: true })
    await expect(userAdminGateway.getMyCommentRestriction()).rejects.toThrow(/motivo/)
  })

  it('adapts cursor pages without turning unknown sanctions into none', async () => {
    api.request.mockResolvedValue({ items: [{ id: '00000000-0000-4000-8000-000000000001', username: 'ana', role: 'EDITOR', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z' }], hasMore: true, nextCursor: { createdAt: '2026-01-01T00:00:00.000Z', id: '00000000-0000-4000-8000-000000000001' } })
    const page = await userAdminGateway.listUsers({ limit: 20 })
    expect(api.request).toHaveBeenCalledWith('/admin/users', { query: { limit: 20 } })
    expect(page.items[0]).toMatchObject({ username: 'ana', sanction: { kind: 'unknown' } })
    expect(JSON.parse(atob(page.nextCursor!))).toEqual({ createdAt: '2026-01-01T00:00:00.000Z', id: '00000000-0000-4000-8000-000000000001' })
    expect(page.hasMore).toBe(true)
  })

  it('rejects malformed backend DTOs instead of treating them as confirmed users', async () => {
    api.request.mockResolvedValue({ items: [{ id: 'not-a-uuid', username: 'ana', role: 'ADMIN', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' }], hasMore: false, nextCursor: null })
    await expect(userAdminGateway.listUsers({ limit: 20 })).rejects.toThrow(/usuario inválido/)
  })

  it('uses the detail CAS token for role changes', async () => {
    const userId = '00000000-0000-4000-8000-000000000001'
    api.request.mockResolvedValueOnce({ id: userId, username: 'ana', role: 'BASIC', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-10-30T12:00:00.000Z' })
      .mockResolvedValueOnce({ id: userId, username: 'ana', role: 'EDITOR', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-10-31T12:00:00.000Z' })
    await userAdminGateway.changeRole({ actorId: 'admin' as never, subjectId: userId as never, role: 'EDITOR' })
    expect(api.request).toHaveBeenNthCalledWith(1, `/admin/users/${userId}`)
    expect(api.request).toHaveBeenNthCalledWith(2, `/admin/users/${userId}/role`, { method: 'PATCH', body: { role: 'EDITOR', expectedUpdatedAt: '2026-10-30T12:00:00.000Z' } })
  })

  it('follows assignment pages and revokes with the current CAS version', async () => {
    const item = { id: '00000000-0000-4000-8000-000000000010', workId: '00000000-0000-4000-8000-000000000011', editorId: '00000000-0000-4000-8000-000000000012', assignedAt: '2026-01-01T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z', revokedAt: null, version: 4 }
    api.request.mockResolvedValueOnce({ items: [item], hasMore: true, nextCursor: { createdAt: item.createdAt, id: item.id } })
      .mockResolvedValueOnce({ items: [{ ...item, id: '00000000-0000-4000-8000-000000000013', workId: '00000000-0000-4000-8000-000000000014' }], hasMore: false, nextCursor: null })
    await expect(userAdminGateway.listAssignments(item.editorId as never)).resolves.toHaveLength(2)
    api.request.mockReset()
    api.request.mockResolvedValueOnce({ items: [item], hasMore: false, nextCursor: null })
      .mockResolvedValueOnce({ ...item, revokedAt: '2026-02-01T00:00:00.000Z', version: 5 })
    await userAdminGateway.revokeAssignment({ editorId: item.editorId as never, workId: item.workId as never })
    expect(api.request).toHaveBeenLastCalledWith(`/admin/users/${item.editorId}/work-assignments/${item.workId}/revocation`, { method: 'PATCH', body: { expectedVersion: 4 } })
  })

  it('uses the existing staff work list contract for assignable work pages', async () => {
    api.listWorks.mockResolvedValue([{ id: 'w', title: 'Obra' }])
    await expect(userAdminGateway.listAssignableWorks({ editorId: 'e' as never, limit: 1 })).resolves.toEqual({ items: [{ id: 'w', title: 'Obra' }], nextCursor: btoa('2') })
    expect(api.listWorks).toHaveBeenCalledWith({ page: 1, limit: 1, search: undefined, includeDrafts: true })
  })

  it('uses the historical CAS version when reactivating a revoked assignment', async () => {
    const assignment = { id: '00000000-0000-4000-8000-000000000010', workId: '00000000-0000-4000-8000-000000000011', editorId: '00000000-0000-4000-8000-000000000012', assignedAt: '2026-01-01T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z', revokedAt: '2026-02-01T00:00:00.000Z', version: 7 }
    api.request.mockResolvedValueOnce({ items: [assignment], hasMore: false, nextCursor: null }).mockResolvedValueOnce({ ...assignment, revokedAt: null, version: 8 })
    await userAdminGateway.assignWork({ editorId: assignment.editorId as never, workId: assignment.workId as never })
    expect(api.request).toHaveBeenLastCalledWith(`/admin/users/${assignment.editorId}/work-assignments/${assignment.workId}`, { method: 'PUT', body: { expectedVersion: 7 } })
  })
})

describe('createFakeUserAdminGateway fixture', () => {
  it('can be injected and preserves unknown sanction state', async () => {
    const fake = createFakeUserAdminGateway()
    expect(getUserAdminGateway(fake)).toBe(fake)
    expect(fake.capabilities.listUsers.available).toBe(true)
    await expect(fake.getSanction('subject' as never)).resolves.toEqual({ kind: 'unknown' })
  })
})
