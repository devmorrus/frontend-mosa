import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PAGE_SIZE_OPTIONS } from '@/features/master-data/utils'
import type { ProductionOrderQueryState } from '@/features/production-orders/types'
import { getProductionOrderStatusFilterLabel, hasActiveProductionOrderFilters } from '@/features/production-orders/validation'
import { entityLinks } from '@/routes/canonicalRoutes'

const STATUS_OPTIONS: Array<{ label: string; value: ProductionOrderQueryState['status'] }> = [
  { label: 'Semua status', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Material Shortage', value: 'MATERIAL_SHORTAGE' },
  { label: 'Ready', value: 'READY' },
  { label: 'Scheduled', value: 'SCHEDULED' },
  { label: 'Released', value: 'RELEASED' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Waiting QC', value: 'WAITING_QC' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

interface ProductionOrderToolbarProps {
  query: ProductionOrderQueryState
  searchValue: string
  onSearchValueChange: (value: string) => void
  onStatusChange: (status: ProductionOrderQueryState['status']) => void
  onPageSizeChange: (pageSize: number) => void
  onReset: () => void
  canCreate: boolean
  totalItems: number
  visibleItems: number
}

export function ProductionOrderToolbar({
  query,
  searchValue,
  onSearchValueChange,
  onStatusChange,
  onPageSizeChange,
  onReset,
  canCreate,
  totalItems,
  visibleItems,
}: ProductionOrderToolbarProps) {
  const hasActiveFilters = hasActiveProductionOrderFilters(query)

  return (
    <div className="grid gap-4 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-display text-xl font-semibold text-ink">Filter Production Order</div>
          <p className="mt-1 text-sm text-slate-500">
            Menampilkan {visibleItems} order dari {totalItems} total.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={onReset} disabled={!hasActiveFilters}>
            Reset Filter
          </Button>
          {canCreate ? (
            <Button asChild className="whitespace-nowrap" data-tour="po-create-btn">
              <Link to={entityLinks.productionOrderCreate()} data-tour="po-create-btn">
                <Plus size={16} />
                Buat Production Order
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Search</label>
          <Input
            value={searchValue}
            onChange={(event) => onSearchValueChange(event.target.value)}
            placeholder="Cari PO number, product, atau warehouse"
            className="h-12 rounded-2xl"
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Status</label>
          <select
            value={query.status}
            onChange={(event) =>
              onStatusChange(event.target.value as ProductionOrderQueryState['status'])
            }
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Page size</label>
          <select
            value={query.pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
          >
            {PAGE_SIZE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value} / halaman
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
          {query.search ? <span className="rounded-full bg-slate-100 px-3 py-1">Search: {query.search}</span> : null}
          {query.status !== 'ALL' ? <span className="rounded-full bg-slate-100 px-3 py-1">Status: {getProductionOrderStatusFilterLabel(query.status)}</span> : null}
        </div>
      ) : null}
    </div>
  )
}
