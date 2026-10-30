import type { AdminRole, ManagementAccess } from '@/types/user-admin'

export type AdminAction = 'change-role' | 'manage-sanction' | 'manage-assignment'

/** UI policy only; the service remains the authorization authority. */
export function canAdminister(
  actorRole: AdminRole | null | undefined,
  actorId: string | null | undefined,
  subjectRole: AdminRole | null | undefined,
  subjectId: string | null | undefined,
  action: AdminAction,
): boolean {
  if (actorRole !== 'ADMIN' || !actorId || !subjectId) return false

  switch (action) {
    case 'change-role':
      return actorId !== subjectId &&
        (subjectRole === 'BASIC' || subjectRole === 'EDITOR')
    case 'manage-sanction':
      return subjectRole === 'BASIC' || subjectRole === 'EDITOR'
    case 'manage-assignment':
      return subjectRole === 'EDITOR'
  }
}

/** Unknown access is conservative and never grants editorial management. */
export function canManageWork(access: ManagementAccess): boolean {
  return access === 'allowed'
}

export function isActiveSanction(status: string): boolean {
  return status === 'active-temporary' || status === 'active-permanent'
}
