import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowRight, Factory, Layers3, LoaderCircle, Plus } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { recipesApi } from '@/api/recipes.api'
import { unitOfMeasuresApi } from '@/api/unitOfMeasures.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MasterDataFormFieldError } from '@/features/master-data/components/MasterDataFormFieldError'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import { getFieldError, hasFormErrors } from '@/features/master-data/utils'
import { RecipeStatusBadge } from '@/features/recipes/components/RecipeStatusBadge'
import {
  RecipeLifecycleStatus,
  type RecipeDetail,
  type RecipeVersionCreateFormValues,
  type RecipeVersionQueryState,
} from '@/features/recipes/types'
import { RECIPE_STATUS_FILTER_OPTIONS, formatQuantity, formatRecipeDate } from '@/features/recipes/utils'
import {
  emptyRecipeVersionCreateFormValues,
  validateRecipeVersionCreateForm,
} from '@/features/recipes/validation'
import { useAuth } from '@/hooks/useAuth'
import type { ApiError } from '@/types/api'
import type { UnitOfMeasureOption } from '@/features/unit-of-measures/types'

const DEFAULT_QUERY: RecipeVersionQueryState = {
  status: 'ALL',
  page: 1,
  pageSize: 10,
}

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { can } = useAuth()
  const canCreate = can('recipes.create')
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null)
  const [versions, setVersions] = useState<RecipeDetail['versions']>([])
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  })
  const [query, setQuery] = useState<RecipeVersionQueryState>(DEFAULT_QUERY)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createValues, setCreateValues] = useState<RecipeVersionCreateFormValues>(emptyRecipeVersionCreateFormValues)
  const [createErrors, setCreateErrors] = useState<Record<string, string[]>>({})
  const [createError, setCreateError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [uomOptions, setUomOptions] = useState<UnitOfMeasureOption[]>([])

  useEffect(() => {
    if (!id) return
    const recipeId = id

    async function loadRecipe() {
      setError(null)
      setIsLoading(recipe === null)
      setIsRefreshing(recipe !== null)

      try {
        const [recipeResult, versionsResult] = await Promise.all([
          recipesApi.getById(recipeId),
          recipesApi.getVersions(recipeId, query),
        ])

        setRecipe(recipeResult)
        setVersions(versionsResult.items)
        setPagination(versionsResult.pagination)
      } catch (caughtError) {
        const apiError = caughtError as ApiError
        setError(apiError.message)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }

    void loadRecipe()
  }, [id, query])

  useEffect(() => {
    void unitOfMeasuresApi.listActiveOptions().then(setUomOptions).catch(() => setUomOptions([]))
  }, [])

  useEffect(() => {
    if (!recipe) return

    const baseVersion = recipe.currentVersion
    setCreateValues({
      standardOutputQuantity: baseVersion?.standardOutputQuantity.toString() ?? '',
      unitOfMeasureId: baseVersion?.unitOfMeasure.id ?? recipe.product.unitOfMeasureId,
    })
  }, [recipe])

  const approvedCount = useMemo(
    () => versions.filter((item) => item.status === RecipeLifecycleStatus.Approved).length,
    [versions],
  )

  async function handleCreateVersion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!id) return

    const errors = validateRecipeVersionCreateForm(createValues)
    setCreateErrors(errors)
    setCreateError(null)

    if (hasFormErrors(errors)) {
      return
    }

    setIsCreating(true)

    try {
      const version = await recipesApi.createVersion(id, createValues)
      setQuery((current) => ({ ...current, page: 1 }))
      setCreateValues({
        standardOutputQuantity: version.standardOutputQuantity.toString(),
        unitOfMeasureId: version.unitOfMeasure.id,
      })
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setCreateError(apiError.message)
      setCreateErrors(apiError.errors ?? {})
    } finally {
      setIsCreating(false)
    }
  }

  if (!id) {
    return <MasterDataErrorState description="Recipe id tidak ditemukan di route." onRetry={() => window.location.reload()} />
  }

  if (isLoading) {
    return <MasterDataLoadingState description="Detail recipe sedang dimuat dari backend." />
  }

  if (error || !recipe) {
    return <MasterDataErrorState description={error ?? 'Recipe tidak ditemukan.'} onRetry={() => setQuery((current) => ({ ...current }))} />
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <Factory size={14} className="text-signal" />
              Recipe Detail
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              {recipe.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-paper/68 sm:text-base">
              Product {recipe.product.code} - {recipe.product.name}. Buka setiap version secara read-only
              atau buat version baru tanpa menyentuh approved version yang sudah terkunci.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Current version</div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper">
                  {recipe.currentVersion ? `V${recipe.currentVersion.versionNumber}` : '-'}
                </div>
                <div className="mt-2">
                  <RecipeStatusBadge status={recipe.currentVersion?.status ?? recipe.status} />
                </div>
              </CardContent>
            </Card>
            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Approved in page</div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper">{approvedCount}</div>
                <p className="mt-1 text-sm text-paper/60">Historical version tetap dapat dibuka read-only.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Recipe Summary</CardTitle>
            <CardDescription>Informasi product dan version aktif yang digunakan sebagai konteks utama.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Product</div>
              <div className="mt-2 font-semibold text-ink">{recipe.product.name}</div>
              <div className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-slate-500">{recipe.product.code}</div>
            </div>
            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Updated</div>
              <div className="mt-2 font-semibold text-ink">{formatRecipeDate(recipe.updatedAtUtc ?? recipe.createdAtUtc)}</div>
              <div className="mt-1 text-xs text-slate-500">Created by {recipe.createdBy ?? '-'}</div>
            </div>
            {recipe.currentVersion ? (
              <div className="rounded-[24px] border border-slate-200 bg-white p-4 sm:col-span-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Active version</div>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        <Layers3 size={16} className="text-slate-400" />
                        V{recipe.currentVersion.versionNumber}
                      </div>
                      <RecipeStatusBadge status={recipe.currentVersion.status} />
                    </div>
                  </div>

                  <Button asChild variant="secondary">
                    <Link to={`/production/recipes/${recipe.id}/versions/${recipe.currentVersion.id}`}>
                      Open Current Version
                      <ArrowRight size={16} />
                    </Link>
                  </Button>
                </div>
                <div className="mt-4 text-sm text-slate-600">
                  Standard output:{' '}
                  {formatQuantity(
                    recipe.currentVersion.standardOutputQuantity,
                    recipe.currentVersion.unitOfMeasure.symbol ?? recipe.currentVersion.unitOfMeasure.code,
                  )}
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {canCreate ? (
          <Card>
            <CardHeader>
              <CardTitle>Create Version</CardTitle>
              <CardDescription>Buat version baru untuk perubahan recipe tanpa mengedit approved version.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreateVersion}>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">Standard Output Quantity</label>
                  <Input
                    value={createValues.standardOutputQuantity}
                    onChange={(event) =>
                      setCreateValues((current) => ({ ...current, standardOutputQuantity: event.target.value }))
                    }
                    inputMode="decimal"
                    placeholder="100"
                  />
                  <MasterDataFormFieldError message={getFieldError(createErrors, 'standardOutputQuantity')} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-ink">Output UOM</label>
                  <select
                    value={createValues.unitOfMeasureId}
                    onChange={(event) => setCreateValues((current) => ({ ...current, unitOfMeasureId: event.target.value }))}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
                  >
                    <option value="">Pilih UOM</option>
                    {uomOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.symbol ? `${option.name} (${option.symbol})` : `${option.name} (${option.code})`}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Default mengikuti current version atau product UOM backend.
                  </p>
                  <MasterDataFormFieldError message={getFieldError(createErrors, 'unitOfMeasureId')} />
                </div>
                {createError ? (
                  <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {createError}
                  </div>
                ) : null}
                <Button type="submit" disabled={isCreating} className="w-full">
                  {isCreating ? <LoaderCircle size={16} className="animate-spin" /> : <Plus size={16} />}
                  Create New Version
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : null}
      </div>

      <Card>
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Version List</CardTitle>
            <CardDescription>Status version terlihat jelas dan tetap bisa dipagination dari backend.</CardDescription>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={query.status}
              onChange={(event) =>
                setQuery((current) => ({ ...current, status: event.target.value as RecipeVersionQueryState['status'], page: 1 }))
              }
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
            >
              {RECIPE_STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={query.pageSize}
              onChange={(event) =>
                setQuery((current) => ({ ...current, pageSize: Number(event.target.value), page: 1 }))
              }
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
            >
              <option value={10}>10 / halaman</option>
              <option value={20}>20 / halaman</option>
              <option value={50}>50 / halaman</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {isRefreshing ? (
            <div className="px-7 pb-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1">
                <LoaderCircle size={14} className="animate-spin" />
                Menyegarkan version...
              </span>
            </div>
          ) : null}

          {versions.length === 0 ? (
            <div className="px-7 pb-7">
              <MasterDataEmptyState description="Belum ada version yang cocok dengan filter saat ini." />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full border-separate border-spacing-0">
                  <thead>
                    <tr className="border-y border-slate-200/80 bg-slate-50/80 text-left">
                      {['Version', 'Output', 'Status', 'Steps', 'Updated', 'Action'].map((label) => (
                        <th key={label} className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {versions.map((version) => (
                      <tr key={version.id} className="border-b border-slate-200/70 bg-white">
                        <td className="px-6 py-4 font-semibold text-ink">V{version.versionNumber}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatQuantity(version.standardOutputQuantity, version.unitOfMeasure.symbol ?? version.unitOfMeasure.code)}
                        </td>
                        <td className="px-6 py-4">
                          <RecipeStatusBadge status={version.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{version.stepsCount}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{formatRecipeDate(version.updatedAtUtc ?? version.createdAtUtc)}</td>
                        <td className="px-6 py-4">
                          <Button asChild variant="secondary" size="sm">
                            <Link to={`/production/recipes/${recipe.id}/versions/${version.id}`}>Open Version</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <MasterDataPagination
                pagination={pagination}
                onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
