import { useDeferredValue, useEffect, useState } from 'react'
import { LoaderCircle, PackageSearch } from 'lucide-react'
import { Link } from 'react-router-dom'
import { goodsReceivingsApi } from '@/api/goodsReceivings.api'
import { suppliersApi } from '@/api/suppliers.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import {
  PAGE_SIZE_OPTIONS,
  EMPTY_PAGINATION,
} from '@/features/master-data/utils'
import type {
  GoodsReceivingListItem,
  GoodsReceivingQueryState,
} from '@/features/goods-receivings/types'
import { formatDateLabel } from '@/features/goods-receivings/utils'
import { useAuth } from '@/hooks/useAuth'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'
import type { SupplierListItem } from '@/features/suppliers/types'
import type { WarehouseListItem } from '@/features/warehouses/types'
import type { ApiError } from '@/types/api'

const DEFAULT_QUERY: GoodsReceivingQueryState = {
  search: '',
  status: 'ALL',
  supplierId: '',
  warehouseId: '',
  dateFrom: '',
  dateTo: '',
  page: 1,
  pageSize: 10,
}

const STATUS_OPTIONS: Array<{ label: string; value: GoodsReceivingQueryState['status'] }> = [
  { label: 'Semua status', value: 'ALL' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Posted', value: 'POSTED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export function GoodsReceivingsPage() {
  const { can } = useAuth()
  const [query, setQuery] = useState<GoodsReceivingQueryState>(DEFAULT_QUERY)
  const [searchInput, setSearchInput] = useState('')
  const deferredSearch = useDeferredValue(searchInput)
  const [items, setItems] = useState<GoodsReceivingListItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const [suppliers, setSuppliers] = useState<SupplierListItem[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([])
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

  useEffect(() => {
    async function loadFilters() {
      try {
        const [supplierOptions, warehouseOptions] = await Promise.all([
          suppliersApi.listOptions('ALL'),
          warehousesApi.listOptions('ALL'),
        ])
        setSuppliers(supplierOptions)
        setWarehouses(warehouseOptions)
      } catch {
        // keep list usable even if filter lookup partially fails
      }
    }

    void loadFilters()
  }, [])

  async function loadData(nextQuery = query, background = false) {
    if (background) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    setError(null)

    try {
      const result = await goodsReceivingsApi.list(nextQuery)
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
              <PackageSearch size={14} className="text-signal" />
              Goods Receiving
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Penerimaan bahan baku yang siap dicatat user warehouse
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Kelola draft receiving dari pencarian sampai edit ulang, dengan filter backend dan
              layout yang tetap nyaman dipakai di tablet.
            </p>
          </div>

          <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
            <CardContent className="p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">
                Total receiving
              </div>
              <div className="mt-2 font-display text-3xl font-semibold text-paper">
                {pagination.totalItems}
              </div>
              <p className="mt-1 text-sm text-paper/60">Daftar mengikuti pagination backend secara penuh.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-3 rounded-[28px] border border-white/70 bg-white/85 p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
          <Input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Cari receiving number, supplier, warehouse, atau notes"
            className="h-12 rounded-2xl"
          />
          <select
            value={query.status}
            onChange={(event) =>
              setQuery((current) => ({
                ...current,
                status: event.target.value as GoodsReceivingQueryState['status'],
                page: 1,
              }))
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={query.pageSize}
            onChange={(event) =>
              setQuery((current) => ({
                ...current,
                pageSize: Number(event.target.value),
                page: 1,
              }))
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
          >
            {PAGE_SIZE_OPTIONS.map((value) => (
              <option key={value} value={value}>
                {value} / halaman
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto_auto]">
          <select
            value={query.supplierId}
            onChange={(event) =>
              setQuery((current) => ({ ...current, supplierId: event.target.value, page: 1 }))
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
          >
            <option value="">Semua supplier</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </select>
          <select
            value={query.warehouseId}
            onChange={(event) =>
              setQuery((current) => ({ ...current, warehouseId: event.target.value, page: 1 }))
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
          >
            <option value="">Semua warehouse</option>
            {warehouses.map((warehouse) => (
              <option key={warehouse.id} value={warehouse.id}>
                {warehouse.name}
              </option>
            ))}
          </select>
          <Input
            type="date"
            value={query.dateFrom}
            onChange={(event) =>
              setQuery((current) => ({ ...current, dateFrom: event.target.value, page: 1 }))
            }
            className="h-12 rounded-2xl"
          />
          <Input
            type="date"
            value={query.dateTo}
            onChange={(event) =>
              setQuery((current) => ({ ...current, dateTo: event.target.value, page: 1 }))
            }
            className="h-12 rounded-2xl"
          />
          {can('receiving.create') ? (
            <Button asChild className="h-12 whitespace-nowrap" data-tour="receiving-add-btn">
              <Link to="/goods-receiving/create" data-tour="receiving-add-btn">Create Receiving</Link>
            </Button>
          ) : (
            <div className="hidden xl:block" />
          )}
        </div>
      </div>

      {isLoading ? (
        <MasterDataLoadingState description="Daftar goods receiving sedang dimuat dari backend." />
      ) : error ? (
        <MasterDataErrorState description={error} onRetry={() => void loadData(query)} />
      ) : items.length === 0 ? (
        <MasterDataEmptyState
          description="Belum ada goods receiving yang cocok dengan filter saat ini."
          action={
            can('receiving.create') ? (
              <Button asChild>
                <Link to="/goods-receiving/create">Buat draft pertama</Link>
              </Button>
            ) : null
          }
        />
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle>Receiving List</CardTitle>
              <p className="mt-2 text-sm text-slate-500">
                {pagination.totalItems} dokumen receiving terdaftar pada sistem.
              </p>
            </div>
            {isRefreshing ? (
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
                <LoaderCircle size={14} className="animate-spin" />
                Menyegarkan data...
              </div>
            ) : null}
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/80 text-left">
                    {['Receiving No', 'Date', 'Supplier', 'Warehouse', 'Items', 'Status', 'Created By', 'Action'].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const isDraft = item.status === 'DRAFT'
                    const canEditDraft = isDraft && can('receiving.update')

                    return (
                      <tr key={item.id} className="border-b border-slate-200/70 bg-white">
                        <td className="px-6 py-4 text-sm font-semibold text-ink">{item.receivingNumber}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{formatDateLabel(item.receivingDate)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.supplierName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.warehouseName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.itemsCount}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                            {item.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.createdBy ?? '-'}</td>
                        <td className="px-6 py-4 text-right">
                          <Button asChild variant="secondary" size="sm">
                            <Link to={`/goods-receiving/${item.id}`}>
                              {canEditDraft ? 'Edit Draft' : 'View Detail'}
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
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
