import { ArrowUpRight, ClipboardList, LoaderCircle, Printer, QrCode } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/common/StatusBadge'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'
import type { RawMaterialLotListItem } from '@/features/raw-material-lots/types'
import {
  formatLotDateLabel,
  formatLotQuantity,
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
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink"><ClipboardList size={19} className="text-[#0b5ed7]" /> LOT List</h2>
          <p className="mt-1 text-sm text-slate-500">
            {pagination.totalItems} LOT terdaftar pada sistem.
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
              {['Internal LOT', 'Material', 'Supplier LOT', 'Warehouse', 'Current Qty', 'Expiry', 'Status', 'Action'].map((header) => (
                <th
                  key={header}
                  data-tour={header === 'Internal LOT' ? 'lot-internal-lot-col' : undefined}
                  className={`px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 ${header === 'Action' ? 'text-center' : 'text-left'}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.id}
                data-tour={idx === 0 ? 'lot-item-row' : undefined}
                className="border-b border-slate-200/70 bg-white align-top transition-colors hover:bg-blue-50/30"
              >
                <td className="px-6 py-4 text-sm">
                  <div className="font-semibold text-[#063b8c]">{item.internalLotNumber}</div>
                  <div className="mt-1 inline-flex max-w-[180px] items-center gap-1 truncate text-xs text-slate-500"><QrCode size={12} /> {item.qrToken}</div>
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
                  <StatusBadge domain="lot" value={item.status} />
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button asChild variant="secondary" size="sm">
                      <Link to={`/lots/${item.id}`}><span>View Detail</span><ArrowUpRight size={14} /></Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => onPrintLabel(item.id)}>
                      <Printer size={14} />
                      Print Label
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 px-4 pb-4 md:hidden">
        {items.map((item, idx) => (
          <article key={item.id} data-tour={idx === 0 ? 'lot-item-row' : undefined} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p data-tour={idx === 0 ? 'lot-internal-lot-col' : undefined} className="text-sm font-semibold text-[#063b8c]">{item.internalLotNumber}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><QrCode size={12} /> {item.qrToken}</p>
              </div>
              <StatusBadge domain="lot" value={item.status} />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <div><dt className="text-xs text-slate-400">Material</dt><dd className="mt-0.5 truncate font-medium text-ink">{item.rawMaterialName}</dd></div>
              <div><dt className="text-xs text-slate-400">Warehouse</dt><dd className="mt-0.5 truncate font-medium text-ink">{item.warehouseName}</dd></div>
              <div><dt className="text-xs text-slate-400">Supplier LOT</dt><dd className="mt-0.5 truncate font-medium text-ink">{item.supplierLot ?? '-'}</dd></div>
              <div><dt className="text-xs text-slate-400">Current Qty</dt><dd className="mt-0.5 font-medium text-ink">{formatLotQuantity(item.currentQuantity, item.unitOfMeasureCode)}</dd></div>
              <div><dt className="text-xs text-slate-400">Expiry</dt><dd className="mt-0.5 font-medium text-ink">{formatLotDateLabel(item.expiryDate)}</dd></div>
              <div><dt className="text-xs text-slate-400">Receiving</dt><dd className="mt-0.5 truncate font-medium text-ink">{item.receivingNumber}</dd></div>
            </dl>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Button asChild variant="secondary" className="justify-center gap-1.5"><Link to={`/lots/${item.id}`}>View Detail <ArrowUpRight size={14} /></Link></Button>
              <Button variant="ghost" className="justify-center gap-1.5" onClick={() => onPrintLabel(item.id)}><Printer size={14} /> Print</Button>
            </div>
          </article>
        ))}
      </div>

      <MasterDataPagination pagination={pagination} onPageChange={onPageChange} />
    </div>
  )
}
