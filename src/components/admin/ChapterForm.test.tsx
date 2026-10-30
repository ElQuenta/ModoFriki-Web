import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChapterForm } from './ChapterForm'
import type { Chapter } from '@/types'

vi.mock('@/services/admin', () => ({ validateImages: vi.fn(() => undefined) }))

const chapter: Chapter = {
  id: 'chapter-1', seriesId: 'work-1', number: '0012.500', title: '', kind: 'NORMAL',
  status: 'DRAFT', version: 3, releaseDate: '2026-01-01T00:00:00.000Z', pages: [],
}

describe('ChapterForm', () => {
  it('preserves chapter decimal text without numeric conversion or rounding', () => {
    render(<ChapterForm chapter={chapter} onSubmit={vi.fn()} onCancel={vi.fn()} />)
    expect(screen.getByRole('textbox', { name: 'Número' })).toHaveValue('0012.500')
  })
})
