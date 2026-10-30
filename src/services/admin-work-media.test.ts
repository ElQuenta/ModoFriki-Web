import { beforeEach, describe, expect, it, vi } from 'vitest'

const { request } = vi.hoisted(() => ({ request: vi.fn() }))
vi.mock('@/lib/api', () => ({ request }))

import { createWork, updateWork } from './admin'

const input = {
  title: 'Obra', synopsis: 'Sinopsis', typeId: 'type', publicationStatus: 'DRAFT' as const,
  releaseStatus: 'ONGOING' as const, alternativeTitles: [], genreIds: [],
}

describe('work media transport remains blocked until DEP-004', () => {
  beforeEach(() => request.mockReset())

  it('rejects creation before HTTP so it cannot persist a partial two-image work', async () => {
    await expect(createWork(input, {})).rejects.toMatchObject({ dependency: 'DEP-004' })
    expect(request).not.toHaveBeenCalled()
  })

  it('rejects edits before HTTP and does not submit guessed multipart fields', async () => {
    await expect(updateWork('work-1', input, { cover: new File(['cover'], 'cover.jpg', { type: 'image/jpeg' }) }, 'v1'))
      .rejects.toMatchObject({ dependency: 'DEP-004' })
    expect(request).not.toHaveBeenCalled()
  })
})
