export const catalogPageCache = new Map<string, Map<number, { items: unknown[]; total?: number }>>()

export function clearCatalogPageCache() {
  catalogPageCache.clear()
}
