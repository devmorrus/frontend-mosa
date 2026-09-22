import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Boxes, Layers3 } from 'lucide-react'
import { inventoryApi } from '@/api/inventory.api'
import { Button } from '@/components/ui/button'
import { entityLinks } from '@/routes/canonicalRoutes'
import { RawMaterialInventoryFefoCard } from '@/features/raw-material-inventory/components/RawMaterialInventoryFefoCard'
import type {
  FefoRecommendation,
  InventoryRawMaterialListItem,
  InventoryRawMaterialLot,
} from '@/features/raw-material-inventory/types'
import {
  formatInventoryDateLabel,
  formatInventoryQuantity,
  getInventoryFefoInfoMessage,
  getInventoryLotStatusLabel,
  getInventoryLotStatusTone,
  resolveInventoryFefoWarehouseId,
} from '@/features/raw-material-inventory/utils'
import type { ApiError } from '@/types/api'

interface RawMaterialInventoryLotBreakdownProps {
  item: InventoryRawMaterialListItem
  selectedWarehouseId: string
}

export function RawMaterialInventoryLotBreakdown({
  item,
  selectedWarehouseId,
}: RawMaterialInventoryLotBreakdownProps) {
  const [recommendation, setRecommendation] = useState<FefoRecommendation | null>(null)
  const [fefoError, setFefoError] = useState<string | null>(null)
  const [isLoadingFefo, setIsLoadingFefo] = useState(false)
  const resolvedWarehouseId = resolveInventoryFefoWarehouseId(item, selectedWarehouseId)
  const infoMessage = getInventoryFefoInfoMessage(item, selectedWarehouseId)

  useEffect(() => {
    if (!resolvedWarehouseId || infoMessage) {
      return
    }

    const warehouseId = resolvedWarehouseId
    let isCancelled = false

    async function loadRecommendation() {
      setIsLoadingFefo(true)
      setFefoError(null)

      try {
        const result = await inventoryApi.getRecommendedLots(item.materialId, warehouseId)
        if (!isCancelled) {
          setRecommendation(result)
        }
      } catch (caughtError) {
        if (isCancelled) return
        const apiError = caughtError as ApiError
        setFefoError(apiError.message)
      } finally {
        if (!isCancelled) {
          setIsLoadingFefo(false)
        }
      }
    }

    void loadRecommendation()

    return () => {
      isCancelled = true
    }
  }, [infoMessage, item.materialId, resolvedWarehouseId])

  const visibleRecommendation = !resolvedWarehouseId || infoMessage ? null : recommendation
  const visibleError = !resolvedWarehouseId || infoMessage ? null : fefoError
  const visibleLoading = !resolvedWarehouseId || infoMessage ? false : isLoadingFefo

  return (
    <div className="space-y-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3"><div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#0b5ed7]"><Boxes size={18} /></div><div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0b5ed7]">Material breakdown</p><h3 className="mt-1 font-display text-xl font-semibold text-ink">{item.materialName}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {formatInventoryQuantity(item.availableQuantity, item.unit)} available stock
          </p>
        </div></div>
        <div className="inline-flex items-center gap-1.5 text-sm text-slate-500"><Layers3 size={15} className="text-[#0b5ed7]" />{item.lots.length} LOT pembentuk total</div>
      </div>

      <RawMaterialInventoryFefoCard
        recommendation={visibleRecommendation}
        isLoading={visibleLoading}
        error={visibleError}
        infoMessage={infoMessage}
        unit={item.unit}
      />

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
          <Link to={entityLinks.lotDetail(lot.lotId)}>View LOT</Link>
        </Button>
      </div>
    </div>
  )
}
