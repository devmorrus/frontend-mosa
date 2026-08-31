import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'
import { RawMaterialInventoryLotBreakdown } from '@/features/raw-material-inventory/components/RawMaterialInventoryLotBreakdown'
import type { InventoryRawMaterialListItem } from '@/features/raw-material-inventory/types'
import {
  formatInventoryQuantity,
  getAggregateWarehouseLabel,
  getInventoryAggregateStatus,
  getInventoryAggregateStatusTone,
} from '@/features/raw-material-inventory/utils'

interface RawMaterialInventoryTableProps {
  items: InventoryRawMaterialListItem[]
  pagination: PaginationMeta
  expandedMaterialId: string | null
  selectedWarehouseId: string
  isRefreshing: boolean
  onToggleBreakdown: (materialId: string) => void
  onPageChange: (page: number) => void
}

export function RawMaterialInventoryTable({
  items,
  pagination,
  expandedMaterialId,
  selectedWarehouseId,
  isRefreshing,
  onToggleBreakdown,
  onPageChange,
}: RawMaterialInventoryTableProps) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Inventory Raw Material</h2>
          <p className="mt-1 text-sm text-slate-500">
            {pagination.totalItems} material inventory terdaftar pada sistem.
          </p>
        </div>
        {isRefreshing ? (
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
            Menyegarkan data...
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/80 text-left">
              {['Material Code', 'Material Name', 'Warehouse', 'Available Qty', 'Total LOT', 'UOM', 'Status/Indicator', 'Action'].map((header) => (
                <th
                  key={header}
                  className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const isExpanded = expandedMaterialId === item.materialId
              const aggregateStatus = getInventoryAggregateStatus(item)

              return (
                <FragmentRow
                  key={item.materialId}
                  item={item}
                  aggregateStatus={aggregateStatus}
                  isExpanded={isExpanded}
                  selectedWarehouseId={selectedWarehouseId}
                  onToggleBreakdown={onToggleBreakdown}
                />
              )
            })}
          </tbody>
        </table>
      </div>

      <MasterDataPagination pagination={pagination} onPageChange={onPageChange} />
    </div>
  )
}

function FragmentRow({
  item,
  aggregateStatus,
  isExpanded,
  selectedWarehouseId,
  onToggleBreakdown,
}: {
  item: InventoryRawMaterialListItem
  aggregateStatus: string
  isExpanded: boolean
  selectedWarehouseId: string
  onToggleBreakdown: (materialId: string) => void
}) {
  return (
    <>
      <tr className="border-b border-slate-200/70 bg-white align-top">
        <td className="px-6 py-4 text-sm font-semibold text-ink">{item.materialCode}</td>
        <td className="px-6 py-4 text-sm text-slate-600">{item.materialName}</td>
        <td className="px-6 py-4 text-sm text-slate-600">{getAggregateWarehouseLabel(item)}</td>
        <td data-tour="inventory-total-qty" className="px-6 py-4 text-sm font-semibold text-ink">
          {formatInventoryQuantity(item.availableQuantity, item.unit)}
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">{item.lots.length}</td>
        <td className="px-6 py-4 text-sm text-slate-600">{item.unit}</td>
        <td className="px-6 py-4 text-sm">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getInventoryAggregateStatusTone(aggregateStatus)}`}
          >
            {aggregateStatus}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
          <Button data-tour="inventory-lot-breakdown" variant="secondary" size="sm" onClick={() => onToggleBreakdown(item.materialId)}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {isExpanded ? 'Hide Breakdown' : 'View Breakdown'}
          </Button>
        </td>
      </tr>
      {isExpanded ? (
        <tr className="bg-white">
          <td colSpan={8} className="px-6 pb-5">
            <div data-tour="inventory-fefo-recommendation">
              <RawMaterialInventoryLotBreakdown item={item} selectedWarehouseId={selectedWarehouseId} />
            </div>
          </td>
        </tr>
      ) : null}
    </>
  )
}
