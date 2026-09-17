import { useEffect, useState } from 'react'
import { CheckCircle2, Printer, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/common/StatusBadge'
import type { FinishedGoodsLotLabel, OperatorProductionDetail, ProductionCompletionResult } from '@/features/operator-production/types'

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))
}

function formatSigned(value: number) {
  return `${value > 0 ? '+' : ''}${Number(value.toFixed(4))}`
}

export function ProductionCompletionCard({ detail, isSubmitting, error, onComplete, onLoadLabel, onViewFg, onPrint, onBack }: { detail: OperatorProductionDetail; isSubmitting: boolean; error: string | null; onComplete: (actualOutput: number, productionNotes?: string) => Promise<ProductionCompletionResult>; onLoadLabel: (id: string) => Promise<FinishedGoodsLotLabel>; onViewFg: (id: string) => void; onPrint: (id: string) => void; onBack: () => void }) {
  const [actualOutput, setActualOutput] = useState(String(detail.targetOutput))
  const [productionNotes, setProductionNotes] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<ProductionCompletionResult | null>(null)
  const [label, setLabel] = useState<FinishedGoodsLotLabel | null>(null)
  const [labelLoading, setLabelLoading] = useState(false)
  const [labelError, setLabelError] = useState<string | null>(null)
  const uom = detail.unitOfMeasureSymbol ?? detail.unitOfMeasureCode
  const parsed = Number(actualOutput.replace(',', '.'))
  const valid = Number.isFinite(parsed) && parsed > 0 && /^\d+(?:[.,]\d{1,4})?$/.test(actualOutput.trim())
  const outputVariance = valid ? parsed - detail.targetOutput : 0
  const yieldValue = valid ? Number(((parsed / detail.targetOutput) * 100).toFixed(2)) : null
  const requiresReason = valid && outputVariance !== 0
  const canSubmit = valid && (!requiresReason || productionNotes.trim().length > 0)

  async function submit() {
    if (isSubmitting || !canSubmit) return
    setSubmitError(null)
    try {
      const next = await onComplete(parsed, productionNotes.trim() || undefined)
      setResult(next)
      setConfirmOpen(false)
    } catch (caught) {
      setSubmitError((caught as Error).message)
    }
  }

  useEffect(() => {
    if (!result) return
    setLabelLoading(true)
    setLabelError(null)
    void onLoadLabel(result.finishedGoodsLot.id)
      .then(setLabel)
      .catch((caught) => { setLabel(null); setLabelError((caught as Error).message) })
      .finally(() => setLabelLoading(false))
  }, [onLoadLabel, result])

  if (result) return <CompletedProductionCard result={result} label={label} labelLoading={labelLoading} labelError={labelError} onViewFg={onViewFg} onPrint={onPrint} onBack={onBack} />

  return <Card className="border-signal/35"><CardContent className="space-y-6 p-6 sm:p-8"><div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">All steps completed</div><h2 className="mt-2 font-display text-3xl font-semibold text-ink">Production Summary</h2><p className="mt-2 text-sm text-slate-600">Review hasil produksi sebelum Finished Goods LOT dibuat oleh backend.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Summary label="Product" value={detail.productName} /><Summary label="PO Number" value={detail.productionOrderNumber} /><Summary label="Recipe Version" value={`V${detail.recipeVersionNumber}`} /><Summary label="Target Output" value={`${detail.targetOutput} ${uom}`} /><Summary label="Yield Preview" value={yieldValue === null ? '-' : `${yieldValue}%`} /><Summary label="Output Variance" value={valid ? `${formatSigned(outputVariance)} ${uom}` : '-'} /><Summary label="Completed Steps" value={`${detail.progress.completedSteps}/${detail.progress.totalSteps}`} /><Summary label="Deviations" value={`${detail.deviationSummary.totalCount} total · ${detail.deviationSummary.approvedCount} approved`} /></div><div className="rounded-2xl border border-ink/10 p-4"><div className="text-sm font-semibold text-ink">Material Consumption</div><p className="mt-1 text-xs text-slate-500">Actual material adalah bahan baku yang dipakai, bukan hasil produk jadi.</p>{detail.materialConsumptionSummary.lines.length ? <div className="mt-3 grid gap-2">{detail.materialConsumptionSummary.lines.map((line) => { const materialUom = line.unitOfMeasureSymbol ?? line.unitOfMeasureCode; return <div key={`${line.rawMaterialCode}-${materialUom}`} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-sand/35 px-3 py-2 text-sm"><span className="font-medium text-ink">{line.rawMaterialCode} - {line.rawMaterialName}</span><span className="text-slate-600">Actual {line.actualQuantity} / Required {line.targetQuantity} {materialUom}</span></div> })}</div> : <p className="mt-3 text-sm text-slate-500">Belum ada material consumption posted.</p>}</div><div><label className="text-sm font-semibold text-ink">Actual Good Output <span className="text-red-600">*</span></label><div className="mt-2 flex flex-col gap-2 sm:flex-row"><Input inputMode="decimal" value={actualOutput} onChange={(event) => setActualOutput(event.target.value)} placeholder={`Contoh: ${detail.targetOutput}`} disabled={isSubmitting} /><span className="flex h-14 min-w-20 items-center justify-center rounded-2xl bg-sand/45 px-4 text-sm font-semibold text-ink">{uom}</span></div><p className="mt-2 text-sm text-slate-600">Masukkan jumlah produk jadi baik yang benar-benar dihasilkan, bukan jumlah bahan baku.</p>{actualOutput && !valid ? <p className="mt-2 text-sm text-red-700">Actual Good Output harus angka lebih dari 0, maksimal 4 desimal.</p> : null}</div>{requiresReason ? <div><label className="text-sm font-semibold text-ink">Reason for Output Variance <span className="text-red-600">*</span></label><textarea className="mt-2 min-h-24 w-full rounded-2xl border border-ink/15 bg-white px-4 py-3 text-sm outline-none focus:border-signal" value={productionNotes} onChange={(event) => setProductionNotes(event.target.value)} placeholder="Contoh: output lebih rendah karena produk reject, tumpah, atau batch dihentikan." disabled={isSubmitting} />{!productionNotes.trim() ? <p className="mt-2 text-sm text-amber-700">Alasan wajib jika Actual Good Output berbeda dari Target Output.</p> : null}</div> : null}{error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}<Button size="lg" disabled={!canSubmit || isSubmitting} onClick={() => { setSubmitError(null); setConfirmOpen(true) }}>Complete Production</Button><Dialog open={confirmOpen} onOpenChange={setConfirmOpen}><DialogContent><DialogHeader><DialogTitle>Complete production?</DialogTitle><DialogDescription>Finished Goods LOT akan dibuat dengan actual good output {valid ? parsed : '-'} {uom}. Yield {yieldValue ?? '-'}% dan variance {valid ? `${formatSigned(outputVariance)} ${uom}` : '-'}.</DialogDescription></DialogHeader>{submitError ? <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</p> : null}<DialogFooter><Button variant="secondary" disabled={isSubmitting} onClick={() => setConfirmOpen(false)}>Cancel</Button><Button disabled={isSubmitting} onClick={() => void submit()}>Confirm Complete</Button></DialogFooter></DialogContent></Dialog></CardContent></Card>
}

