import type { UserRole } from '@/types'

export type UUID = string & { readonly __brand: 'UUID' }
export type AdminRole = Extract<UserRole, 'BASIC' | 'EDITOR' | 'ADMIN'>

export type AdminSanctionState =
  | { kind: 'unknown' }
  | { kind: 'none' }
  | { kind: 'active-temporary'; endsAt: string; reason?: string; id?: UUID; revision?: number }
  | { kind: 'active-permanent'; reason?: string; id?: UUID; revision?: number }
  | { kind: 'expired'; endsAt?: string; reason?: string; id?: UUID; revision?: number }
  | { kind: 'revoked'; endsAt?: string; reason?: string; id?: UUID; revision?: number }

export type SanctionStatus = AdminSanctionState

export interface AdminUser {
  id: UUID
  username: string
  role: AdminRole
  sanction: AdminSanctionState
  status?: 'ACTIVE' | 'SUSPENDED'
  createdAt?: string
  updatedAt?: string
}

export interface SanctionInput {
  subjectId: UUID
  reason: string
  type: 'temporary' | 'permanent'
  /** ISO 8601 instant with an explicit offset; absent for permanent sanctions. */
  endsAt?: string
}

export interface WorkEditorAssignment {
  id?: UUID
  workId: UUID
  editorId: UUID
  assignedAt: string
  revokedAt: string | null
  createdAt?: string
  version?: number
}

export type ManagementAccess = 'allowed' | 'denied' | 'unknown'
