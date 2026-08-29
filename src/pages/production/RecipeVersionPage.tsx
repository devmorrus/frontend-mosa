import { useEffect, useState } from 'react'
import { Calculator, Eye, FlaskConical, LoaderCircle } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { recipesApi } from '@/api/recipes.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import { RecipeStatusBadge } from '@/features/recipes/components/RecipeStatusBadge'
import {
  describeRecipeStep,
  formatQuantity,
  formatRecipeDate,
  getRecipeStepTypeLabel,
  isReadOnlyRecipeVersion,
} from '@/features/recipes/utils'
import {
  RecipeStepType,
  type RecipeScalingPreview,
  type RecipeStep,
  type RecipeVersionDetail,
} from '@/features/recipes/types'
import type { ApiError } from '@/types/api'

function renderStepMeta(step: RecipeStep) {
  if (step.stepType === RecipeStepType.Material) {
    const tolerance =
      step.toleranceValue !== null && step.toleranceType !== null
        ? `Tolerance ${step.toleranceValue}`
        : 'Tanpa tolerance'

    return `${tolerance}${step.unitOfMeasure ? ` • ${step.unitOfMeasure.symbol ?? step.unitOfMeasure.code}` : ''}`
  }

  if (step.stepType === RecipeStepType.Timer) {
    return `${step.timerSeconds ?? 0} seconds`
  }

  return 'Non-material step'
}

export function RecipeVersionPage() {
  const { recipeId, versionId } = useParams<{ recipeId: string; versionId: string }>()
  const [version, setVersion] = useState<RecipeVersionDetail | null>(null)
  const [preview, setPreview] = useState<RecipeScalingPreview | null>(null)
  const [targetOutputQuantity, setTargetOutputQuantity] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewError, setPreviewError] = useState<string | null>(null)

  useEffect(() => {
    if (!versionId) return
    const currentVersionId = versionId

    async function loadVersion() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await recipesApi.getVersionById(currentVersionId)
        setVersion(result)
        setTargetOutputQuantity(result.standardOutputQuantity.toString())
      } catch (caughtError) {
        const apiError = caughtError as ApiError
        setError(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadVersion()
  }, [versionId])

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

  if (!recipeId || !versionId) {
    return <MasterDataErrorState description="Recipe version route tidak lengkap." onRetry={() => window.location.reload()} />
  }

  if (isLoading) {
    return <MasterDataLoadingState description="Detail recipe version sedang dimuat dari backend." />
  }

  if (error || !version) {
    return <MasterDataErrorState description={error ?? 'Recipe version tidak ditemukan.'} onRetry={() => window.location.reload()} />
  }

  const isReadOnly = isReadOnlyRecipeVersion(version.status)

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <Eye size={14} className="text-signal" />
              Recipe Version Detail
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              {version.recipeName} • V{version.versionNumber}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-paper/68 sm:text-base">
              Version ini ditampilkan read-only di frontend. Status approved dan historical tidak
              menampilkan affordance edit agar selaras dengan business rule backend.
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.85fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Version Overview</CardTitle>
            <CardDescription>Header version, metadata approval, dan standard output.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Standard Output</div>
              <div className="mt-2 font-semibold text-ink">
                {formatQuantity(version.standardOutputQuantity, version.unitOfMeasure.symbol ?? version.unitOfMeasure.code)}
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Updated</div>
              <div className="mt-2 font-semibold text-ink">{formatRecipeDate(version.updatedAtUtc ?? version.createdAtUtc)}</div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Submitted</div>
              <div className="mt-2 text-sm text-slate-600">
                {version.submittedAtUtc ? `${version.submittedBy ?? '-'} • ${formatRecipeDate(version.submittedAtUtc)}` : '-'}
              </div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-white p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Approved</div>
              <div className="mt-2 text-sm text-slate-600">
                {version.approvedAtUtc ? `${version.approvedBy ?? '-'} • ${formatRecipeDate(version.approvedAtUtc)}` : '-'}
              </div>
            </div>
            {version.approvalNotes ? (
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 sm:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Approval Notes</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{version.approvalNotes}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scaling Preview</CardTitle>
            <CardDescription>Foundation service Day 6 sudah bisa dipreview langsung dari frontend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Target Output Quantity</label>
              <Input
                value={targetOutputQuantity}
                onChange={(event) => setTargetOutputQuantity(event.target.value)}
                inputMode="decimal"
                placeholder="500"
              />
            </div>
            <Button onClick={handlePreviewScaling} disabled={isPreviewLoading || !targetOutputQuantity.trim()} className="w-full">
              {isPreviewLoading ? <LoaderCircle size={16} className="animate-spin" /> : <Calculator size={16} />}
              Preview Scaling
            </Button>
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
                      <div className="font-semibold text-ink">{item.rawMaterialName}</div>
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
                Masukkan target output untuk melihat kebutuhan material hasil scaling service.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Steps</CardTitle>
          <CardDescription>
            {isReadOnly
              ? 'Version ini read-only sesuai status lifecycle.'
              : 'Version masih editable di backend, namun halaman ini fokus untuk review dan visibility.'}
          </CardDescription>
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
                      {renderStepMeta(step)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm leading-6 text-slate-600">{describeRecipeStep(step)}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
