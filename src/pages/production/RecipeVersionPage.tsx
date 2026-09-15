import { useEffect, useMemo, useState } from 'react'
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import { hasFormErrors } from '@/features/master-data/utils'
import { RecipeApprovalDecisionDialog } from '@/features/recipes/components/RecipeApprovalDecisionDialog'
import { RecipeStatusBadge } from '@/features/recipes/components/RecipeStatusBadge'
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
  getRecipeStepTypeLabel,
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

  const isEditable = Boolean(version && canUpdate && isRecipeVersionEditable(version.status))
  const isReadOnly = Boolean(version && isReadOnlyRecipeVersion(version.status))
  const isPendingApproval = version?.status === RecipeLifecycleStatus.PendingApproval

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

  const currentStepIds = useMemo(
    () => new Set(version?.steps.map((step) => step.id) ?? []),
    [version],
  )

  async function persistBuilder(options?: { submitAfterSave?: boolean }) {
    if (!version || !versionId) return null

    const errors = buildBuilderErrors(headerValues, stepValues)
    setBuilderErrors(errors)
    setBuilderError(null)

    if (hasFormErrors(errors)) {
      return null
    }

    setIsSaving(true)

    try {
      let currentVersion = await recipesApi.updateVersion(versionId, headerValues)

      const originalSteps = version.steps
      const originalSequenceById = new Map(originalSteps.map((step) => [step.id, step.sequence]))
      const removedSteps = originalSteps.filter(
        (step) => !stepValues.some((formStep) => formStep.id === step.id),
      )

      for (const removedStep of removedSteps) {
        await recipesApi.deleteStep(versionId, removedStep.id)
      }

      if (removedSteps.length > 0) {
        currentVersion = await recipesApi.getVersionById(versionId)
      }

      for (const step of stepValues.filter((item) => currentStepIds.has(item.id))) {
        currentVersion = await recipesApi.updateStep(
          versionId,
          step.id,
          step,
          originalSequenceById.get(step.id) ?? 1,
        )
      }

      let workingVersion = await recipesApi.getVersionById(versionId)
      const newStepIds = new Map<string, string>()
      let nextSequence = workingVersion.steps.length + 1

      for (const step of stepValues.filter((item) => !currentStepIds.has(item.id))) {
        const updatedVersion = await recipesApi.addStep(versionId, step, nextSequence)
        const addedStep = updatedVersion.steps.find(
          (candidate) => !workingVersion.steps.some((existing) => existing.id === candidate.id),
        )

        if (addedStep) {
          newStepIds.set(step.id, addedStep.id)
        }

        workingVersion = updatedVersion
        nextSequence = workingVersion.steps.length + 1
      }

      currentVersion = await recipesApi.reorderSteps(
        versionId,
        stepValues.map((step, index) => ({
          stepId: currentStepIds.has(step.id) ? step.id : (newStepIds.get(step.id) ?? step.id),
          sequence: index + 1,
        })),
      )

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
      return null
    } finally {
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
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <Eye size={14} className="text-signal" />
              Recipe Builder
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              {version.recipeName} • V{version.versionNumber}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-paper/68 sm:text-base">
              Builder hanya editable untuk status draft atau needs revision. Pending approval,
              approved, dan historical tetap terlihat jelas sebagai read-only state.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <RecipeStatusBadge status={version.status} />
            <Button asChild variant="ghost">
              <Link to={`/production/recipes/${recipeId}`}>Back to Recipe</Link>
            </Button>
          </div>
        </div>
      </section>

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
        <CardContent>
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
                <FlaskConical size={16} className="text-signal" />
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
