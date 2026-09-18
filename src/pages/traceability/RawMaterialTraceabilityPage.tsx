import { useEffect, useState, type ReactNode } from 'react'
import { ArrowRight, Boxes, Factory, PackageCheck, ShieldCheck, Warehouse } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { traceabilityApi } from '@/api/traceability.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import { MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { formatLotDateLabel } from '@/features/raw-material-lots/utils'
import { formatQuantity } from '@/features/recipes/utils'
import type { AffectedBatchItem, AffectedBatchSummary } from '@/features/traceability/types'
import type { MasterDataPagination as Pagination } from '@/features/master-data/types'
import type { ApiError } from '@/types/api'

const PAGE_SIZE = 20

function label(value: string | number) {
  if (typeof value === 'string') return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')
  return String(value)
}

function statusTone(value: string | number, type: 'qc' | 'inventory') {
  const text = label(value).toLowerCase()
  const numericPass = type === 'qc' && value === 2
  const numericAvailable = type === 'inventory' && value === 2
  const numericHold = type === 'qc' && value === 4
  const numericBlocked = type === 'inventory' && value === 1
  const numericReject = value === 3
  if (numericPass || numericAvailable || text.includes('pass') || text.includes('available')) return 'border-blue-200 bg-blue-50 text-blue-700'
  if (numericHold || numericBlocked || text.includes('hold') || text.includes('blocked')) return 'border-amber-200 bg-amber-50 text-amber-700'
  if (numericReject || text.includes('reject')) return 'border-rose-200 bg-rose-50 text-rose-700'
  return 'border-slate-200 bg-slate-50 text-slate-600'
}

