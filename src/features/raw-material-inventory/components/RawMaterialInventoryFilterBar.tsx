import { Input } from '@/components/ui/input'
import { PAGE_SIZE_OPTIONS } from '@/features/master-data/utils'
import type { InventoryRawMaterialQueryState } from '@/features/raw-material-inventory/types'
import {
  buildInventorySearchPlaceholder,
  INVENTORY_RAW_MATERIAL_STATUS_OPTIONS,
} from '@/features/raw-material-inventory/utils'
import type { RawMaterialListItem } from '@/features/raw-materials/types'
import type { WarehouseListItem } from '@/features/warehouses/types'

interface RawMaterialInventoryFilterBarProps {
  query: InventoryRawMaterialQueryState
  searchInput: string
  filterError: string | null
  warehouses: WarehouseListItem[]
  materials: RawMaterialListItem[]
  onSearchInputChange: (value: string) => void
  onQueryChange: (patch: Partial<InventoryRawMaterialQueryState>) => void
}

export function RawMaterialInventoryFilterBar({
  query,
  searchInput,
  filterError,
  warehouses,
  materials,
  onSearchInputChange,
  onQueryChange,
}: RawMaterialInventoryFilterBarProps) {
  return (
    <div className="grid gap-3 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Input
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          placeholder={buildInventorySearchPlaceholder()}
          className="h-12 rounded-2xl"
        />
        <select
          value={query.status}
          onChange={(event) =>
            onQueryChange({
              status: event.target.value as InventoryRawMaterialQueryState['status'],
              page: 1,
            })
          }
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
        >
          {INVENTORY_RAW_MATERIAL_STATUS_OPTIONS.map((option) => (
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
          data-tour="inventory-warehouse-filter"
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
          onChange={(event) => onQueryChange({ rawMaterialId: event.target.value, page: 1 })}
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
        >
          <option value="">Semua material</option>
          {materials.map((material) => (
            <option key={material.id} value={material.id}>
              {material.code} - {material.name}
            </option>
          ))}
        </select>
        <Input
          type="date"
          value={query.expiryFrom}
          onChange={(event) => onQueryChange({ expiryFrom: event.target.value, page: 1 })}
          className="h-12 rounded-2xl"
        />
        <Input
          type="date"
          value={query.expiryTo}
          onChange={(event) => onQueryChange({ expiryTo: event.target.value, page: 1 })}
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
