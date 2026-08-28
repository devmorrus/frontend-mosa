import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'

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

  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-slate-400">
        Menampilkan{' '}
        <span className="font-semibold text-slate-600">{start}–{end}</span>{' '}
        dari{' '}
        <span className="font-semibold text-slate-600">{pagination.totalItems}</span>{' '}
        data
      </p>

      <div className="flex items-center gap-2">
        <button
          disabled={!pagination.hasPreviousPage}
          onClick={() => onPageChange(pagination.page - 1)}
          className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-35"
        >
          <ChevronLeft size={14} />
          Prev
        </button>

        <div className="min-w-[72px] rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-center text-xs font-semibold text-slate-600">
          {pagination.page} / {Math.max(1, pagination.totalPages)}
        </div>

        <button
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
          className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:pointer-events-none disabled:opacity-35"
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}
