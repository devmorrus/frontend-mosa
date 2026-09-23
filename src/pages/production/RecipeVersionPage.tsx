import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Calculator,
  Eye,
  FlaskConical,
  LoaderCircle,
  Save,
  Send,
  ShieldCheck,
  ShieldX,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { rawMaterialsApi } from '@/api/rawMaterials.api'
import { recipesApi } from '@/api/recipes.api'
import { unitOfMeasuresApi } from '@/api/unitOfMeasures.api'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ModuleHero } from '@/components/common/ModuleHero'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import { hasFormErrors } from '@/features/master-data/utils'
import { RecipeApprovalDecisionDialog } from '@/features/recipes/components/RecipeApprovalDecisionDialog'
import { RecipeStepEditor } from '@/features/recipes/components/RecipeStepEditor'
import {
  RecipeLifecycleStatus,
  RecipeStepType,
  type RecipeScalingPreview,
  type RecipeStepFormValues,
  type RecipeVersionCreateFormValues,
  type RecipeVersionDetail,
} from '@/features/recipes/types'
import {
  describeRecipeStep,
  formatQuantity,
  formatRecipeDate,
  formatToleranceLabel,
  countRecipeStepTypes,
  getRecipeStepTypeLabel,
  getRecipeStatusLabel,
  isReadOnlyRecipeVersion,
  isRecipeVersionEditable,
  moveRecipeStep,
} from '@/features/recipes/utils'
import {
  emptyRecipeStepFormValues,
  mapRecipeStepToFormValues,
  validateRecipeStep,
  validateRecipeVersionCreateForm,
} from '@/features/recipes/validation'
import type { RawMaterialListItem } from '@/features/raw-materials/types'
import type { ApiError } from '@/types/api'
import type { UnitOfMeasureOption } from '@/features/unit-of-measures/types'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/stores/uiStore'
import { fetchLookupIfAllowed } from '@/utils/lookupGuard'
import { breadcrumbs, entityLinks } from '@/routes/canonicalRoutes'

function buildUnitLabel(option: UnitOfMeasureOption) {
  return option.symbol ? `${option.name} (${option.symbol})` : `${option.name} (${option.code})`
}

function buildBuilderErrors(
  headerValues: RecipeVersionCreateFormValues,
  steps: RecipeStepFormValues[],
) {
  const errors = { ...validateRecipeVersionCreateForm(headerValues) }

  if (steps.length === 0) {
    errors.steps = ['Minimal harus ada satu step.']
  }

  steps.forEach((step, index) => {
    Object.assign(errors, validateRecipeStep(step, index))
  })

  return errors
}

function renderPersistedStepMeta(version: RecipeVersionDetail, stepId: string) {
  const step = version.steps.find((item) => item.id === stepId)
  if (!step) return '-'

  if (step.stepType === RecipeStepType.Material) {
    return [
      step.rawMaterial?.name ?? '-',
      step.targetQuantity !== null && step.unitOfMeasure
        ? formatQuantity(step.targetQuantity, step.unitOfMeasure.symbol ?? step.unitOfMeasure.code)
        : '-',
      formatToleranceLabel(step.toleranceType, step.toleranceValue),
    ].join(' • ')
  }

  if (step.stepType === RecipeStepType.Timer) {
    return `${step.timerSeconds ?? 0} seconds`
  }

  return step.instruction ?? '-'
}

