import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type {
  InventoryRawMaterialListItem,
  InventoryRawMaterialLot,
} from '@/features/raw-material-inventory/types'
import {
  formatInventoryDateLabel,
  formatInventoryQuantity,
  getInventoryLotStatusLabel,
  getInventoryLotStatusTone,
} from '@/features/raw-material-inventory/utils'

interface RawMaterialInventoryLotBreakdownProps {
  item: InventoryRawMaterialListItem
}

export function RawMaterialInventoryLotBreakdown({
  item,
}: RawMaterialInventoryLotBreakdownProps) {
  return (
    <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-ink">{item.materialName}</h3>
          <p className="mt-1 text-sm text-slate-500">
            Total Available {formatInventoryQuantity(item.availableQuantity, item.unit)}
          </p>
        </div>
        <div className="text-sm text-slate-500">{item.lots.length} LOT pembentuk total</div>
      </div>

      <div className="grid gap-3">
        {item.lots.map((lot) => (
          <LotCard key={lot.lotId} lot={lot} unit={item.unit} />
        ))}
      </div>
    </div>
  )
}

function LotCard({
  lot,
  unit,
}: {
  lot: InventoryRawMaterialLot
  unit: string
}) {
  return (
    <div className="grid gap-3 rounded-[20px] border border-white bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,0.7fr)_minmax(0,0.8fr)_minmax(0,0.8fr)_auto]">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Internal LOT</p>
        <p className="mt-1 font-medium text-ink">{lot.internalLotNumber}</p>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Warehouse</p>
        <p className="mt-1 text-slate-600">{lot.warehouseCode} - {lot.warehouseName}</p>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Qty</p>
        <p className="mt-1 text-slate-600">{formatInventoryQuantity(lot.quantity, unit)}</p>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Expiry</p>
        <p className="mt-1 text-slate-600">{formatInventoryDateLabel(lot.expiryDate)}</p>
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Status</p>
        <div className="mt-1">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getInventoryLotStatusTone(lot)}`}
          >
            {getInventoryLotStatusLabel(lot)}
          </span>
        </div>
      </div>
      <div className="flex items-start justify-end">
        <Button asChild variant="secondary" size="sm">
          <Link to={`/lots/${lot.lotId}`}>View LOT</Link>
        </Button>
      </div>
    </div>
  )
}
