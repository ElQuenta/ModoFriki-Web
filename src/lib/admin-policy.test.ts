import { describe, expect, it } from 'vitest'
import { canAdminister, canManageWork, isActiveSanction } from './admin-policy'

describe('administrative UI policy', () => {
  it('allows only ADMIN to switch a third party between BASIC and EDITOR', () => {
    expect(canAdminister('ADMIN', 'admin', 'BASIC', 'reader', 'change-role')).toBe(true)
    expect(canAdminister('ADMIN', 'admin', 'EDITOR', 'editor', 'change-role')).toBe(true)
    expect(canAdminister('EDITOR', 'editor', 'BASIC', 'reader', 'change-role')).toBe(false)
    expect(canAdminister('ADMIN', 'admin', 'ADMIN', 'other-admin', 'change-role')).toBe(false)
    expect(canAdminister('ADMIN', 'same', 'BASIC', 'same', 'change-role')).toBe(false)
  })

  it('limits sanctions to BASIC/EDITOR and assignments to EDITOR', () => {
    expect(canAdminister('ADMIN', 'admin', 'BASIC', 'reader', 'manage-sanction')).toBe(true)
    expect(canAdminister('ADMIN', 'admin', 'EDITOR', 'editor', 'manage-sanction')).toBe(true)
    expect(canAdminister('ADMIN', 'admin', 'ADMIN', 'other-admin', 'manage-sanction')).toBe(false)
    expect(canAdminister('ADMIN', 'admin', 'EDITOR', 'editor', 'manage-assignment')).toBe(true)
    expect(canAdminister('ADMIN', 'admin', 'BASIC', 'reader', 'manage-assignment')).toBe(false)
  })

  it('never treats unknown access as allowed', () => {
    expect(canManageWork('unknown')).toBe(false)
    expect(canManageWork('denied')).toBe(false)
    expect(canManageWork('allowed')).toBe(true)
  })

  it('recognizes only confirmed active sanctions as active', () => {
    expect(isActiveSanction('active-temporary')).toBe(true)
    expect(isActiveSanction('active-permanent')).toBe(true)
    expect(isActiveSanction('unknown')).toBe(false)
    expect(isActiveSanction('none')).toBe(false)
  })
})
