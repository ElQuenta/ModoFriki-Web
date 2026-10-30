import { beforeEach, describe, expect, it, vi } from 'vitest'

const { request } = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock('@/lib/api', () => ({ request: (...args: unknown[]) => request(...args) }))

import { listLatestChapters, listPopularWorks } from './discovery'

describe('discovery service pages', () => {
  beforeEach(() => request.mockReset())

  it('forwards latest-chapter pagination, type filter, and cancellation', async () => {
    const signal = new AbortController().signal
    request.mockResolvedValue({ items: [], total: 37, page: 2, limit: 20 })
    await expect(listLatestChapters({ page: 2, limit: 20, typeId: 'type', signal })).resolves.toMatchObject({ total: 37, page: 2 })
    expect(request).toHaveBeenCalledWith('/chapters/latest', {
      query: { page: 2, limit: 20, typeId: 'type' }, signal,
    })
  })

  it('forwards ranking period/type/page and retains the server total', async () => {
    const signal = new AbortController().signal
    request.mockResolvedValue({ items: [], total: 137, page: 3, limit: 50 })
    await expect(listPopularWorks({ page: 3, limit: 50, period: 'day', typeId: 'type', signal })).resolves.toEqual({
      items: [], total: 137, page: 3, limit: 50,
    })
    expect(request).toHaveBeenCalledWith('/works/popular', {
      query: { page: 3, limit: 50, period: 'day', typeId: 'type' }, signal,
    })
  })
})
