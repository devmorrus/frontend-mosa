import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { StatusBadge, getStatusLabel } from '@/components/common/StatusBadge'
import { entityLinks } from '@/routes/canonicalRoutes'
import { qcApi } from '@/api/qc.api'
import { productionOrdersApi } from '@/api/productionOrders.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import { MasterDataDetailSkeleton, MasterDataErrorState } from '@/features/master-data/components/MasterDataStates'
import { QcResultType, type QcHistoryItem, type QcInspection, type QcPaged, type QcResultInput } from '@/features/quality-control/types'
import { useAuth } from '@/hooks/useAuth'

export function QualityControlInspectionPage() {
  const { finishedGoodsLotId } = useParams<{ finishedGoodsLotId: string }>()
  const navigate = useNavigate()
  const { can } = useAuth()
  const [inspection, setInspection] = useState<QcInspection | null>(null)
  const [fg, setFg] = useState<any>(null)
  const [history, setHistory] = useState<QcPaged<QcHistoryItem> | null>(null)
  const [values, setValues] = useState<Record<string, QcResultInput>>({})
  const [notes, setNotes] = useState('')
  const [decision, setDecision] = useState<'pass' | 'hold' | 'reject' | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function load() {
    if (!finishedGoodsLotId) return

    try {
      setError(null)
      setActionError(null)
      const [nextInspection, nextFg, nextHistory] = await Promise.all([
        qcApi.getInspection(finishedGoodsLotId),
        productionOrdersApi.getFinishedGoodsLot(finishedGoodsLotId),
        qcApi.history(finishedGoodsLotId),
      ])
      setInspection(nextInspection)
      setFg(nextFg)
      setHistory(nextHistory)
      setNotes(nextInspection.notes ?? '')
      setValues(Object.fromEntries(nextInspection.items.map((item) => [item.parameterId, { parameterId: item.parameterId, resultValue: item.resultValue, isPassed: item.isPassed, notes: item.notes }])))
    } catch (caught) {
      if (!inspection) setError((caught as Error).message)
      else setActionError((caught as Error).message)
    }
  }

  useEffect(() => { void load() }, [finishedGoodsLotId])

  if (error) return <MasterDataErrorState description={error} onRetry={() => void load()} />
  if (!inspection || !fg || !history) return <MasterDataDetailSkeleton label="Memuat QC inspection" />

  const isEditable = isInspectionEditable(inspection.inspectionStatus)
  const setValue = (parameterId: string, patch: Partial<QcResultInput>) => setValues((current) => ({ ...current, [parameterId]: current[parameterId] ? { ...current[parameterId], ...patch } : { parameterId, resultValue: patch.resultValue ?? '', isPassed: patch.isPassed ?? null, notes: patch.notes ?? null } }))
  const items = inspection.parameters.map((parameter) => values[parameter.id] ?? { parameterId: parameter.id, resultValue: '', isPassed: null, notes: null })
  const missingRequired = inspection.parameters.some((parameter) => parameter.isRequired && !values[parameter.id]?.resultValue.trim())

  async function saveInspection() {
    if (!finishedGoodsLotId || saving || !isEditable) return

    setSaving(true)
    setActionError(null)
    try {
      await qcApi.inspect(finishedGoodsLotId, items.filter((item) => item.resultValue.trim()))
      await load()
    } catch (caught) {
      setActionError((caught as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function decide() {
    if (!finishedGoodsLotId || !decision || !inspection || saving || !isEditable) return
    if ((decision === 'hold' || decision === 'reject') && !notes.trim()) return

    setSaving(true)
    setActionError(null)
    try {
      await qcApi.decide(finishedGoodsLotId, decision, notes.trim() || null, isInspectionInProgress(inspection.inspectionStatus) ? [] : items.filter((item) => item.resultValue.trim()))
      setDecision(null)
      await load()
    } catch (caught) {
      setActionError((caught as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const uom = fg.unitOfMeasure?.symbol ?? fg.unitOfMeasure?.code ?? ''

  return <div className="mx-auto max-w-5xl space-y-6 pb-12">
    <Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Quality Control', to: '/quality-control' }, { label: inspection.lotNumber }]} />
    <div className="flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => navigate('/quality-control')}><ArrowLeft size={16} />QC Queue</Button>
      <Button variant="secondary" disabled={saving} onClick={() => void load()}>Refresh</Button>
    </div>
    <Card>
      <CardHeader>
        <div className="text-xs font-semibold uppercase tracking-[.16em] text-blue-700">Finished Goods Inspection</div>
        <CardTitle>{inspection.lotNumber}</CardTitle>
        <div className="mt-3 flex flex-wrap gap-2">
          <StatusBadge domain="fg-qc" value={fg.qcStatus ?? inspection.lotQcStatus} />
          <StatusBadge domain="fg-inventory" value={fg.inventoryStatus} />
          {can('production-orders.view') && fg.productionOrderId ? <Link to={entityLinks.productionOrderDetail(fg.productionOrderId)} className="inline-flex items-center rounded-full bg-ink px-3 py-1.5 text-xs font-semibold text-paper underline underline-offset-4">Buka {fg.productionOrderNumber}</Link> : null}
          {can('traceability.view') && finishedGoodsLotId ? <Link to={entityLinks.traceFinishedGoods(finishedGoodsLotId)} className="inline-flex items-center rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink">Traceability</Link> : null}
          {can('finished-goods-lots.view') && finishedGoodsLotId ? <Link to={entityLinks.finishedGoodsLotDetail(finishedGoodsLotId)} className="inline-flex items-center rounded-full border border-ink/15 px-3 py-1.5 text-xs font-semibold text-ink">FG Detail</Link> : null}
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Info label="Product" value={fg.productName} />
        <Info label="Production Order" value={fg.productionOrderNumber} />
        <Info label="Recipe Version" value={`V${fg.recipeVersionNumber}`} />
        <Info label="Target Output" value={`${fg.targetOutput} ${uom}`} />
        <Info label="Actual Output" value={`${fg.actualOutput} ${uom}`} />
        <Info label="Yield" value={`${fg.yieldValue}%`} />
        <Info label="Inspector" value={inspection.inspectorName ?? '-'} />
        <Info label="Inspected At" value={inspection.inspectedAt ? new Date(inspection.inspectedAt).toLocaleString('id-ID') : '-'} />
        <Info label="Inspection Status" value={getInspectionStatusLabel(inspection.inspectionStatus)} />
        <Info label="Production Date" value={new Date(fg.productionDate).toLocaleDateString('id-ID')} />
        <Info label="Inventory" value={fg.inventoryStatus} />
      </CardContent>
    </Card>
    {actionError ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{actionError}</p> : null}
    <Card data-tour="qc-param-card">
      <CardHeader>
        <CardTitle>{isEditable ? 'QC Parameters' : 'QC Results'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditable ? <p className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">QC sudah final dengan status {getInspectionStatusLabel(inspection.inspectionStatus)}. Hasil inspeksi ditampilkan sebagai read-only.</p> : null}
        {inspection.parameters.map((parameter, parameterIndex) => <div key={parameter.id} data-tour={parameterIndex === 0 ? 'qc-result-input' : undefined} className="rounded-2xl border border-ink/10 p-4">
          <div className="flex justify-between gap-3">
            <div>
              <div className="font-semibold text-ink">{parameter.sequence}. {parameter.name} {parameter.isRequired ? <span className="text-red-600">*</span> : null}</div>
              {parameter.description ? <p className="mt-1 text-sm text-slate-500">{parameter.description}</p> : null}
            </div>
          </div>
          {isEditable ? <ResultInput parameter={parameter} value={values[parameter.id]} onChange={(patch) => setValue(parameter.id, patch)} /> : <ReadOnlyResult value={values[parameter.id]} />}
          <Textarea className="mt-3" disabled={!isEditable || !can('qc.inspect') || saving} placeholder="Catatan parameter (opsional)" value={values[parameter.id]?.notes ?? ''} onChange={(e) => setValue(parameter.id, { notes: e.target.value })} />
        </div>)}
        {!inspection.parameters.length ? <p className="rounded-xl bg-sand/45 p-4 text-sm text-slate-600">Product ini belum memiliki parameter QC aktif.</p> : null}
        <Textarea value={notes} maxLength={1000} disabled={!isEditable || !can('qc.decide') || saving} onChange={(e) => setNotes(e.target.value)} placeholder="QC Notes" />
        {isEditable ? <div data-tour="qc-decide-bar" className="flex flex-wrap gap-3">
          {can('qc.inspect') ? <Button variant="secondary" disabled={saving || !items.some((item) => item.resultValue.trim())} onClick={() => void saveInspection()}>Save Inspection</Button> : null}
          {can('qc.decide') ? <>
            <Button disabled={saving || missingRequired} onClick={() => setDecision('pass')}><CheckCircle2 size={16} />Pass</Button>
            <Button disabled={saving || missingRequired} variant="secondary" onClick={() => setDecision('hold')}>Hold</Button>
            <Button disabled={saving || missingRequired} variant="secondary" onClick={() => setDecision('reject')}>Reject</Button>
          </> : null}
        </div> : null}
        {isEditable && missingRequired ? <p className="text-sm text-red-700">Lengkapi seluruh parameter required sebelum mengambil keputusan.</p> : null}
      </CardContent>
    </Card>
    <Card data-tour="qc-history">
      <CardHeader>
        <CardTitle>QC History</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {history.items.map((item) => <div key={item.id} className="rounded-xl border border-slate-100 p-3 text-sm">
          <b>{getStatusLabel('inspection', item.status)}</b> - {item.inspectorName ?? '-'} - {item.inspectedAt ? new Date(item.inspectedAt).toLocaleString('id-ID') : '-'}
          <div className="mt-1 text-slate-500">{item.itemCount} result item {item.notes ? `- ${item.notes}` : ''}</div>
        </div>)}
        <MasterDataPagination pagination={history.pagination} onPageChange={(page) => finishedGoodsLotId && void qcApi.history(finishedGoodsLotId, page).then(setHistory).catch((caught) => setActionError((caught as Error).message))} />
      </CardContent>
    </Card>
    <Dialog open={!!decision} onOpenChange={(open) => !saving && !open && setDecision(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Konfirmasi QC {decision?.toUpperCase()}</DialogTitle>
          <DialogDescription>{decision === 'pass' ? 'Finished Goods akan dilepas menjadi Available Stock.' : decision === 'hold' ? 'Finished Goods akan tetap diblokir dan belum tersedia sebagai stock.' : 'Finished Goods akan ditandai Rejected dan tidak menjadi Available Stock.'}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" disabled={saving} onClick={() => setDecision(null)}>Batal</Button>
          <Button disabled={saving || ((decision === 'hold' || decision === 'reject') && !notes.trim())} onClick={() => void decide()}>{saving ? 'Memproses...' : `Ya, ${decision?.toUpperCase()}`}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
}

function isInspectionInProgress(status: string | number): boolean {
  // Backend serializes enums as numbers (Pending=1, InProgress=2); tolerate both forms.
  const normalized = String(status).trim().toUpperCase().replace(/[\s-]+/g, '_')
  return normalized === 'IN_PROGRESS' || normalized === 'INPROGRESS' || normalized === '2'
}

function isInspectionEditable(status: string | number): boolean {
  const normalized = String(status).trim().toUpperCase().replace(/[\s-]+/g, '_')
  return normalized === 'PENDING' || normalized === 'IN_PROGRESS' || normalized === 'INPROGRESS' || normalized === 'HOLD' || normalized === 'ON_HOLD' || normalized === '1' || normalized === '2' || normalized === '4'
}

function getInspectionStatusLabel(status: string | number): string {
  return getStatusLabel('inspection', status)
}

function ResultInput({ parameter, value, onChange }: { parameter: any; value: QcResultInput | undefined; onChange: (patch: Partial<QcResultInput>) => void }) {
  const current = value ?? { resultValue: '', isPassed: null }
  if (parameter.resultType === QcResultType.Boolean || parameter.resultType === QcResultType.PassFail) return <select className="mt-3 h-12 rounded-xl border border-slate-200 px-3" value={current.isPassed === null ? '' : String(current.isPassed)} onChange={(e) => { const isPassed = e.target.value === '' ? null : e.target.value === 'true'; onChange({ isPassed, resultValue: e.target.value === '' ? '' : isPassed ? 'PASS' : 'FAIL' }) }}>
    <option value="">Pilih hasil</option>
    <option value="true">Pass / Ya</option>
    <option value="false">Fail / Tidak</option>
  </select>
  return <Input className="mt-3" inputMode={parameter.resultType === QcResultType.Number || parameter.resultType === QcResultType.NumericRange ? 'decimal' : 'text'} value={current.resultValue} onChange={(e) => onChange({ resultValue: e.target.value })} placeholder="Masukkan hasil" />
}

function ReadOnlyResult({ value }: { value: QcResultInput | undefined }) {
  return <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-ink">{value?.resultValue?.trim() || '-'}</div>
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-sand/35 p-4">
    <div className="text-xs font-semibold uppercase text-slate-500">{label}</div>
    <div className="mt-2 font-semibold text-ink">{value}</div>
  </div>
}
