import { Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import {
  PAGE_SIZE_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '@/features/master-data/utils'
import type { MasterDataBaseQueryState } from '@/features/master-data/types'

export function SupplierToolbar({
  query,
  searchValue,
  searchPlaceholder,
  onSearchValueChange,
  onStatusChange,
  onPageSizeChange,
  createLabel,
  onCreate,
  canCreate,
}: {
  query: MasterDataBaseQueryState
  searchValue: string
  searchPlaceholder: string
  onSearchValueChange: (value: string) => void
  onStatusChange: (status: MasterDataBaseQueryState['status']) => void
  onPageSizeChange: (pageSize: number) => void
  createLabel: string
  onCreate: () => void
  canCreate: boolean
}) {
  const isFiltered = query.status !== 'ALL' || searchValue.trim().length > 0

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white/90 shadow-sm backdrop-blur-sm">
      {/* Search row */}
      <div className="border-b border-slate-100 px-4 py-4 sm:px-5">
        <div className="group relative flex items-center gap-3">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-ink"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchValueChange(e.target.value)}
            placeholder={searchPlaceholder}
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

      {/* Filter + actions row */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-5">
        {/* Filter icon label */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
          <SlidersHorizontal size={13} />
          Filter
        </div>

        {/* Status select */}
        <div className="relative">
          <select
            value={query.status}
            onChange={(e) =>
              onStatusChange(e.target.value as MasterDataBaseQueryState['status'])
            }
            className={`h-9 appearance-none rounded-xl border pl-3 pr-8 text-xs font-medium outline-none transition-all hover:border-slate-300 focus:ring-2 focus:ring-ink/10 ${
              query.status !== 'ALL'
                ? 'border-ink/20 bg-ink/5 text-ink focus:border-ink'
                : 'border-slate-200 bg-white text-ink focus:border-ink'
            }`}
          >
            {STATUS_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            ▾
          </span>
        </div>

        {/* Page size select */}
        <div className="relative">
          <select
            value={query.pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-9 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-medium text-ink outline-none transition-all hover:border-slate-300 focus:border-ink focus:ring-2 focus:ring-ink/10"
          >
            {PAGE_SIZE_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {v} / hal
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
            ▾
          </span>
        </div>

        {/* Reset filter chip */}
        {isFiltered && (
          <button
            type="button"
            onClick={() => {
              onStatusChange('ALL')
              onSearchValueChange('')
            }}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={12} />
            Reset filter
          </button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Add button */}
        {canCreate && (
          <button
            onClick={onCreate}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-ink px-4 text-xs font-semibold text-paper shadow-sm transition-all hover:bg-ink-light hover:shadow-md active:scale-95"
          >
            <Plus size={14} />
            {createLabel}
          </button>
        )}
      </div>
    </div>
  )
}