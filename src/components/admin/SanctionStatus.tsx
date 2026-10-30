import { accountTimeZone, formatInstantInZone } from '@/lib/zoned-date'
import type { SanctionStatus as SanctionState } from '@/types/user-admin'

export function SanctionStatus({ status, timeZone }: { status: SanctionState; timeZone?: string | null }) {
  let label: string
  switch (status.kind) {
    case 'none': label = 'Sin sanción'; break
    case 'unknown': label = 'Estado no disponible'; break
    case 'active-temporary': label = `Temporal hasta ${formatInstantInZone(status.endsAt, accountTimeZone(timeZone))}`; break
    case 'active-permanent': label = 'Permanente'; break
    case 'expired': label = 'Vencida'; break
    case 'revoked': label = 'Retirada'; break
  }
  return <span aria-label={`Estado de sanción: ${label}`}>{label}</span>
}
