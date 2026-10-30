import type {
  AdminUser,
  SanctionStatus,
  UUID,
  WorkEditorAssignment,
} from '@/types/user-admin'
import type {
  AdminUserPage,
  AssignableWorkPage,
  UserAdminCapabilities,
  UserAdminGateway,
} from '@/services/user-admin'

const unknownSanction: SanctionStatus = { kind: 'unknown' }

/** Fake explícito para pruebas; nunca se importa desde código de producción. */
export function createFakeUserAdminGateway(
  overrides: Partial<UserAdminGateway> = {},
): UserAdminGateway {
  const fakeUser: AdminUser = {
    id: '00000000-0000-4000-8000-000000000001' as UUID,
    username: 'fixture-user',
    role: 'BASIC',
    sanction: unknownSanction,
  }
  const emptyUsers: AdminUserPage = { items: [], nextCursor: null }
  const emptyWorks: AssignableWorkPage = { items: [], nextCursor: null }
  const capabilities: UserAdminCapabilities = {
    listUsers: { available: true },
    getUser: { available: true },
    changeRole: { available: true },
    getSanction: { available: true },
    applySanction: { available: true },
    extendSanction: { available: true },
    revokeSanction: { available: true },
    listAssignments: { available: true },
    listAssignableWorks: { available: true },
    assignWork: { available: true },
    revokeAssignment: { available: true },
    getMyCommentRestriction: { available: true },
    getManagementAccess: { available: true },
  }
  const defaultAssignment: WorkEditorAssignment = {
    workId: '00000000-0000-4000-8000-000000000002' as UUID,
    editorId: fakeUser.id,
    assignedAt: '2026-01-01T00:00:00.000Z',
    revokedAt: null,
  }

  return {
    capabilities,
    listUsers: async () => emptyUsers,
    getUser: async () => fakeUser,
    changeRole: async ({ role }) => ({ ...fakeUser, role }),
    getSanction: async () => unknownSanction,
    applySanction: async () => unknownSanction,
    extendSanction: async () => unknownSanction,
    revokeSanction: async () => ({ kind: 'revoked' }),
    listAssignments: async () => [defaultAssignment],
    listAssignableWorks: async () => emptyWorks,
    assignWork: async () => defaultAssignment,
    revokeAssignment: async () => ({ ...defaultAssignment, revokedAt: '2026-01-02T00:00:00.000Z' }),
    getMyCommentRestriction: async () => unknownSanction,
    getManagementAccess: async () => 'unknown',
    ...overrides,
  }
}
