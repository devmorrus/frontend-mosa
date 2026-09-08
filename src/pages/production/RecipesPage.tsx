import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { ClipboardList, Eye, Layers3, LoaderCircle, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { productsApi } from '@/api/products.api'
import { recipesApi } from '@/api/recipes.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MasterDataEmptyState, MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import { RecipeStatusBadge } from '@/features/recipes/components/RecipeStatusBadge'
import { RecipeLifecycleStatus, type RecipeListItem, type RecipeQueryState } from '@/features/recipes/types'
import { RECIPE_PAGE_SIZE_OPTIONS, RECIPE_STATUS_FILTER_OPTIONS, formatQuantity, formatRecipeDate } from '@/features/recipes/utils'
import { useAuth } from '@/hooks/useAuth'
import type { ProductListItem } from '@/features/products/types'
import type { ApiError } from '@/types/api'

const DEFAULT_QUERY: RecipeQueryState = {
  search: '',
  status: 'ALL',
  productId: '',
  page: 1,
  pageSize: 10,
}

export function RecipesPage() {
  const { can } = useAuth()
  const canCreate = can('recipes.create')
  const canApprove = can('recipes.approve')
  const [items, setItems] = useState<RecipeListItem[]>([])
  const [query, setQuery] = useState<RecipeQueryState>(DEFAULT_QUERY)
  const [searchInput, setSearchInput] = useState('')
  const deferredSearch = useDeferredValue(searchInput)
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false,
  })
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void productsApi.listActiveOptions().then(setProducts).catch(() => setProducts([]))
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQuery((current) =>
        current.search === deferredSearch.trim()
          ? current
          : { ...current, search: deferredSearch.trim(), page: 1 },
      )
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [deferredSearch])

  useEffect(() => {
    async function loadRecipes() {
      setError(null)
      if (items.length > 0) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      try {
        const result = await recipesApi.list(query)
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

    void loadRecipes()
  }, [query])

  const activeVersions = useMemo(
    () => items.filter((item) => item.currentVersion?.status === RecipeLifecycleStatus.Approved).length,
    [items],
  )

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <ClipboardList size={14} className="text-signal" />
              Production Recipe Management
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Recipe list dan status version yang siap dibuka supervisor
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-paper/68 sm:text-base">
              Pantau recipe aktif, status version terbaru, dan buka detail recipe secara cepat tanpa
              kehilangan konteks product yang diproduksi.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Total recipe</div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper">{pagination.totalItems}</div>
                <p className="mt-1 text-sm text-paper/60">Pagination backend aktif untuk list recipe.</p>
              </CardContent>
            </Card>
            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Approved visible</div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper">{activeVersions}</div>
                <p className="mt-1 text-sm text-paper/60">Version approved mudah dikenali dari list.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="grid gap-3 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-sm sm:p-5">
        <div className="relative">
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Cari recipe name, product code, atau product name"
            className="h-12 rounded-2xl pl-4"
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-[repeat(3,minmax(0,1fr))_auto_auto]">
          <select
            value={query.status}
            onChange={(event) => setQuery((current) => ({ ...current, status: event.target.value as RecipeQueryState['status'], page: 1 }))}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
          >
            {RECIPE_STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={query.productId}
            onChange={(event) => setQuery((current) => ({ ...current, productId: event.target.value, page: 1 }))}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
          >
            <option value="">Semua product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.code} - {product.name}
              </option>
            ))}
          </select>

          <select
            value={query.pageSize}
            onChange={(event) => setQuery((current) => ({ ...current, pageSize: Number(event.target.value), page: 1 }))}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
          >
            {RECIPE_PAGE_SIZE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value} / halaman
              </option>
            ))}
          </select>

          {canApprove ? (
            <Button asChild variant="secondary" className="h-12 whitespace-nowrap">
              <Link to="/production/recipes/approval-queue">Approval Queue</Link>
            </Button>
          ) : (
            <div className="hidden lg:block" />
          )}

          {canCreate ? (
            <Button asChild className="h-12 whitespace-nowrap" data-tour="recipe-create-btn">
              <Link to="/production/recipes/create" data-tour="recipe-create-btn">
                <Plus size={16} />
                Create Recipe
              </Link>
            </Button>
          ) : (
            <div className="hidden lg:block" />
          )}
        </div>
      </div>

      {isLoading ? (
        <MasterDataLoadingState description="Recipe sedang dimuat dari backend." />
      ) : error ? (
        <MasterDataErrorState description={error} onRetry={() => setQuery((current) => ({ ...current }))} />
      ) : items.length === 0 ? (
        <MasterDataEmptyState
          description="Belum ada recipe yang cocok dengan filter saat ini."
          action={
            canCreate ? (
              <Button asChild>
                <Link to="/production/recipes/create">Tambah recipe pertama</Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Recipe List</CardTitle>
              <p className="mt-2 text-sm text-slate-500">
                {pagination.totalItems} recipe tersedia untuk ditinjau.
              </p>
            </div>
            {isRefreshing ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                <LoaderCircle size={14} className="animate-spin" />
                Menyegarkan data...
              </div>
            ) : (
              <Badge className="border-ink/10 bg-ink/5 text-ink/70">Responsive list</Badge>
            )}
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="border-y border-slate-200/80 bg-slate-50/80 text-left">
                    {['Product', 'Recipe Name', 'Active Version', 'Status', 'Updated At', 'Action'].map((label) => (
                      <th key={label} className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-200/70 bg-white">
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-ink">{item.product.name}</div>
                        <div className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
                          {item.product.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-ink">{item.name}</div>
                        <div className="mt-1 text-xs text-slate-500">
                          Output default:{' '}
                          {item.currentVersion
                            ? formatQuantity(
                                item.currentVersion.standardOutputQuantity,
                                item.currentVersion.unitOfMeasure.symbol ?? item.currentVersion.unitOfMeasure.code,
                              )
                            : '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        {item.currentVersion ? (
                          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                            <Layers3 size={16} className="text-slate-400" />
                            V{item.currentVersion.versionNumber}
                          </div>
                        ) : (
                          <span className="text-sm text-slate-400">Belum ada</span>
                        )}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <span data-tour="recipe-active-badge" className="inline-flex">
                          <RecipeStatusBadge status={item.currentVersion?.status ?? item.status} />
                        </span>
                      </td>
                      <td className="px-6 py-4 align-top text-sm text-slate-600">
                        {formatRecipeDate(item.updatedAtUtc ?? item.createdAtUtc)}
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="flex flex-wrap justify-end gap-2">
                          <Button asChild variant="secondary" size="sm">
                            <Link to={`/production/recipes/${item.id}`}>
                              <Eye size={15} />
                              Open Recipe
                            </Link>
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
    </div>
  )
}
