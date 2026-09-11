import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, LoaderCircle, SlidersHorizontal } from 'lucide-react'
import { rawMaterialLotsApi } from '@/api/rawMaterialLots.api'
import { rawMaterialsApi } from '@/api/rawMaterials.api'
import { stockAdjustmentsApi } from '@/api/stockAdjustments.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import type { RawMaterialLotListItem } from '@/features/raw-material-lots/types'
import type { RawMaterialListItem } from '@/features/raw-materials/types'
import type { StockAdjustmentPreview, StockAdjustmentType } from '@/features/stock-adjustments/types'
import { toSignedAdjustmentQuantity, validateStockAdjustmentForm } from '@/features/stock-adjustments/validation'
import type { WarehouseListItem } from '@/features/warehouses/types'
import { fetchLookupIfAllowed } from '@/utils/lookupGuard'
import type { ApiError } from '@/types/api'

function qty(value: number | null) { return value === null ? '-' : new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 }).format(value) }
function createIdempotencyKey() { return `${Date.now()}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}` }
const fieldClass = 'h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm'

export function StockAdjustmentCreatePage() {
  const navigate = useNavigate()
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([])
  const [materials, setMaterials] = useState<RawMaterialListItem[]>([])
  const [lots, setLots] = useState<RawMaterialLotListItem[]>([])
  const [warehouseId, setWarehouseId] = useState('')
  const [rawMaterialId, setRawMaterialId] = useState('')
  const [rawMaterialLotId, setRawMaterialLotId] = useState('')
  const [adjustmentType, setAdjustmentType] = useState<StockAdjustmentType>('IN')
  const [adjustmentQuantity, setAdjustmentQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [reference, setReference] = useState('')
  const [preview, setPreview] = useState<StockAdjustmentPreview | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [actionError, setActionError] = useState<string | null>(null)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  useEffect(() => {
    async function loadLookups() {
      const [warehouseOptions, materialOptions] = await Promise.all([
        fetchLookupIfAllowed('warehouses.view', () => warehousesApi.listOptions('ACTIVE'), []),
        fetchLookupIfAllowed('materials.view', () => rawMaterialsApi.listActiveOptions(), []),
      ])
      setWarehouses(warehouseOptions); setMaterials(materialOptions)
    }
    void loadLookups().catch(() => undefined)
  }, [])

  useEffect(() => {
    async function loadLots() {
      if (!warehouseId || !rawMaterialId) { setLots([]); setRawMaterialLotId(''); return }
      const result = await fetchLookupIfAllowed('lots.view', () => rawMaterialLotsApi.list({ search: '', rawMaterialId, supplierId: '', warehouseId, status: 'AVAILABLE', expiryFrom: '', expiryTo: '', receivedDateFrom: '', receivedDateTo: '', page: 1, pageSize: 100 }), null)
      setLots(result?.items ?? [])
    }
    void loadLots().catch(() => setLots([]))
  }, [warehouseId, rawMaterialId])

  const selectedLot = useMemo(() => lots.find((lot) => lot.id === rawMaterialLotId) ?? null, [lots, rawMaterialLotId])
  const signedQuantity = toSignedAdjustmentQuantity(adjustmentType, adjustmentQuantity)
  const localPreviewAfter = selectedLot && Number.isFinite(signedQuantity) ? selectedLot.currentQuantity + signedQuantity : null

  useEffect(() => {
    async function loadPreview() {
      setPreview(null)
      if (!warehouseId || !rawMaterialId || !rawMaterialLotId || !Number.isFinite(signedQuantity) || signedQuantity === 0) return
      setIsPreviewing(true)
      try {
        const result = await stockAdjustmentsApi.preview({ warehouseId, rawMaterialId, rawMaterialLotId, adjustmentQuantity: signedQuantity })
        setPreview(result); setActionError(null)
      } catch (caughtError) {
        setActionError((caughtError as ApiError).message)
      } finally { setIsPreviewing(false) }
    }
    const timeoutId = window.setTimeout(() => void loadPreview(), 350)
    return () => window.clearTimeout(timeoutId)
  }, [warehouseId, rawMaterialId, rawMaterialLotId, signedQuantity])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateStockAdjustmentForm({ warehouseId, rawMaterialId, rawMaterialLotId, adjustmentQuantity, reason })
    if (!preview) nextErrors.preview = 'Preview backend wajib berhasil sebelum adjustment diposting.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setConfirmOpen(true)
  }

  async function postAdjustment() {
    setIsSubmitting(true); setActionError(null)
    try {
      const result = await stockAdjustmentsApi.create({ warehouseId, rawMaterialId, rawMaterialLotId, adjustmentQuantity: signedQuantity, reason: reason.trim(), reference: reference.trim() || null }, createIdempotencyKey())
      navigate(`/warehouse/stock-adjustments/${result.id}`)
    } catch (caughtError) { setActionError((caughtError as ApiError).message) }
    finally { setIsSubmitting(false) }
  }

  return <div className="mx-auto max-w-4xl space-y-6">
    <Button asChild variant="ghost" className="text-slate-500"><Link to="/warehouse/stock-adjustments"><ArrowLeft size={16} />Kembali</Link></Button>
    <section className="rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8"><div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72"><SlidersHorizontal size={14} className="text-signal" />Create Adjustment</div><h1 className="mt-5 font-display text-3xl font-semibold">Post correction per LOT</h1><p className="mt-3 text-sm leading-7 text-paper/68">Quantity before diambil dari backend. Tidak ada optimistic update setelah post.</p></section>
    <div className="rounded-[24px] border border-red-200 bg-red-50 p-4 text-sm text-red-800"><div className="flex gap-3"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><p>Stock Adjustment langsung mengubah inventory setelah dikonfirmasi. Pastikan LOT, quantity, dan reason benar.</p></div></div>
    {actionError ? <div className="rounded-[24px] border border-red-100 bg-red-50 p-4 text-sm text-red-700">{actionError}</div> : null}
    <Card className="rounded-[28px] border-slate-200/80"><CardHeader><CardTitle>Adjustment Form</CardTitle></CardHeader><CardContent><form onSubmit={handleSubmit} className="grid gap-5 lg:grid-cols-2">
      <Field label="Warehouse" error={errors.warehouseId}><select className={fieldClass} value={warehouseId} onChange={(event) => { setWarehouseId(event.target.value); setRawMaterialLotId('') }}><option value="">Pilih warehouse</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select></Field>
      <Field label="Material" error={errors.rawMaterialId}><select className={fieldClass} value={rawMaterialId} onChange={(event) => { setRawMaterialId(event.target.value); setRawMaterialLotId('') }}><option value="">Pilih material</option>{materials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}</select></Field>
      <Field label="LOT" error={errors.rawMaterialLotId}><select data-tour="adjustment-lot-select" className={fieldClass} value={rawMaterialLotId} onChange={(event) => setRawMaterialLotId(event.target.value)}><option value="">Pilih LOT</option>{lots.map((lot) => <option key={lot.id} value={lot.id}>{lot.internalLotNumber} · {qty(lot.currentQuantity)} {lot.unitOfMeasureCode}</option>)}</select></Field>
      <Field label="Current Quantity"><div className={`${fieldClass} flex items-center bg-slate-50 font-semibold`}>{preview ? qty(preview.currentQuantity) : qty(selectedLot?.currentQuantity ?? null)}</div></Field>
      <Field label="Adjustment Type"><select className={fieldClass} value={adjustmentType} onChange={(event) => setAdjustmentType(event.target.value as StockAdjustmentType)}><option value="IN">IN / Surplus</option><option value="OUT">OUT / Shortage</option></select></Field>
      <Field label="Adjustment Quantity" error={errors.adjustmentQuantity}><input className={fieldClass} type="number" min="0" step="0.0001" inputMode="decimal" value={adjustmentQuantity} onChange={(event) => setAdjustmentQuantity(event.target.value)} /></Field>
      <Field label="Preview Quantity After" error={errors.preview}><div className={`${fieldClass} flex items-center bg-slate-50 font-semibold`}>{isPreviewing ? 'Menghitung...' : preview ? qty(preview.quantityAfter) : qty(localPreviewAfter)}</div></Field>
      <Field label="Reference"><input className={fieldClass} value={reference} onChange={(event) => setReference(event.target.value)} placeholder="Opsional" /></Field>
      <div className="lg:col-span-2" data-tour="adjustment-reason"><Field label="Reason" error={errors.reason}><Textarea className="mt-2 min-h-28 rounded-2xl" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Wajib. Jelaskan alasan correction." /></Field></div>
      <div className="lg:col-span-2" data-tour="adjustment-submit-btn"><Button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-2xl bg-red-700 text-white hover:bg-red-800">Post Adjustment</Button></div>
    </form></CardContent></Card>
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}><DialogContent><DialogHeader><DialogTitle>Konfirmasi Post Adjustment</DialogTitle><DialogDescription>Adjustment ini akan langsung menyesuaikan inventory LOT. Pastikan data sudah benar.</DialogDescription></DialogHeader><div className="rounded-2xl bg-slate-50 p-4 text-sm">Before: <b>{qty(preview?.currentQuantity ?? selectedLot?.currentQuantity ?? null)}</b><br />Adjustment: <b>{qty(signedQuantity)}</b><br />After: <b>{qty(preview?.quantityAfter ?? localPreviewAfter)}</b></div><DialogFooter><Button variant="secondary" onClick={() => setConfirmOpen(false)}>Batal</Button><Button disabled={isSubmitting} onClick={() => void postAdjustment()} className="bg-red-700 text-white hover:bg-red-800">{isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : null}Post Adjustment</Button></DialogFooter></DialogContent></Dialog>
  </div>
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div><label className="text-sm font-semibold text-ink">{label}</label><div className="mt-2">{children}</div>{error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}</div>
}
