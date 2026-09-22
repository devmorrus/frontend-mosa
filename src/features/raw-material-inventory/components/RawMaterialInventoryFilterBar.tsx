import { CalendarDays, ChevronDown, Filter, Info, Package, RotateCcw, Search, Warehouse } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
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
  onReset: () => void
}

export function RawMaterialInventoryFilterBar({
  query,
  searchInput,
  filterError,
  warehouses,
  materials,
  onSearchInputChange,
  onQueryChange,
  onReset,
}: RawMaterialInventoryFilterBarProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="flex items-center gap-2"><Filter size={17} className="text-[#0b5ed7]" /><h2 className="text-sm font-semibold text-ink">Filter Inventory</h2></div><p className="mt-1 text-xs text-slate-500">Persempit data berdasarkan material, warehouse, status, dan expiry.</p></div>
        <Button type="button" variant="ghost" size="sm" onClick={onReset} className="w-fit gap-1.5 text-slate-500 hover:text-[#063b8c]"><RotateCcw size={13} />Reset filter</Button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(170px,0.7fr)_minmax(170px,0.7fr)]">
        <div className="relative"><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><Input aria-label="Cari material inventory" value={searchInput} onChange={(event) => onSearchInputChange(event.target.value)} placeholder={buildInventorySearchPlaceholder()} className="h-12 rounded-2xl pl-11" /></div>
        <SelectField label="Status" value={query.status} onChange={(value) => onQueryChange({ status: value as InventoryRawMaterialQueryState['status'], page: 1 })}>{INVENTORY_RAW_MATERIAL_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</SelectField>
        <SelectField label="Jumlah per halaman" value={query.pageSize} onChange={(value) => onQueryChange({ pageSize: Number(value), page: 1 })}>{PAGE_SIZE_OPTIONS.map((value) => <option key={value} value={value}>{value} / halaman</option>)}</SelectField>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"><Package size={14} className="text-[#0b5ed7]" /> Master data</div>
      <div className="mt-2 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <SelectField label="Warehouse" dataTour="inventory-warehouse-filter" value={query.warehouseId} onChange={(value) => onQueryChange({ warehouseId: value, page: 1 })}><option value="">Semua warehouse</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</SelectField>
        <SelectField label="Material" value={query.rawMaterialId} onChange={(value) => onQueryChange({ rawMaterialId: value, page: 1 })}><option value="">Semua material</option>{materials.map((material) => <option key={material.id} value={material.id}>{material.code} - {material.name}</option>)}</SelectField>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"><CalendarDays size={14} className="text-[#0b5ed7]" /> Expiry date</div>
      <div className="mt-2 grid gap-3 sm:grid-cols-2"><DateField label="Expiry dari" value={query.expiryFrom} onChange={(value) => onQueryChange({ expiryFrom: value, page: 1 })} /><DateField label="Expiry sampai" value={query.expiryTo} onChange={(value) => onQueryChange({ expiryTo: value, page: 1 })} /></div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5"><Warehouse size={13} /> Warehouse & material</span><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5"><CalendarDays size={13} /> Expiry range</span></div>

      {filterError ? (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Info size={17} className="mt-0.5 shrink-0" />{filterError}
        </div>
      ) : null}
    </div>
  )
}

function SelectField({ label, value, onChange, children, dataTour }: { label: string; value: string | number; onChange: (value: string) => void; children: ReactNode; dataTour?: string }) {
  return <label className="relative block"><span className="sr-only">{label}</span><select data-tour={dataTour} aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm text-ink outline-none transition-all focus:border-[#0b5ed7] focus:ring-4 focus:ring-blue-100">{children}</select><ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" /></label>
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span><Input aria-label={label} type="date" value={value} onChange={(event) => onChange(event.target.value)} className="h-12 rounded-2xl" /></label>
}
