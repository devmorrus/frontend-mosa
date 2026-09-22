import { Link } from 'react-router-dom'
import { History, LoaderCircle } from 'lucide-react'
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
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink"><History size={19} className="text-[#0b5ed7]" /> Stock Movement History</h2>
          <p className="mt-1 text-sm text-slate-500">
            {pagination.totalItems} movements tercatat. Quantity mengikuti filter aktif.
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
        <table className="min-w-[1120px] border-separate border-spacing-0">
          <thead>
            <tr className="bg-slate-50/80 text-left">
              {['Date', 'Movement', 'Material', 'LOT', 'Warehouse', 'Quantity', 'Before → After', 'Reference', 'User'].map((header) => (
                <th
                  key={header}
                  className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="border-b border-slate-200/70 bg-white align-top transition-colors hover:bg-blue-50/30">
                <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                  {formatStockMovementDateTimeLabel(item.createdAtUtc)}
                </td>
                <td className="px-4 py-4 text-sm font-medium text-ink"><StatusBadge domain="movement" value={item.movementType} /></td>
                <td className="max-w-[220px] px-4 py-4 text-sm text-slate-600">
                  <div className="truncate font-medium text-ink" title={item.rawMaterialName}>{item.rawMaterialName}</div>
                  <div className="mt-1 truncate text-xs text-slate-500" title={item.rawMaterialCode}>{item.rawMaterialCode}</div>
                </td>
                <td className="max-w-[180px] px-4 py-4 text-sm text-slate-600">
                  {item.rawMaterialLotId ? (
                    <Link to={entityLinks.lotDetail(item.rawMaterialLotId)} className="break-words font-medium text-[#063b8c] underline decoration-blue-200 underline-offset-4 hover:decoration-[#063b8c]">
                      {item.internalLotNumber}
                    </Link>
                  ) : (
                    <span className="break-words">{item.internalLotNumber}</span>
                  )}
                </td>
                <td className="max-w-[200px] px-4 py-4 text-sm text-slate-600">
                  <div className="break-words" title={`${item.warehouseCode} - ${item.warehouseName}`}>{item.warehouseCode} - {item.warehouseName}</div>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <StatusBadge domain="movement-direction" value={item.quantityDirection === 'OUT' ? 'OUT' : 'IN'} />
                    <span className="font-semibold tabular-nums text-ink">{getStockMovementDisplayLabel(item)}</span>
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-4 text-sm tabular-nums text-slate-600">
                  {formatStockMovementQuantity(item.quantityBefore)} <span className="text-slate-400">→</span> {formatStockMovementQuantity(item.quantityAfter)}
                </td>
                <td className="max-w-[200px] px-4 py-4 text-sm text-slate-600">
                  {(() => {
                    const link = getStockMovementReferenceLink(item)
                    return link ? (
                      <Link
                        to={link}
                        title={getStockMovementReferenceLabel(item)}
                        className="block truncate font-medium text-[#063b8c] underline decoration-blue-200 underline-offset-4 hover:decoration-[#063b8c]"
                      >
                        {getStockMovementReferenceLabel(item)}
                      </Link>
                    ) : (
                      <span className="block truncate">{getStockMovementReferenceLabel(item)}</span>
                    )
                  })()}
                </td>
                <td className="max-w-[140px] truncate px-4 py-4 text-sm text-slate-600" title={item.createdBy ?? '-'}>{item.createdBy ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 px-4 py-4 md:hidden">
        {items.map((item) => <MobileMovementCard key={item.id} item={item} />)}
      </div>

      <MasterDataPagination pagination={pagination} onPageChange={onPageChange} />
    </div>
  )
}

function MobileMovementCard({ item }: { item: StockMovementListItem }) {
  const referenceLink = getStockMovementReferenceLink(item)
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge domain="movement" value={item.movementType} />
        <StatusBadge domain="movement-direction" value={item.quantityDirection === 'OUT' ? 'OUT' : 'IN'} />
        <span className="ml-auto text-xs text-slate-400">{formatStockMovementDateTimeLabel(item.createdAtUtc)}</span>
      </div>
      <div className="mt-3 min-w-0">
        <p className="truncate text-sm font-semibold text-ink" title={item.rawMaterialName}>{item.rawMaterialName}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500" title={item.rawMaterialCode}>{item.rawMaterialCode}</p>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-slate-400">Quantity</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-[#063b8c]">{getStockMovementDisplayLabel(item)}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Before → After</dt>
          <dd className="mt-0.5 font-medium tabular-nums text-ink">{formatStockMovementQuantity(item.quantityBefore)} → {formatStockMovementQuantity(item.quantityAfter)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-slate-400">LOT</dt>
          <dd className="mt-0.5 break-words font-medium text-ink">
            {item.rawMaterialLotId ? (
              <Link to={entityLinks.lotDetail(item.rawMaterialLotId)} className="text-[#063b8c] underline decoration-blue-200 underline-offset-4">{item.internalLotNumber}</Link>
            ) : item.internalLotNumber}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs text-slate-400">Warehouse</dt>
          <dd className="mt-0.5 break-words font-medium text-ink">{item.warehouseCode} - {item.warehouseName}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Reference</dt>
          <dd className="mt-0.5 break-words font-medium text-ink">
            {referenceLink ? (
              <Link to={referenceLink} className="text-[#063b8c] underline decoration-blue-200 underline-offset-4">{getStockMovementReferenceLabel(item)}</Link>
            ) : getStockMovementReferenceLabel(item)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">By</dt>
          <dd className="mt-0.5 truncate font-medium text-ink">{item.createdBy ?? '-'}</dd>
        </div>
      </dl>
    </article>
  )
}
