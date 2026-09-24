import { useDeferredValue, useEffect, useState } from 'react'
import { CheckCircle2, ClipboardCheck, Eye, LoaderCircle, ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { recipesApi } from '@/api/recipes.api'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ModuleHero } from '@/components/common/ModuleHero'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataTableSkeleton,
} from '@/features/master-data/components/MasterDataStates'
import { RecipeApprovalDecisionDialog } from '@/features/recipes/components/RecipeApprovalDecisionDialog'
import { RecipeStatusBadge } from '@/features/recipes/components/RecipeStatusBadge'
import type { RecipeApprovalQueueItem, RecipeApprovalQueueQueryState } from '@/features/recipes/types'
import { RECIPE_PAGE_SIZE_OPTIONS, formatQuantity, formatRecipeDate, hasActiveRecipeApprovalFilters } from '@/features/recipes/utils'
import type { ApiError } from '@/types/api'
import { useUiStore } from '@/stores/uiStore'
import { breadcrumbs, entityLinks } from '@/routes/canonicalRoutes'

const DEFAULT_QUERY: RecipeApprovalQueueQueryState = {
  search: '',
  page: 1,
  pageSize: 10,
}

export function RecipeApprovalQueuePage() {
  const pushToast = useUiStore((state) => state.pushToast)
  const [query, setQuery] = useState<RecipeApprovalQueueQueryState>(DEFAULT_QUERY)
  const [searchInput, setSearchInput] = useState('')
  const deferredSearch = useDeferredValue(searchInput)
  const [items, setItems] = useState<RecipeApprovalQueueItem[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDecisionSubmitting, setIsDecisionSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [decisionError, setDecisionError] = useState<string | null>(null)
  const [approveTarget, setApproveTarget] = useState<RecipeApprovalQueueItem | null>(null)
  const [rejectTarget, setRejectTarget] = useState<RecipeApprovalQueueItem | null>(null)
  const [approveNotes, setApproveNotes] = useState('')
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQuery((current) =>
        current.search === deferredSearch.trim()
          ? current
          : { ...current, search: deferredSearch.trim(), page: 1 },
      )
    }, 300)

    return () => window.clearTimeout(timeoutId)
  }, [deferredSearch])

  useEffect(() => {
    async function loadQueue() {
      setError(null)
      if (items.length > 0) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      try {
        const result = await recipesApi.getApprovalQueue(query)
        setItems(result.items)
        setPagination(result.pagination)
      } catch (caughtError) {
        const apiError = caughtError as ApiError
        setError(apiError.message)
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }

    void loadQueue()
  }, [query])

  async function handleApprove() {
    if (!approveTarget) return

    setDecisionError(null)
    setIsDecisionSubmitting(true)

    try {
      await recipesApi.approveVersion(approveTarget.recipeVersionId, approveNotes)
      pushToast('success', 'Recipe version berhasil di-approve.')
      setApproveTarget(null)
      setApproveNotes('')
      setQuery((current) => ({ ...current }))
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setDecisionError(apiError.message)
    } finally {
      setIsDecisionSubmitting(false)
    }
  }

  async function handleReject() {
    if (!rejectTarget) return

    setDecisionError(null)
    setIsDecisionSubmitting(true)

    try {
      await recipesApi.rejectVersion(rejectTarget.recipeVersionId, rejectReason)
      pushToast('success', 'Recipe version berhasil direject.')
      setRejectTarget(null)
      setRejectReason('')
      setQuery((current) => ({ ...current }))
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setDecisionError(apiError.message)
    } finally {
      setIsDecisionSubmitting(false)
    }
  }

  const hasActiveFilters = hasActiveRecipeApprovalFilters(query)

  function resetFilters() {
    setSearchInput('')
    setQuery(DEFAULT_QUERY)
  }

  if (isLoading) {
    return <MasterDataTableSkeleton rows={query.pageSize} label="Approval queue sedang dimuat" />
  }

  if (error) {
    return <MasterDataErrorState description={error} onRetry={() => setQuery((current) => ({ ...current }))} />
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs.recipeApprovalQueue()} />
      <ModuleHero
        eyebrow="Production • Approval"
        title="Review recipe version yang menunggu keputusan supervisor"
        description="Queue ini hanya menampilkan version pending approval sehingga supervisor bisa review, approve, atau reject tanpa mencari manual dari recipe list."
        icon={<ClipboardCheck size={13} className="text-signal" />}
        metrics={[
          { label: 'Pending', value: pagination.totalItems, sub: 'sesuai filter backend' },
          { label: 'Visible', value: items.length, sub: 'di halaman ini', tone: 'muted' },
          { label: 'Page', value: `${pagination.page}/${pagination.totalPages || 1}`, sub: 'pagination backend', tone: 'muted' },
        ]}
        actions={
          <Button asChild variant="secondary" className="border-paper/10 bg-paper/10 text-paper hover:bg-paper/15">
            <Link to={entityLinks.recipeList()}>Back to Recipes</Link>
          </Button>
        }
      />

      <div className="grid gap-4 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-display text-xl font-semibold text-ink">Filter Approval</div>
            <p className="mt-1 text-sm text-slate-500">
              Menampilkan {items.length} approval dari {pagination.totalItems} pending.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={resetFilters} disabled={!hasActiveFilters}>
            Reset Search
          </Button>
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_200px]">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Search</label>
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari recipe name, product code, atau product name"
              className="h-12 rounded-2xl"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Page size</label>
            <select
              value={query.pageSize}
              onChange={(event) =>
                setQuery((current) => ({ ...current, pageSize: Number(event.target.value), page: 1 }))
              }
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
            >
              {RECIPE_PAGE_SIZE_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value} / halaman
                </option>
              ))}
            </select>
          </div>
        </div>
        {query.search ? <div className="text-xs text-slate-500">Search aktif: {query.search}</div> : null}
      </div>

      {items.length === 0 ? (
        <MasterDataEmptyState description="Tidak ada recipe version yang sedang menunggu approval." />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Approval Queue</CardTitle>
              <CardDescription>
                Recipe Version, Product, Submitted By, Submitted At, dan action review.
              </CardDescription>
            </div>
            {isRefreshing ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                <LoaderCircle size={14} className="animate-spin" />
                Menyegarkan queue...
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="border-y border-slate-200/80 bg-slate-50/80 text-left">
                    {['Recipe Version', 'Product', 'Submitted By', 'Submitted At', 'Output', 'Action'].map((label) => (
                      <th key={label} className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.recipeVersionId} className="border-b border-slate-200/70 bg-white">
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-ink">{item.recipeName}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                            V{item.versionNumber}
                          </span>
                          <RecipeStatusBadge status={item.status} />
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-ink">{item.product.name}</div>
                        <div className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
                          {item.product.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-600">{item.submittedBy ?? '-'}</td>
                      <td className="px-6 py-4 align-top text-sm text-slate-600">
                        {item.submittedAtUtc ? formatRecipeDate(item.submittedAtUtc) : '-'}
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-600">
                        {formatQuantity(item.standardOutputQuantity, item.unitOfMeasure.symbol ?? item.unitOfMeasure.code)}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button asChild variant="secondary" size="sm">
                            <Link to={entityLinks.recipeVersionDetail(item.recipeId, item.recipeVersionId)}>
                              <Eye size={15} />
                              Review
                            </Link>
                          </Button>
                          <Button data-tour="recipe-approve-btn" size="sm" onClick={() => setApproveTarget(item)}>
                            <CheckCircle2 size={15} />
                            Approve
                          </Button>
                          <Button variant="secondary" size="sm" onClick={() => setRejectTarget(item)}>
                            <ShieldX size={15} />
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid gap-3 px-4 pb-4 md:hidden">
              {items.map((item) => (
                <div key={item.recipeVersionId} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-ink">{item.recipeName}</div>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                          V{item.versionNumber}
                        </span>
                        <RecipeStatusBadge status={item.status} />
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      {item.submittedAtUtc ? formatRecipeDate(item.submittedAtUtc) : '-'}
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl bg-slate-50 p-3">
                    <div className="font-semibold text-ink">{item.product.name}</div>
                    <div className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
                      {item.product.code}
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted By</div>
                      <div className="mt-1 font-semibold text-ink">{item.submittedBy ?? '-'}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Output</div>
                      <div className="mt-1 font-semibold text-ink">
                        {formatQuantity(item.standardOutputQuantity, item.unitOfMeasure.symbol ?? item.unitOfMeasure.code)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-2">
                    <Button asChild variant="secondary">
                      <Link to={entityLinks.recipeVersionDetail(item.recipeId, item.recipeVersionId)}>
                        <Eye size={15} />
                        Review
                      </Link>
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button data-tour="recipe-approve-btn" onClick={() => setApproveTarget(item)}>
                        <CheckCircle2 size={15} />
                        Approve
                      </Button>
                      <Button variant="secondary" onClick={() => setRejectTarget(item)}>
                        <ShieldX size={15} />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <MasterDataPagination
              pagination={pagination}
              onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
            />
          </CardContent>
        </Card>
      )}

      <RecipeApprovalDecisionDialog
        open={approveTarget !== null}
        mode="approve"
        recipeLabel={approveTarget ? `${approveTarget.recipeName} V${approveTarget.versionNumber}` : 'Recipe'}
        value={approveNotes}
        error={decisionError}
        submitting={isDecisionSubmitting}
        onValueChange={setApproveNotes}
        onOpenChange={(open) => {
          if (!open) {
            setApproveTarget(null)
            setApproveNotes('')
            setDecisionError(null)
          }
        }}
        onSubmit={() => void handleApprove()}
      />

      <RecipeApprovalDecisionDialog
        open={rejectTarget !== null}
        mode="reject"
        recipeLabel={rejectTarget ? `${rejectTarget.recipeName} V${rejectTarget.versionNumber}` : 'Recipe'}
        value={rejectReason}
        error={decisionError}
        submitting={isDecisionSubmitting}
        onValueChange={setRejectReason}
        onOpenChange={(open) => {
          if (!open) {
            setRejectTarget(null)
            setRejectReason('')
            setDecisionError(null)
          }
        }}
        onSubmit={() => void handleReject()}
      />
    </div>
  )
}
