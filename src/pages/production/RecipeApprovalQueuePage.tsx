import { useDeferredValue, useEffect, useState } from 'react'
import { CheckCircle2, ClipboardCheck, Eye, LoaderCircle, ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { recipesApi } from '@/api/recipes.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import { RecipeApprovalDecisionDialog } from '@/features/recipes/components/RecipeApprovalDecisionDialog'
import { RecipeStatusBadge } from '@/features/recipes/components/RecipeStatusBadge'
import type { RecipeApprovalQueueItem, RecipeApprovalQueueQueryState } from '@/features/recipes/types'
import { RECIPE_PAGE_SIZE_OPTIONS, formatQuantity, formatRecipeDate } from '@/features/recipes/utils'
import type { ApiError } from '@/types/api'
import { useUiStore } from '@/stores/uiStore'

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

  if (isLoading) {
    return <MasterDataLoadingState description="Approval queue sedang dimuat dari backend." />
  }

  if (error) {
    return <MasterDataErrorState description={error} onRetry={() => setQuery((current) => ({ ...current }))} />
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(6,59,140,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,201,40,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <ClipboardCheck size={14} className="text-signal" />
              Supervisor Approval Queue
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Review recipe version yang menunggu keputusan approval
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-paper/68 sm:text-base">
              Queue ini hanya menampilkan version berstatus pending approval sehingga supervisor bisa membuka,
              approve, atau reject tanpa mencari manual dari recipe list.
            </p>
          </div>

          <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
            <CardContent className="p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Pending approvals</div>
              <div className="mt-2 font-display text-3xl font-semibold text-paper">{pagination.totalItems}</div>
              <p className="mt-1 text-sm text-paper/60">Queue memakai pagination backend.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-3 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-sm sm:p-5 lg:grid-cols-[minmax(0,1fr)_200px]">
        <Input
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Cari recipe name, product code, atau product name"
          className="h-12 rounded-2xl"
        />
        <select
          value={query.pageSize}
          onChange={(event) =>
            setQuery((current) => ({ ...current, pageSize: Number(event.target.value), page: 1 }))
          }
          className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
        >
          {RECIPE_PAGE_SIZE_OPTIONS.map((value) => (
            <option key={value} value={value}>
              {value} / halaman
            </option>
          ))}
        </select>
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
            <div className="overflow-x-auto">
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
                            <Link to={`/production/recipes/${item.recipeId}/versions/${item.recipeVersionId}`}>
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
