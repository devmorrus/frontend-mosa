import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PAGE_SIZE_OPTIONS } from '@/features/master-data/utils'
import type { RawMaterialLotQueryState } from '@/features/raw-material-lots/types'
import { RAW_MATERIAL_LOT_STATUS_OPTIONS, buildLotSearchPlaceholder } from '@/features/raw-material-lots/utils'
import type { RawMaterialListItem } from '@/features/raw-materials/types'
import type { SupplierListItem } from '@/features/suppliers/types'
import type { WarehouseListItem } from '@/features/warehouses/types'

interface RawMaterialLotsFilterBarProps {
  query: RawMaterialLotQueryState
  searchInput: string
  filterError: string | null
  suppliers: SupplierListItem[]
  warehouses: WarehouseListItem[]
  materials: RawMaterialListItem[]
  onSearchInputChange: (value: string) => void
  onQueryChange: (patch: Partial<RawMaterialLotQueryState>) => void
}

export function RawMaterialLotsFilterBar({
  query,
  searchInput,
  filterError,
  suppliers,
  warehouses,
  materials,
  onSearchInputChange,
  onQueryChange,
}: RawMaterialLotsFilterBarProps) {
  return (
    <div className="grid gap-3 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-sm sm:p-5">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Input
          value={searchInput}
          onChange={(event) => onSearchInputChange(event.target.value)}
          placeholder={buildLotSearchPlaceholder()}
          className="h-12 rounded-2xl"
        />
        <select
          value={query.status}
          onChange={(event) =>
            onQueryChange({
              status: event.target.value as RawMaterialLotQueryState['status'],
              page: 1,
            })
          }
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
        >
          {RAW_MATERIAL_LOT_STATUS_OPTIONS.map((option) => (
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

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <select
          value={query.supplierId}
          onChange={(event) => onQueryChange({ supplierId: event.target.value, page: 1 })}
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
        >
          <option value="">Semua supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id}>
              {supplier.name}
            </option>
          ))}
        </select>
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
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
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
        <Input
          type="date"
          value={query.receivedDateFrom}
          onChange={(event) => onQueryChange({ receivedDateFrom: event.target.value, page: 1 })}
          className="h-12 rounded-2xl"
        />
        <Input
          type="date"
          value={query.receivedDateTo}
          onChange={(event) => onQueryChange({ receivedDateTo: event.target.value, page: 1 })}
          className="h-12 rounded-2xl"
        />
        <Button asChild className="h-12 whitespace-nowrap">
          <Link to="/lots/scan">Scan QR Test</Link>
        </Button>
      </div>

      {filterError ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {filterError}
        </div>
      ) : null}
    </div>
  )
}
