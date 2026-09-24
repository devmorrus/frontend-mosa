import { useDeferredValue, useEffect, useState } from 'react'
import { Boxes, LoaderCircle } from 'lucide-react'
import { inventoryApi } from '@/api/inventory.api'
import { rawMaterialsApi } from '@/api/rawMaterials.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ModuleHero } from '@/components/common/ModuleHero'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataTableSkeleton,
} from '@/features/master-data/components/MasterDataStates'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'
import { EMPTY_PAGINATION } from '@/features/master-data/utils'
import { RawMaterialInventoryFilterBar } from '@/features/raw-material-inventory/components/RawMaterialInventoryFilterBar'
import { RawMaterialInventoryTable } from '@/features/raw-material-inventory/components/RawMaterialInventoryTable'
import type {
  InventoryRawMaterialListItem,
  InventoryRawMaterialQueryState,
} from '@/features/raw-material-inventory/types'
import {
  getInventoryFilterErrorMessage,
} from '@/features/raw-material-inventory/utils'
import {
  emptyInventoryRawMaterialQuery,
  validateInventoryRawMaterialQuery,
} from '@/features/raw-material-inventory/validation'
import type { RawMaterialListItem } from '@/features/raw-materials/types'
import type { WarehouseListItem } from '@/features/warehouses/types'
import { fetchLookupIfAllowed } from '@/utils/lookupGuard'
import type { ApiError } from '@/types/api'
import { breadcrumbs } from '@/routes/canonicalRoutes'

export function RawMaterialInventoryPage() {
  const [query, setQuery] = useState<InventoryRawMaterialQueryState>(
    emptyInventoryRawMaterialQuery,
  )
  const [searchInput, setSearchInput] = useState('')
  const deferredSearch = useDeferredValue(searchInput)
  const [items, setItems] = useState<InventoryRawMaterialListItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([])
  const [materials, setMaterials] = useState<RawMaterialListItem[]>([])
  const [expandedMaterialId, setExpandedMaterialId] = useState<string | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [filterError, setFilterError] = useState<string | null>(null)
  const [listError, setListError] = useState<string | null>(null)
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
        const [warehouseOptions, materialOptions] = await Promise.all([
          fetchLookupIfAllowed('warehouses.view', () => warehousesApi.listOptions('ALL'), []),
          fetchLookupIfAllowed('materials.view', () => rawMaterialsApi.listActiveOptions(), []),
        ])
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
    const validation = validateInventoryRawMaterialQuery(nextQuery)
    setFilterError(getInventoryFilterErrorMessage(validation.errors))
    if (!validation.isValid) return

    if (background) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    setListError(null)

    try {
      const result = await inventoryApi.listRawMaterials(nextQuery)
      setItems(result.items)
      setPagination(result.pagination)
      setExpandedMaterialId((current) =>
        current && result.items.some((item) => item.materialId === current) ? current : null,
      )
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
    query.search ||
      query.warehouseId ||
      query.rawMaterialId ||
      query.status !== 'ALL' ||
      query.expiryFrom ||
      query.expiryTo,
  )

  function resetFilters() {
    setSearchInput('')
    setQuery(emptyInventoryRawMaterialQuery)
    setExpandedMaterialId(null)
  }

  const availableOnPage = items.reduce((total, item) => total + item.availableQuantity, 0)
  const lotsOnPage = items.reduce((total, item) => total + item.lots.length, 0)

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs.inventory()} />

      <ModuleHero
        eyebrow="Warehouse • Inventory"
        title="Raw Material Inventory"
        description="Pantau aggregate stock raw material dan buka breakdown LOT saat membutuhkan detail."
        icon={<Boxes size={13} className="text-signal" />}
        metrics={[
          { label: 'Material', value: pagination.totalItems, sub: 'Hasil filter' },
          { label: 'Available', value: formatMetricNumber(availableOnPage), sub: 'Page aktif', tone: 'success' },
          { label: 'LOTs', value: lotsOnPage, sub: 'Page aktif' },
        ]}
      />

      <RawMaterialInventoryFilterBar
        query={query}
        searchInput={searchInput}
        filterError={filterError}
        warehouses={warehouses}
        materials={materials}
        onSearchInputChange={setSearchInput}
        onQueryChange={(patch) => setQuery((current) => ({ ...current, ...patch }))}
        onReset={resetFilters}
      />

      {lookupError ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Gagal memuat lookup filter inventory: {lookupError}
        </div>
      ) : null}

      {isLoading ? (
        <MasterDataTableSkeleton rows={query.pageSize} label="Inventory raw material sedang dimuat" />
      ) : listError ? (
        <MasterDataErrorState description={listError} onRetry={() => void loadData(query)} />
      ) : items.length === 0 ? (
        <MasterDataEmptyState
          description={
            hasActiveFilter
              ? 'Belum ada inventory yang cocok dengan filter saat ini.'
              : 'Belum ada raw material inventory yang tersedia di sistem.'
          }
        />
      ) : (
        <RawMaterialInventoryTable
          items={items}
          pagination={pagination}
          expandedMaterialId={expandedMaterialId}
          selectedWarehouseId={query.warehouseId}
          isRefreshing={isRefreshing}
          onToggleBreakdown={(materialId) =>
            setExpandedMaterialId((current) => (current === materialId ? null : materialId))
          }
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

function formatMetricNumber(value: number) {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value)
}
