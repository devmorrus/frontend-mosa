import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AlertTriangle, Boxes, CheckCircle2, ChevronRight, CircleAlert, ClipboardList, Factory, PackageCheck, QrCode, ScanLine, Search, ShieldCheck, Truck, X } from 'lucide-react'
import QrScanner from 'qr-scanner'
import qrScannerWorkerPath from 'qr-scanner/qr-scanner-worker.min?url'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { breadcrumbs, entityLinks } from '@/routes/canonicalRoutes'
import { traceabilityApi } from '@/api/traceability.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { formatLotDateLabel, formatLotDateTimeLabel } from '@/features/raw-material-lots/utils'
import { formatQuantity } from '@/features/recipes/utils'
import type { ApiError } from '@/types/api'
import type { BatchGenealogy, ForwardTraceability } from '@/features/traceability/types'

QrScanner.WORKER_PATH = qrScannerWorkerPath

type SearchType = 'finished-goods' | 'raw-material'

type StatusKind = 'qc' | 'inventory' | 'inspection' | 'execution' | 'deviation' | 'default'

function readableStatus(value: string | number | null | undefined, kind: StatusKind = 'default') {
  if (value === null || value === undefined) return '-'
  const numeric: Record<StatusKind, Record<number, string>> = {
    qc: { 1: 'Waiting QC', 2: 'Passed', 3: 'Rejected', 4: 'Hold' },
    inventory: { 1: 'Blocked', 2: 'Available', 3: 'Rejected' },
    inspection: { 1: 'Pending', 2: 'In Progress', 3: 'Passed', 4: 'Hold', 5: 'Rejected' },
    execution: { 1: 'Locked', 2: 'Ready', 3: 'In Progress', 4: 'Completed', 5: 'Waiting Approval' },
    deviation: { 1: 'Pending Approval', 2: 'Approved', 3: 'Rejected', 4: 'Cancelled' },
    default: {},
  }
  if (typeof value === 'number') return numeric[kind][value] ?? `Status ${value}`
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')
}

function statusTone(value: string | number | null | undefined, kind: StatusKind) {
  const status = readableStatus(value, kind).toLowerCase()
  if (status.includes('pass') || status.includes('available') || status.includes('complete')) return 'border-blue-200 bg-blue-50 text-blue-700'
  if (status.includes('hold') || status.includes('pending') || status.includes('waiting')) return 'border-amber-200 bg-amber-50 text-amber-700'
  if (status.includes('reject') || status.includes('deviation')) return 'border-rose-200 bg-rose-50 text-rose-700'
  return 'border-slate-200 bg-slate-50 text-slate-600'
}

