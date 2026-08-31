import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'

/** Builds a compact page list with ellipses, e.g. [1, '…', 4, 5, 6, '…', 12] */
function buildPageList(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set<number>([1, total, current, current - 1, current + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)

  const result: (number | '…')[] = []
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) result.push('…')
    result.push(page)
  })
  return result
}

export function MasterDataPagination({
  pagination,
  onPageChange,
}: {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
}) {
  if (pagination.totalItems === 0) return null

  const start = (pagination.page - 1) * pagination.pageSize + 1
  const end = Math.min(pagination.page * pagination.pageSize, pagination.totalItems)
  const totalPages = Math.max(1, pagination.totalPages)
  const pageList = buildPageList(pagination.page, totalPages)

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs text-slate-400">
        Menampilkan{' '}
        <span className="font-semibold text-slate-600">{start}–{end}</span>{' '}
        dari{' '}
        <span className="font-semibold text-slate-600">{pagination.totalItems}</span>{' '}
        data
      </p>

      <div className="flex items-center justify-center gap-1.5 overflow-x-auto">
        <button
          disabled={!pagination.hasPreviousPage}
          onClick={() => onPageChange(pagination.page - 1)}
          aria-label="Halaman sebelumnya"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronLeft size={14} />
        </button>

        {pageList.map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-xs text-slate-300">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              aria-current={p === pagination.page ? 'page' : undefined}
              className={`inline-flex h-8 min-w-8 shrink-0 items-center justify-center rounded-xl px-2.5 text-xs font-semibold transition-all ${
                p === pagination.page
                  ? 'bg-ink text-paper shadow-sm shadow-ink/20'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
          aria-label="Halaman berikutnya"
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}