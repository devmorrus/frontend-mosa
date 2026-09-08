import { Link } from 'react-router-dom'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'
import type { StockMovementListItem } from '@/features/stock-movements/types'
import {
  formatStockMovementDateTimeLabel,
  formatStockMovementQuantity,
  getStockMovementDisplayLabel,
  getStockMovementReferenceLabel,
  getStockMovementReferenceLink,
} from '@/features/stock-movements/utils'
import { entityLinks } from '@/routes/canonicalRoutes'

interface StockMovementsTableProps {
  items: StockMovementListItem[]
  pagination: PaginationMeta
  isRefreshing: boolean
  onPageChange: (page: number) => void
}

export function StockMovementsTable({
  items,
  pagination,
  isRefreshing,
  onPageChange,
}: StockMovementsTableProps) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">Stock Movement History</h2>
          <p className="mt-1 text-sm text-slate-500">
            {pagination.totalItems} movement stock tercatat pada sistem.
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
              {['Date', 'Movement', 'Material', 'LOT', 'Warehouse', 'Quantity', 'Before', 'After', 'Reference', 'User'].map((header) => (
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
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-200/70 bg-white align-top">
                <td className="px-6 py-4 text-sm text-slate-600">
                  {formatStockMovementDateTimeLabel(item.createdAtUtc)}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-ink"><StatusBadge domain="movement" value={item.movementType} /></td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="font-medium text-ink">{item.rawMaterialName}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.rawMaterialCode}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.rawMaterialLotId ? (
                    <Link to={entityLinks.lotDetail(item.rawMaterialLotId)} className="font-medium text-ink underline underline-offset-4">
                      {item.internalLotNumber}
                    </Link>
                  ) : (
                    item.internalLotNumber
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {item.warehouseCode} - {item.warehouseName}
                </td>
                <td className="px-6 py-4 text-sm">
                  <StatusBadge domain="movement-direction" value={item.quantityDirection === 'OUT' ? 'OUT' : 'IN'} />
                  <span className="ml-2 text-slate-600">{getStockMovementDisplayLabel(item)}</span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {formatStockMovementQuantity(item.quantityBefore)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {formatStockMovementQuantity(item.quantityAfter)}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {(() => {
                    const link = getStockMovementReferenceLink(item)
                    return link ? (
                      <Link
                        to={link}
                        className="font-medium text-ink underline underline-offset-4"
                      >
                        {getStockMovementReferenceLabel(item)}
                      </Link>
                    ) : (
                      getStockMovementReferenceLabel(item)
                    )
                  })()}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.createdBy ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MasterDataPagination pagination={pagination} onPageChange={onPageChange} />
    </div>
  )
}