function StatusPill({ value, kind = 'default' }: { value: string | number | null | undefined; kind?: StatusKind }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusTone(value, kind)}`}>{readableStatus(value, kind)}</span>
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return <div><div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</div><div className="mt-1.5 text-sm font-medium text-ink">{value || '-'}</div></div>
}

function qrToken(value: string) {
  const input = value.trim()
  if (/^[A-Z0-9]{8,100}$/i.test(input)) return input
  try {
    const candidate = new URL(input).pathname.split('/').filter(Boolean).at(-1) ?? ''
    return /^[A-Z0-9]{8,100}$/i.test(candidate) ? candidate : null
  } catch { return null }
}

export function TraceabilitySearchPage() {
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const [searchType, setSearchType] = useState<SearchType>('finished-goods')
  const [value, setValue] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BatchGenealogy | null>(null)
  const [forwardResult, setForwardResult] = useState<ForwardTraceability | null>(null)
  const [cameraOpen, setCameraOpen] = useState(false)

  useEffect(() => () => { scannerRef.current?.stop(); scannerRef.current?.destroy() }, [])

  function stopCamera() { scannerRef.current?.stop(); scannerRef.current?.destroy(); scannerRef.current = null; setCameraOpen(false) }

  async function search(nextValue = value, type = searchType, isQr = false) {
    const normalized = isQr ? qrToken(nextValue) : nextValue.trim()
    if (!normalized) { setError(isQr ? 'QR Finished Goods tidak dikenali.' : 'Masukkan LOT number terlebih dahulu.'); return }
    setIsSearching(true); setError(null); setResult(null); setForwardResult(null)
    try {
      if (isQr) setResult(await traceabilityApi.getFinishedGoodsByQrToken(normalized))
      else if (type === 'finished-goods') setResult(await traceabilityApi.getFinishedGoodsByLotNumber(normalized))
      else {
        const forward = await traceabilityApi.getRawMaterialByLotNumber(normalized)
        navigate(`/traceability/raw-material/${forward.rawMaterialLot.rawMaterialLotId}`)
      }
      stopCamera()
    } catch (caught) {
      const apiError = caught as ApiError
      setError(apiError.status === 404 ? 'LOT tidak ditemukan. Periksa nomor LOT lalu coba lagi.' : apiError.message)
    } finally { setIsSearching(false) }
  }

  async function openCamera() {
    if (!videoRef.current) return
    if (!window.isSecureContext && window.location.hostname !== 'localhost') { setError('Kamera memerlukan HTTPS atau localhost. Gunakan input token QR sebagai alternatif.'); return }
    try {
      stopCamera()
      const scanner = new QrScanner(videoRef.current, (scan) => { if (!isSearching) void search(scan.data, 'finished-goods', true) }, { preferredCamera: 'environment', highlightScanRegion: true, highlightCodeOutline: true, returnDetailedScanResult: true })
      scannerRef.current = scanner; await scanner.start(); setCameraOpen(true)
    } catch { setError('Kamera tidak dapat dibuka. Periksa izin kamera browser atau gunakan input token QR.') }
  }

  return <div data-tour="traceability-search" className="space-y-6 pb-10">
    <section className="relative overflow-hidden rounded-[30px] bg-ink px-6 py-8 text-paper shadow-[0_24px_80px_rgba(6,59,140,0.16)] sm:px-8 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_12%,rgba(255,201,40,0.30),transparent_25%),radial-gradient(circle_at_10%_100%,rgba(44,112,201,0.22),transparent_40%)]" />
      <div className="relative max-w-3xl"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-signal"><ScanLine size={15} /> Batch genealogy</div><h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Trace every LOT, in one clear view.</h1><p className="mt-3 max-w-2xl text-sm leading-7 text-paper/70 sm:text-base">Cari Finished Goods untuk menelusuri bahan yang digunakan, atau Raw Material untuk melihat batch produk yang terdampak.</p></div>
    </section>

    <Card className="border-white/70 bg-white shadow-sm"><CardContent className="p-5 sm:p-7">
      <div data-tour="traceability-search-type" className="flex flex-wrap gap-2"><SearchTypeButton tourId="traceability-fg-search-type" active={searchType === 'finished-goods'} onClick={() => { setSearchType('finished-goods'); setResult(null); setForwardResult(null); setError(null) }} icon={<PackageCheck size={16} />} label="Finished Goods LOT" /><SearchTypeButton tourId="traceability-rm-search-type" active={searchType === 'raw-material'} onClick={() => { setSearchType('raw-material'); setResult(null); setForwardResult(null); setError(null) }} icon={<Boxes size={16} />} label="Raw Material LOT" /></div>
      <form data-tour="traceability-search-form" className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); void search() }}><Input data-tour="traceability-lot-search" aria-label="Masukkan LOT Number" value={value} onChange={(event) => setValue(event.target.value)} placeholder={searchType === 'finished-goods' ? 'Masukkan LOT Number, contoh FG-20260902-00001' : 'Masukkan Raw Material LOT'} className="h-12 flex-1 rounded-2xl" /><Button type="submit" className="h-12" disabled={isSearching}>{isSearching ? 'Mencari...' : <><Search size={16} />Cari LOT</>}</Button>{searchType === 'finished-goods' ? <Button type="button" variant="secondary" className="h-12" onClick={() => void openCamera()}><QrCode size={16} />Scan QR</Button> : null}</form>
      {error ? <div className="mt-4 flex gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"><CircleAlert className="mt-0.5 shrink-0" size={17} />{error}</div> : null}
      {searchType === 'finished-goods' ? <div className="mt-4 text-xs text-slate-500">QR shortcut hanya untuk Finished Goods. Kamera membutuhkan HTTPS atau localhost.</div> : null}
      {cameraOpen ? <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-200 bg-slate-950 p-3"><div className="mb-3 flex items-center justify-between text-sm font-medium text-paper"><span>Arahkan QR Finished Goods ke kamera</span><Button type="button" variant="ghost" size="sm" onClick={stopCamera}><X size={15} />Tutup</Button></div><video ref={videoRef} className="aspect-video w-full rounded-xl object-cover" muted playsInline /></div> : <video ref={videoRef} className="hidden" muted playsInline />}
    </CardContent></Card>
    {isSearching ? <MasterDataLoadingState description="Menyusun traceability LOT." /> : null}
    {result ? <GenealogyResult data={result} /> : null}
    {forwardResult ? <ForwardResult data={forwardResult} /> : null}
  </div>
}

function SearchTypeButton({ active, icon, label, onClick, tourId }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void; tourId: string }) { return <button type="button" data-tour={tourId} aria-pressed={active} onClick={onClick} className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${active ? 'border-ink bg-ink text-paper' : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>{icon}{label}</button> }

export function FinishedGoodsTraceabilityPage() {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<BatchGenealogy | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => { if (!id) return; void traceabilityApi.getFinishedGoodsById(id).then(setData).catch((caught: ApiError) => setError(caught.message)) }, [id])
  if (error) return <MasterDataErrorState description={error} onRetry={() => window.location.reload()} />
  if (!data) return <MasterDataLoadingState description="Memuat backward traceability." />
  return <div className="space-y-6 pb-10"><Breadcrumb items={breadcrumbs.traceFinishedGoods(data.finishedGoodsLot.lotNumber)} /><div><div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Backward traceability</div><h1 className="mt-2 font-display text-3xl font-semibold text-ink">Finished Goods genealogy</h1></div><GenealogyResult data={data} /></div>
}

export function GenealogyResult({ data }: { data: BatchGenealogy }) {
  const { finishedGoodsLot: fg, production, qc } = data
  const outputUnit = production.unitOfMeasureSymbol ?? production.unitOfMeasureCode
  return <div className="space-y-6">
    <Card className="overflow-hidden border-white/70 bg-white shadow-sm"><div className="border-b border-slate-100 bg-sand/35 px-6 py-4"><div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Genealogy flow</div></div><CardContent className="p-6"><div className="grid gap-3 md:grid-cols-4">{[[<PackageCheck key="fg" size={16} />, 'Finished Goods', fg.lotNumber, fg.name, 'traceability-fg-summary'], [<ClipboardList key="po" size={16} />, 'Production Order', production.productionOrderNumber, production.productName, 'traceability-production'], [<Factory key="recipe" size={16} />, 'Recipe Version', `V${production.recipeVersionNumber}`, production.recipeName, 'traceability-recipe'], [<Boxes key="materials" size={16} />, 'Materials Used', `${data.consumptions.length} LOT`, 'Actual consumption', 'traceability-materials']].map(([icon, label, primary, secondary, tourId], index) => <div key={label as string} data-tour={tourId as string} className="relative rounded-2xl border border-ink/10 bg-white p-4">{index < 3 ? <ChevronRight className="absolute -right-5 top-1/2 z-10 hidden -translate-y-1/2 text-blue-300 md:block" size={22} /> : null}<div className="flex items-center gap-2 text-slate-500">{icon as ReactNode}<span className="text-xs font-semibold uppercase tracking-wide">{label as string}</span></div><div className="mt-3 font-semibold text-ink">{primary as string}</div><div className="mt-1 text-sm text-slate-500">{secondary as string}</div></div>)}</div></CardContent></Card>

    <Card data-tour="traceability-fg-summary" className="overflow-hidden border-white/70 bg-white shadow-sm"><CardHeader><div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Finished goods overview</div><CardTitle className="mt-2">{fg.lotNumber}</CardTitle></div><div className="flex gap-2"><StatusPill value={qc.lotQcStatus} kind="qc" /><StatusPill value={qc.inventoryStatus} kind="inventory" /></div></div></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><Field label="Product" value={`${production.productCode} - ${production.productName}`} /><Field label="Production date" value={formatLotDateLabel(production.productionDate)} /><Field label="Actual output" value={formatQuantity(production.actualOutput ?? 0, outputUnit)} /><Field label="Yield" value={production.yieldValue === null ? '-' : `${production.yieldValue}%`} /><Field label="Production order" value={production.productionOrderNumber} /><Field label="Recipe" value={`${production.recipeName} V${production.recipeVersionNumber}`} /><Field label="Warehouse" value={production.warehouseCode} /><Field label="Completed by" value={production.completedBy ?? production.assignedOperator ?? '-'} /></CardContent></Card>

    <section data-tour="traceability-materials"><SectionTitle icon={<Boxes size={19} />} title="Material LOT cards" description={`${data.consumptions.length} material consumption tercatat untuk batch ini.`} /><div className="mt-4 grid gap-4 lg:grid-cols-2">{data.consumptions.map((item) => <MaterialCard key={item.materialConsumptionId} item={item} expiryDate={data.rawMaterialLots.find((lot) => lot.lotId === item.rawMaterialLotId)?.expiryDate ?? null} />)}{!data.consumptions.length ? <Empty text="Belum ada material consumption yang diposting." /> : null}</div></section>
    <section><SectionTitle icon={<Factory size={19} />} title="Production execution" description="Urutan aktual eksekusi proses dan operator." /><div className="mt-4"><ExecutionTimeline items={data.executions} /></div></section>
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]"><DeviationSection items={data.deviations} /><QcSection qc={qc} /></section>
  </div>
}

function SectionTitle({ icon, title, description }: { icon: ReactNode; title: string; description: string }) { return <div><div className="flex items-center gap-2 text-ink"><span className="text-blue-600">{icon}</span><h2 className="font-display text-2xl font-semibold">{title}</h2></div><p className="mt-1 text-sm text-slate-500">{description}</p></div> }

function MaterialCard({ item, expiryDate }: { item: BatchGenealogy['consumptions'][number]; expiryDate: string | null }) { const unit = item.unitOfMeasureSymbol ?? item.unitOfMeasureCode; return <Card className="border-white/70 bg-white shadow-sm"><CardContent className="p-5"><div className="flex justify-between gap-4"><div><div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">{item.rawMaterialCode}</div><h3 className="mt-1 text-lg font-semibold text-ink">{item.rawMaterialName}</h3></div><div data-tour="traceability-actual-quantity" className="text-right"><div className="text-xs text-slate-500">Actual used</div><div className="mt-1 font-semibold text-ink">{formatQuantity(item.actualQuantity, unit)}</div></div></div><div data-tour="traceability-supplier" className="mt-5 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2"><Field label="Internal LOT" value={<Link to={entityLinks.lotDetail(item.rawMaterialLotId)} className="text-ink underline underline-offset-4">{item.internalLotNumber}</Link>} /><Field label="Supplier LOT" value={item.supplierLot ?? '-'} /><Field label="Supplier" value={item.supplierName} /><Field label="Receiving" value={<Link to={entityLinks.receivingDetail(item.goodsReceivingId)} className="text-ink underline underline-offset-4">{`${item.receivingNumber} · ${formatLotDateLabel(item.receivingDate)}`}</Link>} /><Field label="Expiry" value={formatLotDateLabel(expiryDate)} /><Field label="Production step" value={`${item.stepSequence}. ${item.stepName}`} /></div></CardContent></Card> }

function ExecutionTimeline({ items }: { items: BatchGenealogy['executions'] }) { if (!items.length) return <Empty text="Belum ada production execution yang tercatat." />; return <Card className="border-white/70 bg-white shadow-sm"><CardContent className="p-5 sm:p-6"><ol className="space-y-5">{[...items].sort((a, b) => a.sequence - b.sequence).map((item, index) => <li key={item.stepExecutionId} className="relative pl-10">{index < items.length - 1 ? <span className="absolute left-[13px] top-8 h-[calc(100%+12px)] w-px bg-slate-200" /> : null}<span className="absolute left-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs font-bold text-paper">{item.sequence}</span><div className="flex flex-col justify-between gap-3 sm:flex-row"><div><div className="font-semibold text-ink">{item.stepName}</div><div className="mt-1 text-sm text-slate-500">{item.startedAtUtc ? `${formatLotDateTimeLabel(item.startedAtUtc)} - ${formatLotDateTimeLabel(item.completedAtUtc)}` : 'Belum dimulai'}</div>{item.operatorNotes ? <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-600">{item.operatorNotes}</p> : null}</div><div className="flex items-start gap-2"><StatusPill value={item.status} kind="execution" />{item.isConfirmed ? <span title="Confirmed" className="text-blue-600"><CheckCircle2 size={18} /></span> : null}</div></div></li>)}</ol></CardContent></Card> }

function DeviationSection({ items }: { items: BatchGenealogy['deviations'] }) { return <div><SectionTitle icon={<AlertTriangle size={19} />} title="Deviation" description={items.length ? `${items.length} deviation tercatat.` : 'Tidak ada deviation tercatat.'} /><div className="mt-4 space-y-3">{items.map((item) => <details key={item.id} className="group rounded-2xl border border-amber-200 bg-amber-50/50"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4"><div><div className="font-semibold text-ink">{item.reason}</div><div className="mt-1 text-sm text-slate-600">Variance {formatQuantity(item.varianceQuantity, item.unitOfMeasureSymbol)}</div></div><StatusPill value={item.status} kind="deviation" /></summary><div className="grid gap-4 border-t border-amber-100 p-4 sm:grid-cols-3"><Field label="Target" value={formatQuantity(item.targetQuantity, item.unitOfMeasureSymbol)} /><Field label="Actual" value={formatQuantity(item.actualQuantity, item.unitOfMeasureSymbol)} /><Field label="Requested by" value={item.requestedBy} />{item.reviewNotes ? <div className="sm:col-span-3"><Field label="Review notes" value={item.reviewNotes} /></div> : null}</div></details>)}{!items.length ? <Empty text="Tidak ada deviation untuk batch ini." /> : null}</div></div> }

function QcSection({ qc }: { qc: BatchGenealogy['qc'] }) { return <div data-tour="traceability-qc"><SectionTitle icon={<ShieldCheck size={19} />} title="Quality control" description="Status dan keputusan pemeriksaan FG." /><Card className="mt-4 border-white/70 bg-white shadow-sm"><CardContent className="space-y-5 p-5"><div className="flex flex-wrap gap-2"><StatusPill value={qc.lotQcStatus} kind="qc" /><StatusPill value={qc.inspectionStatus} kind="inspection" /><StatusPill value={qc.inventoryStatus} kind="inventory" /></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1"><Field label="Inspector" value={qc.inspectorName ?? '-'} /><Field label="Inspection date" value={formatLotDateTimeLabel(qc.inspectedAt)} /></div><div className="rounded-xl bg-slate-50 p-3"><div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Notes</div><p className="mt-2 text-sm leading-6 text-slate-600">{qc.notes ?? 'Tidak ada catatan QC.'}</p></div></CardContent></Card></div> }

function ForwardResult({ data }: { data: ForwardTraceability }) { const lot = data.rawMaterialLot; return <div className="space-y-6"><Card className="border-white/70 bg-white shadow-sm"><CardHeader><div className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Raw material traceability</div><CardTitle className="mt-2">{lot.internalLotNumber}</CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><Field label="Material" value={`${lot.rawMaterialCode} - ${lot.rawMaterialName}`} /><Field label="Supplier LOT" value={lot.supplierLot ?? '-'} /><Field label="Supplier" value={lot.supplierName} /><Field label="Receiving" value={`${lot.receivingNumber} · ${formatLotDateLabel(lot.receivingDate)}`} /><Field label="Expiry" value={formatLotDateLabel(lot.expiryDate)} /><Field label="Warehouse" value={`${lot.warehouseCode} - ${lot.warehouseName}`} /><Field label="Usage" value={`${data.totalUsages} production(s)`} /><Field label="Total used" value={formatQuantity(data.totalQuantityUsed)} /></CardContent></Card><section><SectionTitle icon={<Truck size={19} />} title="Affected Finished Goods" description="Batch Finished Goods yang menggunakan Raw Material LOT ini." /><div className="mt-4 grid gap-4">{data.usages.map((item) => <Card key={`${item.productionOrderId}-${item.finishedGoodsLot.lotId}`} className="border-white/70 bg-white shadow-sm"><CardContent className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4"><Field label="Finished Goods LOT" value={item.finishedGoodsLot.lotNumber} /><Field label="Product" value={`${item.productCode} - ${item.productName}`} /><Field label="Production" value={`${item.productionOrderNumber} · ${formatLotDateLabel(item.productionDate)}`} /><Field label="Actual used" value={formatQuantity(item.actualQuantityUsed)} /><Field label="Recipe" value={`${item.recipeName} V${item.recipeVersionNumber}`} /><Field label="Step" value={`${item.stepSequence}. ${item.stepName}`} /><Field label="QC" value={<StatusPill value={item.fgQcStatus} kind="qc" />} /><Field label="Inventory" value={<StatusPill value={item.fgInventoryStatus} kind="inventory" />} /></CardContent></Card>)}{!data.usages.length ? <Empty text="LOT ini belum digunakan pada Finished Goods mana pun." /> : null}</div></section></div> }

function Empty({ text }: { text: string }) { return <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center text-sm text-slate-500">{text}</div> }
