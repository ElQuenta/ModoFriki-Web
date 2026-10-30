import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getUserAdminGateway, userAdminGateway } from '@/services/user-admin'
import { createFakeUserAdminGateway } from '@/test/fixtures/user-admin'

describe('userAdminGateway', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn()))
  afterEach(() => vi.unstubAllGlobals())

  it('declares each unpublished operation unavailable', () => {
    expect(Object.values(userAdminGateway.capabilities)).toEqual(
      Array(Object.keys(userAdminGateway.capabilities).length).fill({ available: false }),
    )
  })

  it.each([
    ['listUsers', () => userAdminGateway.listUsers({ limit: 20 })],
    ['changeRole', () => userAdminGateway.changeRole({ actorId: 'actor' as never, subjectId: 'subject' as never, role: 'EDITOR' })],
    ['getSanction', () => userAdminGateway.getSanction('subject' as never)],
    ['applySanction', () => userAdminGateway.applySanction({ subjectId: 'subject' as never, reason: 'motivo', type: 'permanent' })],
    ['extendSanction', () => userAdminGateway.extendSanction({ subjectId: 'subject' as never, endsAt: '2027-01-01T00:00:00Z' })],
    ['revokeSanction', () => userAdminGateway.revokeSanction('subject' as never)],
    ['listAssignments', () => userAdminGateway.listAssignments('editor' as never)],
    ['listAssignableWorks', () => userAdminGateway.listAssignableWorks({ editorId: 'editor' as never, limit: 20 })],
    ['assignWork', () => userAdminGateway.assignWork({ editorId: 'editor' as never, workId: 'work' as never })],
    ['revokeAssignment', () => userAdminGateway.revokeAssignment({ editorId: 'editor' as never, workId: 'work' as never })],
    ['getMyCommentRestriction', () => userAdminGateway.getMyCommentRestriction()],
    ['getManagementAccess', () => userAdminGateway.getManagementAccess('work' as never)],
  ] as const)('rejects %s with a typed unavailable capability before HTTP', async (operation, invoke) => {
    await expect(invoke()).rejects.toMatchObject({
      name: 'CapabilityUnavailable',
      code: 'CAPABILITY_UNAVAILABLE',
      operation,
    })
    expect(fetch).not.toHaveBeenCalled()
  })
})

describe('createFakeUserAdminGateway fixture', () => {
  it('can be injected and returns only the explicitly configured page and continuation', async () => {
    const page = {
      items: [
        {
          id: '00000000-0000-4000-8000-000000000003' as never,
          username: 'ana',
          role: 'EDITOR' as const,
          sanction: { kind: 'unknown' as const },
        },
      ],
      nextCursor: 'fixture-cursor-2',
    }
    const fake = createFakeUserAdminGateway({ listUsers: vi.fn().mockResolvedValue(page) })
    const gateway = getUserAdminGateway(fake)

    await expect(gateway.listUsers({ limit: 20, search: 'ana' })).resolves.toBe(page)
    expect(gateway.capabilities.listUsers.available).toBe(true)
    expect(gateway).toBe(fake)
  })

  it('does not turn an unconfirmed sanction into no sanction', async () => {
    const gateway = createFakeUserAdminGateway()

    await expect(gateway.getSanction('subject' as never)).resolves.toEqual({ kind: 'unknown' })
  })
})