function StatusBadge({ value, type }: { value: string | number; type: 'qc' | 'inventory' }) {
  const numericLabels = type === 'qc'
    ? ({ 1: 'Waiting QC', 2: 'Passed', 3: 'Rejected', 4: 'Hold' } as Record<number, string>)
    : ({ 1: 'Blocked', 2: 'Available', 3: 'Rejected' } as Record<number, string>)
  const text = typeof value === 'number' ? numericLabels[value] ?? `Status ${value}` : label(value)
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(value, type)}`}>{text}</span>
}

function rawMaterialLotStatus(value: string | number) {
  if (typeof value !== 'number') return label(value)
  return ({ 1: 'Available', 2: 'Blocked', 3: 'Expired', 4: 'Depleted' } as Record<number, string>)[value] ?? `Status ${value}`
}

function Field({ label: title, value }: { label: string; value: ReactNode }) {
  return <div><div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{title}</div><div className="mt-1.5 text-sm font-medium text-ink">{value || '-'}</div></div>
}

export function RawMaterialTraceabilityPage() {
  const { id } = useParams<{ id: string }>()
  const [summary, setSummary] = useState<AffectedBatchSummary | null>(null)
  const [pageData, setPageData] = useState<{ items: AffectedBatchItem[]; pagination: Pagination } | null>(null)
  const [page, setPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)

  useEffect(() => {
    if (!id) return
    void traceabilityApi.getAffectedBatchSummary(id)
      .then(setSummary)
      .catch((caught: ApiError) => setError(caught.message))
      .finally(() => setIsLoadingSummary(false))
  }, [id])

  useEffect(() => {
    if (!id || !summary) return
    void traceabilityApi.getAffectedBatchPage(id, page, PAGE_SIZE)
      .then((response) => setPageData({ items: response.items, pagination: response.pagination }))
      .catch((caught: ApiError) => setError(caught.message))
  }, [id, page, summary])

  if (!id) return <MasterDataErrorState description="ID Raw Material LOT tidak valid." onRetry={() => window.location.reload()} />
  if (error) return <MasterDataErrorState description={error} onRetry={() => window.location.reload()} />
  if (isLoadingSummary || !summary) return <MasterDataLoadingState description="Memuat affected batch traceability." />

  const lot = summary.rawMaterialLot
  const materialUnit = lot.unitOfMeasureSymbol ?? lot.unitOfMeasureCode
  const visibleGenealogy = summary.batches.slice(0, 5)

  return <div className="space-y-6 pb-10">
    <section className="relative overflow-hidden rounded-[30px] bg-ink px-6 py-8 text-paper shadow-[0_24px_80px_rgba(6,59,140,0.16)] sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_90%_5%,rgba(255,201,40,0.28),transparent_28%),radial-gradient(circle_at_0%_100%,rgba(44,112,201,0.22),transparent_42%)]" />
      <div className="relative"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-signal"><Boxes size={15} /> Forward traceability</div><h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">{lot.internalLotNumber}</h1><p className="mt-2 max-w-2xl text-sm leading-7 text-paper/70 sm:text-base">Identifikasi batch Finished Goods yang menggunakan Raw Material LOT ini. Halaman ini hanya untuk investigasi, tanpa tindakan recall atau quarantine.</p></div>
    </section>

    <Card data-tour="traceability-rm-header" className="border-white/70 bg-white shadow-sm"><CardHeader><CardTitle>Raw Material LOT</CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"><Field label="Material" value={`${lot.rawMaterialCode} - ${lot.rawMaterialName}`} /><Field label="Internal LOT" value={lot.internalLotNumber} /><Field label="Supplier LOT" value={lot.supplierLot ?? '-'} /><Field label="Supplier" value={lot.supplierName} /><Field label="Receiving" value={lot.receivingNumber} /><Field label="Received date" value={formatLotDateLabel(lot.receivingDate)} /><Field label="Expiry" value={formatLotDateLabel(lot.expiryDate)} /><Field label="Warehouse" value={`${lot.warehouseCode} - ${lot.warehouseName}`} /><Field label="Current quantity" value={formatQuantity(lot.currentQuantity, materialUnit)} /><Field label="Status" value={<span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">{rawMaterialLotStatus(lot.lotStatus)}</span>} /></CardContent></Card>

    <section><div className="flex items-center gap-2 text-ink"><Warehouse size={19} className="text-blue-600" /><h2 className="font-display text-2xl font-semibold">Affected summary</h2></div><div className="mt-4 grid gap-4 sm:grid-cols-3"><Metric tourId="traceability-affected-production" icon={<Factory size={19} />} label="Production Orders Affected" value={summary.totalProductionsAffected} /><Metric tourId="traceability-affected-fg" icon={<PackageCheck size={19} />} label="Finished Goods LOTs Affected" value={summary.totalFGLotsAffected} /><Metric icon={<Boxes size={19} />} label="Total Quantity Consumed" value={formatQuantity(summary.totalActualMaterialUsed, materialUnit)} /></div></section>

    <section><div className="flex flex-wrap items-end justify-between gap-3"><div><div className="flex items-center gap-2 text-ink"><ArrowRight size={19} className="text-blue-600" /><h2 className="font-display text-2xl font-semibold">Batch genealogy</h2></div><p className="mt-1 text-sm text-slate-500">Hubungan penggunaan LOT ke Production Order dan Finished Goods.</p></div>{summary.totalFGLotsAffected > visibleGenealogy.length ? <span className="text-sm text-slate-500">Menampilkan contoh {visibleGenealogy.length} dari {summary.totalFGLotsAffected} batch.</span> : null}</div><div className="mt-4 space-y-3">{visibleGenealogy.map((batch) => <GenealogyRow key={batch.finishedGoodsLotId} lot={lot.internalLotNumber} batch={batch} />)}{!visibleGenealogy.length ? <EmptyState text="LOT ini belum digunakan pada Finished Goods mana pun." /> : null}</div></section>

    <section><div className="flex items-center gap-2 text-ink"><ShieldCheck size={19} className="text-blue-600" /><h2 className="font-display text-2xl font-semibold">Affected batch list</h2></div><p className="mt-1 text-sm text-slate-500">Pilih batch untuk membuka backward traceability Finished Goods.</p><Card data-tour="traceability-affected-batches" className="mt-4 overflow-hidden border-white/70 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-[980px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{['Finished Goods LOT', 'Product', 'Production Order', 'Production Date', 'Actual RM Used', 'FG Output', 'QC Status', 'Inventory Status', 'Action'].map((heading) => <th key={heading} className="px-5 py-3 font-semibold">{heading}</th>)}</tr></thead><tbody>{!pageData ? <tr><td colSpan={9} className="px-5 py-10 text-center text-slate-500">Memuat batch terdampak...</td></tr> : pageData.items.map((batch) => <AffectedBatchRow key={batch.finishedGoodsLotId} batch={batch} />)}{pageData && !pageData.items.length ? <tr><td colSpan={9} className="px-5 py-10"><EmptyState text="LOT ini belum digunakan pada Finished Goods mana pun." /></td></tr> : null}</tbody></table></div>{pageData ? <MasterDataPagination pagination={pageData.pagination} onPageChange={setPage} /> : null}</Card></section>
  </div>
}

function Metric({ icon, label, value, tourId }: { icon: ReactNode; label: string; value: ReactNode; tourId?: string }) { return <Card data-tour={tourId} className="border-white/70 bg-white shadow-sm"><CardContent className="p-5"><div className="flex items-center gap-2 text-blue-600">{icon}<span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</span></div><div className="mt-4 font-display text-3xl font-semibold text-ink">{value}</div></CardContent></Card> }

function GenealogyRow({ lot, batch }: { lot: string; batch: AffectedBatchItem }) { const unit = batch.actualMaterialUnitOfMeasureSymbol ?? batch.actualMaterialUnitOfMeasureCode; return <details className="group rounded-2xl border border-slate-200 bg-white shadow-sm"><summary className="flex cursor-pointer list-none flex-col gap-3 p-4 sm:flex-row sm:items-center"><div className="min-w-0 flex-1"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">RM LOT {lot}</div><div className="mt-1 text-sm text-slate-600">Used {formatQuantity(batch.actualMaterialUsed, unit)}</div></div><ArrowRight size={18} className="text-slate-400 transition-transform group-open:rotate-90" /><div className="min-w-0 flex-1"><div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{batch.productionOrderNumber}</div><div className="mt-1 font-semibold text-ink">{batch.finishedGoodsLotNumber} - {batch.productName}</div></div><div className="flex gap-2"><StatusBadge value={batch.qcStatus} type="qc" /><StatusBadge value={batch.inventoryStatus} type="inventory" /></div></summary><div className="grid gap-4 border-t border-slate-100 px-4 py-4 sm:grid-cols-3"><Field label="Production date" value={formatLotDateLabel(batch.productionDate)} /><Field label="FG output" value={formatQuantity(batch.finishedGoodsActualOutput, batch.finishedGoodsUnitOfMeasureSymbol ?? batch.finishedGoodsUnitOfMeasureCode)} /><div className="flex items-end"><Button asChild variant="secondary" size="sm"><Link to={`/traceability/finished-goods/${batch.finishedGoodsLotId}`}>View Finished Goods Traceability</Link></Button></div></div></details> }

function AffectedBatchRow({ batch }: { batch: AffectedBatchItem }) { return <tr className="border-t border-slate-100 align-top"><td className="px-5 py-4 font-semibold text-ink">{batch.finishedGoodsLotNumber}</td><td className="px-5 py-4"><div className="font-medium text-ink">{batch.productName}</div><div className="mt-1 text-xs text-slate-500">{batch.productCode}</div></td><td className="px-5 py-4 text-slate-700">{batch.productionOrderNumber}</td><td className="px-5 py-4 text-slate-600">{formatLotDateLabel(batch.productionDate)}</td><td className="px-5 py-4 text-slate-700">{formatQuantity(batch.actualMaterialUsed, batch.actualMaterialUnitOfMeasureSymbol ?? batch.actualMaterialUnitOfMeasureCode)}</td><td className="px-5 py-4 text-slate-700">{formatQuantity(batch.finishedGoodsActualOutput, batch.finishedGoodsUnitOfMeasureSymbol ?? batch.finishedGoodsUnitOfMeasureCode)}</td><td data-tour="traceability-affected-qc" className="px-5 py-4"><StatusBadge value={batch.qcStatus} type="qc" /></td><td className="px-5 py-4"><StatusBadge value={batch.inventoryStatus} type="inventory" /></td><td className="px-5 py-4"><Button asChild variant="secondary" size="sm"><Link data-tour="traceability-view-fg" to={`/traceability/finished-goods/${batch.finishedGoodsLotId}`}>View traceability</Link></Button></td></tr> }

function EmptyState({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">{text}</div> }
