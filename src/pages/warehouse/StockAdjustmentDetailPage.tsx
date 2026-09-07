import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, SlidersHorizontal } from 'lucide-react'
import { stockAdjustmentsApi } from '@/api/stockAdjustments.api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import type { StockAdjustmentDetail } from '@/features/stock-adjustments/types'
import type { ApiError } from '@/types/api'

function qty(value: number) { return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 }).format(value) }
function date(value: string | null) { return value ? new Date(value).toLocaleString('id-ID') : '-' }

export function StockAdjustmentDetailPage() {
  const { id } = useParams()
  const [detail, setDetail] = useState<StockAdjustmentDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  async function loadData() {
    if (!id) return
    setIsLoading(true); setError(null)
    try { setDetail(await stockAdjustmentsApi.getById(id)) }
    catch (caughtError) { setError((caughtError as ApiError).message) }
    finally { setIsLoading(false) }
  }

  useEffect(() => { void loadData() }, [id])
  if (isLoading) return <MasterDataLoadingState description="Detail stock adjustment sedang dimuat." />
  if (error || !detail) return <MasterDataErrorState description={error ?? 'Stock adjustment tidak ditemukan.'} onRetry={() => void loadData()} />

  return <div className="space-y-6"><Button asChild variant="ghost" className="text-slate-500"><Link to="/warehouse/stock-adjustments"><ArrowLeft size={16} />Kembali</Link></Button><section className="rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8"><div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72"><SlidersHorizontal size={14} className="text-signal" />{detail.stockAdjustmentNumber}</div><h1 className="mt-5 font-display text-3xl font-semibold">{detail.rawMaterialName}</h1><p className="mt-3 text-sm text-paper/68">{detail.warehouseName} · LOT {detail.internalLotNumber}</p></section><Card className="rounded-[28px]"><CardHeader><CardTitle>Adjustment History</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Info label="Warehouse" value={detail.warehouseName} /><Info label="Material" value={`${detail.rawMaterialCode} - ${detail.rawMaterialName}`} /><Info label="LOT" value={detail.internalLotNumber} /><Info label="Quantity Before" value={qty(detail.quantityBefore)} /><Info label="Adjustment" value={qty(detail.adjustmentQuantity)} /><Info label="Quantity After" value={qty(detail.quantityAfter)} /><div><div className="text-xs uppercase tracking-wide text-slate-400">Type</div><Badge className={detail.adjustmentType === 'IN' ? 'mt-1 border-emerald-200 bg-emerald-50 text-emerald-700' : 'mt-1 border-red-200 bg-red-50 text-red-700'}>{detail.adjustmentType}</Badge></div><Info label="Reference" value={detail.reference ?? '-'} /><Info label="Posted By" value={detail.postedBy} /><Info label="Posted At" value={date(detail.postedAtUtc)} /><Info label="Created By" value={detail.createdBy ?? '-'} /><Info label="Created At" value={date(detail.createdAtUtc)} /><div className="sm:col-span-2 lg:col-span-3"><Info label="Reason" value={detail.reason} /></div></CardContent></Card></div>
}

function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl bg-slate-50 p-4"><div className="text-xs uppercase tracking-wide text-slate-400">{label}</div><div className="mt-1 font-semibold text-ink">{value}</div></div> }
