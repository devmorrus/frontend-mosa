import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <div className="flex flex-col gap-3 border-t border-slate-200/80 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Menampilkan <span className="font-semibold text-ink">{start}</span> -{' '}
        <span className="font-semibold text-ink">{end}</span> dari{' '}
        <span className="font-semibold text-ink">{pagination.totalItems}</span> data
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={!pagination.hasPreviousPage}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          <ChevronLeft size={16} />
          Sebelumnya
        </Button>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
          Halaman {pagination.page} / {Math.max(1, pagination.totalPages)}
        </div>
        <Button
          variant="secondary"
          size="sm"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Berikutnya
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  )
}
