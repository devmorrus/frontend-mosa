import { Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import {
  PAGE_SIZE_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '@/features/master-data/utils'
import type { ProductQueryState } from '@/features/products/types'

export function ProductToolbar({
  query,
  searchValue,
  onSearchValueChange,
  onStatusChange,
  onPageSizeChange,
  onResetFilters,
  onCreate,
  canCreate,
}: {
  query: ProductQueryState
  searchValue: string
  onSearchValueChange: (value: string) => void
  onStatusChange: (status: ProductQueryState['status']) => void
  onPageSizeChange: (pageSize: number) => void
  onResetFilters: () => void
  onCreate: () => void
  canCreate: boolean
}) {
  const isFiltered = query.status !== 'ALL' || searchValue.trim().length > 0

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white/90 shadow-sm backdrop-blur-sm">
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="group relative flex items-center gap-3">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-ink"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(event) => onSearchValueChange(event.target.value)}
            placeholder="Cari kode atau nama product"
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm text-ink placeholder:text-slate-400 outline-none transition-all focus:border-ink focus:bg-white focus:ring-4 focus:ring-ink/8"
          />
          {searchValue.length > 0 && (
            <button
              type="button"
              onClick={() => onSearchValueChange('')}
              aria-label="Hapus pencarian"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <SlidersHorizontal size={13} />
          Filter
        </div>

        <div className="relative">
          <select
            value={query.status}
            onChange={(event) =>
              onStatusChange(event.target.value as ProductQueryState['status'])
            }
            className={`h-9 appearance-none rounded-xl border pl-3 pr-8 text-xs font-medium outline-none transition-all hover:border-slate-300 focus:ring-2 focus:ring-ink/10 ${
              query.status !== 'ALL'
                ? 'border-ink/20 bg-ink/5 text-ink focus:border-ink'
                : 'border-slate-200 bg-white text-ink focus:border-ink'
            }`}
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            ▾
          </span>
        </div>

        <div className="relative">
          <select
            value={query.pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-9 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-ink outline-none transition-all hover:border-slate-300 focus:border-ink focus:ring-2 focus:ring-ink/10"
          >
            {PAGE_SIZE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value} / hal
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            ▾
          </span>
        </div>

        {isFiltered && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={12} />
            Reset filter
          </button>
        )}

        <div className="flex-1" />

        {canCreate && (
          <button
            onClick={onCreate}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-ink px-4 text-xs font-semibold text-paper shadow-sm transition-all hover:bg-ink-light hover:shadow-md active:scale-95"
          >
            <Plus size={14} />
            Add Product
          </button>
        )}
      </div>
    </div>
  )
}
