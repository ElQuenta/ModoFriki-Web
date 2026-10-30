import type {
  AdminRole,
  AdminUser,
  ManagementAccess,
  SanctionInput,
  SanctionStatus,
  UUID,
  WorkEditorAssignment,
} from '@/types/user-admin'
import { request } from '@/lib/api'
import { listWorks } from '@/services/catalog'
export type { AdminUser } from '@/types/user-admin'

/** Capacidades aún sin contrato remoto: se activan individualmente al publicarse. */
export type UserAdminOperation =
  | 'listUsers'
  | 'getUser'
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
  hasMore?: boolean
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
  getUser(userId: UUID): Promise<AdminUser>
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
type BackendPage<T> = { items: T[]; hasMore: boolean; nextCursor: { createdAt: string; id: string } | null }
type BackendAdminUser = { id: string; username: string; role: AdminRole; status: 'ACTIVE' | 'SUSPENDED'; createdAt: string; updatedAt: string }
type BackendAssignment = { id: string; workId: string; editorId: string; assignedAt: string; createdAt: string; revokedAt: string | null; version: number }

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('El servicio administrativo devolvió una respuesta inválida.')
  return value as Record<string, unknown>
}

function uuid(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function parsePage<T>(value: unknown, map: (item: unknown) => T): BackendPage<T> {
  const page = record(value)
  if (!Array.isArray(page.items) || typeof page.hasMore !== 'boolean') throw new Error('El servicio administrativo devolvió una página inválida.')
  const cursor = page.nextCursor
  if (cursor !== null && cursor !== undefined) {
    const parsed = record(cursor)
    if (typeof parsed.createdAt !== 'string' || !Number.isFinite(Date.parse(parsed.createdAt)) || !uuid(parsed.id)) throw new Error('El servicio administrativo devolvió un cursor inválido.')
  }
  if (page.hasMore && !cursor) throw new Error('El servicio indicó más resultados sin cursor de continuación.')
  return { items: page.items.map(map), hasMore: page.hasMore, nextCursor: (cursor ?? null) as BackendPage<T>['nextCursor'] }
}

function cursorQuery(cursor?: string | null) {
  if (!cursor) return {}
  const parsed = JSON.parse(atob(cursor)) as { createdAt?: unknown; id?: unknown }
  if (typeof parsed.createdAt !== 'string' || typeof parsed.id !== 'string') throw new Error('Cursor administrativo invÃ¡lido.')
  return { cursorCreatedAt: parsed.createdAt, cursorId: parsed.id }
}
function encodeCursor(cursor: BackendPage<unknown>['nextCursor']) { return cursor ? btoa(JSON.stringify(cursor)) : null }
function mapUser(value: unknown): AdminUser {
  const user = record(value)
  if (!uuid(user.id) || typeof user.username !== 'string' || !['BASIC', 'EDITOR', 'ADMIN'].includes(String(user.role)) || !['ACTIVE', 'SUSPENDED'].includes(String(user.status)) || typeof user.createdAt !== 'string' || !Number.isFinite(Date.parse(user.createdAt)) || typeof user.updatedAt !== 'string' || !Number.isFinite(Date.parse(user.updatedAt))) {
    throw new Error('El servicio administrativo devolvió un usuario inválido.')
  }
  return { id: user.id as UUID, username: user.username, role: user.role as AdminRole, status: user.status as BackendAdminUser['status'], createdAt: user.createdAt, updatedAt: user.updatedAt, sanction: { kind: 'unknown' } }
}
function mapAssignment(value: unknown): WorkEditorAssignment {
  const item = record(value)
  if (!uuid(item.id) || !uuid(item.workId) || !uuid(item.editorId) || typeof item.assignedAt !== 'string' || !Number.isFinite(Date.parse(item.assignedAt)) || typeof item.createdAt !== 'string' || !Number.isFinite(Date.parse(item.createdAt)) || (item.revokedAt !== null && (typeof item.revokedAt !== 'string' || !Number.isFinite(Date.parse(item.revokedAt)))) || !Number.isInteger(item.version)) {
    throw new Error('El servicio administrativo devolvió una asignación inválida.')
  }
  return { id: item.id as UUID, workId: item.workId as UUID, editorId: item.editorId as UUID, assignedAt: item.assignedAt, createdAt: item.createdAt, revokedAt: item.revokedAt as string | null, version: item.version as number }
}

const capabilities = Object.freeze({
  listUsers: { available: true }, getUser: { available: true }, changeRole: { available: true },
  getSanction: { available: false }, applySanction: { available: false }, extendSanction: { available: false }, revokeSanction: { available: false },
  listAssignments: { available: true }, listAssignableWorks: { available: true }, assignWork: { available: true }, revokeAssignment: { available: true },
  getMyCommentRestriction: { available: false }, getManagementAccess: { available: false },
}) satisfies UserAdminCapabilities

const unavailable = (operation: UserAdminOperation): Promise<never> => {
  return Promise.reject(new CapabilityUnavailable(operation))
}

export const userAdminGateway: UserAdminGateway = Object.freeze({
  capabilities,
  async listUsers(input: Parameters<UserAdminGateway['listUsers']>[0]) {
    const page = parsePage(await request<unknown>('/admin/users', { query: { limit: input.limit, ...cursorQuery(input.cursor) } }), mapUser)
    return { items: page.items.map(mapUser), nextCursor: encodeCursor(page.nextCursor), hasMore: page.hasMore }
  },
  async getUser(userId: UUID) {
    return mapUser(await request<unknown>(`/admin/users/${encodeURIComponent(userId)}`))
  },
  async changeRole(input: Parameters<UserAdminGateway['changeRole']>[0]) {
    const current = mapUser(await request<unknown>(`/admin/users/${encodeURIComponent(input.subjectId)}`))
    if (!current.updatedAt) throw new Error('El servicio no devolvió el token vigente para cambiar el rol.')
    return mapUser(await request<unknown>(`/admin/users/${encodeURIComponent(input.subjectId)}/role`, { method: 'PATCH', body: { role: input.role, expectedUpdatedAt: current.updatedAt } }))
  },
  getSanction: () => unavailable('getSanction'),
  applySanction: () => unavailable('applySanction'),
  extendSanction: () => unavailable('extendSanction'),
  revokeSanction: () => unavailable('revokeSanction'),
  async listAssignments(editorId: UUID) {
    const result: WorkEditorAssignment[] = []
    let cursor: BackendPage<BackendAssignment>['nextCursor'] = null
    do {
      const page: BackendPage<WorkEditorAssignment> = parsePage<WorkEditorAssignment>(await request<unknown>(`/admin/users/${encodeURIComponent(editorId)}/work-assignments`, { query: { limit: 100, includeRevoked: true, ...(cursor ? { cursorCreatedAt: cursor.createdAt, cursorId: cursor.id } : {}) } }), mapAssignment)
      result.push(...page.items)
      cursor = page.hasMore ? page.nextCursor : null
      if (page.hasMore && !cursor) throw new Error('El servicio indicó más asignaciones sin cursor de continuación.')
    } while (cursor)
    return result
  },
  async listAssignableWorks(input: Parameters<UserAdminGateway['listAssignableWorks']>[0]) {
    const page = input.cursor ? Number(atob(input.cursor)) : 1
    if (!Number.isInteger(page) || page < 1) throw new Error('La continuación de obras no es válida.')
    const works = await listWorks({ page, limit: input.limit, search: input.search, includeDrafts: true })
    return { items: works.map((work) => ({ id: work.id as UUID, title: work.title })), nextCursor: works.length === input.limit ? btoa(String(page + 1)) : null }
  },
  async assignWork(input: Parameters<UserAdminGateway['assignWork']>[0]) {
    const previous = (await userAdminGateway.listAssignments(input.editorId)).find((item) => item.workId === input.workId)
    if (previous?.revokedAt === null) throw new Error('La obra ya está asignada a este editor.')
    return mapAssignment(await request<BackendAssignment>(`/admin/users/${encodeURIComponent(input.editorId)}/work-assignments/${encodeURIComponent(input.workId)}`, { method: 'PUT', body: { expectedVersion: previous?.version ?? 0 } }))
  },
  async revokeAssignment(input: Parameters<UserAdminGateway['revokeAssignment']>[0]) {
    const page = await request<BackendPage<BackendAssignment>>(`/admin/users/${encodeURIComponent(input.editorId)}/work-assignments`, { query: { limit: 100, includeRevoked: true } })
    const current = page.items.find((item) => item.workId === input.workId && item.revokedAt === null)
    if (!current) throw new Error('La asignaciÃ³n no estÃ¡ vigente.')
    return mapAssignment(await request<BackendAssignment>(`/admin/users/${encodeURIComponent(input.editorId)}/work-assignments/${encodeURIComponent(input.workId)}/revocation`, { method: 'PATCH', body: { expectedVersion: current.version } }))
  },
  getMyCommentRestriction: () => unavailable('getMyCommentRestriction'),
  getManagementAccess: () => unavailable('getManagementAccess'),
})

/** Resolve an explicitly supplied test gateway or the safe production default. */
export function getUserAdminGateway(override?: UserAdminGateway): UserAdminGateway {
  return override ?? userAdminGateway
}
