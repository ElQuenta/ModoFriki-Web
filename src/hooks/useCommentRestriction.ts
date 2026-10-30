import { useEffect, useRef } from 'react'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { accountTimeZone, formatInstantInZone } from '@/lib/zoned-date'
import { getUserAdminGateway, type UserAdminGateway } from '@/services/user-admin'

export function useCommentRestriction(gatewayOverride?: UserAdminGateway) {
  const { user } = useAuth()
  const gateway = getUserAdminGateway(gatewayOverride)
  const available = gateway.capabilities.getMyCommentRestriction.available
  const result = useAsync(
    () => gateway.getMyCommentRestriction(),
    `comment-restriction:${user?.id ?? 'guest'}`,
    Boolean(user) && available,
  )
  const status = result.data ?? { kind: 'unknown' as const }
  const blocked = status.kind === 'active-temporary' || status.kind === 'active-permanent'
  const activeEndsAt = status.kind === 'active-temporary' ? status.endsAt : undefined
  const reload = result.reload
  const checkedExpiry = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (!activeEndsAt) return
    if (checkedExpiry.current === activeEndsAt) return
    const parsed = Date.parse(activeEndsAt)
    const delay = Number.isFinite(parsed) ? Math.max(0, parsed - Date.now() + 50) : 0
    const timer = window.setTimeout(() => {
      checkedExpiry.current = activeEndsAt
      reload()
    }, Math.min(delay, 2_147_000_000))
    return () => window.clearTimeout(timer)
  }, [activeEndsAt, reload])
  const message = status.kind === 'active-temporary'
    ? `No puedes crear, responder ni editar comentarios hasta ${formatInstantInZone(status.endsAt, accountTimeZone(user?.timezone))}.`
    : status.kind === 'active-permanent'
      ? 'No puedes crear, responder ni editar comentarios mientras esté vigente esta sanción permanente.'
      : undefined
  return { status, blocked, message, loading: result.loading, error: result.error, reload }
}
