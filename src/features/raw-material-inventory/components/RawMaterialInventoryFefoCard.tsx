import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import type { FefoRecommendation } from '@/features/raw-material-inventory/types'
import {
  formatInventoryDateLabel,
  formatInventoryQuantity,
  getInventoryFefoStatusLabel,
  getInventoryFefoStatusTone,
} from '@/features/raw-material-inventory/utils'

interface RawMaterialInventoryFefoCardProps {
  recommendation: FefoRecommendation | null
  isLoading: boolean
  error: string | null
  infoMessage: string | null
  unit: string
}

export function RawMaterialInventoryFefoCard({
  recommendation,
  isLoading,
  error,
  infoMessage,
  unit,
}: RawMaterialInventoryFefoCardProps) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-ink">Recommended LOT (FEFO)</h3>
          <p className="mt-1 text-sm text-slate-500">
            FEFO hanya rekomendasi, tidak mengurangi stock otomatis.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Memuat rekomendasi FEFO...
        </div>
      ) : error ? (
        <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}
        </div>
      ) : infoMessage ? (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {infoMessage}
        </div>
      ) : recommendation && recommendation.lots.length > 0 ? (
        <div className="mt-4 space-y-3">
          {recommendation.lots.slice(0, 3).map((lot, index) => (
            <div
              key={lot.lotId}
              className="grid gap-3 rounded-[20px] border border-slate-200 bg-slate-50/70 p-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,0.7fr)_auto]"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  {index === 0 ? 'Recommended First' : `Alternative ${index + 1}`}
                </p>
                <p className="mt-1 font-medium text-ink">{lot.internalLotNumber}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Expiry</p>
                <p className="mt-1 text-slate-600">{formatInventoryDateLabel(lot.expiryDate)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Available</p>
                <p className="mt-1 text-slate-600">
                  {formatInventoryQuantity(lot.availableQuantity, unit)}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Status</p>
                <div className="mt-1">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getInventoryFefoStatusTone(lot)}`}
                  >
                    {getInventoryFefoStatusLabel(lot)}
                  </span>
                </div>
              </div>
              <div className="flex items-start justify-end">
                <Button asChild variant="secondary" size="sm">
                  <Link to={`/lots/${lot.lotId}`}>View LOT</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Belum ada rekomendasi FEFO yang tersedia.
        </div>
      )}
    </div>
  )
}
