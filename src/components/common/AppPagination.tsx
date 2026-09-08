import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'
import { PAGE_SIZE_OPTIONS } from '@/routes/canonicalRoutes'

/**
 * Pagination standar Tasking 4: server-side, page + pageSize,
 * reset ke halaman 1 saat filter berubah (ditangani hook),
 * opsi pageSize seragam [10, 20, 50].
 */
export function AppPagination({
  pagination,
  onPageChange,
  onPageSizeChange,
  showPageSize = true,
}: {
  pagination: PaginationMeta
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  showPageSize?: boolean
}) {
  return (
    <div className="overflow-hidden rounded-b-[28px]">
      {showPageSize && onPageSizeChange ? (
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-white px-4 pt-3 sm:px-6">
          <label htmlFor="app-page-size" className="text-xs text-slate-500">
            Rows per page
          </label>
          <select
            id="app-page-size"
            value={pagination.pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-xl border border-slate-200 bg-white px-2 text-xs font-semibold text-ink outline-none focus:border-ink"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      ) : null}
      <MasterDataPagination pagination={pagination} onPageChange={onPageChange} />
    </div>
  )
}
