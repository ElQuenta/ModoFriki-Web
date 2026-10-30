import { useState } from 'react'
import { Search, UserRoundCog } from 'lucide-react'
import { ApiError, errorMessage } from '@/lib/api'
import { useAsync } from '@/hooks/useAsync'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { Modal } from '@/components/ui/modal'
import { Skeleton } from '@/components/ui/skeleton'
import type { AdminUser, UserAdminGateway } from '@/services/user-admin'
import { inputClass } from './styles'

const PAGE_SIZE = 20

export function AssignmentsPanel({
  open, editor, gateway, onClose,
}: {
  open: boolean
  editor: AdminUser | null
  gateway: UserAdminGateway
  onClose: () => void
}) {
  const { user, revalidateSession, revalidating } = useAuth()
  const [search, setSearch] = useState('')
  const [cursor, setCursor] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  const [confirmRevoke, setConfirmRevoke] = useState<string>()
  const [confirmAssign, setConfirmAssign] = useState<string>()
  const list = useAsync(
    () => gateway.listAssignments(editor!.id),
    `admin-assignments:${user?.id}:${editor?.id}`,
    open && Boolean(editor) && gateway.capabilities.listAssignments.available,
  )
  const works = useAsync(
    () => gateway.listAssignableWorks({ editorId: editor!.id, search: search || undefined, limit: PAGE_SIZE, cursor }),
    `admin-assignable:${user?.id}:${editor?.id}:${search}:${cursor ?? 'first'}`,
    open && Boolean(editor) && gateway.capabilities.listAssignableWorks.available,
  )
  const assignments = (list.data ?? []).filter((assignment) => assignment.revokedAt === null)
  const mayManage = user?.role === 'ADMIN' && editor?.role === 'EDITOR' && editor.id !== user.id

  const mutate = async (kind: 'assign' | 'revoke', workId: string) => {
    if (!editor || !mayManage || pending || revalidating) return
    setPending(true)
    setError(undefined)
    try {
      const actor = await revalidateSession()
      if (actor.role !== 'ADMIN' || editor.role !== 'EDITOR') throw new Error('El rol confirmado ya no permite gestionar asignaciones.')
      if (!gateway.capabilities.getUser.available || !gateway.capabilities.listAssignments.available) throw new Error('No se pueden verificar las condiciones vigentes de la asignación.')
      const [currentEditor, currentAssignments] = await Promise.all([
        gateway.getUser(editor.id),
        gateway.listAssignments(editor.id),
      ])
      if (!currentEditor || currentEditor.role !== 'EDITOR') throw new Error('La cuenta ya no tiene rol EDITOR. Actualiza la lista antes de continuar.')
      if (kind === 'assign') {
        if (currentAssignments.some((item) => item.workId === workId && item.revokedAt === null)) {
          list.reload()
          setError('Esta obra ya está asignada a la cuenta.')
          return
        }
        await gateway.assignWork({ editorId: editor.id, workId: workId as never })
        setConfirmAssign(undefined)
      } else {
        if (!currentAssignments.some((item) => item.workId === workId && item.revokedAt === null)) {
          list.reload()
          setError('La asignación ya no está vigente. Actualizamos la lista.')
          return
        }
        await gateway.revokeAssignment({ editorId: editor.id, workId: workId as never })
      }
      list.reload()
      setConfirmRevoke(undefined)
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 403) list.reload()
      setError(cause instanceof ApiError && cause.status === 403
        ? 'El servicio rechazó el cambio. Actualizamos tu sesión; se conserva la asignación confirmada.'
        : errorMessage(cause, 'No pudimos guardar la asignación.'))
    } finally { setPending(false) }
  }

  return <Modal open={open && Boolean(editor)} onClose={() => !pending && onClose()} title="Obras asignadas" description={editor ? `Editor: ${editor.username}. Revocar conserva el historial y no elimina contenido.` : undefined} className="max-w-2xl">
    {editor ? <div className="space-y-5">
      {!gateway.capabilities.listAssignments.available ? <p role="status" className="rounded-xl bg-raised p-3 text-sm">La consulta de asignaciones está pendiente del contrato DEP-007.</p> : list.loading && !list.data ? <Skeleton className="h-24 w-full" /> : list.error ? <div role="alert" className="text-danger text-sm">{list.error}<Button variant="secondary" size="sm" className="ml-2" onClick={list.reload}>Reintentar</Button></div> : assignments.length ? <ul className="divide-line divide-y rounded-xl border border-line">{assignments.map((assignment) => <li key={`${assignment.workId}:${assignment.assignedAt}`} className="flex items-center justify-between gap-2 p-3"><span className="text-sm">Obra {assignment.workId}</span>{gateway.capabilities.revokeAssignment.available ? confirmRevoke === assignment.workId ? <span className="flex gap-2"><Button size="sm" variant="danger" disabled={pending} onClick={() => void mutate('revoke', assignment.workId)}>Confirmar revocación</Button><Button size="sm" variant="secondary" onClick={() => setConfirmRevoke(undefined)}>Cancelar</Button></span> : <Button size="sm" variant="secondary" onClick={() => setConfirmRevoke(assignment.workId)}>Revocar</Button> : <span className="text-muted text-xs">Revocación no disponible</span>}</li>)}</ul> : <p className="text-muted text-sm">No hay asignaciones confirmadas.</p>}
      <div className="border-line border-t pt-4">
        <label className="mb-2 block text-sm font-semibold" htmlFor="assign-work-search"><Search className="mr-1 inline size-4" />Buscar obras para asignar</label>
        <input id="assign-work-search" className={inputClass} value={search} onChange={(event) => { setSearch(event.target.value.trim()); setCursor(null); setConfirmAssign(undefined) }} placeholder="Buscar por título" />
        {!gateway.capabilities.listAssignableWorks.available ? <p className="text-muted mt-2 text-sm">La búsqueda y asignación esperan su contrato del servicio.</p> : works.loading && !works.data ? <Skeleton className="mt-2 h-16 w-full" /> : works.error ? <p role="alert" className="text-danger mt-2 text-sm">{works.error}</p> : <ul className="divide-line mt-2 divide-y rounded-xl border border-line">{(works.data?.items ?? []).map((work) => { const exists = assignments.some((item) => item.workId === work.id); return <li key={work.id} className="flex items-center justify-between gap-3 p-3"><span className="truncate text-sm">{work.title}</span>{exists ? <span className="text-muted text-sm">Asignada</span> : confirmAssign === work.id ? <span className="flex items-center gap-2"><span className="sr-only">Asignar {work.title} a {editor.username}</span><Button size="sm" disabled={pending || revalidating || !gateway.capabilities.assignWork.available} onClick={() => void mutate('assign', work.id)}>Confirmar</Button><Button size="sm" variant="secondary" disabled={pending} onClick={() => setConfirmAssign(undefined)}>Cancelar</Button></span> : <Button size="sm" variant="secondary" disabled={!mayManage || pending || revalidating || !gateway.capabilities.assignWork.available} onClick={() => setConfirmAssign(work.id)}>Asignar</Button>}</li> })}</ul>}
        {works.data?.nextCursor ? <Button variant="secondary" className="mt-2 w-full" disabled={works.loading || pending} onClick={() => setCursor(works.data!.nextCursor)}>Cargar más obras</Button> : null}
      </div>
      {confirmAssign ? <p className="rounded-xl border border-line p-3 text-sm">Vas a asignar la obra seleccionada a {editor.username}. Confirma desde la fila de la obra.</p> : null}
      {error ? <p role="alert" className="text-danger text-sm">{error}</p> : null}
      {revalidating ? <p role="status" className="text-muted text-sm">Verificando tu sesión…</p> : null}
      {!mayManage ? <p className="text-muted text-sm">Solo se pueden gestionar asignaciones de otra cuenta con rol EDITOR.</p> : null}
      <div className="flex justify-end"><Button variant="secondary" onClick={onClose}>Cerrar</Button></div>
    </div> : <EmptyState icon={UserRoundCog} title="Selecciona un editor" description="Elige una cuenta con rol EDITOR para consultar asignaciones." />}
  </Modal>
}
