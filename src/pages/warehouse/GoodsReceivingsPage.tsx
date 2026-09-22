import { useDeferredValue, useEffect, useState } from 'react'
import {
  ArrowUpRight,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Filter,
  LoaderCircle,
  PackageSearch,
  RotateCcw,
  Search,
  Truck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppPagination } from '@/components/common/AppPagination'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ModuleHero } from '@/components/common/ModuleHero'
import { StatusBadge } from '@/components/common/StatusBadge'
import { breadcrumbs, entityLinks } from '@/routes/canonicalRoutes'
import { goodsReceivingsApi } from '@/api/goodsReceivings.api'
import { suppliersApi } from '@/api/suppliers.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import { fetchLookupIfAllowed } from '@/utils/lookupGuard'
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
          fetchLookupIfAllowed('suppliers.view', () => suppliersApi.listOptions('ALL'), []),
          fetchLookupIfAllowed('warehouses.view', () => warehousesApi.listOptions('ALL'), []),
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
      <Breadcrumb items={breadcrumbs.receivingList()} />
      <ModuleHero
        eyebrow="Warehouse • Receiving"
        title="Goods Receiving"
        description="Catat penerimaan bahan baku, kelola draft, dan lanjutkan posting saat data siap."
        icon={<PackageSearch size={13} className="text-signal" />}
        metrics={[{ label: 'Total', value: pagination.totalItems, sub: 'Dokumen' }]}
      />

      <div className="rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter size={17} className="text-[#0b5ed7]" />
            <h2 className="text-sm font-semibold text-ink">Filter receiving</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setQuery(DEFAULT_QUERY)
              setSearchInput('')
            }}
            className="inline-flex w-fit items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-[#063b8c]"
          >
            <RotateCcw size={13} />
            Reset filter
          </button>
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(170px,0.7fr)_minmax(170px,0.7fr)]">
          <div className="relative">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Cari nomor, supplier, warehouse..."
              className="h-12 rounded-2xl pl-11"
            />
          </div>
          <label className="relative">
            <span className="sr-only">Status</span>
            <select
              value={query.status}
              onChange={(event) => setQuery((current) => ({ ...current, status: event.target.value as GoodsReceivingQueryState['status'], page: 1 }))}
              className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm text-ink outline-none transition-all focus:border-[#0b5ed7] focus:ring-4 focus:ring-blue-100"
            >
              {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </label>
          <label className="relative">
            <span className="sr-only">Jumlah per halaman</span>
            <select
              value={query.pageSize}
              onChange={(event) => setQuery((current) => ({ ...current, pageSize: Number(event.target.value), page: 1 }))}
              className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm text-ink outline-none transition-all focus:border-[#0b5ed7] focus:ring-4 focus:ring-blue-100"
            >
              {PAGE_SIZE_OPTIONS.map((value) => <option key={value} value={value}>{value} / halaman</option>)}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </label>
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)_auto]">
          <select
            value={query.supplierId}
            onChange={(event) =>
              setQuery((current) => ({ ...current, supplierId: event.target.value, page: 1 }))
            }
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-[#0b5ed7] focus:ring-4 focus:ring-blue-100"
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
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-[#0b5ed7] focus:ring-4 focus:ring-blue-100"
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
            <Button asChild className="h-12 whitespace-nowrap bg-[#063b8c] hover:bg-[#052f70]" data-tour="receiving-add-btn">
              <Link to="/goods-receiving/create" data-tour="receiving-add-btn">Create Receiving</Link>
            </Button>
          ) : (
            <div className="hidden xl:block" />
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5"><Truck size={13} /> Supplier & warehouse</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5"><CalendarDays size={13} /> Rentang tanggal</span>
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
          <CardHeader className="flex flex-col gap-3 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><ClipboardList size={18} className="text-[#0b5ed7]" /> Receiving List</CardTitle>
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
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-slate-50/80 text-left">
                    {['Receiving No', 'Date', 'Supplier', 'Warehouse', 'Items', 'Status', 'Created By', 'Action'].map((header) => (
                      <th
                        key={header}
                        className={`px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 ${header === 'Action' ? 'text-center' : 'text-left'}`}
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
                      <tr key={item.id} className="border-b border-slate-200/70 bg-white transition-colors hover:bg-blue-50/30">
                        <td className="px-6 py-4 text-sm font-semibold text-[#063b8c]">{item.receivingNumber}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{formatDateLabel(item.receivingDate)}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.supplierName}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.warehouseName}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.itemsCount} item</td>
                        <td className="px-6 py-4 text-sm">
                          <StatusBadge domain="receiving" value={item.status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.createdBy ?? '-'}</td>
                        <td className="px-6 py-4 text-center">
                          <Button asChild variant="secondary" size="sm" className="gap-1.5">
                            <Link to={entityLinks.receivingDetail(item.id)}>
                              {canEditDraft ? 'Edit Draft' : 'View Detail'}
                              <ArrowUpRight size={14} />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="space-y-3 px-4 md:hidden">
              {items.map((item) => {
                const canEditDraft = item.status === 'DRAFT' && can('receiving.update')
                return (
                  <article key={item.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#063b8c]">{item.receivingNumber}</p>
                        <p className="mt-1 text-xs text-slate-500">{formatDateLabel(item.receivingDate)}</p>
                      </div>
                      <StatusBadge domain="receiving" value={item.status} />
                    </div>
                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                      <div><dt className="text-xs text-slate-400">Supplier</dt><dd className="mt-0.5 truncate font-medium text-ink">{item.supplierName}</dd></div>
                      <div><dt className="text-xs text-slate-400">Warehouse</dt><dd className="mt-0.5 truncate font-medium text-ink">{item.warehouseName}</dd></div>
                      <div><dt className="text-xs text-slate-400">Items</dt><dd className="mt-0.5 font-medium text-ink">{item.itemsCount} item</dd></div>
                      <div><dt className="text-xs text-slate-400">Created by</dt><dd className="mt-0.5 truncate font-medium text-ink">{item.createdBy ?? '-'}</dd></div>
                    </dl>
                    <Button asChild variant="secondary" className="mt-4 w-full justify-center gap-1.5">
                      <Link to={entityLinks.receivingDetail(item.id)}>{canEditDraft ? 'Edit Draft' : 'View Detail'}<ArrowUpRight size={14} /></Link>
                    </Button>
                  </article>
                )
              })}
            </div>
            <AppPagination
              pagination={pagination}
              onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
              onPageSizeChange={(pageSize) => setQuery((current) => ({ ...current, pageSize, page: 1 }))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
