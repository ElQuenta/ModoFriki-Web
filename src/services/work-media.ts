import type { PersistedMedia, WorkMediaSlot, WorkMediaSlots, WorkMediaSlotName } from '@/types/work-media'

export const WORK_MEDIA_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const WORK_MEDIA_FILE_LIMIT = 10 * 1024 * 1024
export const WORK_MEDIA_REQUEST_LIMIT = 100 * 1024 * 1024

export function createWorkMediaSlot(persisted: PersistedMedia | null): WorkMediaSlot {
  return { persisted, selected: null, previewUrl: persisted?.url ?? null }
}

function revokeSelectedPreview(slot: WorkMediaSlot) {
  if (slot.selected && slot.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(slot.previewUrl)
}

export function validateSelectedMediaFiles(files: File[]): string | undefined {
  const invalidType = files.find((file) => !WORK_MEDIA_TYPES.includes(file.type as typeof WORK_MEDIA_TYPES[number]))
  if (invalidType) return `“${invalidType.name}” no es JPEG, PNG ni WebP.`
  const tooLarge = files.find((file) => file.size > WORK_MEDIA_FILE_LIMIT)
  if (tooLarge) return `“${tooLarge.name}” pesa más de 10 MiB.`
  if (files.reduce((sum, file) => sum + file.size, 0) > WORK_MEDIA_REQUEST_LIMIT)
    return 'Los archivos juntos pasan de 100 MiB.'
  return undefined
}

/** Una selección inválida deja visible el persistido, pero bloquea la operación. */
export function selectWorkMedia(slot: WorkMediaSlot, file: File): WorkMediaSlot {
  revokeSelectedPreview(slot)
  const error = validateSelectedMediaFiles([file])
  if (error) return { ...slot, selected: null, previewUrl: slot.persisted?.url ?? null, error }
  return { ...slot, selected: file, previewUrl: URL.createObjectURL(file), error: undefined }
}

/** Cancelar una selección revierte exactamente a la referencia persistida propia. */
export function clearWorkMediaSelection(slot: WorkMediaSlot): WorkMediaSlot {
  revokeSelectedPreview(slot)
  return { ...slot, selected: null, previewUrl: slot.persisted?.url ?? null, error: undefined }
}

/** Llamar al desmontar/cerrar el formulario para revocar previews Blob. */
export function disposeWorkMediaSlot(slot: WorkMediaSlot): void {
  revokeSelectedPreview(slot)
}

export function validateWorkMediaSlots(slots: WorkMediaSlots): string | undefined {
  const names: WorkMediaSlotName[] = ['cover', 'detailBanner', 'chapterBanner']
  for (const name of names) {
    const slot = slots[name]
    if (slot.error) return slot.error
    if (!slot.selected && !slot.persisted)
      return `Falta un medio obligatorio: ${name === 'cover' ? 'portada' : name === 'detailBanner' ? 'banner de ficha' : 'banner de capítulo'}.`
  }
  return validateSelectedMediaFiles(names.flatMap((name) => slots[name].selected ? [slots[name].selected] : []))
}
