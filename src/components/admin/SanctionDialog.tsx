import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import { ApiError, errorMessage } from '@/lib/api'
import { zodResolver } from '@/lib/zod-resolver'
import { accountTimeZone, formatInstantInZone, resolveZonedDateTime } from '@/lib/zoned-date'
import { canAdminister } from '@/lib/admin-policy'
import { validateSanctionInput } from '@/lib/admin-validation'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import type { AdminUser, UserAdminGateway } from '@/services/user-admin'
import type { SanctionStatus } from '@/types/user-admin'
import { inputClass, labelClass, textareaClass } from './styles'

const sanctionFormSchema = z.object({ reason: z.string() })
type SanctionFormValues = z.infer<typeof sanctionFormSchema>

export function SanctionDialog({
  open, subject, gateway, onClose, onSaved, onRefresh,
}: {
  open: boolean
  subject: AdminUser | null
  gateway: UserAdminGateway
  onClose: () => void
  onSaved: (sanction: SanctionStatus) => void
  onRefresh: () => void
}) {
  const { user, revalidateSession, revalidating } = useAuth()
  const zone = accountTimeZone(user?.timezone)
  const [loadedSanction, setLoadedSanction] = useState<{ subjectId: string; status: SanctionStatus }>()
  const current: SanctionStatus = subject && loadedSanction?.subjectId === subject.id ? loadedSanction.status : { kind: 'unknown' }
  const active = current?.kind === 'active-temporary' || current?.kind === 'active-permanent'
  const [type, setType] = useState<'temporary' | 'permanent'>('temporary')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [offset, setOffset] = useState('')
  const { register, control, handleSubmit, formState: { isDirty } } = useForm<SanctionFormValues>({
    resolver: zodResolver(sanctionFormSchema),
    defaultValues: { reason: '' },
  })
  const reason = useWatch({ control, name: 'reason' })
  const [activeAction, setActiveAction] = useState<'revoke' | 'extend'>('revoke')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string>()
  const [loadError, setLoadError] = useState<{ subjectId: string; message: string }>()
  const [fieldError, setFieldError] = useState<string>()
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  useEffect(() => {
    let currentRequest = true
    if (!open || !subject || !gateway.capabilities.getSanction.available) return () => { currentRequest = false }
    void gateway.getSanction(subject.id).then((status) => {
      if (currentRequest) setLoadedSanction({ subjectId: subject.id, status })
    }).catch((cause: unknown) => {
      if (currentRequest) setLoadError({ subjectId: subject.id, message: errorMessage(cause, 'No pudimos consultar la sanción vigente.') })
    })
    return () => { currentRequest = false }
  }, [open, subject, gateway])
  const visibleError = error ?? (subject && loadError?.subjectId === subject.id
    ? loadError.message
    : open && subject && !gateway.capabilities.getSanction.available
      ? 'No se puede consultar el estado vigente de la sanción.'
      : undefined)
  const available = active
    ? activeAction === 'extend'
      ? current?.kind === 'active-temporary' && gateway.capabilities.extendSanction.available
      : gateway.capabilities.revokeSanction.available
    : gateway.capabilities.applySanction.available
  const knownSanction = current?.kind !== 'unknown'
  const allowed = Boolean(subject && knownSanction && canAdminister(user?.role, user?.id, subject.role, subject.id, 'manage-sanction'))
  const resolved = useMemo(() => type === 'temporary' && date && time
    ? resolveZonedDateTime({ date, time, timeZone: zone, offset: offset || undefined })
    : null, [type, date, time, zone, offset])
  const candidates = resolved?.kind === 'ambiguous' ? resolved.candidates : []
  const dirty = Boolean(isDirty || date || time || type !== 'temporary' || activeAction !== 'revoke')
  const requestClose = () => {
    if (pending) return
    if (confirmDiscard) { setConfirmDiscard(false); return }
    if (dirty) setConfirmDiscard(true)
    else onClose()
  }

  const submit = async () => {
    if (!subject || !allowed || !available || pending || revalidating) return
    setError(undefined)
    setFieldError(undefined)
    if (active && activeAction === 'extend' && current?.kind === 'active-temporary') {
      if (resolved?.kind !== 'resolved') {
        setFieldError(resolved?.kind === 'nonexistent'
          ? 'Esa hora no existe en la zona seleccionada.'
          : resolved?.kind === 'ambiguous'
            ? 'Selecciona cuál desfase horario corresponde a esa hora.'
            : 'Indica una fecha, hora y zona válidas.')
        return
      }
      const validation = validateSanctionInput({ subjectId: subject.id, reason: current.reason || 'gestión de sanción', type: 'temporary', endsAt: resolved.candidate.instant }, { previous: current })
      if (validation) { setFieldError(validationMessage(validation)); return }
    }
    if (active && current) {
      const extensionEndsAt = resolved?.kind === 'resolved' ? resolved.candidate.instant : undefined
      setPending(true)
      try {
        const actor = await revalidateSession()
        if (actor.role !== 'ADMIN') throw new Error('La cuenta ya no cumple las condiciones para gestionar sanciones.')
        if (!gateway.capabilities.getUser.available) throw new Error('No se puede verificar el rol vigente de la cuenta.')
        const currentSubject = await gateway.getUser(subject.id)
        if (!currentSubject || currentSubject.role !== subject.role || currentSubject.role === 'ADMIN') {
          onRefresh()
          throw new Error('La cuenta cambió o ya no está disponible. Actualiza la lista antes de continuar.')
        }
        let updated: SanctionStatus
        if (activeAction === 'extend' && current.kind === 'active-temporary') {
          if (!extensionEndsAt) throw new Error('Indica una nueva fecha de vencimiento válida.')
          updated = await gateway.extendSanction({ subjectId: subject.id, endsAt: extensionEndsAt })
        } else {
          updated = await gateway.revokeSanction(subject.id)
        }
        setLoadedSanction({ subjectId: subject.id, status: updated })
        onSaved(updated)
        onClose()
      } catch (cause) {
        if (cause instanceof ApiError && cause.status === 403) onRefresh()
        setError(cause instanceof ApiError && cause.status === 403
          ? 'El servicio rechazó la operación. Actualizamos tu sesión; el estado confirmado se conserva.'
          : errorMessage(cause, 'No pudimos retirar la sanción.'))
      } finally { setPending(false) }
      return
    }

    const endsAt = type === 'temporary' && resolved?.kind === 'resolved' ? resolved.candidate.instant : undefined
    const validation = validateSanctionInput({ subjectId: subject.id, reason, type, endsAt })
    if (validation) { setFieldError(validationMessage(validation)); return }
    if (type === 'temporary' && resolved?.kind !== 'resolved') {
      setFieldError(resolved?.kind === 'nonexistent'
        ? 'Esa hora no existe en la zona seleccionada.'
        : resolved?.kind === 'ambiguous'
          ? 'Selecciona cuál desfase horario corresponde a esa hora.'
          : 'Indica una fecha, hora y zona válidas.')
      return
    }
    setPending(true)
    try {
      const actor = await revalidateSession()
      if (actor.role !== 'ADMIN' || actor.id === subject.id) throw new Error('La cuenta ya no cumple las condiciones para recibir una sanción.')
      if (!gateway.capabilities.getUser.available) throw new Error('No se puede verificar el rol vigente de la cuenta.')
      const currentSubject = await gateway.getUser(subject.id)
      if (!currentSubject || currentSubject.role !== subject.role || currentSubject.role === 'ADMIN') {
        onRefresh()
        throw new Error('La cuenta cambió o ya no está disponible. Actualiza la lista antes de continuar.')
      }
      const input = type === 'permanent'
        ? { subjectId: subject.id, reason: reason.trim(), type: 'permanent' as const }
        : { subjectId: subject.id, reason: reason.trim(), type: 'temporary' as const, endsAt: endsAt! }
      const updated = await gateway.applySanction(input)
      setLoadedSanction({ subjectId: subject.id, status: updated })
      onSaved(updated)
      onClose()
    } catch (cause) {
      if (cause instanceof ApiError && cause.status === 403) onRefresh()
      setError(cause instanceof ApiError && cause.status === 403
        ? 'El servicio rechazó la operación. Actualizamos tu sesión; el estado confirmado se conserva.'
        : errorMessage(cause, 'No pudimos confirmar la sanción.'))
    } finally { setPending(false) }
  }

  const preview = type === 'permanent' ? 'Permanente' : resolved?.kind === 'resolved'
    ? formatInstantInZone(resolved.candidate.instant, zone)
    : 'Fecha y hora pendientes'

  return <Modal open={open && Boolean(subject)} onClose={requestClose} title={confirmDiscard ? 'Descartar cambios' : active ? 'Gestionar sanción' : 'Aplicar sanción'} description={subject ? `Cuenta: ${subject.username}. Zona horaria: ${zone}.` : undefined}>
    {subject ? <div className="space-y-4">
      {confirmDiscard ? <><p className="text-secondary text-sm">Hay cambios de sanción sin confirmar. ¿Quieres descartarlos?</p><div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => setConfirmDiscard(false)}>Seguir editando</Button><Button variant="danger" onClick={onClose}>Descartar cambios</Button></div></> : <>
      {active ? <>
        <p className="rounded-xl bg-raised p-3 text-sm">Sanción actual: {current?.kind === 'active-temporary' ? `Temporal hasta ${formatInstantInZone(current.endsAt, zone)}` : 'Permanente'}.</p>
        {current?.kind === 'active-temporary' ? <div className="flex gap-2"><Button variant={activeAction === 'revoke' ? 'outline' : 'secondary'} onClick={() => setActiveAction('revoke')}>Retirar</Button><Button variant={activeAction === 'extend' ? 'outline' : 'secondary'} disabled={!gateway.capabilities.extendSanction.available} onClick={() => setActiveAction('extend')}>Extender</Button></div> : null}
        {activeAction === 'extend' && current?.kind === 'active-temporary' ? <div><label className={labelClass} htmlFor="sanction-extend">Nuevo vencimiento</label><input id="sanction-extend" type="datetime-local" className={inputClass} value={date && time ? `${date}T${time}` : ''} onChange={(e) => { setDate(e.target.value.slice(0, 10)); setTime(e.target.value.slice(11, 16)); setOffset('') }} /><p className="text-muted mt-1 text-xs">Debe ser posterior al vencimiento actual ({formatInstantInZone(current.endsAt, zone)}).</p>{candidates.length ? <select aria-label="Desfase horario" className={`${inputClass} mt-2`} value={offset} onChange={(e) => setOffset(e.target.value)}><option value="">Selecciona desfase horario</option>{candidates.map((candidate) => <option key={candidate.offset} value={candidate.offset}>{candidate.offset}</option>)}</select> : null}</div> : null}
      </> : <>
        {!knownSanction ? <p role="status" className="text-secondary rounded-xl bg-raised p-3 text-sm">El estado de sanción no está confirmado. No es posible aplicar otra sanción hasta consultar el estado vigente.</p> : null}
        <div><label className={labelClass} htmlFor="sanction-type">Duración</label><select id="sanction-type" className={inputClass} value={type} onChange={(e) => { const next = e.target.value as 'temporary' | 'permanent'; setType(next); if (next === 'permanent') { setDate(''); setTime(''); setOffset(''); setFieldError(undefined) } }}><option value="temporary">Temporal</option><option value="permanent">Permanente</option></select></div>
        {type === 'temporary' ? <>
          <div><label className={labelClass} htmlFor="sanction-date">Fecha y hora de vencimiento</label><input id="sanction-date" type="datetime-local" className={inputClass} value={date && time ? `${date}T${time}` : ''} onChange={(e) => { setDate(e.target.value.slice(0, 10)); setTime(e.target.value.slice(11, 16)); setOffset('') }} aria-describedby={fieldError ? 'sanction-error' : undefined} /></div>
          {candidates.length ? <div><label className={labelClass} htmlFor="sanction-offset">Hora ambigua; selecciona desfase</label><select id="sanction-offset" className={inputClass} value={offset} onChange={(e) => setOffset(e.target.value)}><option value="">Seleccionar</option>{candidates.map((candidate) => <option key={candidate.offset} value={candidate.offset}>{candidate.offset} · {new Date(candidate.instant).toLocaleString('es', { timeZone: 'UTC' })}</option>)}</select></div> : null}
          <p className="text-muted text-xs">La fecha se interpreta en {zone}; la hora debe existir y ser futura.</p>
        </> : null}
        <div><label className={labelClass} htmlFor="sanction-reason">Motivo</label><textarea id="sanction-reason" className={textareaClass} rows={3} maxLength={2000} {...register('reason')} aria-describedby={fieldError ? 'sanction-error' : undefined} /></div>
      </>}
      {fieldError ? <p id="sanction-error" role="alert" className="text-danger text-sm">{fieldError}</p> : null}
      {!available ? <p role="status" className="text-secondary rounded-xl bg-raised p-3 text-sm">Esta operación todavía no está disponible porque falta el contrato correspondiente. No se enviará ninguna solicitud.</p> : null}
      {visibleError ? <p role="alert" className="text-danger text-sm">{visibleError}</p> : null}
      <div className="rounded-xl border border-line p-3 text-sm"><strong>Confirmación:</strong> {active ? `${activeAction === 'extend' ? `extender la sanción de ${subject.username} hasta ${resolved?.kind === 'resolved' ? formatInstantInZone(resolved.candidate.instant, zone) : 'una fecha pendiente'}` : `retirar la sanción de ${subject.username}`}` : `${type === 'temporary' ? 'temporal' : 'permanente'} para ${subject.username}; vencimiento: ${preview}`}</div>
      <div className="flex justify-end gap-2"><Button variant="secondary" disabled={pending} onClick={requestClose}>Cancelar</Button><Button variant={activeAction === 'revoke' && active ? 'danger' : 'primary'} disabled={!allowed || !available || pending || revalidating} onClick={() => void handleSubmit(() => submit())()}>{pending || revalidating ? 'Verificando…' : active ? activeAction === 'extend' ? 'Confirmar extensión' : 'Retirar sanción' : 'Confirmar sanción'}</Button></div>
      </>}
    </div> : null}
  </Modal>
}

function validationMessage(error: string) {
  const messages: Record<string, string> = {
    'subject-required': 'Selecciona una cuenta.',
    'reason-required': 'Escribe un motivo.',
    'reason-too-long': 'El motivo no puede superar los 2000 caracteres.',
    'ends-at-required': 'Indica el vencimiento.',
    'ends-at-invalid': 'El vencimiento no es válido.',
    'ends-at-not-future': 'El vencimiento debe ser posterior al momento actual.',
    'ends-at-not-extended': 'La extensión debe superar el vencimiento actual.',
  }
  return messages[error] ?? 'Revisa los datos de la sanción.'
}
