import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({ userId: 'u1', setData: vi.fn(), setRating: vi.fn() }))
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: { id: state.userId } }) }))
vi.mock('./useAsync', () => ({ useAsync: () => ({ data: { score: 1, chapters: { items: [] }, totalChapters: 0, readChapters: 0 }, setData: state.setData }) }))
vi.mock('@/services/reading', () => ({ getWorkProgress: vi.fn(), setRating: (...args: unknown[]) => state.setRating(...args), removeRating: vi.fn(), markChapterRead: vi.fn(), unmarkChapterRead: vi.fn() }))
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

import { useWorkProgress } from './useReading'

describe('useWorkProgress mutation identity', () => {
  beforeEach(() => { state.userId = 'u1'; state.setData.mockReset(); state.setRating.mockReset() })

  it('does not roll back an old account rating into the new account query', async () => {
    let rejectRating!: (reason: Error) => void
    state.setRating.mockImplementation(() => new Promise((_resolve, reject) => { rejectRating = reject }))
    const { result, rerender } = renderHook(({ userId }) => {
      state.userId = userId
      return useWorkProgress('work')
    }, { initialProps: { userId: 'u1' } })
    let pending!: Promise<void>
    act(() => { pending = result.current.setScore(4.5) })
    expect(state.setData).toHaveBeenCalledTimes(1)
    rerender({ userId: 'u2' })
    await act(async () => { rejectRating(new Error('stale')); await pending })
    expect(state.setData).toHaveBeenCalledTimes(1)
  })

  it('rejects values outside the 0–5 half-step contract before mutation', async () => {
    state.setRating.mockResolvedValue(undefined)
    const { result } = renderHook(() => useWorkProgress('work'))
    await act(async () => result.current.setScore(3.25))
    expect(state.setRating).not.toHaveBeenCalled()
  })
})
