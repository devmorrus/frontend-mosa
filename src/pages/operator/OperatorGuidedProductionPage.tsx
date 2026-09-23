import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CheckCircle2, Clock3, Factory, LoaderCircle, Play, TimerReset, Volume2, VolumeX } from 'lucide-react'
import { productionOrdersApi } from '@/api/productionOrders.api'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ModuleHero } from '@/components/common/ModuleHero'
import { Badge } from '@/components/ui/badge'
import { breadcrumbs, entityLinks } from '@/routes/canonicalRoutes'
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
import { parseRawMaterialLotQrToken } from '@/features/raw-material-lots/utils'
import { buildStepVoiceInstruction, getVoiceGuidanceSessionKey, isVoiceGuidanceSupported, speakStepInstruction, stopVoiceGuidance, VOICE_GUIDANCE_ENABLED_KEY } from '@/features/operator-production/voiceGuidance'
import { formatAllowedRange } from '@/features/operator-production/deviation/validation'
import { ProductionCompletionCard } from '@/features/operator-production/completion/ProductionCompletionCard'
import { buildQrSvgDataUri } from '@/features/raw-material-lots/utils'
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
  const [errorTraceId, setErrorTraceId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notes, setNotes] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [voiceEnabled, setVoiceEnabled] = useState(() => localStorage.getItem(VOICE_GUIDANCE_ENABLED_KEY) !== 'false')
  const completingRef = useRef(false)
  const lastSpokenStepRef = useRef<string | null>(null)

  async function loadDetail(background = false) {
    if (!id) return
    if (!background) setIsLoading(true)
    setError(null)
    setErrorTraceId(null)
    try {
      const next = await productionOrdersApi.getMyQueueDetail(id)
      setDetail(next)
      setConfirmed(next.currentStep?.isConfirmed ?? false)
      setNotes('')
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setError(apiError.message)
      setErrorTraceId(apiError.traceId ?? null)
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
      setErrorTraceId(null)
      try {
        const next = await productionOrdersApi.getMyQueueDetail(productionOrderId)
        setDetail(next)
        setConfirmed(next.currentStep?.isConfirmed ?? false)
      } catch (caughtError) {
        const apiError = caughtError as ApiError
        setError(apiError.message)
        setErrorTraceId(apiError.traceId ?? null)
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

  useEffect(() => {
    return () => stopVoiceGuidance()
  }, [])

  useEffect(() => {
    if (!id || !detail?.currentStep || !voiceEnabled || !isVoiceGuidanceSupported()) return

    const step = detail.currentStep
    const sessionKey = getVoiceGuidanceSessionKey(id)
    const shouldSpeakFromNavigation = sessionStorage.getItem(sessionKey) === '1'
    const isNewStep = lastSpokenStepRef.current !== null && lastSpokenStepRef.current !== step.id

    if (!shouldSpeakFromNavigation && !isNewStep) {
      lastSpokenStepRef.current = step.id
      return
    }

    const text = buildStepVoiceInstruction(step)
    if (!text) return

    speakStepInstruction(text)
    lastSpokenStepRef.current = step.id
    sessionStorage.removeItem(sessionKey)
  }, [id, detail?.currentStep?.id, voiceEnabled])

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

  async function completeProduction(actualOutput: number, productionNotes?: string) {
    if (!detail) throw new Error('Production order tidak ditemukan.')
    if (completingRef.current) throw new Error('Complete production sedang diproses.')
    completingRef.current = true
    setIsSubmitting(true)
    setActionError(null)
    try {
      return await productionOrdersApi.completeProduction(detail.id, { actualOutput, productionNotes })
    } catch (caughtError) {
      const message = (caughtError as ApiError).message
      setActionError(message)
      throw caughtError
    } finally {
      completingRef.current = false
      setIsSubmitting(false)
    }
  }

  async function printFinishedGoodsLabel(fgLotId: string) {
    try {
      const label = await productionOrdersApi.getFinishedGoodsLabel(fgLotId)
      const printWindow = window.open('', '_blank', 'noopener,noreferrer')
      if (!printWindow) throw new Error('Popup print diblokir browser.')
      const productionDate = new Date(label.productionDate).toLocaleDateString('id-ID')
      const expiry = label.expiryDate ? new Date(label.expiryDate).toLocaleDateString('id-ID') : '-'
      printWindow.document.write(`<html><head><title>${label.finishedGoodsLotNumber}</title></head><body style="font-family:Arial;padding:24px"><h1>${label.productName}</h1><p><b>FG LOT:</b> ${label.finishedGoodsLotNumber}</p><p><b>PO:</b> ${label.productionOrderNumber} · <b>Warehouse:</b> ${label.warehouseCode}</p><p>Actual: ${label.actualOutput} ${label.unitOfMeasureSymbol}</p><p>Production Date: ${productionDate} · Expiry: ${expiry}</p><p>QC: ${label.qcStatus}</p><img width="220" src="${buildQrSvgDataUri(atob(label.qrImageBase64))}" /></body></html>`)
      printWindow.document.close(); printWindow.focus(); printWindow.print()
    } catch (caughtError) { setActionError((caughtError as ApiError).message) }
  }

  function toggleVoiceGuidance() {
    const next = !voiceEnabled
    setVoiceEnabled(next)
    localStorage.setItem(VOICE_GUIDANCE_ENABLED_KEY, String(next))
    if (!next) stopVoiceGuidance()
  }

  function replayStepInstruction() {
    const text = buildStepVoiceInstruction(detail?.currentStep)
    if (text) speakStepInstruction(text)
  }

  if (isLoading) return <MasterDataLoadingState description="Memuat langkah produksi saat ini." />
  if (error || !detail) return <MasterDataErrorState description={error ?? 'Production order tidak ditemukan.'} traceId={errorTraceId} onRetry={() => void loadDetail()} />

  const step = detail.currentStep
  const progress = detail.progress.totalSteps === 0 ? 0 : Math.round((detail.progress.completedSteps / detail.progress.totalSteps) * 100)
  const remaining = step?.timerEndsAtUtc
    ? getRemainingSeconds(step.timerEndsAtUtc, now)
    : step?.timerSeconds ?? 0
  const voiceSupported = isVoiceGuidanceSupported()

  return <div className="mx-auto max-w-4xl space-y-6 pb-24">
    <Breadcrumb items={breadcrumbs.operatorProductionDetail(detail.productionOrderNumber)} />
    <Button asChild variant="secondary" className="text-slate-600">
      <Link to={entityLinks.operatorProductionList()}>
        <ArrowLeft size={16} />
        Kembali ke My Production
      </Link>
    </Button>
    <ModuleHero
      eyebrow={detail.productionOrderNumber}
      title={detail.productName}
      description={`Recipe v${detail.recipeVersionNumber} · ${detail.targetOutput} ${detail.unitOfMeasureSymbol ?? detail.unitOfMeasureCode} target output · Operator ${detail.operatorName}`}
      icon={<Factory size={13} className="text-signal" />}
      metrics={[
        { label: 'Progress', value: `${progress}%`, sub: `Step ${step?.sequence ?? detail.progress.totalSteps} of ${detail.progress.totalSteps}`, tone: progress >= 100 ? 'success' : 'default' },
        { label: 'Completed', value: `${detail.progress.completedSteps}/${detail.progress.totalSteps}`, sub: 'steps selesai', tone: 'muted' },
        { label: 'Recipe', value: `v${detail.recipeVersionNumber}`, sub: detail.recipeName, tone: 'muted' },
      ]}
      bottom={
        <div className="h-2 overflow-hidden rounded-full bg-paper/15">
          <div className="h-full rounded-full bg-signal transition-all" style={{ width: `${progress}%` }} />
        </div>
      }
    />

    {voiceSupported ? <div className="flex flex-col gap-3 rounded-[24px] border border-white/70 bg-white/85 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div>
        <div className="font-semibold text-ink">Voice Guidance</div>
        <p className="mt-1 text-xs text-slate-500">Instruksi langkah dibacakan otomatis saat operator membuka step baru.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm" onClick={toggleVoiceGuidance}>{voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}{voiceEnabled ? 'Suara aktif' : 'Suara mati'}</Button>
        <Button variant="secondary" size="sm" disabled={!voiceEnabled || !step} onClick={replayStepInstruction}><Volume2 size={16} /> Ulangi instruksi</Button>
      </div>
    </div> : null}

    {detail.status === ProductionOrderStatus.Released && !step ? <Card className="rounded-[24px] border-blue-100 shadow-sm"><CardContent className="p-7 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50"><CheckCircle2 className="text-blue-600" size={30} /></div><h2 className="mt-4 font-display text-2xl font-semibold text-ink">Siap memulai produksi</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Mulai production order untuk membuka langkah pertama dari backend. Progress dan timer mengikuti data server.</p><div className="mt-6"><Button size="lg" className="h-12 min-w-[200px]" disabled={isSubmitting} onClick={() => void runAction(() => productionOrdersApi.startProduction(detail.id))}><Play size={18} fill="currentColor" /> Start Production</Button></div></CardContent></Card> : null}

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
      onValidateLot={(value) => {
        const trimmed = value.trim()
        if (/^[0-9a-f-]{36}$/i.test(trimmed)) return productionOrdersApi.validateMaterialLot(detail.id, step.id, { rawMaterialLotId: trimmed })
        const parsed = parseRawMaterialLotQrToken(trimmed)
        return productionOrdersApi.validateMaterialLot(detail.id, step.id, { qrToken: parsed.token ?? trimmed })
      }}
      onConsume={(lots, reason) => void runAction(() => reason ? productionOrdersApi.createDeviationRequest(detail.id, step.id, { lots: lots.map((lot) => ({ rawMaterialLotId: lot.lotId, actualQuantity: Number(lot.actualQuantity.replace(',', '.')) })), reason }, crypto.randomUUID()) : productionOrdersApi.consumeMaterial(detail.id, step.id, { lots: lots.map((lot) => ({ rawMaterialLotId: lot.lotId, actualQuantity: Number(lot.actualQuantity.replace(',', '.')) })) }, crypto.randomUUID()))}
    /> : null}
    {!step && detail.status === ProductionOrderStatus.InProgress && detail.progress.totalSteps > 0 && detail.progress.completedSteps === detail.progress.totalSteps ? <div data-tour="guided-complete-info"><ProductionCompletionCard detail={detail} isSubmitting={isSubmitting} error={actionError} onComplete={completeProduction} onLoadLabel={productionOrdersApi.getFinishedGoodsLabel} onViewFg={(fgLotId) => navigate(entityLinks.finishedGoodsLotDetail(fgLotId))} onPrint={(fgLotId) => void printFinishedGoodsLabel(fgLotId)} onBack={() => navigate(entityLinks.operatorProductionList())} /></div> : null}
    {!step && (detail.status === ProductionOrderStatus.WaitingQc || detail.status === ProductionOrderStatus.Completed) ? <Card className="rounded-[24px] border-slate-200/80 shadow-sm"><CardContent className="space-y-4 p-7 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50"><CheckCircle2 className="text-emerald-600" size={30} /></div><h2 className="font-display text-2xl font-semibold text-ink">Production selesai</h2><p className="mx-auto max-w-md text-sm leading-6 text-slate-500">Finished Goods LOT sudah dibuat. {detail.status === ProductionOrderStatus.WaitingQc ? 'Sebagian LOT masih menunggu QC.' : 'Seluruh LOT sudah memiliki keputusan QC.'}</p><div className="flex flex-wrap justify-center gap-3"><Button onClick={() => navigate(entityLinks.qcQueue())}>Buka QC Queue</Button><Button variant="secondary" onClick={() => navigate(entityLinks.operatorProductionList())}>Back to Production</Button></div></CardContent></Card> : null}
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

  return <Card data-tour="guided-step-card" className="overflow-hidden rounded-[24px] border-slate-200/80 shadow-sm"><CardContent className="p-6 sm:p-8">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700"><Factory size={15} /> Current step</div><h2 className="mt-3 font-display text-3xl font-semibold text-ink">{isMaterial ? step.rawMaterialName ?? step.stepName : step.stepName}</h2><p className="mt-1 text-sm text-slate-500">{step.stepName} · Sequence {step.sequence} dari {props.detail.progress.totalSteps}</p></div><Badge variant={waitingApproval ? 'signal' : 'default'}>{waitingApproval ? 'Waiting approval' : `Step ${step.sequence}`}</Badge></div>
    {step.instruction ? <p className="mt-6 rounded-[20px] border border-slate-100 bg-slate-50 p-5 text-base leading-7 text-slate-700">{step.instruction}</p> : null}
    {isMaterial ? <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-[20px] border border-blue-100 bg-blue-50/60 p-5"><span className="text-xs font-semibold uppercase tracking-wide text-blue-700">Target material</span><p className="mt-2 font-display text-3xl font-semibold text-ink">{step.targetQuantity ?? '-'} {uom}</p></div>{toleranceLabel(step.toleranceType, step.toleranceValue, uom) ? <div className="rounded-[20px] border border-slate-200 bg-white p-5"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tolerance</span><p className="mt-2 font-semibold leading-6 text-ink">{toleranceLabel(step.toleranceType, step.toleranceValue, uom)}</p></div> : null}</div> : null}
    {isTimer ? <div data-tour="guided-timer" className="mt-6 rounded-[20px] bg-ink p-6 text-paper shadow-[0_18px_50px_rgba(6,59,140,0.22)]"><div className="flex items-center gap-2 text-sm text-paper/65"><Clock3 size={18} /> Timer produksi</div><p className="mt-3 font-display text-5xl font-semibold tabular-nums tracking-tight">{inProgress ? formatDuration(props.remaining) : formatDuration(step.timerSeconds ?? 0)}</p><p className="mt-3 text-sm leading-6 text-paper/60">{inProgress ? props.remaining === 0 ? 'Timer selesai. Anda dapat menyelesaikan langkah ini.' : 'Countdown mengikuti waktu akhir dari server.' : 'Mulai timer untuk merekam waktu di server.'}</p></div> : null}
    {isCheck && inProgress && !waitingApproval ? <div className="mt-6 space-y-4 rounded-[20px] border border-emerald-100 bg-emerald-50/50 p-5"><label className="flex min-h-12 cursor-pointer items-center gap-3 text-sm font-semibold text-ink"><input type="checkbox" className="h-5 w-5 accent-ink" checked={props.confirmed} onChange={(event) => props.onConfirmedChange(event.target.checked)} /> Saya telah melakukan pemeriksaan ini.</label><Textarea maxLength={1000} value={props.notes} onChange={(event) => props.onNotesChange(event.target.value)} placeholder="Catatan operator (opsional)" /><p className="text-right text-xs text-slate-400">{props.notes.length}/1000</p></div> : null}
    {waitingApproval ? <DeviationWaitingPanel deviation={props.detail.currentDeviation} uom={uom} /> : null}
    {isMaterial && inProgress && !waitingApproval && props.detail.currentDeviation?.status === 3 ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-900"><p className="font-semibold">Deviation ditolak, koreksi material diperlukan</p><p className="mt-1">{props.detail.currentDeviation.reviewNotes ?? 'Perbaiki Actual Quantity atau LOT, kemudian ajukan kembali.'}</p><p className="mt-1 text-red-700">Reviewer: {props.detail.currentDeviation.reviewedBy ?? '-'}</p></div> : null}
    {isMaterial && inProgress && !waitingApproval ? <div data-tour="guided-consume-form"><MaterialConsumptionPanel step={step} uom={uom} disabled={props.isSubmitting} onValidateLot={props.onValidateLot} onSubmit={props.onConsume} /></div> : null}
    {props.actionError ? <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{props.actionError}</p> : null}
    {!waitingApproval && !(isMaterial && inProgress) ? <div className="sticky bottom-3 z-10 mt-7 border-t border-ink/8 bg-white/95 pt-5 backdrop-blur sm:static sm:bg-transparent"><StepAction stepStatus={step.status} isTimer={isTimer} isCheck={isCheck} canCompleteTimer={canCompleteTimer} confirmed={props.confirmed} isSubmitting={props.isSubmitting} onStart={props.onStart} onStartTimer={props.onStartTimer} onComplete={props.onComplete} /></div> : null}
  </CardContent></Card>
}

function DeviationWaitingPanel({ deviation, uom }: { deviation: OperatorProductionDetail['currentDeviation']; uom: string }) {
  if (!deviation) return <div data-tour="guided-deviation-link" className="mt-6 flex gap-3 rounded-2xl border border-signal/25 bg-signal/10 p-5 text-sm leading-6 text-ink"><AlertTriangle className="mt-0.5 shrink-0 text-signal-deep" size={20} /> Konsumsi material menunggu persetujuan supervisor. Stok dan langkah berikutnya tetap terkunci.</div>
  return <div data-tour="guided-deviation-link" className="mt-6 rounded-2xl border border-signal/25 bg-signal/10 p-5 text-sm leading-6 text-ink"><div className="flex gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-signal-deep" size={20} /><div><p className="font-semibold">Menunggu persetujuan supervisor</p><p>Stok dan langkah berikutnya tetap terkunci. Status diperbarui otomatis setiap 10 detik.</p></div></div><div className="mt-4 grid gap-2 rounded-xl bg-white/60 p-3 sm:grid-cols-2"><span>Target: <b>{deviation.targetQuantity} {uom}</b></span><span>Actual: <b>{deviation.actualQuantity} {uom}</b></span><span>Variance: <b>{deviation.varianceQuantity} {uom}</b></span><span>Range: <b>{formatAllowedRange(deviation.lowerLimit, deviation.upperLimit, uom)}</b></span></div><p className="mt-3"><b>Alasan:</b> {deviation.reason}</p><p className="mt-1 text-slate-600">Diajukan oleh {deviation.requestedBy} pada {new Date(deviation.requestedAtUtc).toLocaleString('id-ID')}.</p></div>
}

function StepAction(props: { stepStatus: ProductionStepExecutionStatus; isTimer: boolean; isCheck: boolean; canCompleteTimer: boolean; confirmed: boolean; isSubmitting: boolean; onStart: () => void; onStartTimer: () => void; onComplete: () => void }) {
  if (props.stepStatus === ProductionStepExecutionStatus.Ready) return <Button size="lg" className="h-12 w-full sm:w-auto" disabled={props.isSubmitting} onClick={props.isTimer ? props.onStartTimer : props.onStart}>{props.isSubmitting ? <LoaderCircle className="animate-spin" size={18} /> : props.isTimer ? <TimerReset size={18} /> : <Play size={18} fill="currentColor" />}{props.isTimer ? 'Start Timer' : 'Start Step'}</Button>
  if (props.stepStatus !== ProductionStepExecutionStatus.InProgress) return null
  return <Button size="lg" className="h-12 w-full sm:w-auto" disabled={props.isSubmitting || !props.canCompleteTimer || (props.isCheck && !props.confirmed)} onClick={props.onComplete}>{props.isSubmitting ? <LoaderCircle className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} Complete Step</Button>
}
