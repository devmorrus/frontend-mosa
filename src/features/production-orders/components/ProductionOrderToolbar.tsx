import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PAGE_SIZE_OPTIONS } from '@/features/master-data/utils'
import type { ProductionOrderQueryState } from '@/features/production-orders/types'

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
  canCreate: boolean
}

export function ProductionOrderToolbar({
  query,
  searchValue,
  onSearchValueChange,
  onStatusChange,
  onPageSizeChange,
  canCreate,
}: ProductionOrderToolbarProps) {
  return (
    <div className="grid gap-3 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Input
          value={searchValue}
          onChange={(event) => onSearchValueChange(event.target.value)}
          placeholder="Cari PO number, product, atau warehouse"
          className="h-12 rounded-2xl"
        />
        <select
          value={query.status}
          onChange={(event) =>
            onStatusChange(event.target.value as ProductionOrderQueryState['status'])
          }
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
        >
          {STATUS_OPTIONS.map((option) => (
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

      <div className="flex justify-end">
        {canCreate ? (
          <Button asChild className="h-12 whitespace-nowrap">
            <Link to="/production/orders/create">
              <Plus size={16} className="mr-2" />
              Buat Production Order
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  )
}
