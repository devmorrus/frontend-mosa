import { Input } from '@/components/ui/input'
import { PAGE_SIZE_OPTIONS } from '@/features/master-data/utils'
import type { RawMaterialLotListItem } from '@/features/raw-material-lots/types'
import type { RawMaterialListItem } from '@/features/raw-materials/types'
import type { StockMovementQueryState } from '@/features/stock-movements/types'
import {
  buildStockMovementSearchPlaceholder,
  STOCK_MOVEMENT_TYPE_OPTIONS,
} from '@/features/stock-movements/utils'
import type { WarehouseListItem } from '@/features/warehouses/types'

interface StockMovementsFilterBarProps {
  query: StockMovementQueryState
  searchInput: string
  filterError: string | null
  warehouses: WarehouseListItem[]
  materials: RawMaterialListItem[]
  lots: RawMaterialLotListItem[]
  onSearchInputChange: (value: string) => void
  onQueryChange: (patch: Partial<StockMovementQueryState>) => void
}

export function StockMovementsFilterBar({
  query,
  searchInput,
  filterError,
  warehouses,
  materials,
  lots,
  onSearchInputChange,
  onQueryChange,
}: StockMovementsFilterBarProps) {
  return (
    <div className="grid gap-3 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Input
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          placeholder={buildStockMovementSearchPlaceholder()}
          className="h-12 rounded-2xl"
        />
        <select
          value={query.movementType}
          onChange={(event) =>
            onQueryChange({
              movementType: event.target.value as StockMovementQueryState['movementType'],
              page: 1,
            })
          }
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
        >
          {STOCK_MOVEMENT_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={query.pageSize}
          onChange={(event) => onQueryChange({ pageSize: Number(event.target.value), page: 1 })}
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
        >
          {PAGE_SIZE_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value} / halaman
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <select
          value={query.warehouseId}
          onChange={(event) => onQueryChange({ warehouseId: event.target.value, page: 1 })}
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
        >
          <option value="">Semua warehouse</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </select>
        <select
          value={query.rawMaterialId}
          onChange={(event) => onQueryChange({ rawMaterialId: event.target.value, rawMaterialLotId: '', page: 1 })}
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
        >
          <option value="">Semua material</option>
          {materials.map((material) => (
            <option key={material.id} value={material.id}>
              {material.code} - {material.name}
            </option>
          ))}
        </select>
        <select
          value={query.rawMaterialLotId}
          onChange={(event) => onQueryChange({ rawMaterialLotId: event.target.value, page: 1 })}
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
        >
          <option value="">Semua LOT</option>
          {lots.map((lot) => (
            <option key={lot.id} value={lot.id}>
              {lot.internalLotNumber}
            </option>
          ))}
        </select>
        <div className="hidden xl:block" />
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Input
          type="date"
          value={query.dateFrom}
          onChange={(event) => onQueryChange({ dateFrom: event.target.value, page: 1 })}
          className="h-12 rounded-2xl"
        />
        <Input
          type="date"
          value={query.dateTo}
          onChange={(event) => onQueryChange({ dateTo: event.target.value, page: 1 })}
          className="h-12 rounded-2xl"
        />
      </div>

      {filterError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {filterError}
        </div>
      ) : null}
    </div>
  )
}
