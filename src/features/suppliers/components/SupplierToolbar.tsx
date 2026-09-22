import { ChevronDown, Plus, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'
import {
  PAGE_SIZE_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '@/features/master-data/utils'
import type { MasterDataBaseQueryState } from '@/features/master-data/types'

const STATUS_DOT: Record<string, string> = {
  ALL: 'bg-slate-400',
  ACTIVE: 'bg-emerald-500',
  INACTIVE: 'bg-slate-400',
}

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
    <div className="rounded-[20px] border border-slate-200/75 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        {/* Search */}
        <div className="group relative min-w-0 flex-1">
          <Search
            size={17}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-ink"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchValueChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label="Cari supplier"
            className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-11 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-ink focus:bg-white focus:ring-4 focus:ring-ink/10"
          />
          {searchValue.length > 0 && (
            <button
              type="button"
              onClick={() => onSearchValueChange('')}
              aria-label="Hapus pencarian"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-200/70 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 xl:flex">
            <SlidersHorizontal size={13} />
            Filter
          </div>

          {/* Status select */}
          <div className="relative">
            <span className={`pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${STATUS_DOT[query.status] ?? STATUS_DOT.ALL}`} />
            <select
              value={query.status}
              onChange={(e) =>
                onStatusChange(e.target.value as MasterDataBaseQueryState['status'])
              }
              aria-label="Filter status supplier"
              className={`h-11 appearance-none rounded-xl border pl-8 pr-9 text-[13px] font-medium outline-none transition-all hover:border-slate-300 focus:ring-4 focus:ring-ink/10 ${
                query.status !== 'ALL'
                  ? 'border-ink/25 bg-ink/5 text-ink focus:border-ink'
                  : 'border-slate-200 bg-white text-slate-700 focus:border-ink'
              }`}
            >
              {STATUS_FILTER_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Page size select */}
          <div className="relative">
            <select
              value={query.pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Jumlah per halaman"
              className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-[13px] font-medium text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-ink focus:ring-4 focus:ring-ink/10"
            >
              {PAGE_SIZE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v} / halaman
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Reset filter */}
          {isFiltered && (
            <button
              type="button"
              onClick={() => {
                onStatusChange('ALL')
                onSearchValueChange('')
              }}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}

          {/* Add button */}
          {canCreate && (
            <button
              onClick={onCreate}
              data-tour="supplier-add-btn"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-paper shadow-[0_14px_30px_rgba(6,59,140,0.22)] transition-all hover:bg-ink-light hover:shadow-[0_18px_36px_rgba(6,59,140,0.26)] active:scale-[0.98]"
            >
              <Plus size={16} />
              {createLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}