import { ChevronDown, ChevronUp, ClipboardList, LoaderCircle } from 'lucide-react'
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
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink"><ClipboardList size={19} className="text-[#0b5ed7]" /> Inventory Raw Material</h2>
          <p className="mt-1 text-sm text-slate-500">
            {pagination.totalItems} material types ditemukan. Status menunjukkan kondisi aggregate dari LOT material.
          </p>
        </div>
        {isRefreshing ? (
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
            <LoaderCircle size={13} className="animate-spin" />
            Menyegarkan data...
          </div>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/80 text-left">
              {['Material', 'Warehouse', 'Available Stock', 'Total LOT', 'UOM', 'Status', 'Action'].map((header) => (
                <th
                  key={header}
                   className={`px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 ${header === 'Action' ? 'text-center' : ''}`}
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

      <div className="space-y-3 px-4 pb-4 md:hidden">
        {items.map((item) => <MobileInventoryCard key={item.materialId} item={item} isExpanded={expandedMaterialId === item.materialId} selectedWarehouseId={selectedWarehouseId} onToggleBreakdown={onToggleBreakdown} />)}
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
        <td className="px-6 py-4 text-sm"><div className="font-semibold text-[#063b8c]">{item.materialCode}</div><div className="mt-1 text-xs text-slate-500">{item.materialName}</div></td>
        <td className="px-6 py-4 text-sm text-slate-600">{getAggregateWarehouseLabel(item)}</td>
        <td data-tour="inventory-total-qty" className="px-6 py-4 text-sm font-semibold text-[#063b8c]">
          {formatInventoryQuantity(item.availableQuantity, item.unit)}
        </td>
        <td className="px-6 py-4 text-sm text-slate-600">{item.lots.length}</td>
        <td className="px-6 py-4 text-sm text-slate-600">{item.unit}</td>
        <td className="px-6 py-4 text-sm">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getInventoryAggregateStatusTone(aggregateStatus)}`}
          >
            {aggregateStatus === 'MIXED' ? 'MIXED LOT STATUS' : aggregateStatus}
          </span>
        </td>
        <td className="px-6 py-4 text-right">
           <Button data-tour="inventory-lot-breakdown" aria-expanded={isExpanded} aria-controls={`inventory-breakdown-${item.materialId}`} variant="secondary" size="sm" onClick={() => onToggleBreakdown(item.materialId)}>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {isExpanded ? 'Hide Breakdown' : 'View Breakdown'}
          </Button>
        </td>
      </tr>
      {isExpanded ? (
        <tr className="bg-white">
           <td id={`inventory-breakdown-${item.materialId}`} colSpan={7} className="px-6 pb-5">
            <div data-tour="inventory-fefo-recommendation">
              <RawMaterialInventoryLotBreakdown item={item} selectedWarehouseId={selectedWarehouseId} />
            </div>
          </td>
        </tr>
      ) : null}
    </>
  )
}

function MobileInventoryCard({ item, isExpanded, selectedWarehouseId, onToggleBreakdown }: { item: InventoryRawMaterialListItem; isExpanded: boolean; selectedWarehouseId: string; onToggleBreakdown: (materialId: string) => void }) {
  const aggregateStatus = getInventoryAggregateStatus(item)
  return <article className="rounded-2xl border border-slate-200 bg-white p-4">
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#063b8c]">{item.materialCode}</p><p className="mt-1 break-words text-sm text-slate-600">{item.materialName}</p></div><span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${getInventoryAggregateStatusTone(aggregateStatus)}`}>{aggregateStatus === 'MIXED' ? 'MIXED' : aggregateStatus}</span></div>
    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm"><div><dt className="text-xs text-slate-400">Available stock</dt><dd data-tour="inventory-total-qty" className="mt-0.5 font-semibold text-[#063b8c]">{formatInventoryQuantity(item.availableQuantity, item.unit)}</dd></div><div><dt className="text-xs text-slate-400">Total LOT</dt><dd className="mt-0.5 font-medium text-ink">{item.lots.length}</dd></div><div className="col-span-2"><dt className="text-xs text-slate-400">Warehouse</dt><dd className="mt-0.5 break-words font-medium text-ink">{getAggregateWarehouseLabel(item)}</dd></div></dl>
    <Button data-tour="inventory-lot-breakdown" aria-expanded={isExpanded} aria-controls={`mobile-inventory-breakdown-${item.materialId}`} variant="secondary" className="mt-4 w-full justify-center" onClick={() => onToggleBreakdown(item.materialId)}>{isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}{isExpanded ? 'Hide Breakdown' : 'View Breakdown'}</Button>
    {isExpanded ? <div id={`mobile-inventory-breakdown-${item.materialId}`} data-tour="inventory-fefo-recommendation" className="mt-4"><RawMaterialInventoryLotBreakdown item={item} selectedWarehouseId={selectedWarehouseId} /></div> : null}
  </article>
}
