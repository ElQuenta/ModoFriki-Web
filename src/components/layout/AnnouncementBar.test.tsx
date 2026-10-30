import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { UIProvider } from '@/context/UIContext'
import { AnnouncementBar } from './AnnouncementBar'

vi.mock('@/services/discovery', () => ({
  listLatestChapters: vi.fn().mockResolvedValue({
    items: [
      {
        series: { id: 'work-id', title: 'Obra de Prueba' },
        chapter: { id: 'chapter-id', number: '2' },
      },
    ],
  }),
}))

describe('AnnouncementBar', () => {
  it('links to the latest chapter reader with work and chapter IDs', async () => {
    render(
      <MemoryRouter>
        <UIProvider>
          <AnnouncementBar />
        </UIProvider>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Obra de Prueba')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: 'Leer ahora' })).toHaveAttribute(
      'href',
      '/read/work-id/chapter-id',
    )
  })
})
