import { useMemo, useState } from 'react'
import { clamp } from '@/lib/format'

export function usePagination(totalItems: number, pageSize = 9) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const currentPage = clamp(page, 1, totalPages)
  const start = (currentPage - 1) * pageSize
  const end = start + pageSize

  const pages = useMemo(
    () => Array.from({ length: totalPages }, (_, index) => index + 1),
    [totalPages],
  )

  return {
    page: currentPage,
    totalPages,
    pages,
    start,
    end,
    setPage: (next: number) => setPage(clamp(next, 1, totalPages)),
    next: () => setPage((value) => clamp(value + 1, 1, totalPages)),
    previous: () => setPage((value) => clamp(value - 1, 1, totalPages)),
  }
}
