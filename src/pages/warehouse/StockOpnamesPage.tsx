import { useDeferredValue, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ClipboardCheck, Eye, LoaderCircle, Plus } from 'lucide-react'
import { stockOpnamesApi } from '@/api/stockOpnames.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MasterDataEmptyState, MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'
import { EMPTY_PAGINATION } from '@/features/master-data/utils'
import type { StockOpnameListItem, StockOpnameQueryState, StockOpnameStatus } from '@/features/stock-opname/types'
import { emptyStockOpnameQuery } from '@/features/stock-opname/validation'
import type { WarehouseListItem } from '@/features/warehouses/types'
import type { ApiError } from '@/types/api'

const statuses: Array<'ALL' | StockOpnameStatus> = ['ALL', 'DRAFT', 'INPROGRESS', 'READYTOPOST', 'POSTED', 'CANCELLED']

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('id-ID') : '-'
}

function StatusBadge({ status }: { status: StockOpnameStatus }) {
  const className = status === 'POSTED'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : status === 'CANCELLED'
      ? 'bg-slate-100 text-slate-500 border-slate-200'
      : status === 'READYTOPOST'
        ? 'bg-amber-50 text-amber-700 border-amber-200'
        : 'bg-blue-50 text-blue-700 border-blue-200'
  return <Badge className={className}>{status}</Badge>
}

export function StockOpnamesPage() {
  const [query, setQuery] = useState<StockOpnameQueryState>(emptyStockOpnameQuery)
  const [searchInput, setSearchInput] = useState('')
  const deferredSearch = useDeferredValue(searchInput)
  const [items, setItems] = useState<StockOpnameListItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQuery((current) => current.search === deferredSearch.trim() ? current : { ...current, search: deferredSearch.trim(), page: 1 })
    }, 350)
    return () => window.clearTimeout(timeoutId)
  }, [deferredSearch])

  useEffect(() => {
    void warehousesApi.listOptions('ALL').then(setWarehouses).catch(() => setWarehouses([]))
  }, [])

  async function loadData(nextQuery = query, background = false) {
    if (background) setIsRefreshing(true)
    else setIsLoading(true)
    setError(null)
    try {
      const result = await stockOpnamesApi.list(nextQuery)
      setItems(result.items)
      setPagination(result.pagination)
    } catch (caughtError) {
      setError((caughtError as ApiError).message)
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
    <div className="space-y-6" data-tour="opname-queue">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <ClipboardCheck size={14} className="text-signal" /> Stock Opname
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">Physical count raw material LOT</h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68">Buat opname, isi physical count, review variance, lalu post correction ke inventory.</p>
          </div>
          <Button asChild className="bg-signal text-ink hover:bg-signal/90" data-tour="opname-create-btn">
            <Link to="/warehouse/stock-opname/create"><Plus size={16} />Create Opname</Link>
          </Button>
        </div>
      </section>

      <Card className="rounded-[28px] border-slate-200/80">
        <CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
          <input className="h-11 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Cari nomor, warehouse, notes" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
          <select className="h-11 rounded-2xl border border-slate-200 px-4 text-sm" value={query.warehouseId} onChange={(event) => setQuery((current) => ({ ...current, warehouseId: event.target.value, page: 1 }))}>
            <option value="">Semua warehouse</option>
            {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
          </select>
          <select className="h-11 rounded-2xl border border-slate-200 px-4 text-sm" value={query.status} onChange={(event) => setQuery((current) => ({ ...current, status: event.target.value as StockOpnameQueryState['status'], page: 1 }))}>
            {statuses.map((status) => <option key={status} value={status}>{status === 'ALL' ? 'Semua status' : status}</option>)}
          </select>
          <input type="date" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm" value={query.dateFrom} onChange={(event) => setQuery((current) => ({ ...current, dateFrom: event.target.value, page: 1 }))} />
          <input type="date" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm" value={query.dateTo} onChange={(event) => setQuery((current) => ({ ...current, dateTo: event.target.value, page: 1 }))} />
        </CardContent>
      </Card>

      {isLoading ? <MasterDataLoadingState description="Stock opname sedang dimuat." /> : error ? <MasterDataErrorState description={error} onRetry={() => void loadData(query)} /> : items.length === 0 ? <MasterDataEmptyState description="Belum ada stock opname." action={<Button asChild><Link to="/warehouse/stock-opname/create">Create Opname</Link></Button>} /> : (
        <Card className="overflow-hidden rounded-[28px] border-slate-200/80">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>{['Opname Number', 'Warehouse', 'Date', 'Total LOT', 'Variance Lines', 'Status', 'Created By', 'Posted By', 'Action'].map((label) => <th key={label} className="px-5 py-3">{label}</th>)}</tr>
              </thead>
              <tbody>
                {items.map((item) => <tr key={item.id} className="border-t border-slate-100">
                  <td className="px-5 py-4 font-semibold text-ink">{item.stockOpnameNumber}</td>
                  <td className="px-5 py-4">{item.warehouseName}<div className="text-xs text-slate-400">{item.warehouseCode}</div></td>
                  <td className="px-5 py-4">{formatDate(item.opnameDate)}</td>
                  <td className="px-5 py-4">{item.itemsCount}</td>
                  <td className="px-5 py-4">{item.varianceLines}</td>
                  <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                  <td className="px-5 py-4">{item.createdBy ?? '-'}</td>
                  <td className="px-5 py-4">{item.postedBy ?? '-'}</td>
                  <td className="px-5 py-4"><Button asChild size="sm" variant="secondary"><Link to={`/warehouse/stock-opname/${item.id}`}><Eye size={15} />Open</Link></Button></td>
                </tr>)}
              </tbody>
            </table>
          </div>
          <MasterDataPagination pagination={pagination} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} />
        </Card>
      )}
      {isRefreshing ? <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500"><LoaderCircle size={14} className="animate-spin" />Menyegarkan data...</div> : null}
    </div>
  )
}
