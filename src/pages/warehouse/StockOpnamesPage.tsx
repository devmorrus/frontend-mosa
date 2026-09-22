import { useDeferredValue, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, ClipboardCheck, Eye, Filter, LoaderCircle, Plus, RotateCcw, Search } from 'lucide-react'
import { stockOpnamesApi } from '@/api/stockOpnames.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ModuleHero } from '@/components/common/ModuleHero'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MasterDataEmptyState, MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'
import { EMPTY_PAGINATION } from '@/features/master-data/utils'
import type { StockOpnameListItem, StockOpnameQueryState, StockOpnameStatus } from '@/features/stock-opname/types'
import { emptyStockOpnameQuery, validateStockOpnameQuery } from '@/features/stock-opname/validation'
import { getStockOpnameStatusLabel, getStockOpnameStatusTone, getStockOpnameVarianceTone } from '@/features/stock-opname/utils'
import type { WarehouseListItem } from '@/features/warehouses/types'
import { useAuth } from '@/hooks/useAuth'
import { breadcrumbs, canonicalRoutes, entityLinks } from '@/routes/canonicalRoutes'
import { fetchLookupIfAllowed } from '@/utils/lookupGuard'
import type { ApiError } from '@/types/api'

const statuses: Array<'ALL' | StockOpnameStatus> = ['ALL', 'DRAFT', 'INPROGRESS', 'READYTOPOST', 'POSTED', 'CANCELLED']

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'
}

function formatNumber(value: number | null) {
  return value === null ? '-' : new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value)
}

function StatusBadge({ status }: { status: StockOpnameStatus }) {
  return <Badge className={getStockOpnameStatusTone(status)}>{getStockOpnameStatusLabel(status)}</Badge>
}

