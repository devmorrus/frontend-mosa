import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'
import type { RawMaterialLotListItem } from '@/features/raw-material-lots/types'
import {
  formatLotDateLabel,
  formatLotQuantity,
  getLotStatusTone,
} from '@/features/raw-material-lots/utils'

interface RawMaterialLotsTableProps {
  items: RawMaterialLotListItem[]
  pagination: PaginationMeta
  isRefreshing: boolean
  onPageChange: (page: number) => void
  onPrintLabel: (lotId: string) => void
}

export function RawMaterialLotsTable({
  items,
  pagination,
  isRefreshing,
  onPageChange,
  onPrintLabel,
}: RawMaterialLotsTableProps) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-ink">LOT List</h2>
          <p className="mt-1 text-sm text-slate-500">
            {pagination.totalItems} LOT terdaftar pada sistem.
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
              {['Internal LOT', 'Material', 'Supplier LOT', 'Warehouse', 'Current Qty', 'Expiry', 'Status', 'Action'].map((header) => (
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
                <td className="px-6 py-4 text-sm">
                  <div className="font-semibold text-ink">{item.internalLotNumber}</div>
                  <div className="mt-1 text-xs text-slate-500">QR {item.qrToken}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="font-medium text-ink">{item.rawMaterialName}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    {item.rawMaterialCode} • Supplier {item.supplierName}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div>{item.supplierLot ?? '-'}</div>
                  <div className="mt-1 text-xs text-slate-500">Receiving {item.receivingNumber}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{item.warehouseName}</td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div>{formatLotQuantity(item.currentQuantity, item.unitOfMeasureCode)}</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Initial {formatLotQuantity(item.initialQuantity, item.unitOfMeasureCode)}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {formatLotDateLabel(item.expiryDate)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getLotStatusTone(item.status)}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button asChild variant="secondary" size="sm">
                      <Link to={`/lots/${item.id}`}>View Detail</Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onPrintLabel(item.id)}>
                      Print Label
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <MasterDataPagination pagination={pagination} onPageChange={onPageChange} />
    </div>
  )
}
