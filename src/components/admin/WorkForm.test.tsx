import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Series } from '@/types'
import { WorkForm } from './WorkForm'

vi.mock('@/hooks/useCatalog', () => ({
  useGenres: () => ({ data: [] }),
  useWorkTypes: () => ({ data: [{ id: 'manga', name: 'Manga' }] }),
}))

const mediaRefs = {
  coverMedia: { id: 'cover-id', url: 'https://assets.test/cover.png' },
  detailBannerMedia: { id: 'detail-id', url: 'https://assets.test/detail.png' },
  chapterBannerMedia: { id: 'chapter-id', url: 'https://assets.test/chapter.png' },
}

const existingWork: Series = {
  id: 'work-1', slug: 'work-1', title: 'Obra existente', alternativeTitles: [],
  coverUrl: mediaRefs.coverMedia.url, bannerUrl: mediaRefs.chapterBannerMedia.url,
  ...mediaRefs, detailBannerUrl: mediaRefs.detailBannerMedia.url,
  chapterBannerUrl: mediaRefs.chapterBannerMedia.url,
  type: 'Manga', typeId: 'manga', publicationStatus: 'DRAFT',
  synopsis: 'Sinopsis', genres: [],
}

function fillRequiredText() {
  fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Obra de prueba' } })
  fireEvent.change(screen.getByLabelText('Sinopsis'), { target: { value: 'Sinopsis de prueba' } })
  fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'manga' } })
}

function image(name: string, type = 'image/png') {
  return new File(['image-bytes'], name, { type })
}

describe('WorkForm independent media slots', () => {
  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:preview') })
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() })
  })

  it('requires all three image slots even for a draft and keeps transport blocked', async () => {
    const onSubmit = vi.fn()
    render(<WorkForm onSubmit={onSubmit} onCancel={vi.fn()} />)
    fillRequiredText()
    for (const label of ['Portada', 'Banner de ficha', 'Banner de capítulo']) {
      fireEvent.change(screen.getByLabelText(label), { target: { files: [image(`${label}.png`)] } })
    }
    fireEvent.click(screen.getByRole('button', { name: 'Crear obra' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/servidor admita los tres medios/)
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getAllByRole('img', { name: /^Vista previa:/ })).toHaveLength(3)
  })

  it('confirms only the selected replacement and cancellation restores the persisted preview', async () => {
    const onSubmit = vi.fn()
    render(<WorkForm work={existingWork} onSubmit={onSubmit} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Portada'), { target: { files: [image('new-cover.png')] } })
    expect(screen.getByRole('img', { name: 'Vista previa: Portada' })).toHaveAttribute('src', 'blob:preview')
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar selección' }))
    expect(screen.getByRole('img', { name: 'Vista previa: Portada' })).toHaveAttribute('src', mediaRefs.coverMedia.url)
    expect(screen.getAllByText(/Se conservará la imagen actual/)).toHaveLength(3)

    fireEvent.change(screen.getByLabelText('Portada'), { target: { files: [image('replacement.png')] } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('group', { name: 'Confirmar reemplazo de medios' })).toHaveTextContent('Portada')
    expect(screen.getByRole('group', { name: 'Confirmar reemplazo de medios' })).not.toHaveTextContent('Banner de ficha, Banner de capítulo')
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar reemplazos' }))
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/DEP-004/))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByRole('img', { name: 'Vista previa: Banner de ficha' })).toHaveAttribute('src', mediaRefs.detailBannerMedia.url)
    expect(screen.getByRole('img', { name: 'Vista previa: Banner de capítulo' })).toHaveAttribute('src', mediaRefs.chapterBannerMedia.url)
  })

  it('rejects an invalid selection even when a persisted image exists', async () => {
    const onSubmit = vi.fn()
    render(<WorkForm work={existingWork} onSubmit={onSubmit} onCancel={vi.fn()} />)
    fireEvent.change(screen.getByLabelText('Portada'), { target: { files: [image('wrong.svg', 'image/svg+xml')] } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('no es JPEG, PNG ni WebP')
    expect(screen.getByRole('img', { name: 'Vista previa: Portada' })).toHaveAttribute('src', mediaRefs.coverMedia.url)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('keeps a legacy work with no detail-banner reference visible and requires completion before saving', async () => {
    const onSubmit = vi.fn()
    const legacy: Series = {
      ...existingWork,
      detailBannerUrl: null,
      detailBannerMedia: null,
      // The old single banner remains the chapter banner; it is not reused as persisted detail media.
      bannerUrl: mediaRefs.chapterBannerMedia.url,
    }
    render(<WorkForm work={legacy} onSubmit={onSubmit} onCancel={vi.fn()} />)
    expect(screen.getByText(/DEP-004/)).toHaveTextContent(/tres medios independientes/)
    expect(screen.getByRole('img', { name: 'Vista previa: Portada' })).toHaveAttribute('src', mediaRefs.coverMedia.url)
    expect(screen.getByText('Sin medio guardado ni vista previa.')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'Vista previa: Banner de ficha' })).not.toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Banner de ficha'), { target: { files: [image('detail-banner.webp', 'image/webp')] } })
    fireEvent.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    expect(await screen.findByRole('alert')).toHaveTextContent(/DEP-004/)
    expect(onSubmit).not.toHaveBeenCalled()
  })

})
