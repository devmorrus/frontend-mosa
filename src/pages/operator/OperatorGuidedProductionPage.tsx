import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock3, Factory, LoaderCircle, Play, TimerReset } from 'lucide-react'
import { productionOrdersApi } from '@/api/productionOrders.api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import { ProductionOrderStatus } from '@/features/production-orders/types'
import { ProductionStepExecutionStatus, type OperatorProductionDetail } from '@/features/operator-production/types'
import { MaterialConsumptionPanel } from '@/features/operator-production/deviation/MaterialConsumptionPanel'
import { ProductionCompletionCard } from '@/features/operator-production/completion/ProductionCompletionCard'
import { RecipeStepType, RecipeToleranceType } from '@/features/recipes/types'
import type { ApiError } from '@/types/api'

function formatDuration(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

function getRemainingSeconds(timerEndsAtUtc: string | null, now: number) {
  if (!timerEndsAtUtc) return 0
  return Math.max(0, Math.ceil((new Date(timerEndsAtUtc).getTime() - now) / 1000))
}

function toleranceLabel(type: RecipeToleranceType | null, value: number | null, uom: string | null) {
  if (!type || type === RecipeToleranceType.None || value === null) return null
  const suffix = uom ? ` ${uom}` : ''
  if (type === RecipeToleranceType.PlusMinus) return `Tolerance ±${value}${suffix}`
  return type === RecipeToleranceType.Min ? `Minimum tolerance ${value}${suffix}` : `Maximum tolerance ${value}${suffix}`
}

export function OperatorGuidedProductionPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [detail, setDetail] = useState<OperatorProductionDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notes, setNotes] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [now, setNow] = useState(() => Date.now())

  async function loadDetail(background = false) {
    if (!id) return
    if (!background) setIsLoading(true)
    setError(null)
    try {
      const next = await productionOrdersApi.getMyQueueDetail(id)
      setDetail(next)
      setConfirmed(next.currentStep?.isConfirmed ?? false)
      setNotes('')
    } catch (caughtError) {
      setError((caughtError as ApiError).message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    const productionOrderId = id

    async function fetchInitialDetail() {
      setIsLoading(true)
      setError(null)
      try {
        const next = await productionOrdersApi.getMyQueueDetail(productionOrderId)
        setDetail(next)
        setConfirmed(next.currentStep?.isConfirmed ?? false)
      } catch (caughtError) {
        setError((caughtError as ApiError).message)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchInitialDetail()
  }, [id])

  useEffect(() => {
    if (!detail?.currentStep?.timerEndsAtUtc) return
    const interval = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(interval)
  }, [detail?.currentStep?.timerEndsAtUtc])

  useEffect(() => {
    if (!detail?.currentDeviation || detail.currentDeviation.status !== 1) return
    const interval = window.setInterval(() => void loadDetail(true), 10_000)
    return () => window.clearInterval(interval)
  }, [detail?.currentDeviation?.id, detail?.currentDeviation?.status])

  async function runAction(action: () => Promise<unknown>) {
    setIsSubmitting(true)
    setActionError(null)
    try {
      await action()
      await loadDetail(true)
    } catch (caughtError) {
      setActionError((caughtError as ApiError).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  async function completeProduction(actualOutput: number) {
    if (!detail) throw new Error('Production order tidak ditemukan.')
    setIsSubmitting(true)
    setActionError(null)
    try {
      return await productionOrdersApi.completeProduction(detail.id, { actualOutput })
    } catch (caughtError) {
      const message = (caughtError as ApiError).message
      setActionError(message)
      throw caughtError
    } finally {
      setIsSubmitting(false)
    }
  }

  async function printFinishedGoodsLabel(fgLotId: string) {
    try {
      const label = await productionOrdersApi.getFinishedGoodsLabel(fgLotId)
      const printWindow = window.open('', '_blank', 'noopener,noreferrer')
      if (!printWindow) throw new Error('Popup print diblokir browser.')
      printWindow.document.write(`<html><head><title>${label.finishedGoodsLotNumber}</title></head><body style="font-family:Arial;padding:24px"><h1>${label.productName}</h1><p><b>FG LOT:</b> ${label.finishedGoodsLotNumber}</p><p>Actual: ${label.actualOutput} ${label.unitOfMeasureSymbol}</p><p>QC: ${label.qcStatus}</p><img width="220" src="data:image/png;base64,${label.qrImageBase64}" /></body></html>`)
      printWindow.document.close(); printWindow.focus(); printWindow.print()
    } catch (caughtError) { setActionError((caughtError as ApiError).message) }
  }

  if (isLoading) return <MasterDataLoadingState description="Memuat langkah produksi saat ini." />
  if (error || !detail) return <MasterDataErrorState description={error ?? 'Production order tidak ditemukan.'} onRetry={() => void loadDetail()} />

  const step = detail.currentStep
  const progress = detail.progress.totalSteps === 0 ? 0 : Math.round((detail.progress.completedSteps / detail.progress.totalSteps) * 100)
  const remaining = step?.timerEndsAtUtc
    ? getRemainingSeconds(step.timerEndsAtUtc, now)
    : step?.timerSeconds ?? 0

  return <div className="mx-auto max-w-4xl space-y-6 pb-24">
    <button type="button" onClick={() => navigate('/operator/production')} className="inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-slate-600 hover:text-ink"><ArrowLeft size={18} /> Kembali ke My Production</button>
    <section className="relative overflow-hidden rounded-[30px] bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,163,61,0.24),transparent_55%)]" />
      <div className="relative"><div className="flex flex-wrap items-center justify-between gap-3"><div><div className="text-xs font-semibold uppercase tracking-[0.18em] text-paper/62">{detail.productionOrderNumber}</div><h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">{detail.productName}</h1></div><Badge variant="subtle">Recipe v{detail.recipeVersionNumber}</Badge></div><div className="mt-6 grid gap-3 text-sm sm:grid-cols-3"><div><span className="text-paper/52">Target output</span><p className="mt-1 font-semibold">{detail.targetOutput} {detail.unitOfMeasureSymbol ?? detail.unitOfMeasureCode}</p></div><div><span className="text-paper/52">Operator</span><p className="mt-1 font-semibold">{detail.operatorName}</p></div><div><span className="text-paper/52">Progress</span><p className="mt-1 font-semibold">Step {step?.sequence ?? detail.progress.totalSteps} of {detail.progress.totalSteps} · {progress}%</p></div></div></div>
    </section>

    {detail.status === ProductionOrderStatus.Released && !step ? <Card><CardContent className="p-7 text-center"><CheckCircle2 className="mx-auto text-signal" size={36} /><h2 className="mt-4 font-display text-2xl font-semibold text-ink">Siap memulai produksi</h2><p className="mt-2 text-sm text-slate-500">Mulai production order untuk membuka langkah pertama dari backend.</p><div className="mt-6"><Button size="lg" className="h-12" disabled={isSubmitting} onClick={() => void runAction(() => productionOrdersApi.startProduction(detail.id))}><Play size={18} fill="currentColor" /> Start Production</Button></div></CardContent></Card> : null}

    {step ? <CurrentStepCard
      detail={detail}
      confirmed={confirmed}
      isSubmitting={isSubmitting}
      actionError={actionError}
      notes={notes}
      remaining={remaining}
      onConfirmedChange={setConfirmed}
      onNotesChange={setNotes}
      onStart={() => void runAction(() => productionOrdersApi.startStep(detail.id, step.id))}
      onStartTimer={() => void runAction(() => productionOrdersApi.startTimer(detail.id, step.id))}
      onComplete={() => void runAction(() => productionOrdersApi.completeStep(detail.id, step.id, step.stepType === RecipeStepType.Check ? { confirmed: true, notes } : {}))}
      onValidateLot={(value) => productionOrdersApi.validateMaterialLot(detail.id, step.id, /^[0-9a-f-]{36}$/i.test(value.trim()) ? { rawMaterialLotId: value.trim() } : { qrToken: value.trim() })}
      onConsume={(lots, reason) => void runAction(() => reason ? productionOrdersApi.createDeviationRequest(detail.id, step.id, { lots: lots.map((lot) => ({ rawMaterialLotId: lot.lotId, actualQuantity: Number(lot.actualQuantity.replace(',', '.')) })), reason }, crypto.randomUUID()) : productionOrdersApi.consumeMaterial(detail.id, step.id, { lots: lots.map((lot) => ({ rawMaterialLotId: lot.lotId, actualQuantity: Number(lot.actualQuantity.replace(',', '.')) })) }, crypto.randomUUID()))}
    /> : null}
    {!step && detail.status === ProductionOrderStatus.InProgress && detail.progress.totalSteps > 0 && detail.progress.completedSteps === detail.progress.totalSteps ? <ProductionCompletionCard detail={detail} isSubmitting={isSubmitting} error={actionError} onComplete={completeProduction} onLoadLabel={productionOrdersApi.getFinishedGoodsLabel} onViewFg={(fgLotId) => navigate(`/production/finished-goods-lots/${fgLotId}`)} onPrint={(fgLotId) => void printFinishedGoodsLabel(fgLotId)} onBack={() => navigate('/operator/production')} /> : null}
  </div>
}

function CurrentStepCard(props: {
  detail: OperatorProductionDetail
  confirmed: boolean
  isSubmitting: boolean
  actionError: string | null
  notes: string
  remaining: number
  onConfirmedChange: (value: boolean) => void
  onNotesChange: (value: string) => void
  onStart: () => void
  onStartTimer: () => void
  onComplete: () => void
  onValidateLot: (value: string) => ReturnType<typeof productionOrdersApi.validateMaterialLot>
  onConsume: (lots: import('@/features/operator-production/types').ValidatedMaterialLot[], reason: string | null) => void
}) {
  const step = props.detail.currentStep!
  const waitingApproval = step.status === ProductionStepExecutionStatus.WaitingApproval
  const inProgress = step.status === ProductionStepExecutionStatus.InProgress
  const isTimer = step.stepType === RecipeStepType.Timer
  const isCheck = step.stepType === RecipeStepType.Check
  const isMaterial = step.stepType === RecipeStepType.Material
  const canCompleteTimer = !isTimer || props.remaining === 0
  const uom = step.unitOfMeasureSymbol ?? props.detail.unitOfMeasureSymbol ?? props.detail.unitOfMeasureCode

  return <Card className="overflow-hidden border-ink/10"><CardContent className="p-6 sm:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500"><Factory size={15} /> Current step</div><h2 className="mt-3 font-display text-3xl font-semibold text-ink">{isMaterial ? step.rawMaterialName ?? step.stepName : step.stepName}</h2></div><Badge variant={waitingApproval ? 'signal' : 'default'}>{waitingApproval ? 'Waiting approval' : `Step ${step.sequence}`}</Badge></div>
    {step.instruction ? <p className="mt-6 rounded-2xl bg-sand/45 p-5 text-base leading-7 text-slate-700">{step.instruction}</p> : null}
    {isMaterial ? <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-ink/8 p-4"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Target material</span><p className="mt-2 font-display text-2xl font-semibold text-ink">{step.targetQuantity ?? '-'} {uom}</p></div>{toleranceLabel(step.toleranceType, step.toleranceValue, uom) ? <div className="rounded-2xl border border-ink/8 p-4"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tolerance</span><p className="mt-2 font-semibold text-ink">{toleranceLabel(step.toleranceType, step.toleranceValue, uom)}</p></div> : null}</div> : null}
    {isTimer ? <div className="mt-6 rounded-2xl bg-ink p-6 text-paper"><div className="flex items-center gap-2 text-sm text-paper/65"><Clock3 size={18} /> Timer produksi</div><p className="mt-3 font-display text-5xl font-semibold tracking-tight">{inProgress ? formatDuration(props.remaining) : formatDuration(step.timerSeconds ?? 0)}</p><p className="mt-3 text-sm text-paper/60">{inProgress ? props.remaining === 0 ? 'Timer selesai. Anda dapat menyelesaikan langkah ini.' : 'Countdown mengikuti waktu akhir dari server.' : 'Mulai timer untuk merekam waktu di server.'}</p></div> : null}
    {isCheck && inProgress && !waitingApproval ? <div className="mt-6 space-y-4 rounded-2xl border border-ink/8 p-5"><label className="flex min-h-12 cursor-pointer items-center gap-3 text-sm font-semibold text-ink"><input type="checkbox" className="h-5 w-5 accent-ink" checked={props.confirmed} onChange={(event) => props.onConfirmedChange(event.target.checked)} /> Saya telah melakukan pemeriksaan ini.</label><Textarea maxLength={1000} value={props.notes} onChange={(event) => props.onNotesChange(event.target.value)} placeholder="Catatan operator (opsional)" /><p className="text-right text-xs text-slate-400">{props.notes.length}/1000</p></div> : null}
    {waitingApproval ? <DeviationWaitingPanel deviation={props.detail.currentDeviation} uom={uom} /> : null}
    {isMaterial && inProgress && !waitingApproval && props.detail.currentDeviation?.status === 3 ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-900"><p className="font-semibold">Deviation ditolak, koreksi material diperlukan</p><p className="mt-1">{props.detail.currentDeviation.reviewNotes ?? 'Perbaiki Actual Quantity atau LOT, kemudian ajukan kembali.'}</p><p className="mt-1 text-red-700">Reviewer: {props.detail.currentDeviation.reviewedBy ?? '-'}</p></div> : null}
    {isMaterial && inProgress && !waitingApproval ? <MaterialConsumptionPanel step={step} uom={uom} disabled={props.isSubmitting} onValidateLot={props.onValidateLot} onSubmit={props.onConsume} /> : null}
    {props.actionError ? <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{props.actionError}</p> : null}
    {!waitingApproval && !(isMaterial && inProgress) ? <div className="sticky bottom-3 z-10 mt-7 border-t border-ink/8 bg-white/95 pt-5 backdrop-blur sm:static sm:bg-transparent"><StepAction stepStatus={step.status} isTimer={isTimer} isCheck={isCheck} canCompleteTimer={canCompleteTimer} confirmed={props.confirmed} isSubmitting={props.isSubmitting} onStart={props.onStart} onStartTimer={props.onStartTimer} onComplete={props.onComplete} /></div> : null}
  </CardContent></Card>
}

function DeviationWaitingPanel({ deviation, uom }: { deviation: OperatorProductionDetail['currentDeviation']; uom: string }) {
  if (!deviation) return <div className="mt-6 flex gap-3 rounded-2xl border border-signal/25 bg-signal/10 p-5 text-sm leading-6 text-ink"><AlertTriangle className="mt-0.5 shrink-0 text-signal" size={20} /> Konsumsi material menunggu persetujuan supervisor. Stok dan langkah berikutnya tetap terkunci.</div>
  return <div className="mt-6 rounded-2xl border border-signal/25 bg-signal/10 p-5 text-sm leading-6 text-ink"><div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-signal" size={20} /><div><p className="font-semibold">Menunggu persetujuan supervisor</p><p>Stok dan langkah berikutnya tetap terkunci. Status diperbarui otomatis setiap 10 detik.</p></div></div><div className="mt-4 grid gap-2 rounded-xl bg-white/60 p-3 sm:grid-cols-2"><span>Target: <b>{deviation.targetQuantity} {uom}</b></span><span>Actual: <b>{deviation.actualQuantity} {uom}</b></span><span>Variance: <b>{deviation.varianceQuantity} {uom}</b></span><span>Range: <b>{deviation.lowerLimit ?? '-'} - {deviation.upperLimit ?? '-'} {uom}</b></span></div><p className="mt-3"><b>Alasan:</b> {deviation.reason}</p><p className="mt-1 text-slate-600">Diajukan oleh {deviation.requestedBy} pada {new Date(deviation.requestedAtUtc).toLocaleString('id-ID')}.</p></div>
}

function StepAction(props: { stepStatus: ProductionStepExecutionStatus; isTimer: boolean; isCheck: boolean; canCompleteTimer: boolean; confirmed: boolean; isSubmitting: boolean; onStart: () => void; onStartTimer: () => void; onComplete: () => void }) {
  if (props.stepStatus === ProductionStepExecutionStatus.Ready) return <Button size="lg" className="h-12 w-full sm:w-auto" disabled={props.isSubmitting} onClick={props.isTimer ? props.onStartTimer : props.onStart}>{props.isSubmitting ? <LoaderCircle className="animate-spin" size={18} /> : props.isTimer ? <TimerReset size={18} /> : <Play size={18} fill="currentColor" />}{props.isTimer ? 'Start Timer' : 'Start Step'}</Button>
  if (props.stepStatus !== ProductionStepExecutionStatus.InProgress) return null
  return <Button size="lg" className="h-12 w-full sm:w-auto" disabled={props.isSubmitting || !props.canCompleteTimer || (props.isCheck && !props.confirmed)} onClick={props.onComplete}>{props.isSubmitting ? <LoaderCircle className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} Complete Step</Button>
}
