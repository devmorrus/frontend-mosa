import { useEffect, useState } from 'react'
import { ArrowLeft, CheckCircle2, Clock3, LoaderCircle, Pause, Play, RotateCcw, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { recipesApi } from '@/api/recipes.api'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ModuleHero } from '@/components/common/ModuleHero'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { MaterialTutorialSimulation } from '@/features/recipes/tutorial/material-simulation/MaterialTutorialSimulation'
import { ProductionCompletionSimulation } from '@/features/recipes/tutorial/ProductionCompletionSimulation'
import { validateMaterialSimulation } from '@/features/recipes/tutorial/material-simulation/validation'
import { RecipeStepType, type GuidedRecipePreview, type GuidedRecipeTutorialStep } from '@/features/recipes/types'
import { useRecipeTutorialStore } from '@/features/recipes/tutorial/recipeTutorialStore'
import { useAuth } from '@/hooks/useAuth'
import { breadcrumbs, entityLinks } from '@/routes/canonicalRoutes'
import type { ApiError } from '@/types/api'

function duration(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

async function loadAllSteps(versionId: string, targetOutput?: number): Promise<GuidedRecipePreview> {
  const first = await recipesApi.getGuidedPreview(versionId, { targetOutput, page: 1, pageSize: 100 })
  const steps = [...first.steps]
  for (let page = 2; page <= first.pagination.totalPages; page++) {
    const result = await recipesApi.getGuidedPreview(versionId, { targetOutput, page, pageSize: 100 })
    steps.push(...result.steps)
  }
  return { ...first, steps: steps.sort((left, right) => left.sequence - right.sequence) }
}

function StepContent({ step, onComplete }: { step: GuidedRecipeTutorialStep; onComplete: () => void }) {
  const { user } = useAuth()
  const userId = user?.id ?? 'anonymous'
  const progress = useRecipeTutorialStore((state) => state.progress)
  const setTimer = useRecipeTutorialStore((state) => state.setTimer)
  const [checked, setChecked] = useState<string[]>([])
  const timer = progress?.timers[step.recipeStepId] ?? { remainingSeconds: step.timerDurationSeconds ?? 0, status: 'IDLE' as const }
  const isTimer = step.stepType === RecipeStepType.Timer
  const isCheck = step.stepType === RecipeStepType.Check
  const isMaterial = step.stepType === RecipeStepType.Material

  useEffect(() => {
    setChecked([])
  }, [step.recipeStepId])

  useEffect(() => {
    if (!isTimer || timer.status !== 'RUNNING') return
    const interval = window.setInterval(() => {
      const remaining = Math.max(0, timer.remainingSeconds - 1)
      setTimer(userId, step.recipeStepId, { remainingSeconds: remaining, status: remaining === 0 ? 'PAUSED' : 'RUNNING' })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [isTimer, setTimer, step.recipeStepId, timer.remainingSeconds, timer.status, userId])

  const timerReady = !isTimer || timer.remainingSeconds === 0
  const checkReady = !isCheck || (step.checkItems.length > 0 && checked.length === step.checkItems.length)
  const materialReady = !isMaterial || validateMaterialSimulation(progress?.materialSimulations[step.recipeStepId], step.targetQuantity, step.toleranceType, step.toleranceValue).isReady || progress?.deviationSimulations[step.recipeStepId]?.status === 'APPROVED'

  return <Card className="overflow-hidden">
    <CardHeader className="bg-sand/35">
      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{step.stepType === RecipeStepType.Material ? 'Material' : step.stepType === RecipeStepType.Process ? 'Proses' : step.stepType === RecipeStepType.Timer ? 'Timer' : 'Pemeriksaan'}</div>
      <CardTitle>{step.stepName}</CardTitle>
      {step.instruction ? <CardDescription>{step.instruction}</CardDescription> : null}
    </CardHeader>
    <CardContent className="space-y-5 pt-6">
      {isMaterial ? <MaterialTutorialSimulation step={step} userId={userId} /> : null}
      {isTimer ? <div className="rounded-3xl bg-ink p-6 text-paper"><div className="flex items-center gap-2 text-sm text-paper/70"><Clock3 size={17} />Tutorial timer</div><div className="mt-3 font-display text-6xl font-semibold tabular-nums">{duration(timer.remainingSeconds)}</div><div className="mt-5 flex flex-wrap gap-2"><Button type="button" variant="outline" onClick={() => setTimer(userId, step.recipeStepId, { remainingSeconds: timer.status === 'RUNNING' ? timer.remainingSeconds : (timer.remainingSeconds || step.timerDurationSeconds || 0), status: timer.status === 'RUNNING' ? 'PAUSED' : 'RUNNING' })}>{timer.status === 'RUNNING' ? <Pause size={16} /> : <Play size={16} />}{timer.status === 'RUNNING' ? 'Pause' : timer.remainingSeconds === 0 ? 'Mulai ulang' : 'Mulai / Lanjutkan'}</Button><Button type="button" variant="outline" onClick={() => setTimer(userId, step.recipeStepId, { remainingSeconds: step.timerDurationSeconds ?? 0, status: 'IDLE' })}><RotateCcw size={16} />Restart</Button><Button type="button" variant="outline" onClick={() => { setTimer(userId, step.recipeStepId, { remainingSeconds: 0, status: 'PAUSED' }); onComplete() }}>Lewati tutorial</Button></div></div> : null}
      {isCheck ? <div className="space-y-3 rounded-2xl border border-ink/10 p-4">{step.checkItems.map((item) => <label key={item.id} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl px-2 text-sm font-medium text-ink hover:bg-sand/35"><input type="checkbox" className="h-5 w-5 accent-ink" checked={checked.includes(item.id)} onChange={() => setChecked((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} />{item.label}</label>)}</div> : null}
      <Button type="button" size="lg" className="w-full sm:w-auto" disabled={!timerReady || !checkReady || !materialReady} onClick={onComplete}><CheckCircle2 size={18} />Selesai, Lanjut</Button>
    </CardContent>
  </Card>
}

export function RecipeTutorialPage() {
  const { recipeId, versionId } = useParams<{ recipeId: string; versionId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id ?? 'anonymous'
  const progress = useRecipeTutorialStore((state) => state.progress)
  const restore = useRecipeTutorialStore((state) => state.restore)
  const start = useRecipeTutorialStore((state) => state.start)
  const view = useRecipeTutorialStore((state) => state.view)
  const completeStep = useRecipeTutorialStore((state) => state.completeStep)
  const restart = useRecipeTutorialStore((state) => state.restart)
  const close = useRecipeTutorialStore((state) => state.close)
  const [preview, setPreview] = useState<GuidedRecipePreview | null>(null)
  const [targetValue, setTargetValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exitOpen, setExitOpen] = useState(false)

  useEffect(() => {
    if (!versionId) return
    let active = true
    void loadAllSteps(versionId).then((result) => { if (active) { setPreview(result); setTargetValue(String(result.standardOutputQuantity)); restore(userId, versionId, result.standardOutputQuantity) } }).catch((caught: ApiError) => active && setError(caught.message)).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [restore, userId, versionId])

  async function applyTarget() {
    if (!versionId) return
    const target = Number(targetValue)
    if (!Number.isFinite(target) || target <= 0) return setError('Target output harus lebih dari 0.')
    setLoading(true); setError(null)
    try { const result = await loadAllSteps(versionId, target); setPreview(result); restore(userId, versionId, target) } catch (caught) { setError((caught as ApiError).message) } finally { setLoading(false) }
  }

  if (loading) return <Card><CardContent className="flex items-center gap-3 py-12 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={18} />Memuat tutorial recipe...</CardContent></Card>
  if (error || !preview || !versionId) return <Card><CardContent className="py-8 text-red-700">{error ?? 'Tutorial tidak ditemukan.'}</CardContent></Card>
  const timerTotal = preview.steps.reduce((total, step) => total + (step.timerDurationSeconds ?? 0), 0)
  const isStarted = progress?.status === 'IN_PROGRESS'
  const isFinalizing = progress?.status === 'FINALIZING'
  const isCompleted = progress?.status === 'COMPLETED'
  const currentIndex = progress?.viewedStep ?? 0
  const step = preview.steps[currentIndex]
  const completed = progress?.completedStepIds.length ?? 0
  const percent = preview.totalSteps ? Math.round((completed / preview.totalSteps) * 100) : 0

  return <div className="mx-auto max-w-4xl space-y-6">
    <Breadcrumb items={breadcrumbs.recipeTutorial(preview.recipeName, preview.versionNumber)} />
    <ModuleHero eyebrow="Production • Guided Tutorial" title={preview.recipeName} description="Simulasi recipe satu langkah dalam satu waktu tanpa membuat stock movement, production order, Finished Goods LOT, atau QC nyata." icon={<Play size={13} className="text-signal" />} metrics={[{ label: 'Version', value: `V${preview.versionNumber}`, sub: 'approved recipe' }, { label: 'Steps', value: preview.totalSteps, sub: 'guided sequence', tone: 'muted' }, { label: 'Progress', value: `${percent}%`, sub: 'tutorial lokal', tone: isCompleted ? 'success' : 'muted' }]} actions={isStarted ? <Button type="button" variant="secondary" className="border-paper/10 bg-paper/10 text-paper hover:bg-paper/15" onClick={() => setExitOpen(true)}><X size={16} />Keluar</Button> : null} />
    {!isStarted && !isCompleted ? <Card><CardHeader><CardTitle>Mulai tutorial</CardTitle><CardDescription>Pelajari recipe satu langkah dalam satu waktu. Tidak ada stok atau production order yang diubah.</CardDescription></CardHeader><CardContent className="space-y-5"><div className="grid gap-3 sm:grid-cols-3"><div>Standard output<div className="mt-1 text-xl font-semibold">{preview.standardOutputQuantity} {preview.outputUnitOfMeasure.symbol ?? preview.outputUnitOfMeasure.code}</div></div><div>Total step<div className="mt-1 text-xl font-semibold">{preview.totalSteps}</div></div><div>Total timer<div className="mt-1 text-xl font-semibold">{Math.ceil(timerTotal / 60)} menit</div></div></div><div className="flex flex-col gap-3 sm:flex-row"><Input value={targetValue} inputMode="decimal" onChange={(event) => setTargetValue(event.target.value)} /><Button type="button" variant="secondary" onClick={() => void applyTarget()}>Gunakan target output</Button><Button type="button" onClick={() => start(userId, versionId, preview.previewTargetOutput)}>Mulai Tutorial</Button></div></CardContent></Card> : null}
    {isStarted && step ? <><Card><CardContent className="py-5"><div className="flex items-center justify-between text-sm font-semibold text-ink"><span>Step {currentIndex + 1} dari {preview.totalSteps}</span><span>{percent}% selesai</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full bg-signal transition-all" style={{ width: `${percent}%` }} /></div></CardContent></Card><StepContent step={step} onComplete={() => completeStep(userId, step.recipeStepId, preview.totalSteps)} /><div className="flex justify-between"><Button type="button" variant="secondary" disabled={currentIndex === 0} onClick={() => view(userId, currentIndex - 1)}><ArrowLeft size={16} />Kembali</Button><Button type="button" variant="secondary" disabled={currentIndex >= (progress?.currentUnlockedStep ?? 0)} onClick={() => view(userId, currentIndex + 1)}>Step berikutnya</Button></div></> : null}
    {isFinalizing ? <ProductionCompletionSimulation userId={userId} recipeVersionId={versionId} targetOutput={preview.previewTargetOutput} uom={preview.outputUnitOfMeasure.symbol ?? preview.outputUnitOfMeasure.code} /> : null}
    {isCompleted ? <Card><CardHeader><CardTitle>Tutorial selesai</CardTitle><CardDescription>{preview.recipeName} V{preview.versionNumber} telah dipelajari dalam mode tutorial.</CardDescription></CardHeader><CardContent className="space-y-5"><div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">{[RecipeStepType.Material, RecipeStepType.Process, RecipeStepType.Timer, RecipeStepType.Check].map((type) => <div key={type} className="rounded-2xl bg-sand/35 p-4"><div className="text-slate-500">{type === 1 ? 'Material' : type === 2 ? 'Process' : type === 3 ? 'Timer' : 'Check'}</div><div className="mt-1 text-2xl font-semibold">{preview.steps.filter((step) => step.stepType === type).length}</div></div>)}</div><div className="grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-ink/10 p-4 text-sm"><b>Target / Actual</b><p className="mt-2">{preview.previewTargetOutput} / {progress?.finalSimulation.actualOutput} {preview.outputUnitOfMeasure.symbol ?? preview.outputUnitOfMeasure.code}</p><p className="mt-1">Yield: {(() => { const raw = progress?.finalSimulation.actualOutput ?? ''; const parsed = /^\d+(?:[.,]\d{1,4})?$/.test(raw.trim()) ? Number(raw.trim().replace(',', '.')) : null; if (parsed === null || preview.previewTargetOutput <= 0) return '-'; return `${Number(((parsed / preview.previewTargetOutput) * 100).toFixed(2))}%` })()}</p></div><div className="rounded-2xl border border-ink/10 p-4 text-sm"><b>Finished Goods LOT</b><p className="mt-2">{progress?.finalSimulation.finishedGoodsLotNumber}</p><p className="mt-1">QC: {progress?.finalSimulation.qcResult} · Inventory: {progress?.finalSimulation.qcResult === 'PASS' ? 'AVAILABLE' : progress?.finalSimulation.qcResult === 'HOLD' ? 'BLOCKED' : 'NON-AVAILABLE'}</p></div></div><p className="rounded-2xl bg-sand/35 p-4 text-sm text-slate-600">Data di atas adalah contoh latihan untuk memahami alur recipe. Tidak ada production order, Finished Goods LOT, inventory, atau QC nyata yang dibuat.</p><div className="flex flex-wrap gap-3"><Button type="button" onClick={() => restart(userId)}><RotateCcw size={16} />Ulangi Tutorial</Button><Button asChild variant="secondary"><Link to={`/production/recipes/${recipeId}/versions/${versionId}`}>Kembali ke Recipe</Link></Button><Button variant="secondary" onClick={() => { close(); navigate(`/production/recipes/${recipeId}`) }}>Tutup</Button></div></CardContent></Card> : null}
    <Dialog open={exitOpen} onOpenChange={setExitOpen}><DialogContent><DialogHeader><DialogTitle>Tutorial belum selesai</DialogTitle><DialogDescription>Progres tersimpan di perangkat ini dan dapat dilanjutkan nanti.</DialogDescription></DialogHeader><DialogFooter><Button variant="secondary" onClick={() => setExitOpen(false)}>Lanjutkan Tutorial</Button><Button onClick={() => { close(); navigate(entityLinks.recipeDetail(recipeId ?? preview.recipeId)) }}>Keluar Tutorial</Button></DialogFooter></DialogContent></Dialog>
  </div>
}
