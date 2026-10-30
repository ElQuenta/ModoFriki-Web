import type {
  AdminRole,
  AdminUser,
  ManagementAccess,
  SanctionInput,
  SanctionStatus,
  UUID,
  WorkEditorAssignment,
} from '@/types/user-admin'
export type { AdminUser } from '@/types/user-admin'

/** Capacidades aún sin contrato remoto: se activan individualmente al publicarse. */
export type UserAdminOperation =
  | 'listUsers'
  | 'changeRole'
  | 'getSanction'
  | 'applySanction'
  | 'extendSanction'
  | 'revokeSanction'
  | 'listAssignments'
  | 'listAssignableWorks'
  | 'assignWork'
  | 'revokeAssignment'
  | 'getMyCommentRestriction'
  | 'getManagementAccess'

export interface UserAdminCapability {
  available: boolean
  reason?: string
}
export type UserAdminCapabilities = Readonly<Record<UserAdminOperation, UserAdminCapability>>

export class CapabilityUnavailable extends Error {
  readonly code = 'CAPABILITY_UNAVAILABLE'
  readonly operation: UserAdminOperation

  constructor(operation: UserAdminOperation) {
    super(`La operación administrativa «${operation}» todavía no está disponible.`)
    this.name = 'CapabilityUnavailable'
    this.operation = operation
  }
}

export interface AdminUserPage {
  items: AdminUser[]
  /** Opaque continuation owned by the eventual adapter; null means no more pages. */
  nextCursor: string | null
}

export interface AssignableWork {
  id: UUID
  title: string
}

export interface AssignableWorkPage {
  items: AssignableWork[]
  nextCursor: string | null
}

export interface UserAdminGateway {
  readonly capabilities: UserAdminCapabilities
  listUsers(input: { limit: number; cursor?: string | null; search?: string }): Promise<AdminUserPage>
  changeRole(input: { actorId: UUID; subjectId: UUID; role: Extract<AdminRole, 'BASIC' | 'EDITOR'> }): Promise<AdminUser>
  getSanction(subjectId: UUID): Promise<SanctionStatus>
  applySanction(input: SanctionInput): Promise<SanctionStatus>
  extendSanction(input: { subjectId: UUID; endsAt: string }): Promise<SanctionStatus>
  revokeSanction(subjectId: UUID): Promise<SanctionStatus>
  listAssignments(editorId: UUID): Promise<WorkEditorAssignment[]>
  listAssignableWorks(input: { editorId: UUID; search?: string; limit: number; cursor?: string | null }): Promise<AssignableWorkPage>
  assignWork(input: { editorId: UUID; workId: UUID }): Promise<WorkEditorAssignment>
  revokeAssignment(input: { editorId: UUID; workId: UUID }): Promise<WorkEditorAssignment>
  getMyCommentRestriction(): Promise<SanctionStatus>
  getManagementAccess(workId: UUID): Promise<ManagementAccess>
}

// No existe ruta/DTO publicado para estas operaciones. Por tanto, la instancia
// de producción falla antes de iniciar cualquier solicitud HTTP.
const unavailable = (operation: UserAdminOperation): Promise<never> => {
  return Promise.reject(new CapabilityUnavailable(operation))
}

const noCapabilities = Object.freeze({
  listUsers: { available: false },
  changeRole: { available: false },
  getSanction: { available: false },
  applySanction: { available: false },
  extendSanction: { available: false },
  revokeSanction: { available: false },
  listAssignments: { available: false },
  listAssignableWorks: { available: false },
  assignWork: { available: false },
  revokeAssignment: { available: false },
  getMyCommentRestriction: { available: false },
  getManagementAccess: { available: false },
}) satisfies UserAdminCapabilities

export const userAdminGateway: UserAdminGateway = Object.freeze({
  capabilities: noCapabilities,
  listUsers: () => unavailable('listUsers'),
  changeRole: () => unavailable('changeRole'),
  getSanction: () => unavailable('getSanction'),
  applySanction: () => unavailable('applySanction'),
  extendSanction: () => unavailable('extendSanction'),
  revokeSanction: () => unavailable('revokeSanction'),
  listAssignments: () => unavailable('listAssignments'),
  listAssignableWorks: () => unavailable('listAssignableWorks'),
  assignWork: () => unavailable('assignWork'),
  revokeAssignment: () => unavailable('revokeAssignment'),
  getMyCommentRestriction: () => unavailable('getMyCommentRestriction'),
  getManagementAccess: () => unavailable('getManagementAccess'),
})

/** Resolve an explicitly supplied test gateway or the safe production default. */
export function getUserAdminGateway(override?: UserAdminGateway): UserAdminGateway {
  return override ?? userAdminGateway
}
