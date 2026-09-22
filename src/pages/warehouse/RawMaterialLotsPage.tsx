import { useDeferredValue, useEffect, useState } from 'react'
import {
  Info,
  LoaderCircle,
  Tags,
} from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ModuleHero } from '@/components/common/ModuleHero'
import { breadcrumbs } from '@/routes/canonicalRoutes'
import { rawMaterialLotsApi } from '@/api/rawMaterialLots.api'
import { rawMaterialsApi } from '@/api/rawMaterials.api'
import { suppliersApi } from '@/api/suppliers.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Button } from '@/components/ui/button'
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
import { fetchLookupIfAllowed } from '@/utils/lookupGuard'
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
          fetchLookupIfAllowed('suppliers.view', () => suppliersApi.listOptions('ALL'), []),
          fetchLookupIfAllowed('warehouses.view', () => warehousesApi.listOptions('ALL'), []),
          fetchLookupIfAllowed('materials.view', () => rawMaterialsApi.listActiveOptions(), []),
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

  const availableOnPage = items.filter((item) => item.status.toUpperCase() === 'AVAILABLE').length
  const attentionOnPage = items.filter((item) => ['BLOCKED', 'EXPIRED'].includes(item.status.toUpperCase())).length

  function resetFilters() {
    setQuery(emptyRawMaterialLotQuery)
    setSearchInput('')
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs.lotList()} />
      <ModuleHero
        eyebrow="Warehouse • Lots"
        title="Raw Material LOT"
        description="Pantau LOT bahan baku, sisa stok, expiry, QR label, dan akses cepat ke detail traceability."
        icon={<Tags size={13} className="text-signal" />}
        metrics={[
          { label: 'Total', value: pagination.totalItems, sub: 'Terdaftar' },
          { label: 'Available', value: availableOnPage, sub: 'Halaman ini', tone: 'success' },
          { label: 'Attention', value: attentionOnPage, sub: 'Halaman ini' },
        ]}
      />

      <RawMaterialLotsFilterBar
        query={query}
        searchInput={searchInput}
        filterError={filterError}
        suppliers={suppliers}
        warehouses={warehouses}
        materials={materials}
        onSearchInputChange={setSearchInput}
        onQueryChange={(patch) => setQuery((current) => ({ ...current, ...patch }))}
        onReset={resetFilters}
      />

      {lookupError ? (
        <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <Info size={17} className="mt-0.5 shrink-0" />
          Gagal memuat lookup filter LOT: {lookupError}
        </div>
      ) : null}

      {printError ? (
        <div className="flex items-start gap-2 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          <Info size={17} className="mt-0.5 shrink-0" />
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
