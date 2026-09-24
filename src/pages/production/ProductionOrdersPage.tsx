import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Factory } from 'lucide-react'
import { Link } from 'react-router-dom'
import { productionOrdersApi } from '@/api/productionOrders.api'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ModuleHero } from '@/components/common/ModuleHero'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataTableSkeleton,
} from '@/features/master-data/components/MasterDataStates'
import { EMPTY_PAGINATION } from '@/features/master-data/utils'
import { ProductionOrderTable } from '@/features/production-orders/components/ProductionOrderTable'
import { ProductionOrderToolbar } from '@/features/production-orders/components/ProductionOrderToolbar'
import type {
  ProductionOrderListItem,
  ProductionOrderQueryState,
} from '@/features/production-orders/types'
import { useAuth } from '@/hooks/useAuth'
import { breadcrumbs, entityLinks } from '@/routes/canonicalRoutes'
import { countProductionOrderStatuses } from '@/features/production-orders/validation'
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

  const statusSummary = useMemo(() => countProductionOrderStatuses(items), [items])

  function resetFilters() {
    setSearchInput('')
    setQuery(DEFAULT_QUERY)
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs.productionOrderList()} />
      <ModuleHero
        eyebrow="Production • Orders"
        title="Kelola Production Order dari draft hingga released"
        description="Buat, edit, pantau ketersediaan material, dan release production order dengan status lifecycle yang mudah dibaca."
        icon={<Factory size={13} className="text-signal" />}
        metrics={[
          { label: 'Total orders', value: pagination.totalItems, sub: 'sesuai filter backend' },
          { label: 'Ready visible', value: statusSummary.ready, sub: 'di halaman ini', tone: 'success' },
          { label: 'Shortage visible', value: statusSummary.shortage, sub: 'di halaman ini', tone: statusSummary.shortage > 0 ? 'default' : 'muted' },
          { label: 'Released visible', value: statusSummary.released, sub: 'di halaman ini', tone: 'muted' },
        ]}
      />

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
        onReset={resetFilters}
        canCreate={can('production-orders.create')}
        totalItems={pagination.totalItems}
        visibleItems={items.length}
      />

      {isLoading ? (
        <MasterDataTableSkeleton rows={query.pageSize} label="Daftar production order sedang dimuat" />
      ) : error ? (
        <MasterDataErrorState description={error} onRetry={() => void loadData(query)} />
      ) : items.length === 0 ? (
        <MasterDataEmptyState
          description="Belum ada production order yang cocok dengan filter saat ini."
          action={
            can('production-orders.create') ? (
              <Link to={entityLinks.productionOrderCreate()} className="inline-flex h-10 items-center justify-center rounded-2xl bg-ink px-5 text-sm font-semibold text-paper shadow-sm shadow-ink/20 transition-all hover:bg-ink/90">
                Buat production order pertama
              </Link>
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
