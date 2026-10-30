/** Disponibilidad de una capacidad remota; nunca concede permisos. */
export type Availability =
  | { status: 'available' }
  | { status: 'unavailable'; dependency: string }

export type QueryState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'empty' }
  | { status: 'error'; error: Error }
  | { status: 'unavailable'; dependency: string }

export type ManagementAccess = 'allowed' | 'denied' | 'unknown'
