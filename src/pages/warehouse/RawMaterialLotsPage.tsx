import { useDeferredValue, useEffect, useState } from 'react'
import { LoaderCircle, Tags } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { breadcrumbs } from '@/routes/canonicalRoutes'
import { rawMaterialLotsApi } from '@/api/rawMaterialLots.api'
import { rawMaterialsApi } from '@/api/rawMaterials.api'
import { suppliersApi } from '@/api/suppliers.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'
import { EMPTY_PAGINATION } from '@/features/master-data/utils'
import { RawMaterialLotsFilterBar } from '@/features/raw-material-lots/components/RawMaterialLotsFilterBar'
import { RawMaterialLotsTable } from '@/features/raw-material-lots/components/RawMaterialLotsTable'
import type {
  RawMaterialLotListItem,
  RawMaterialLotQueryState,
} from '@/features/raw-material-lots/types'
import {
  getLotFilterErrorMessage,
  prepareRawMaterialLotPrintWindow,
  renderRawMaterialLotPrintWindow,
} from '@/features/raw-material-lots/utils'
import {
  emptyRawMaterialLotQuery,
  validateRawMaterialLotQuery,
} from '@/features/raw-material-lots/validation'
import type { RawMaterialListItem } from '@/features/raw-materials/types'
import type { SupplierListItem } from '@/features/suppliers/types'
import type { WarehouseListItem } from '@/features/warehouses/types'
import type { ApiError } from '@/types/api'

export function RawMaterialLotsPage() {
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState<RawMaterialLotQueryState>(() => ({
    ...emptyRawMaterialLotQuery,
    search: searchParams.get('search') ?? '',
    rawMaterialId: searchParams.get('rawMaterialId') ?? '',
    supplierId: searchParams.get('supplierId') ?? '',
    warehouseId: searchParams.get('warehouseId') ?? '',
  }))
  const [searchInput, setSearchInput] = useState(searchParams.get('search') ?? '')
  const deferredSearch = useDeferredValue(searchInput)
  const [items, setItems] = useState<RawMaterialLotListItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const [suppliers, setSuppliers] = useState<SupplierListItem[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([])
  const [materials, setMaterials] = useState<RawMaterialListItem[]>([])
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [filterError, setFilterError] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [printError, setPrintError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

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
    async function loadLookups() {
      try {
        const [supplierOptions, warehouseOptions, materialOptions] = await Promise.all([
          suppliersApi.listOptions('ALL'),
          warehousesApi.listOptions('ALL'),
          rawMaterialsApi.listActiveOptions(),
        ])
        setSuppliers(supplierOptions)
        setWarehouses(warehouseOptions)
        setMaterials(materialOptions)
      } catch (caughtError) {
        const apiError = caughtError as ApiError
        setLookupError(apiError.message)
      }
    }

    void loadLookups()
  }, [])

  async function loadData(nextQuery = query, background = false) {
    const validation = validateRawMaterialLotQuery(nextQuery)
    setFilterError(getLotFilterErrorMessage(validation.errors))
    if (!validation.isValid) return

    if (background) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    setListError(null)

    try {
      const result = await rawMaterialLotsApi.list(nextQuery)
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

  async function handleQuickPrint(lotId: string) {
    setPrintError(null)
    const preparedWindow = prepareRawMaterialLotPrintWindow()

    if (!preparedWindow) {
      setPrintError('Popup print diblok browser. Izinkan popup lalu coba lagi.')
      return
    }

    try {
      const label = await rawMaterialLotsApi.getLabel(lotId)
      const result = renderRawMaterialLotPrintWindow(preparedWindow, label)
      if (!result.ok) {
        setPrintError(result.error)
      }
    } catch (caughtError) {
      preparedWindow.close()
      const apiError = caughtError as ApiError
      setPrintError(apiError.message)
    }
  }

  const hasActiveFilter = Boolean(
    query.search ||
      query.rawMaterialId ||
      query.supplierId ||
      query.warehouseId ||
      query.status !== 'ALL' ||
      query.expiryFrom ||
      query.expiryTo ||
      query.receivedDateFrom ||
      query.receivedDateTo,
  )

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs.lotList()} />
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <Tags size={14} className="text-signal" />
              Raw Material LOT
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              LOT hasil receiving siap dilihat, dicetak, dan diuji via QR
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Warehouse dapat mencari LOT secara manual, membuka detail, melihat QR, dan menguji
              scan browser camera tanpa bergantung pada device scanner khusus.
            </p>
          </div>

          <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
            <CardContent className="p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Total LOT</div>
              <div className="mt-2 font-display text-3xl font-semibold text-paper">
                {pagination.totalItems}
              </div>
              <p className="mt-1 text-sm text-paper/60">Pagination mengikuti backend secara penuh.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <RawMaterialLotsFilterBar
        query={query}
        searchInput={searchInput}
        filterError={filterError}
        suppliers={suppliers}
        warehouses={warehouses}
        materials={materials}
        onSearchInputChange={setSearchInput}
        onQueryChange={(patch) => setQuery((current) => ({ ...current, ...patch }))}
      />

      {lookupError ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Gagal memuat lookup filter LOT: {lookupError}
        </div>
      ) : null}

      {printError ? (
        <div className="rounded-[28px] border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          {printError}
        </div>
      ) : null}

      {isLoading ? (
        <MasterDataLoadingState description="Daftar raw material LOT sedang dimuat dari backend." />
      ) : listError ? (
        <MasterDataErrorState description={listError} onRetry={() => void loadData(query)} />
      ) : items.length === 0 ? (
        <MasterDataEmptyState
          description={
            hasActiveFilter
              ? 'Belum ada LOT yang cocok dengan filter saat ini.'
              : 'Belum ada raw material LOT yang tersedia di sistem.'
          }
          action={
            <Button asChild>
              <Link to="/lots/scan">Buka Scan QR Test</Link>
            </Button>
          }
        />
      ) : (
        <RawMaterialLotsTable
          items={items}
          pagination={pagination}
          isRefreshing={isRefreshing}
          onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
          onPrintLabel={(lotId) => void handleQuickPrint(lotId)}
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
