import { ChevronDown, Plus, RotateCcw, Search, SlidersHorizontal, X } from 'lucide-react'
import {
  PAGE_SIZE_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '@/features/master-data/utils'
import { RAW_MATERIAL_CATEGORIES } from '@/features/raw-materials/categories'
import type { RawMaterialQueryState } from '@/features/raw-materials/types'
import type { UnitOfMeasureOption } from '@/features/unit-of-measures/types'

const HAS_EXPIRY_FILTER_OPTIONS: Array<{
  label: string
  value: RawMaterialQueryState['hasExpiry']
}> = [
  { label: 'Semua expiry', value: 'ALL' },
  { label: 'Has Expiry', value: 'YES' },
  { label: 'No Expiry', value: 'NO' },
]

function buildUnitOptionLabel(option: UnitOfMeasureOption) {
  return option.symbol
    ? `${option.name} (${option.code} / ${option.symbol})`
    : `${option.name} (${option.code})`
}

export function RawMaterialToolbar({
  query,
  searchValue,
  uomOptions,
  onSearchValueChange,
  onStatusChange,
  onCategoryChange,
  onUnitOfMeasureChange,
  onHasExpiryChange,
  onPageSizeChange,
  onResetFilters,
  onCreate,
  canCreate,
}: {
  query: RawMaterialQueryState
  searchValue: string
  uomOptions: UnitOfMeasureOption[]
  onSearchValueChange: (value: string) => void
  onStatusChange: (status: RawMaterialQueryState['status']) => void
  onCategoryChange: (value: string) => void
  onUnitOfMeasureChange: (value: string) => void
  onHasExpiryChange: (value: RawMaterialQueryState['hasExpiry']) => void
  onPageSizeChange: (pageSize: number) => void
  onResetFilters: () => void
  onCreate: () => void
  canCreate: boolean
}) {
  const isFiltered =
    query.status !== 'ALL' ||
    searchValue.trim().length > 0 ||
    query.category.trim().length > 0 ||
    query.unitOfMeasureId.length > 0 ||
    query.hasExpiry !== 'ALL'

  const selectClass = (active: boolean) =>
    `h-11 appearance-none rounded-xl border pl-3 pr-9 text-[13px] font-medium outline-none transition-all hover:border-slate-300 focus:ring-4 focus:ring-ink/10 ${
      active
        ? 'border-ink/25 bg-ink/5 text-ink focus:border-ink'
        : 'border-slate-200 bg-white text-slate-700 focus:border-ink'
    }`

  return (
    <div className="rounded-[20px] border border-slate-200/75 bg-white p-4 shadow-[0_14px_34px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="group relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-ink"
            />
            <input
              type="text"
              value={searchValue}
              onChange={(event) => onSearchValueChange(event.target.value)}
              placeholder="Cari kode, nama, atau kategori material"
              aria-label="Cari raw material"
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

          {canCreate && (
            <button
              onClick={onCreate}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-semibold text-paper shadow-[0_14px_30px_rgba(6,59,140,0.22)] transition-all hover:bg-ink-light hover:shadow-[0_18px_36px_rgba(6,59,140,0.26)] active:scale-[0.98]"
            >
              <Plus size={16} />
              Add Material
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 xl:flex">
            <SlidersHorizontal size={13} />
            Filter
          </div>

          <div className="relative">
            <span className={`pointer-events-none absolute left-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${query.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
            <select
              value={query.status}
              onChange={(event) =>
                onStatusChange(event.target.value as RawMaterialQueryState['status'])
              }
              aria-label="Filter status material"
              className={`${selectClass(query.status !== 'ALL')} pl-8`}
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={query.category}
              onChange={(event) => onCategoryChange(event.target.value)}
              aria-label="Filter kategori material"
              className={selectClass(Boolean(query.category))}
            >
              <option value="">Semua kategori</option>
              {RAW_MATERIAL_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={query.unitOfMeasureId}
              onChange={(event) => onUnitOfMeasureChange(event.target.value)}
              aria-label="Filter UOM material"
              className={selectClass(Boolean(query.unitOfMeasureId))}
            >
              <option value="">Semua UOM</option>
              {uomOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {buildUnitOptionLabel(option)}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={query.hasExpiry}
              onChange={(event) =>
                onHasExpiryChange(event.target.value as RawMaterialQueryState['hasExpiry'])
              }
              aria-label="Filter expiry material"
              className={selectClass(query.hasExpiry !== 'ALL')}
            >
              {HAS_EXPIRY_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="relative">
            <select
              value={query.pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              aria-label="Jumlah per halaman"
              className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-9 text-[13px] font-medium text-slate-700 outline-none transition-all hover:border-slate-300 focus:border-ink focus:ring-4 focus:ring-ink/10"
            >
              {PAGE_SIZE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value} / halaman
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex h-11 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-[13px] font-medium text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
