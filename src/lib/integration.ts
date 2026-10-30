import type { Availability } from '@/types/integration'

/** Error acotado para distinguir dependencia ausente de error y colección vacía. */
export class IntegrationUnavailableError extends Error {
  readonly dependency: string

  constructor(dependency: string, message = 'Esta función no está disponible todavía.') {
    super(message)
    this.name = 'IntegrationUnavailableError'
    this.dependency = dependency
  }
}

export function assertAvailable(availability: Availability): void {
  if (availability.status === 'unavailable') {
    throw new IntegrationUnavailableError(availability.dependency)
  }
}