export function RecipeVersionPage() {
  const { recipeId, versionId } = useParams<{ recipeId: string; versionId: string }>()
  const { can } = useAuth()
  const pushToast = useUiStore((state) => state.pushToast)
  const canUpdate = can('recipes.update')
  const canSubmit = can('recipes.submit')
  const canApprove = can('recipes.approve')
  const [version, setVersion] = useState<RecipeVersionDetail | null>(null)
  const [preview, setPreview] = useState<RecipeScalingPreview | null>(null)
  const [targetOutputQuantity, setTargetOutputQuantity] = useState('')
  const [headerValues, setHeaderValues] = useState<RecipeVersionCreateFormValues>({
    standardOutputQuantity: '',
    unitOfMeasureId: '',
  })
  const [stepValues, setStepValues] = useState<RecipeStepFormValues[]>([])
  const [builderErrors, setBuilderErrors] = useState<Record<string, string[]>>({})
  const [builderError, setBuilderError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmittingApproval, setIsSubmittingApproval] = useState(false)
  const [isDecisionSubmitting, setIsDecisionSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const [uomOptions, setUomOptions] = useState<UnitOfMeasureOption[]>([])
  const [rawMaterials, setRawMaterials] = useState<RawMaterialListItem[]>([])
  const [approveNotes, setApproveNotes] = useState('')
  const [rejectReason, setRejectReason] = useState('')
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false)
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [decisionError, setDecisionError] = useState<string | null>(null)
  // Re-entry guard: Save Builder fires ~1 + K + 1 sequential PUTs. A second
  // click before React re-renders the disabled button (or an impatient retry
  // while the first run is still in flight) interleaves two runs against the
  // same version and the loser fails with 409 concurrency_conflict.
  const persistInFlight = useRef(false)

  const isEditable = Boolean(version && canUpdate && isRecipeVersionEditable(version.status))
  const isReadOnly = Boolean(version && isReadOnlyRecipeVersion(version.status))
  const isPendingApproval = version?.status === RecipeLifecycleStatus.PendingApproval
  const stepSummary = useMemo(() => countRecipeStepTypes(stepValues), [stepValues])

  useEffect(() => {
    if (!versionId) return
    const currentVersionId = versionId

    async function loadVersion() {
      setIsLoading(true)
      setError(null)

      try {
        const [versionResult, unitItems, materialItems] = await Promise.all([
          recipesApi.getVersionById(currentVersionId),
          fetchLookupIfAllowed('uoms.view', () => unitOfMeasuresApi.listActiveOptions(), []),
          fetchLookupIfAllowed('materials.view', () => rawMaterialsApi.listActiveOptions(), []),
        ])

        setVersion(versionResult)
        setTargetOutputQuantity(versionResult.standardOutputQuantity.toString())
        setHeaderValues({
          standardOutputQuantity: versionResult.standardOutputQuantity.toString(),
          unitOfMeasureId: versionResult.unitOfMeasure.id,
        })
        setStepValues(versionResult.steps.map(mapRecipeStepToFormValues))
        setUomOptions(unitItems)
        setRawMaterials(materialItems)
        setPreview(null)
        setBuilderErrors({})
        setBuilderError(null)
      } catch (caughtError) {
        const apiError = caughtError as ApiError
        setError(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadVersion()
  }, [versionId])

  async function persistBuilder(options?: { submitAfterSave?: boolean }) {
    if (!version || !versionId) return null

    const errors = buildBuilderErrors(headerValues, stepValues)
    setBuilderErrors(errors)
    setBuilderError(null)

    if (hasFormErrors(errors)) {
      return null
    }

    if (persistInFlight.current) {
      return null
    }
    persistInFlight.current = true
    setIsSaving(true)

    try {
      const currentVersion = await recipesApi.saveBuilder(versionId, headerValues, stepValues)

      setVersion(currentVersion)
      setHeaderValues({
        standardOutputQuantity: currentVersion.standardOutputQuantity.toString(),
        unitOfMeasureId: currentVersion.unitOfMeasure.id,
      })
      setStepValues(currentVersion.steps.map(mapRecipeStepToFormValues))
      setBuilderErrors({})
      pushToast('success', 'Recipe builder berhasil disimpan.')

      if (options?.submitAfterSave) {
        setIsSubmittingApproval(true)
        const submittedVersion = await recipesApi.submitVersion(versionId)
        setVersion(submittedVersion)
        setHeaderValues({
          standardOutputQuantity: submittedVersion.standardOutputQuantity.toString(),
          unitOfMeasureId: submittedVersion.unitOfMeasure.id,
        })
        setStepValues(submittedVersion.steps.map(mapRecipeStepToFormValues))
        pushToast('success', 'Recipe version berhasil disubmit untuk approval.')
        return submittedVersion
      }

      return currentVersion
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setBuilderError(apiError.message)
      setBuilderErrors(apiError.errors ?? {})
      // A failed run may have partially committed (earlier PUTs succeed before
      // the failing one). Resync the base version so the next save computes
      // deletes/updates against fresh server state. User form edits are kept.
      try {
        if (versionId) {
          const fresh = await recipesApi.getVersionById(versionId)
          setVersion(fresh)
        }
      } catch {
        // Keep showing the original save error if resync also fails.
      }
      return null
    } finally {
      persistInFlight.current = false
      setIsSaving(false)
      setIsSubmittingApproval(false)
    }
  }

  async function handlePreviewScaling() {
    if (!versionId || !targetOutputQuantity.trim()) return

    setIsPreviewLoading(true)
    setPreviewError(null)

    try {
      const result = await recipesApi.previewScaling(versionId, Number(targetOutputQuantity))
      setPreview(result)
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setPreviewError(apiError.message)
    } finally {
      setIsPreviewLoading(false)
    }
  }

  async function handleApprove() {
    if (!versionId) return

    setDecisionError(null)
    setIsDecisionSubmitting(true)

    try {
      const updated = await recipesApi.approveVersion(versionId, approveNotes)
      setVersion(updated)
      setIsApproveDialogOpen(false)
      setApproveNotes('')
      pushToast('success', 'Recipe version berhasil di-approve.')
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setDecisionError(apiError.message)
    } finally {
      setIsDecisionSubmitting(false)
    }
  }

  async function handleReject() {
    if (!versionId) return

    setDecisionError(null)
    setIsDecisionSubmitting(true)

    try {
      const updated = await recipesApi.rejectVersion(versionId, rejectReason)
      setVersion(updated)
      setHeaderValues({
        standardOutputQuantity: updated.standardOutputQuantity.toString(),
        unitOfMeasureId: updated.unitOfMeasure.id,
      })
      setStepValues(updated.steps.map(mapRecipeStepToFormValues))
      setIsRejectDialogOpen(false)
      setRejectReason('')
      pushToast('success', 'Recipe version berhasil direject untuk revisi.')
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setDecisionError(apiError.message)
    } finally {
      setIsDecisionSubmitting(false)
    }
  }

  if (!recipeId || !versionId) {
    return <MasterDataErrorState description="Recipe version route tidak lengkap." onRetry={() => window.location.reload()} />
  }

  if (isLoading) {
    return <MasterDataLoadingState description="Detail recipe version sedang dimuat dari backend." />
  }

  if (error || !version) {
    return <MasterDataErrorState description={error ?? 'Recipe version tidak ditemukan.'} onRetry={() => window.location.reload()} />
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs.recipeVersionDetail(version.recipeName, version.versionNumber)} />
      <Button asChild variant="secondary" className="text-slate-600">
        <Link to={entityLinks.recipeDetail(recipeId)}>Back to Recipe</Link>
      </Button>
      <ModuleHero
        eyebrow="Production • Recipe Builder"
        title={`${version.recipeName} - V${version.versionNumber}`}
        description="Builder editable hanya untuk Draft atau Needs Revision. Pending Approval, Approved, dan Historical tetap ditampilkan sebagai review read-only yang aman."
        icon={<Eye size={13} className="text-signal" />}
        metrics={[
          { label: 'Status', value: getRecipeStatusLabel(version.status), sub: 'lifecycle saat ini' },
          { label: 'Steps', value: version.steps.length, sub: 'sequence tersimpan', tone: 'muted' },
          {
            label: 'Output',
            value: formatQuantity(version.standardOutputQuantity, version.unitOfMeasure.symbol ?? version.unitOfMeasure.code),
            sub: 'standard output',
            tone: 'muted',
          },
        ]}
        bottom={
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-paper/10 bg-paper/10 p-2">
            {[
              { status: RecipeLifecycleStatus.Draft, label: 'Draft' },
              { status: RecipeLifecycleStatus.PendingApproval, label: 'Pending Approval' },
              { status: RecipeLifecycleStatus.Approved, label: 'Approved' },
              { status: RecipeLifecycleStatus.Historical, label: 'Historical' },
            ].map((step) => (
              <span
                key={step.status}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${version.status === step.status ? 'bg-paper text-ink' : 'bg-paper/10 text-paper/65'}`}
              >
                {step.label}
              </span>
            ))}
            {version.status === RecipeLifecycleStatus.NeedsRevision ? (
              <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">Needs Revision</span>
            ) : null}
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Version Header</CardTitle>
            <CardDescription>Standard output version dan metadata approval recipe.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Standard Output Quantity</label>
              <Input
                value={headerValues.standardOutputQuantity}
                onChange={(event) =>
                  setHeaderValues((current) => ({ ...current, standardOutputQuantity: event.target.value }))
                }
                inputMode="decimal"
                disabled={!isEditable}
                placeholder="100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Output UOM</label>
              <select
                value={headerValues.unitOfMeasureId}
                onChange={(event) =>
                  setHeaderValues((current) => ({ ...current, unitOfMeasureId: event.target.value }))
                }
                disabled={!isEditable}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <option value="">Pilih UOM</option>
                {uomOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {buildUnitLabel(option)}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Submitted</div>
              <div className="mt-2 text-sm text-slate-600">
                {version.submittedAtUtc ? `${version.submittedBy ?? '-'} • ${formatRecipeDate(version.submittedAtUtc)}` : '-'}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Approved</div>
              <div className="mt-2 text-sm text-slate-600">
                {version.approvedAtUtc ? `${version.approvedBy ?? '-'} • ${formatRecipeDate(version.approvedAtUtc)}` : '-'}
              </div>
            </div>

            {version.approvalNotes ? (
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 sm:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Notes</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{version.approvalNotes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lifecycle Actions</CardTitle>
            <CardDescription>Action disesuaikan dengan permission user dan status version saat ini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isEditable ? (
              <>
                <Button onClick={() => void persistBuilder()} disabled={isSaving} className="w-full">
                  {isSaving ? <LoaderCircle size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Builder
                </Button>
                {canSubmit ? (
                  <Button
                    variant="secondary"
                    onClick={() => void persistBuilder({ submitAfterSave: true })}
                    disabled={isSaving || isSubmittingApproval}
                    className="w-full"
                  >
                    {isSubmittingApproval ? <LoaderCircle size={16} className="animate-spin" /> : <Send size={16} />}
                    Submit For Approval
                  </Button>
                ) : null}
              </>
            ) : null}

            {isPendingApproval && canApprove ? (
              <>
                <Button onClick={() => setIsApproveDialogOpen(true)} className="w-full">
                  <ShieldCheck size={16} />
                  Approve Version
                </Button>
                <Button variant="secondary" onClick={() => setIsRejectDialogOpen(true)} className="w-full">
                  <ShieldX size={16} />
                  Reject Version
                </Button>
              </>
            ) : null}

            {isReadOnly ? (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 text-sm leading-6 text-slate-600">
                Version ini read-only karena statusnya sudah dikunci oleh lifecycle approval.
              </div>
            ) : null}

            {!isEditable && !isPendingApproval ? (
              <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/70 p-4 text-sm leading-6 text-slate-500">
                Halaman ini tetap menampilkan struktur sequence secara lengkap untuk review historis.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {builderError ? (
        <Card className="border-red-100 bg-red-50">
          <CardContent className="py-4 text-sm text-red-700">{builderError}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Recipe Steps</CardTitle>
          <CardDescription>
            Sequence dikelola secara visual dengan move up dan move down agar operasional tetap jelas di production floor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-2xl bg-blue-50 p-4 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-blue-700">Material</div>
              <div className="mt-1 text-2xl font-semibold text-ink">{stepSummary.material}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Process</div>
              <div className="mt-1 text-2xl font-semibold text-ink">{stepSummary.process}</div>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-amber-700">Timer</div>
              <div className="mt-1 text-2xl font-semibold text-ink">{stepSummary.timer}</div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4 text-sm">
              <div className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Check</div>
              <div className="mt-1 text-2xl font-semibold text-ink">{stepSummary.check}</div>
            </div>
          </div>
          <RecipeStepEditor
            steps={stepValues}
            errors={builderErrors}
            rawMaterials={rawMaterials}
            unitOptions={uomOptions}
            onChange={setStepValues}
            onAdd={() => setStepValues((current) => [...current, emptyRecipeStepFormValues()])}
            onMoveUp={(index) => setStepValues((current) => moveRecipeStep(current, index, -1))}
            onMoveDown={(index) => setStepValues((current) => moveRecipeStep(current, index, 1))}
            readOnly={!isEditable}
            addLabel="Add Builder Step"
          />
        </CardContent>
      </Card>

      {!isEditable ? (
        <Card>
          <CardHeader>
            <CardTitle>Read-Only Summary</CardTitle>
            <CardDescription>Ringkasan step untuk review cepat saat version sudah tidak bisa diubah.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {version.steps.map((step) => (
              <div key={step.id} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Step {step.sequence}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-3">
                      <div className="font-semibold text-ink">{getRecipeStepTypeLabel(step.stepType)}</div>
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                        {renderPersistedStepMeta(version, step.id)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 text-sm leading-6 text-slate-600">{describeRecipeStep(step)}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Scaling Preview</CardTitle>
          <CardDescription>Gunakan target output berbeda untuk melihat kebutuhan material hasil scaling service.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Target Output Quantity</label>
              <Input
                value={targetOutputQuantity}
                onChange={(event) => setTargetOutputQuantity(event.target.value)}
                inputMode="decimal"
                placeholder="500"
              />
            </div>

            <Button onClick={handlePreviewScaling} disabled={isPreviewLoading || !targetOutputQuantity.trim()} className="mt-auto h-12">
              {isPreviewLoading ? <LoaderCircle size={16} className="animate-spin" /> : <Calculator size={16} />}
              Preview Scaling
            </Button>
          </div>

          {previewError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {previewError}
            </div>
          ) : null}

          {preview ? (
            <div className="space-y-3 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <FlaskConical size={16} className="text-blue-600" />
                Scaling factor {preview.scalingFactor}
              </div>
              <div className="space-y-2">
                {preview.materialRequirements.map((item) => (
                  <div key={item.stepId} className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-600">
                    <div className="font-semibold text-ink">
                      Step {item.sequence} • {item.rawMaterialName}
                    </div>
                    <div className="mt-1">
                      {formatQuantity(item.originalTargetQuantity, item.unitOfMeasure.symbol ?? item.unitOfMeasure.code)} to{' '}
                      {formatQuantity(item.scaledTargetQuantity, item.unitOfMeasure.symbol ?? item.unitOfMeasure.code)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/70 p-4 text-sm leading-6 text-slate-500">
              Preview ini membantu supervisor memastikan material step tetap masuk akal sebelum version dipakai untuk order baru.
            </div>
          )}
        </CardContent>
      </Card>

      <RecipeApprovalDecisionDialog
        open={isApproveDialogOpen}
        mode="approve"
        recipeLabel={`${version.recipeName} V${version.versionNumber}`}
        value={approveNotes}
        error={decisionError}
        submitting={isDecisionSubmitting}
        onValueChange={setApproveNotes}
        onOpenChange={(open) => {
          setIsApproveDialogOpen(open)
          if (!open) {
            setApproveNotes('')
            setDecisionError(null)
          }
        }}
        onSubmit={() => void handleApprove()}
      />

      <RecipeApprovalDecisionDialog
        open={isRejectDialogOpen}
        mode="reject"
        recipeLabel={`${version.recipeName} V${version.versionNumber}`}
        value={rejectReason}
        error={decisionError}
        submitting={isDecisionSubmitting}
        onValueChange={setRejectReason}
        onOpenChange={(open) => {
          setIsRejectDialogOpen(open)
          if (!open) {
            setRejectReason('')
            setDecisionError(null)
          }
        }}
        onSubmit={() => void handleReject()}
      />
    </div>
  )
}