export function StockOpnamesPage() {
  const { can } = useAuth()
  const canCreateOpname = can('stock-opname.create')
  const [query, setQuery] = useState<StockOpnameQueryState>(emptyStockOpnameQuery)
  const [searchInput, setSearchInput] = useState('')
  const deferredSearch = useDeferredValue(searchInput)
  const [items, setItems] = useState<StockOpnameListItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [filterError, setFilterError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQuery((current) => current.search === deferredSearch.trim() ? current : { ...current, search: deferredSearch.trim(), page: 1 })
    }, 350)
    return () => window.clearTimeout(timeoutId)
  }, [deferredSearch])

  useEffect(() => {
    void fetchLookupIfAllowed('warehouses.view', () => warehousesApi.listOptions('ALL'), []).then(setWarehouses).catch(() => setWarehouses([]))
  }, [])

  async function loadData(nextQuery = query, background = false) {
    const validation = validateStockOpnameQuery(nextQuery)
    setFilterError(validation.errors[0] ?? null)
    if (!validation.isValid) return
    if (background) setIsRefreshing(true)
    else setIsLoading(true)
    setError(null)
    try {
      const result = await stockOpnamesApi.list(validation.normalized)
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

  const hasActiveFilter = Boolean(query.search || query.status !== 'ALL' || query.warehouseId || query.dateFrom || query.dateTo)
  const inProgressCount = items.filter((item) => item.status === 'INPROGRESS').length
  const readyCount = items.filter((item) => item.status === 'READYTOPOST').length
  const varianceLineCount = items.reduce((total, item) => total + item.varianceLines, 0)

  function resetFilters() {
    setSearchInput('')
    setQuery(emptyStockOpnameQuery)
  }

  return (
    <div className="space-y-6" data-tour="opname-queue">
      <Breadcrumb items={breadcrumbs.stockOpnameList()} />
      <ModuleHero
        eyebrow="Warehouse • Stock Opname"
        title="Stock Opname"
        description="Kelola physical counting, review variance, dan posting correction inventory raw material."
        icon={<ClipboardCheck size={13} className="text-signal" />}
        metrics={[
          { label: 'Documents', value: pagination.totalItems, sub: 'Hasil filter' },
          { label: 'In Progress', value: inProgressCount, sub: 'Page aktif', tone: 'success' },
          { label: 'Variance', value: varianceLineCount, sub: 'Page aktif' },
          { label: 'Ready', value: readyCount, sub: 'Page aktif' },
        ]}
        actions={canCreateOpname ? <Button asChild className="bg-white text-[#062f75] hover:bg-blue-50" data-tour="opname-create-btn"><Link to={`${canonicalRoutes.stockOpname}/create`}><Plus size={16} />Create Opname</Link></Button> : undefined}
      />

      <Card className="border-slate-200 bg-white shadow-sm"><CardContent className="p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><Filter size={17} className="text-[#0b5ed7]" /><h2 className="text-sm font-semibold text-ink">Filter Stock Opname</h2></div><p className="mt-1 text-xs text-slate-500">Persempit dokumen berdasarkan nomor, warehouse, status, dan tanggal.</p></div><Button type="button" variant="secondary" size="sm" onClick={resetFilters} className="w-fit gap-1.5 text-slate-500"><RotateCcw size={13} />Reset filter</Button></div>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_minmax(180px,0.7fr)_minmax(180px,0.7fr)]"><label className="relative block"><span className="sr-only">Cari stock opname</span><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Cari stock opname" className="h-12 w-full rounded-2xl border border-slate-200 pl-11 pr-4 text-sm outline-none focus:border-[#0b5ed7] focus:ring-4 focus:ring-blue-100" placeholder="Cari nomor opname atau warehouse" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} /></label><SelectField label="Status" value={query.status} onChange={(value) => setQuery((current) => ({ ...current, status: value as StockOpnameQueryState['status'], page: 1 }))}>{statuses.map((status) => <option key={status} value={status}>{status === 'ALL' ? 'Semua status' : getStockOpnameStatusLabel(status)}</option>)}</SelectField><SelectField label="Warehouse" value={query.warehouseId} onChange={(value) => setQuery((current) => ({ ...current, warehouseId: value, page: 1 }))}><option value="">Semua warehouse</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</SelectField></div>
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400"><CalendarDays size={14} className="text-[#0b5ed7]" />Tanggal opname</div><div className="mt-2 grid gap-3 sm:grid-cols-2"><DateField label="Tanggal dari" value={query.dateFrom} onChange={(value) => setQuery((current) => ({ ...current, dateFrom: value, page: 1 }))} /><DateField label="Tanggal sampai" value={query.dateTo} onChange={(value) => setQuery((current) => ({ ...current, dateTo: value, page: 1 }))} /></div>
        {filterError ? <p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{filterError}</p> : null}
      </CardContent></Card>

      {isLoading ? <MasterDataLoadingState description="Stock opname sedang dimuat." /> : error ? <MasterDataErrorState description={error} onRetry={() => void loadData(query)} /> : items.length === 0 ? <MasterDataEmptyState description={hasActiveFilter ? 'Tidak ada stock opname yang cocok dengan filter saat ini.' : 'Belum ada dokumen stock opname.'} action={canCreateOpname ? <Button asChild><Link to={`${canonicalRoutes.stockOpname}/create`}>Create Opname</Link></Button> : undefined} /> : <StockOpnameResults items={items} pagination={pagination} isRefreshing={isRefreshing} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} />}
    </div>
  )
}

function StockOpnameResults({ items, pagination, isRefreshing, onPageChange }: { items: StockOpnameListItem[]; pagination: PaginationMeta; isRefreshing: boolean; onPageChange: (page: number) => void }) {
  return <Card className="overflow-hidden border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink"><ClipboardCheck size={19} className="text-[#0b5ed7]" />Opname queue</h2><p className="mt-1 text-sm text-slate-500">{pagination.totalItems} dokumen ditemukan. Variance perlu diverifikasi sebelum posting.</p></div>{isRefreshing ? <span className="inline-flex items-center gap-2 text-xs text-slate-500"><LoaderCircle size={13} className="animate-spin" />Menyegarkan data...</span> : null}</div><div className="hidden overflow-x-auto md:block"><table className="min-w-[1050px] text-left text-sm"><thead className="bg-slate-50/80 text-xs uppercase tracking-[0.12em] text-slate-500"><tr>{['Opname', 'Warehouse', 'Date', 'Total LOT', 'Variance', 'Status', 'Created by', 'Posted by', 'Action'].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-b border-slate-200/70 transition-colors hover:bg-blue-50/30"><td className="px-4 py-4 font-semibold text-[#063b8c]">{item.stockOpnameNumber}</td><td className="px-4 py-4"><div className="font-medium text-ink">{item.warehouseName}</div><div className="text-xs text-slate-500">{item.warehouseCode}</div></td><td className="whitespace-nowrap px-4 py-4 text-slate-600">{formatDate(item.opnameDate)}</td><td className="px-4 py-4 tabular-nums">{item.itemsCount}</td><td className="px-4 py-4"><Badge className={getStockOpnameVarianceTone(item.varianceLines)}>{item.varianceLines} lines{item.totalVariance !== null ? ` · ${formatNumber(item.totalVariance)}` : ''}</Badge></td><td className="px-4 py-4"><StatusBadge status={item.status} /></td><td className="px-4 py-4 text-slate-600">{item.createdBy ?? '-'}</td><td className="px-4 py-4 text-slate-600">{item.postedBy ?? '-'}</td><td className="px-4 py-4"><Button asChild size="sm" variant="secondary"><Link to={entityLinks.stockOpnameDetail(item.id)}><Eye size={15} />Open</Link></Button></td></tr>)}</tbody></table></div><div className="space-y-3 px-4 py-4 md:hidden">{items.map((item) => <MobileStockOpnameCard key={item.id} item={item} />)}</div><MasterDataPagination pagination={pagination} onPageChange={onPageChange} /></Card>
}

function MobileStockOpnameCard({ item }: { item: StockOpnameListItem }) {
  return <article className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-[#063b8c]">{item.stockOpnameNumber}</p><p className="mt-1 text-xs text-slate-500">{formatDate(item.opnameDate)}</p></div><StatusBadge status={item.status} /></div><div className="mt-4"><p className="font-medium text-ink">{item.warehouseName}</p><p className="text-xs text-slate-500">{item.warehouseCode}</p></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-slate-400">Total LOT</dt><dd className="mt-0.5 font-semibold tabular-nums">{item.itemsCount}</dd></div><div><dt className="text-xs text-slate-400">Variance lines</dt><dd className="mt-0.5"><Badge className={getStockOpnameVarianceTone(item.varianceLines)}>{item.varianceLines}</Badge></dd></div><div><dt className="text-xs text-slate-400">Created by</dt><dd className="mt-0.5 truncate font-medium">{item.createdBy ?? '-'}</dd></div><div><dt className="text-xs text-slate-400">Posted by</dt><dd className="mt-0.5 truncate font-medium">{item.postedBy ?? '-'}</dd></div></dl><Button asChild variant="secondary" className="mt-4 w-full"><Link to={entityLinks.stockOpnameDetail(item.id)}><Eye size={15} />Open detail</Link></Button></article>
}

function SelectField({ label, value, onChange, children }: { label: string; value: string; onChange: (value: string) => void; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span><select aria-label={label} value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#0b5ed7] focus:ring-4 focus:ring-blue-100">{children}</select></label>
}

function DateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-1.5 block text-xs font-medium text-slate-500">{label}</span><input aria-label={label} type="date" value={value} onChange={(event) => onChange(event.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-[#0b5ed7] focus:ring-4 focus:ring-blue-100" /></label>
}
