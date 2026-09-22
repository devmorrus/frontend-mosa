import { useDeferredValue, useEffect, useState } from 'react'
import { ArrowLeftRight, LoaderCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ModuleHero } from '@/components/common/ModuleHero'
import { rawMaterialLotsApi } from '@/api/rawMaterialLots.api'
import { rawMaterialsApi } from '@/api/rawMaterials.api'
import { stockMovementsApi } from '@/api/stockMovements.api'
import { warehousesApi } from '@/api/warehouses.api'
import { breadcrumbs } from '@/routes/canonicalRoutes'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'
import { EMPTY_PAGINATION } from '@/features/master-data/utils'
import { StockMovementsFilterBar } from '@/features/stock-movements/components/StockMovementsFilterBar'
import { StockMovementsTable } from '@/features/stock-movements/components/StockMovementsTable'
import type { RawMaterialLotListItem } from '@/features/raw-material-lots/types'
import type { RawMaterialListItem } from '@/features/raw-materials/types'
import type {
  StockMovementListItem,
  StockMovementQueryState,
} from '@/features/stock-movements/types'
import { getStockMovementFilterErrorMessage } from '@/features/stock-movements/utils'
import {
  emptyStockMovementQuery,
  validateStockMovementQuery,
} from '@/features/stock-movements/validation'
import type { WarehouseListItem } from '@/features/warehouses/types'
import { fetchLookupIfAllowed } from '@/utils/lookupGuard'
import type { ApiError } from '@/types/api'

export function StockMovementsPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState<StockMovementQueryState>(() => ({
    ...emptyStockMovementQuery,
    rawMaterialLotId: searchParams.get('rawMaterialLotId') ?? '',
    rawMaterialId: searchParams.get('rawMaterialId') ?? '',
    warehouseId: searchParams.get('warehouseId') ?? '',
  }))
  const [searchInput, setSearchInput] = useState('')
  const deferredSearch = useDeferredValue(searchInput)
  const [items, setItems] = useState<StockMovementListItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([])
  const [materials, setMaterials] = useState<RawMaterialListItem[]>([])
  const [lots, setLots] = useState<RawMaterialLotListItem[]>([])
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [filterError, setFilterError] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQuery((current) =>
        current.reference === deferredSearch.trim()
          ? current
          : { ...current, reference: deferredSearch.trim(), page: 1 },
      )
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [deferredSearch])

  useEffect(() => {
    async function loadLookups() {
      try {
        const [warehouseOptions, materialOptions, lotResult] = await Promise.all([
          fetchLookupIfAllowed('warehouses.view', () => warehousesApi.listOptions('ALL'), []),
          fetchLookupIfAllowed('materials.view', () => rawMaterialsApi.listActiveOptions(), []),
          fetchLookupIfAllowed('lots.view', () => rawMaterialLotsApi.list({
            search: '',
            rawMaterialId: '',
            supplierId: '',
            warehouseId: '',
            status: 'ALL',
            expiryFrom: '',
            expiryTo: '',
            receivedDateFrom: '',
            receivedDateTo: '',
            page: 1,
            pageSize: 100,
          }), null),
        ])

        setWarehouses(warehouseOptions)
        setMaterials(materialOptions)
        setLots(lotResult?.items ?? [])
      } catch (caughtError) {
        const apiError = caughtError as ApiError
        setLookupError(apiError.message)
      }
    }

    void loadLookups()
  }, [])

  useEffect(() => {
    async function reloadLots() {
      try {
        const result = await fetchLookupIfAllowed('lots.view', () => rawMaterialLotsApi.list({
          search: '',
          rawMaterialId: query.rawMaterialId,
          supplierId: '',
          warehouseId: query.warehouseId,
          status: 'ALL',
          expiryFrom: '',
          expiryTo: '',
          receivedDateFrom: '',
          receivedDateTo: '',
          page: 1,
          pageSize: 100,
        }), null)
        if (result) {
          setLots(result.items)
        }
      } catch {
        // keep last lot options
      }
    }

    void reloadLots()
  }, [query.rawMaterialId, query.warehouseId])

  async function loadData(nextQuery = query, background = false) {
    const validation = validateStockMovementQuery(nextQuery)
    setFilterError(getStockMovementFilterErrorMessage(validation.errors))
    if (!validation.isValid) return

    if (background) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    setListError(null)

    try {
      const result = await stockMovementsApi.list(nextQuery)
      setItems(result.items)
      setPagination(result.pagination)
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setListError(apiError.message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    void loadData(query, items.length > 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(query)])

  const hasActiveFilter = Boolean(
    query.reference ||
      query.warehouseId ||
      query.rawMaterialId ||
      query.rawMaterialLotId ||
      query.movementType !== 'ALL' ||
      query.dateFrom ||
      query.dateTo,
  )

  function resetFilters() {
    setSearchInput('')
    setQuery(emptyStockMovementQuery)
  }

  const inQtyOnPage = items.reduce(
    (total, item) => total + (item.quantityDirection.toUpperCase() === 'OUT' ? 0 : item.displayQuantity),
    0,
  )
  const outQtyOnPage = items.reduce(
    (total, item) => total + (item.quantityDirection.toUpperCase() === 'OUT' ? item.displayQuantity : 0),
    0,
  )

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs.stockMovements()} />
      <ModuleHero
        dataTour="inventory-stock-movement"
        eyebrow="Warehouse • Stock Movements"
        title="Stock Movements"
        description="Pantau riwayat perubahan stock yang bersifat read-only, dari receiving sampai konsumsi produksi."
        icon={<ArrowLeftRight size={13} className="text-signal" />}
        metrics={[
          { label: 'Total', value: pagination.totalItems, sub: 'Hasil filter' },
          { label: 'Stock IN', value: formatMovementMetricNumber(inQtyOnPage), sub: 'Page aktif' },
          { label: 'Stock OUT', value: formatMovementMetricNumber(outQtyOnPage), sub: 'Page aktif' },
        ]}
      />

      <StockMovementsFilterBar
        query={query}
        searchInput={searchInput}
        filterError={filterError}
        warehouses={warehouses}
        materials={materials}
        lots={lots}
        onSearchInputChange={setSearchInput}
        onQueryChange={(patch) => setQuery((current) => ({ ...current, ...patch }))}
        onReset={resetFilters}
      />

      {lookupError ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Gagal memuat lookup stock movement: {lookupError}
        </div>
      ) : null}

      {isLoading ? (
        <MasterDataLoadingState description="Riwayat stock movement sedang dimuat dari backend." />
      ) : listError ? (
        <MasterDataErrorState description={listError} onRetry={() => void loadData(query)} />
      ) : items.length === 0 ? (
        <MasterDataEmptyState
          description={
            hasActiveFilter
              ? 'Belum ada stock movement yang cocok dengan filter saat ini.'
              : 'Belum ada stock movement yang tersedia di sistem.'
          }
        />
      ) : (
        <StockMovementsTable
          items={items}
          pagination={pagination}
          isRefreshing={isRefreshing}
          onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
        />
      )}

      {isRefreshing ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
          <LoaderCircle size={14} className="animate-spin" />
          Menyegarkan data...
        </div>
      ) : null}
    </div>
  )
}

function formatMovementMetricNumber(value: number) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value)
}
