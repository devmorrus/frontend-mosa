import { useEffect, useState } from 'react'
import { ArrowLeft, QrCode } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { productionOrdersApi } from '@/api/productionOrders.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import type { ProductionCompletionResult } from '@/features/operator-production/types'

export function FinishedGoodsLotDetailPage() {
  const { id } = useParams<{ id: string }>(); const navigate = useNavigate()
  const [lot, setLot] = useState<(ProductionCompletionResult['finishedGoodsLot'] & { targetOutput: number; expiryDate: string | null }) | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { if (!id) return; void productionOrdersApi.getFinishedGoodsLot(id).then(setLot).catch((caught) => setError(caught.message)) }, [id])
  if (error) return <MasterDataErrorState description={error} onRetry={() => window.location.reload()} />
  if (!lot) return <MasterDataLoadingState description="Memuat Finished Goods LOT." />
  const uom = lot.unitOfMeasure.symbol ?? lot.unitOfMeasure.code
  return <div className="mx-auto max-w-3xl space-y-6"><Button variant="secondary" onClick={() => navigate('/operator/production')}><ArrowLeft size={16} />Back to Production</Button><Card><CardHeader><div className="text-xs font-semibold uppercase tracking-[0.16em] text-signal">Finished Goods LOT</div><CardTitle>{lot.finishedGoodsLotNumber}</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><Info label="Product" value={lot.productName} /><Info label="Target Output" value={`${lot.targetOutput} ${uom}`} /><Info label="Actual Output" value={`${lot.actualOutput} ${uom}`} /><Info label="Yield" value={`${lot.yieldValue}%`} /><Info label="QC Status" value={lot.qcStatus} /><Info label="Inventory Status" value={lot.inventoryStatus} /><div className="rounded-2xl bg-sand/45 p-4 sm:col-span-2"><div className="flex items-center gap-2 font-semibold text-ink"><QrCode size={17} />QR Token</div><p className="mt-2 break-all text-sm text-slate-600">{lot.qrToken}</p></div></CardContent></Card></div>
}
function Info({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-ink/8 p-4"><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div><div className="mt-2 font-semibold text-ink">{value}</div></div> }