function CompletedProductionCard({ result, label, labelLoading, labelError, onViewFg, onPrint, onBack }: { result: ProductionCompletionResult; label: FinishedGoodsLotLabel | null; labelLoading: boolean; labelError: string | null; onViewFg: (id: string) => void; onPrint: (id: string) => void; onBack: () => void }) {
  const fg = result.finishedGoodsLot
  const uom = fg.unitOfMeasure.symbol ?? fg.unitOfMeasure.code
  return <Card className="overflow-hidden border-emerald-200"><CardContent className="space-y-6 p-6 sm:p-8"><div className="flex gap-3"><CheckCircle2 className="text-emerald-600" size={32} /><div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Production Completed</div><h2 className="mt-2 font-display text-3xl font-semibold text-ink">{fg.finishedGoodsLotNumber}</h2><div className="mt-3 flex flex-wrap gap-2"><StatusBadge domain="fg-qc" value={fg.qcStatus} /><StatusBadge domain="fg-inventory" value={fg.inventoryStatus} /></div></div></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><Summary label="Product" value={fg.productName} /><Summary label="Target Output" value={`${result.targetOutput} ${uom}`} /><Summary label="Actual Good Output" value={`${result.actualOutput} ${uom}`} /><Summary label="Output Variance" value={`${formatSigned(result.outputVariance)} ${uom}`} /><Summary label="Yield" value={`${result.yieldValue}%`} /><Summary label="Production Date" value={formatDate(fg.productionDate)} /><Summary label="Completed By" value={result.completedBy} /></div><div className="rounded-2xl border border-ink/10 p-5"><div className="flex items-center gap-2 font-semibold text-ink"><QrCode size={18} />QR Finished Goods</div>{labelLoading ? <p className="mt-4 text-sm text-slate-500">Memuat QR label...</p> : null}{label ? <img className="mt-4 h-44 w-44 rounded-xl border border-slate-100" src={`data:image/png;base64,${label.qrImageBase64}`} alt={`QR ${fg.finishedGoodsLotNumber}`} /> : null}{!labelLoading && !label ? <p className="mt-4 text-sm text-amber-700">{labelError ?? 'QR label belum tersedia. Token di bawah tetap dapat digunakan.'}</p> : null}<p className="mt-3 break-all rounded-xl bg-sand/35 p-3 text-xs text-slate-600">{fg.qrToken}</p></div><div className="flex flex-wrap gap-3"><Button onClick={() => onViewFg(fg.id)}>View FG LOT</Button><Button variant="secondary" disabled={labelLoading} onClick={() => onPrint(fg.id)}><Printer size={16} />Print Label</Button><Button variant="secondary" onClick={onBack}>Back to Queue</Button></div></CardContent></Card>
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-ink/8 p-4"><div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div><div className="mt-2 font-semibold text-ink">{value}</div></div>
}
