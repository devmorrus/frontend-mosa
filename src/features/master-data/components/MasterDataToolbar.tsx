import { Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  PAGE_SIZE_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '@/features/master-data/utils'
import type { MasterDataBaseQueryState } from '@/features/master-data/types'

export function MasterDataToolbar({
  query,
  searchValue,
  searchPlaceholder,
  onSearchValueChange,
  onStatusChange,
  onPageSizeChange,
  createLabel,
  onCreate,
  canCreate,
  filters,
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
  filters?: React.ReactNode
}) {
  return (
    <div className="grid gap-3 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-sm sm:p-5">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={searchValue}
          onChange={(event) => onSearchValueChange(event.target.value)}
          placeholder={searchPlaceholder}
          className="h-12 rounded-2xl pl-11"
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-[auto_auto_minmax(0,1fr)_auto] lg:items-center">
        <div className="grid grid-cols-2 gap-3 sm:flex">
          <select
            value={query.status}
            onChange={(event) => onStatusChange(event.target.value as MasterDataBaseQueryState['status'])}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={query.pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
          >
            {PAGE_SIZE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value} / halaman
              </option>
            ))}
          </select>
        </div>

        {filters ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-none lg:auto-cols-fr lg:grid-flow-col">
            {filters}
          </div>
        ) : null}

        {canCreate ? (
          <Button onClick={onCreate} className="h-12 whitespace-nowrap">
            <Plus size={16} />
            {createLabel}
          </Button>
        ) : (
          <div className="hidden lg:block" />
        )}
      </div>
    </div>
  )
}
