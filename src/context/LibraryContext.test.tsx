import { act, renderHook, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({ userId: 'u1', favorites: vi.fn(), remove: vi.fn(), progress: {} as Record<string, unknown> }))
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ user: state.userId ? { id: state.userId } : null }) }))
vi.mock('@/hooks/useLocalStorage', () => ({ useLocalStorage: (key: string, initial: unknown) => {
  const [value, setValue] = React.useState(() => state.progress[key] ?? initial)
  return [value, (update: (current: Record<string, unknown>) => Record<string, unknown>) => setValue((current: Record<string, unknown>) => {
    const next = typeof update === 'function' ? update(current) : update
    state.progress[key] = next
    return next
  })]
} }))
vi.mock('@/services/reading', () => ({ listFavorites: (...args: unknown[]) => state.favorites(...args), addFavorite: vi.fn(), removeFavorite: (...args: unknown[]) => state.remove(...args) }))

import React from 'react'
import { LibraryProvider } from './LibraryContext'
import { useLibrary } from '@/hooks/useLibrary'

const item = (id: string) => ({ series: { id, slug: id, title: id, coverUrl: '', bannerUrl: '', alternativeTitles: [], genres: [], synopsis: '', type: '' }, addedAt: '2026-01-01' })
const wrapper = ({ children }: { children: React.ReactNode }) => <MemoryRouter><LibraryProvider>{children}</LibraryProvider></MemoryRouter>

describe('LibraryProvider paginated favorite knowledge', () => {
  beforeEach(() => { state.userId = 'u1'; state.favorites.mockReset(); state.remove.mockReset(); state.progress = {} })

  it('keeps partial-page absence unknown and exposes the server total/continuation', async () => {
    state.favorites.mockResolvedValueOnce({ page: 1, limit: 20, total: 41, items: [item('known')] })
      .mockResolvedValueOnce({ page: 2, limit: 20, total: 41, items: [item('later')] })
    const { result } = renderHook(() => useLibrary(), { wrapper })
    await waitFor(() => expect(result.current.favoritesLoading).toBe(false))
    expect(result.current.favoritesTotal).toBe(41)
    expect(result.current.favoritesHasMore).toBe(true)
    expect(result.current.favoriteStatus('known')).toBe('favorite')
    expect(result.current.favoriteStatus('not-loaded-yet')).toBe('unknown')
    await act(async () => result.current.loadMoreFavorites())
    expect(result.current.favoriteStatus('later')).toBe('favorite')
    expect(state.favorites).toHaveBeenCalledTimes(2)
  })

  it('keeps local exact reading progress scoped separately for each user and guest', () => {
    state.userId = 'u1'
    state.favorites.mockResolvedValue({ page: 1, limit: 20, total: 0, items: [] })
    const { result, rerender } = renderHook(() => useLibrary(), { wrapper })
    act(() => result.current.updateProgress('work', 'chapter', '1', 7, 101))
    expect(result.current.getProgress('work')).toMatchObject({ page: 7, totalPages: 101 })
    state.userId = 'u2'
    rerender()
    expect(result.current.getProgress('work')).toBeUndefined()
    state.userId = ''
    rerender()
    expect(result.current.getProgress('work')).toBeUndefined()
  })

  it('does not expose the previous account page after the identity changes', async () => {
    state.favorites.mockResolvedValue({ page: 1, limit: 20, total: 1, items: [item('account-one')] })
    const { result, rerender } = renderHook(() => useLibrary(), { wrapper })
    await waitFor(() => expect(result.current.favorites['account-one']).toBeDefined())
    state.userId = 'u2'
    rerender()
    expect(result.current.favorites['account-one']).toBeUndefined()
    expect(result.current.favoriteStatus('account-one')).toBe('unknown')
  })

  it('ignores a failed removal from the previous account after the new account loads', async () => {
    let rejectRemoval!: (reason: Error) => void
    state.favorites.mockResolvedValueOnce({ page: 1, limit: 20, total: 1, items: [item('account-one')] })
      .mockResolvedValueOnce({ page: 1, limit: 20, total: 1, items: [item('account-two')] })
    state.remove.mockImplementation(() => new Promise((_resolve, reject) => { rejectRemoval = reject }))
    const { result, rerender } = renderHook(() => useLibrary(), { wrapper })
    await waitFor(() => expect(result.current.favorites['account-one']).toBeDefined())
    let removal!: Promise<void>
    act(() => { removal = result.current.removeFavorite('account-one') })
    state.userId = 'u2'
    rerender()
    await waitFor(() => expect(result.current.favorites['account-two']).toBeDefined())
    await act(async () => { rejectRemoval(new Error('old request failed')); await removal })
    expect(result.current.favorites['account-two']).toBeDefined()
    expect(result.current.favorites['account-one']).toBeUndefined()
  })
})
