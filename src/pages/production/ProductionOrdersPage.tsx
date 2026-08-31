import { useDeferredValue, useEffect, useState } from 'react'
import { Factory } from 'lucide-react'
import { productionOrdersApi } from '@/api/productionOrders.api'
import { Card, CardContent } from '@/components/ui/card'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import { EMPTY_PAGINATION } from '@/features/master-data/utils'
import { ProductionOrderTable } from '@/features/production-orders/components/ProductionOrderTable'
import { ProductionOrderToolbar } from '@/features/production-orders/components/ProductionOrderToolbar'
import type {
  ProductionOrderListItem,
  ProductionOrderQueryState,
} from '@/features/production-orders/types'
import { useAuth } from '@/hooks/useAuth'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'
import type { ApiError } from '@/types/api'

const DEFAULT_QUERY: ProductionOrderQueryState = {
  search: '',
  status: 'ALL',
  page: 1,
  pageSize: 10,
}

export function ProductionOrdersPage() {
  const { can } = useAuth()
  const [query, setQuery] = useState<ProductionOrderQueryState>(DEFAULT_QUERY)
  const [searchInput, setSearchInput] = useState('')
  const deferredSearch = useDeferredValue(searchInput)
  const [items, setItems] = useState<ProductionOrderListItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  async function loadData(nextQuery = query, background = false) {
    if (background) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    setError(null)

    try {
      const result = await productionOrdersApi.list(nextQuery)
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

  useEffect(() => {
    void loadData(query, items.length > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(query)])

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <Factory size={14} className="text-signal" />
              Production Orders
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Kelola Production Order dari draft hingga released
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Buat, edit, dan pantau production order. Status otomatis berubah berdasarkan
              ketersediaan material.
            </p>
          </div>

          <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
            <CardContent className="p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">
                Total orders
              </div>
              <div className="mt-2 font-display text-3xl font-semibold text-paper">
                {pagination.totalItems}
              </div>
              <p className="mt-1 text-sm text-paper/60">
                Daftar mengikuti pagination backend secara penuh.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <ProductionOrderToolbar
        query={query}
        searchValue={searchInput}
        onSearchValueChange={setSearchInput}
        onStatusChange={(status) =>
          setQuery((current) => ({ ...current, status, page: 1 }))
        }
        onPageSizeChange={(pageSize) =>
          setQuery((current) => ({ ...current, pageSize, page: 1 }))
        }
        canCreate={can('production-orders.create')}
      />

      {isLoading ? (
        <MasterDataLoadingState description="Daftar production order sedang dimuat dari backend." />
      ) : error ? (
        <MasterDataErrorState description={error} onRetry={() => void loadData(query)} />
      ) : items.length === 0 ? (
        <MasterDataEmptyState
          description="Belum ada production order yang cocok dengan filter saat ini."
          action={
            can('production-orders.create') ? (
              <a
                href="/production/orders/create"
                className="inline-flex h-10 items-center justify-center rounded-2xl bg-ink px-5 text-sm font-semibold text-paper shadow-sm shadow-ink/20 transition-all hover:bg-ink/90"
              >
                Buat production order pertama
              </a>
            ) : null
          }
        />
      ) : (
        <ProductionOrderTable
          items={items}
          pagination={pagination}
          isRefreshing={isRefreshing}
          onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
          canUpdate={can('production-orders.update')}
        />
      )}
    </div>
  )
}
