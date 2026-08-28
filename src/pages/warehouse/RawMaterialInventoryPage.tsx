import { useDeferredValue, useEffect, useState } from 'react'
import { Boxes, LoaderCircle } from 'lucide-react'
import { inventoryApi } from '@/api/inventory.api'
import { rawMaterialsApi } from '@/api/rawMaterials.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Card, CardContent } from '@/components/ui/card'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataLoadingState,
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
import type { ApiError } from '@/types/api'

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
          warehousesApi.listOptions('ALL'),
          rawMaterialsApi.listActiveOptions(),
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

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <Boxes size={14} className="text-signal" />
              Raw Material Inventory
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Lihat total stock raw material tanpa membuka LOT satu per satu
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Inventory hanya menampilkan agregasi stock dari LOT backend, lengkap dengan
              breakdown pembentuk total untuk Warehouse dan Admin.
            </p>
          </div>

          <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
            <CardContent className="p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">
                Total Material
              </div>
              <div className="mt-2 font-display text-3xl font-semibold text-paper">
                {pagination.totalItems}
              </div>
              <p className="mt-1 text-sm text-paper/60">
                Inventory page mengikuti aggregate dan pagination backend.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <RawMaterialInventoryFilterBar
        query={query}
        searchInput={searchInput}
        filterError={filterError}
        warehouses={warehouses}
        materials={materials}
        onSearchInputChange={setSearchInput}
        onQueryChange={(patch) => setQuery((current) => ({ ...current, ...patch }))}
      />

      {lookupError ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Gagal memuat lookup filter inventory: {lookupError}
        </div>
      ) : null}

      {isLoading ? (
        <MasterDataLoadingState description="Inventory raw material sedang dimuat dari backend." />
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
