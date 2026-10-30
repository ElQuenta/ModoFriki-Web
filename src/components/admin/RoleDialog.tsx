import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@/lib/zod-resolver'
import { ApiError, errorMessage } from '@/lib/api'
import { canAdminister } from '@/lib/admin-policy'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import type { AdminUser, UserAdminGateway } from '@/services/user-admin'
import { inputClass } from './styles'

const schema = z.object({ role: z.enum(['BASIC', 'EDITOR']) })
type RoleValues = z.infer<typeof schema>

export function RoleDialog({
  open, subject, gateway, onClose, onSaved, onRefresh,
}: {
  open: boolean
  subject: AdminUser | null
  gateway: UserAdminGateway
  onClose: () => void
  onSaved: (user: AdminUser) => void
  onRefresh: () => void
}) {
  const { user, revalidateSession, revalidating } = useAuth()
  const { register, handleSubmit, control, formState: { isDirty } } = useForm<RoleValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: subject?.role === 'EDITOR' ? 'EDITOR' : 'BASIC' },
  })
  const role = useWatch({ control, name: 'role' })
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const available = gateway.capabilities.changeRole.available
  const allowed = Boolean(subject && canAdminister(user?.role, user?.id, subject.role, subject.id, 'change-role'))
  const requestClose = () => {
    if (pending) return
    if (confirmDiscard) { setConfirmDiscard(false); return }
    if (subject && isDirty) setConfirmDiscard(true)
    else onClose()
  }

  const submit = async () => {
    if (!subject || !allowed || !available || pending || revalidating) return
    setPending(true)
    setError(undefined)
    try {
      const actor = await revalidateSession()
      if (actor.role !== 'ADMIN' || actor.id === subject.id || subject.role === 'ADMIN') {
        setError('La identidad o el rol actual no permite cambiar esta cuenta. Actualiza la lista antes de continuar.')
        return
      }
      if (!gateway.capabilities.listUsers.available) {
        setError('No se puede verificar el rol vigente de la cuenta. No se envió el cambio.')
        return
      }
      const latest = await gateway.listUsers({ limit: 20, search: subject.username })
      const currentSubject = latest.items.find((item) => item.id === subject.id)
      if (!currentSubject || currentSubject.role !== subject.role) {
        onRefresh()
        setError('La cuenta cambió o ya no está disponible. Actualiza la lista antes de continuar.')
        return
      }
      const updated = await gateway.changeRole({ actorId: actor.id as never, subjectId: subject.id, role })
      onSaved(updated)
      onClose()
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 403) onRefresh()
      setError(cause instanceof ApiError && cause.status === 403
        ? 'El servicio rechazó el cambio. Actualizamos tu sesión; el rol confirmado no se modificó.'
        : errorMessage(cause, 'No pudimos confirmar el cambio de rol.'))
    } finally {
      setPending(false)
    }
  }

  return <Modal open={open && Boolean(subject)} onClose={requestClose} title={confirmDiscard ? 'Descartar cambios' : 'Cambiar rol'} description={subject ? `Cuenta: ${subject.username}. Solo se permiten cambios entre BASIC y EDITOR.` : undefined}>
    {subject ? <div className="space-y-4">
      {confirmDiscard ? <><p className="text-secondary text-sm">Hay un cambio de rol sin confirmar. ¿Quieres descartarlo?</p><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setConfirmDiscard(false)}>Seguir editando</Button><Button variant="danger" onClick={onClose}>Descartar cambios</Button></div></> : <>
      {!allowed ? <p className="text-secondary text-sm">Esta cuenta solo se puede consultar.</p> : <>
        <label className="text-secondary block text-sm font-semibold" htmlFor="user-role">Nuevo rol</label>
        <select id="user-role" className={inputClass} {...register('role')}>
          <option value="BASIC">BASIC</option><option value="EDITOR">EDITOR</option>
        </select>
        <p className="text-muted text-sm">Se actualizará a {role} únicamente cuando el servicio confirme el cambio.</p>
      </>}
      {!available ? <p role="status" className="text-secondary rounded-xl bg-raised p-3 text-sm">La capacidad de cambiar roles está pendiente de un contrato del servicio. No se enviará ninguna solicitud.</p> : null}
      {error ? <p role="alert" className="text-danger text-sm">{error}</p> : null}
      <div className="flex justify-end gap-2"><Button variant="secondary" disabled={pending} onClick={requestClose}>Cancelar</Button><Button disabled={!allowed || !isDirty || !available || pending || revalidating} onClick={() => void handleSubmit(() => submit())()}>{pending || revalidating ? 'Verificando…' : 'Confirmar cambio'}</Button></div>
      </>}
    </div> : null}
  </Modal>
}
