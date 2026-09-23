import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { ClipboardList, Eye, Layers3, LoaderCircle, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { productsApi } from '@/api/products.api'
import { recipesApi } from '@/api/recipes.api'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ModuleHero } from '@/components/common/ModuleHero'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { MasterDataEmptyState, MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import { RecipeStatusBadge } from '@/features/recipes/components/RecipeStatusBadge'
import { RecipeLifecycleStatus, type RecipeListItem, type RecipeQueryState } from '@/features/recipes/types'
import {
  RECIPE_PAGE_SIZE_OPTIONS,
  RECIPE_STATUS_FILTER_OPTIONS,
  formatQuantity,
  formatRecipeDate,
  getRecipeStatusFilterLabel,
  hasActiveRecipeListFilters,
} from '@/features/recipes/utils'
import { useAuth } from '@/hooks/useAuth'
import { breadcrumbs, entityLinks } from '@/routes/canonicalRoutes'
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
  const hasActiveFilters = hasActiveRecipeListFilters(query)
  const selectedProduct = products.find((product) => product.id === query.productId)

  function resetFilters() {
    setSearchInput('')
    setQuery(DEFAULT_QUERY)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs.recipeList()} />
      <ModuleHero
        eyebrow="Production • Recipes"
        title="Kelola recipe produksi dan lifecycle version"
        description="Pantau recipe aktif, status version terbaru, approval, dan detail product tanpa kehilangan konteks operasional produksi."
        icon={<ClipboardList size={13} className="text-signal" />}
        metrics={[
          { label: 'Total recipe', value: pagination.totalItems, sub: 'sesuai filter backend' },
          { label: 'Approved visible', value: activeVersions, sub: 'di halaman ini', tone: 'success' },
          { label: 'Page', value: `${pagination.page}/${pagination.totalPages || 1}`, sub: 'pagination backend', tone: 'muted' },
        ]}
        actions={
          <>
            {canApprove ? (
              <Button asChild variant="secondary" className="border-paper/10 bg-paper/10 text-paper hover:bg-paper/15">
                <Link to={entityLinks.recipeApprovalQueue()}>Approval Queue</Link>
              </Button>
            ) : null}
            {canCreate ? (
              <Button asChild className="bg-paper text-ink hover:bg-paper/90" data-tour="recipe-create-btn">
                <Link to={entityLinks.recipeCreate()} data-tour="recipe-create-btn">
                  <Plus size={16} />
                  Create Recipe
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-display text-xl font-semibold text-ink">Filter Recipe</div>
            <p className="mt-1 text-sm text-slate-500">
              Menampilkan {items.length} recipe dari {pagination.totalItems} total.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={resetFilters} disabled={!hasActiveFilters}>
            Reset Filter
          </Button>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Search</label>
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Cari recipe name, product code, atau product name"
            className="h-12 rounded-2xl pl-4"
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-3">
          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Status</label>
            <select
              value={query.status}
              onChange={(event) => setQuery((current) => ({ ...current, status: event.target.value as RecipeQueryState['status'], page: 1 }))}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
            >
              {RECIPE_STATUS_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Product</label>
            <select
              value={query.productId}
              onChange={(event) => setQuery((current) => ({ ...current, productId: event.target.value, page: 1 }))}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
            >
              <option value="">Semua product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.code} - {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Page size</label>
            <select
              value={query.pageSize}
              onChange={(event) => setQuery((current) => ({ ...current, pageSize: Number(event.target.value), page: 1 }))}
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

        {hasActiveFilters ? (
          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
            {query.search ? <span className="rounded-full bg-slate-100 px-3 py-1">Search: {query.search}</span> : null}
            {query.status !== 'ALL' ? <span className="rounded-full bg-slate-100 px-3 py-1">Status: {getRecipeStatusFilterLabel(query.status)}</span> : null}
            {selectedProduct ? <span className="rounded-full bg-slate-100 px-3 py-1">Product: {selectedProduct.code}</span> : null}
          </div>
        ) : null}
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
                <Link to={entityLinks.recipeCreate()}>Tambah recipe pertama</Link>
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
            <div className="hidden overflow-x-auto md:block">
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
                            <Link to={entityLinks.recipeDetail(item.id)}>
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
            <div className="grid gap-3 px-4 pb-4 md:hidden">
              {items.map((item) => (
                <div key={item.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-ink">{item.name}</div>
                      <div className="mt-1 text-sm text-slate-500">{item.product.name}</div>
                      <div className="mt-1 font-mono text-xs uppercase tracking-[0.16em] text-slate-500">
                        {item.product.code}
                      </div>
                    </div>
                    <span data-tour="recipe-active-badge" className="inline-flex shrink-0">
                      <RecipeStatusBadge status={item.currentVersion?.status ?? item.status} />
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Version</div>
                      <div className="mt-1 font-semibold text-ink">
                        {item.currentVersion ? `V${item.currentVersion.versionNumber}` : '-'}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 p-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Output</div>
                      <div className="mt-1 font-semibold text-ink">
                        {item.currentVersion
                          ? formatQuantity(
                              item.currentVersion.standardOutputQuantity,
                              item.currentVersion.unitOfMeasure.symbol ?? item.currentVersion.unitOfMeasure.code,
                            )
                          : '-'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-500">
                    Updated {formatRecipeDate(item.updatedAtUtc ?? item.createdAtUtc)}
                  </div>
                  <Button asChild variant="secondary" className="mt-4 w-full">
                    <Link to={entityLinks.recipeDetail(item.id)}>
                      <Eye size={15} />
                      Open Recipe
                    </Link>
                  </Button>
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
    </div>
  )
}
