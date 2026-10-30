import { useMemo, useState } from 'react'
import { ShieldCheck, Users } from 'lucide-react'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { useDebounce } from '@/hooks/useDebounce'
import { canAdminister } from '@/lib/admin-policy'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { inputClass } from './styles'
import { getUserAdminGateway, type AdminUser, type UserAdminGateway } from '@/services/user-admin'
import { RoleDialog } from './RoleDialog'
import { SanctionDialog } from './SanctionDialog'
import { AssignmentsPanel } from './AssignmentsPanel'
import { SanctionStatus } from './SanctionStatus'

const PAGE_SIZE = 20

export function UsersTab({ gateway: gatewayOverride }: { gateway?: UserAdminGateway } = {}) {
  const { user, revalidating, sessionError } = useAuth()
  const gateway = getUserAdminGateway(gatewayOverride)
  const [search, setSearch] = useState('')
  const term = useDebounce(search.trim(), 300)
  const [additional, setAdditional] = useState<{ key: string; items: AdminUser[]; nextCursor: string | null; error?: string }>()
  const [loadingMore, setLoadingMore] = useState(false)
  const [selected, setSelected] = useState<{ kind: 'role' | 'sanction' | 'assignments'; user: AdminUser }>()
  const scope = `admin-users:${user?.id ?? 'none'}:${search.trim()}`
  const list = useAsync(
    () => gateway.listUsers({ limit: PAGE_SIZE, search: term || undefined }),
    `${scope}:${term}`,
    gateway.capabilities.listUsers.available && search.trim() === term,
    scope,
  )
  const extra = additional?.key === scope ? additional : undefined
  const items = useMemo(() => {
    const merged = [...(list.data?.items ?? []), ...(extra?.items ?? [])]
    return merged.filter((item, index) => merged.findIndex((candidate) => candidate.id === item.id) === index)
  }, [list.data, extra])
  const nextCursor = extra?.nextCursor ?? list.data?.nextCursor ?? null
  const listError = extra?.error ?? list.error

  const capabilityError = !gateway.capabilities.listUsers.available
    ? 'La gestión de usuarios todavía no está conectada al servicio.'
    : undefined

  const resetSearch = (value: string) => {
    setSearch(value)
  }

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const page = await gateway.listUsers({ limit: PAGE_SIZE, cursor: nextCursor, search: term || undefined })
      setAdditional((previous) => ({
        key: scope,
        items: [...(previous?.key === scope ? previous.items : []), ...page.items],
        nextCursor: page.nextCursor,
      }))
    } catch (error) {
      setAdditional((previous) => ({
        key: scope,
        items: previous?.key === scope ? previous.items : [],
        nextCursor,
        error: error instanceof Error ? error.message : 'No pudimos cargar más usuarios.',
      }))
    } finally {
      setLoadingMore(false)
    }
  }

  const title = useMemo(() => `${items.length} ${items.length === 1 ? 'usuario cargado' : 'usuarios cargados'}`, [items.length])
  const refreshList = (clearAdditional = true) => {
    if (clearAdditional) setAdditional(undefined)
    list.reload()
  }

  if (capabilityError) {
    return <EmptyState icon={Users} title="Usuarios no disponibles" description={capabilityError} />
  }
  if ((list.loading || search.trim() !== term) && !items.length) {
    return <div className="space-y-2">{Array.from({ length: 5 }, (_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
  }

  return (
    <section aria-label="Gestión de usuarios">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="sr-only" htmlFor="admin-user-search">Buscar usuarios</label>
        <input id="admin-user-search" className={inputClass} value={search} onChange={(event) => resetSearch(event.target.value)} placeholder="Buscar usuario…" />
        <span className="text-muted text-sm" aria-live="polite">{title}</span>
      </div>
      {sessionError ? <p role="alert" className="text-danger mb-3 text-sm">No se confirmó la sesión. Revalida antes de hacer cambios: {sessionError}</p> : null}
      {listError ? <div role="alert" className="border-danger/30 bg-danger/5 mb-4 rounded-xl border p-4 text-sm"><p>{listError}</p><Button variant="secondary" size="sm" onClick={() => extra?.error ? void loadMore() : list.reload()} className="mt-2">Reintentar</Button></div> : null}
      {!items.length && !listError ? <EmptyState icon={ShieldCheck} title="No hay usuarios" description="No se encontraron usuarios para esta consulta." /> : null}
      {items.length ? (
        <div className="border-line overflow-x-auto rounded-2xl border">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-raised text-secondary"><tr><th className="px-4 py-3 font-semibold">Usuario</th><th className="px-4 py-3 font-semibold">Rol</th><th className="px-4 py-3 font-semibold">Estado de sanción</th><th className="px-4 py-3 font-semibold">Acciones</th></tr></thead>
            <tbody className="divide-line divide-y">
              {items.map((row) => {
                const protectedTarget = row.id === user?.id || row.role === 'ADMIN'
                const canChangeRole = canAdminister(user?.role, user?.id, row.role, row.id, 'change-role')
                const canManageSanction = canAdminister(user?.role, user?.id, row.role, row.id, 'manage-sanction')
                return <tr key={row.id}><th scope="row" className="px-4 py-3 font-medium">{row.username}</th><td className="px-4 py-3">{row.role}</td><td className="px-4 py-3"><SanctionStatus status={row.sanction} timeZone={user?.timezone} /></td><td className="px-4 py-3"><div className="flex flex-wrap gap-2">{canChangeRole ? <Button variant="secondary" size="sm" onClick={() => setSelected({ kind: 'role', user: row })}>Cambiar rol</Button> : null}{canManageSanction && row.sanction.kind !== 'unknown' ? <Button variant="secondary" size="sm" onClick={() => setSelected({ kind: 'sanction', user: row })}>{row.sanction.kind === 'active-temporary' || row.sanction.kind === 'active-permanent' ? 'Gestionar sanción' : 'Sancionar'}</Button> : null}{row.role === 'EDITOR' && user?.role === 'ADMIN' && !protectedTarget ? <Button variant="secondary" size="sm" onClick={() => setSelected({ kind: 'assignments', user: row })}>Asignaciones</Button> : null}{protectedTarget ? <span className="text-muted text-xs">Solo consulta</span> : null}</div></td></tr>
              })}
            </tbody>
          </table>
        </div>
      ) : null}
      {nextCursor ? <Button variant="secondary" className="mt-4 w-full" disabled={loadingMore || list.loading || revalidating} onClick={() => void loadMore()}>{loadingMore || list.loading ? 'Cargando…' : 'Cargar más'}</Button> : null}
      {revalidating ? <p role="status" className="text-muted mt-3 text-sm">Verificando tu sesión…</p> : null}
      <RoleDialog key={`role:${selected?.kind === 'role' ? selected.user.id : 'closed'}`} open={selected?.kind === 'role'} subject={selected?.kind === 'role' ? selected.user : null} gateway={gateway} onClose={() => setSelected(undefined)} onRefresh={() => refreshList()} onSaved={(updated) => { setAdditional((previous) => ({ key: scope, items: (previous?.key === scope ? previous.items : []).map((item) => item.id === updated.id ? updated : item), nextCursor: previous?.key === scope ? previous.nextCursor : null })); refreshList(false) }} />
      <SanctionDialog key={`sanction:${selected?.kind === 'sanction' ? selected.user.id : 'closed'}`} open={selected?.kind === 'sanction'} subject={selected?.kind === 'sanction' ? selected.user : null} gateway={gateway} onClose={() => setSelected(undefined)} onRefresh={() => refreshList()} onSaved={(sanction) => { if (selected?.kind === 'sanction') setAdditional((previous) => ({ key: scope, items: (previous?.key === scope ? previous.items : []).map((item) => item.id === selected.user.id ? { ...item, sanction } : item), nextCursor: previous?.key === scope ? previous.nextCursor : null })); refreshList(false) }} />
      <AssignmentsPanel open={selected?.kind === 'assignments'} editor={selected?.kind === 'assignments' ? selected.user : null} gateway={gateway} onClose={() => setSelected(undefined)} />
    </section>
  )
}
