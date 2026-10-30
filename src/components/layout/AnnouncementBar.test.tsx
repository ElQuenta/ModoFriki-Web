import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { UIProvider } from '@/context/UIContext'
import { AnnouncementBar } from './AnnouncementBar'

describe('AnnouncementBar', () => {
  it('links to the catalog search instead of treating a slug as a work ID', () => {
    render(
      <MemoryRouter>
        <UIProvider>
          <AnnouncementBar />
        </UIProvider>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Buscar en catálogo' })).toHaveAttribute(
      'href',
      '/series?q=Cazador%20de%20Sombras',
    )
  })
})
