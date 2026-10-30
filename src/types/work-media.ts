export interface PersistedMedia {
  id: string
  url: string
}

export type WorkMediaSlotName = 'cover' | 'detailBanner' | 'chapterBanner'

/** Estado de edición de un medio; fallback visual no se representa como persisted. */
export interface WorkMediaSlot {
  persisted: PersistedMedia | null
  selected: File | null
  previewUrl: string | null
  error?: string
}

export type WorkMediaSlots = Record<WorkMediaSlotName, WorkMediaSlot>
