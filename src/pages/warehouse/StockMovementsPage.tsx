import { useDeferredValue, useEffect, useState } from 'react'
import { ArrowLeftRight, LoaderCircle } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { rawMaterialLotsApi } from '@/api/rawMaterialLots.api'
import { rawMaterialsApi } from '@/api/rawMaterials.api'
import { stockMovementsApi } from '@/api/stockMovements.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Card, CardContent } from '@/components/ui/card'
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

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Stock Movements' }]} />
      <section data-tour="inventory-stock-movement" className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <ArrowLeftRight size={14} className="text-signal" />
              Stock Movements
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Telusuri bagaimana stock berubah sampai menjadi angka saat ini
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Riwayat stock movement bersifat read-only dan membantu Warehouse memahami perubahan
              quantity, reference receiving, serta histori LOT per material.
            </p>
          </div>

          <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
            <CardContent className="p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Total Movement</div>
              <div className="mt-2 font-display text-3xl font-semibold text-paper">
                {pagination.totalItems}
              </div>
              <p className="mt-1 text-sm text-paper/60">History mengikuti filter dan pagination backend.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <StockMovementsFilterBar
        query={query}
        searchInput={searchInput}
        filterError={filterError}
        warehouses={warehouses}
        materials={materials}
        lots={lots}
        onSearchInputChange={setSearchInput}
        onQueryChange={(patch) => setQuery((current) => ({ ...current, ...patch }))}
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
