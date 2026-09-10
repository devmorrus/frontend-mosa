import { useEffect, useState } from 'react'
import { ClipboardCheck, Eye, LoaderCircle } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { productsApi } from '@/api/products.api'
import { productionOrdersApi } from '@/api/productionOrders.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { productionDeviationsApi } from '@/features/production-deviations/api'
import { DeviationStatusBadge } from '@/features/production-deviations/components/DeviationStatusBadge'
import type { ProductionDeviationListItem, ProductionDeviationQueryState } from '@/features/production-deviations/types'
import { DEFAULT_DEVIATION_QUERY, validateDeviationQuery } from '@/features/production-deviations/validation'
import { MasterDataEmptyState, MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import { EMPTY_PAGINATION, PAGE_SIZE_OPTIONS } from '@/features/master-data/utils'
import type { ProductListItem } from '@/features/products/types'
import type { ProductionOrderListItem } from '@/features/production-orders/types'
import type { ApiError } from '@/types/api'

function readQuery(params: URLSearchParams): ProductionDeviationQueryState {
  const status = params.get('status')
  return { ...DEFAULT_DEVIATION_QUERY, status: status === 'APPROVED' || status === 'REJECTED' || status === 'CANCELLED' ? status : 'PENDING_APPROVAL', productionOrderId: params.get('productionOrderId') ?? '', productId: params.get('productId') ?? '', requestedAtFrom: params.get('from') ?? '', requestedAtTo: params.get('to') ?? '', search: params.get('search') ?? '', page: Math.max(1, Number(params.get('page')) || 1), pageSize: PAGE_SIZE_OPTIONS.includes(Number(params.get('pageSize'))) ? Number(params.get('pageSize')) : 10 }
}

function formatDate(value: string) { return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }
function quantity(value: number, uom: string) { return `${value} ${uom}` }

async function loadAllProductionOrders() {
  const orders: ProductionOrderListItem[] = []
  let page = 1
  let hasNextPage = true
  while (hasNextPage) {
    const result = await productionOrdersApi.list({ search: '', status: 'ALL', page, pageSize: 100 })
    orders.push(...result.items)
    hasNextPage = result.pagination.hasNextPage
    page += 1
  }
  return orders
}

export function ProductionDeviationQueuePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(() => readQuery(searchParams))
  const [items, setItems] = useState<ProductionDeviationListItem[]>([])
  const [pagination, setPagination] = useState(EMPTY_PAGINATION)
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [orders, setOrders] = useState<ProductionOrderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)
  const validationError = validateDeviationQuery(query)

  useEffect(() => { void Promise.all([productsApi.listActiveOptions(), loadAllProductionOrders()]).then(([productItems, orderItems]) => { setProducts(productItems); setOrders(orderItems) }).catch(() => { setProducts([]); setOrders([]) }) }, [])
  useEffect(() => {
    const params = new URLSearchParams({ status: query.status, page: String(query.page), pageSize: String(query.pageSize) })
    if (query.productionOrderId) params.set('productionOrderId', query.productionOrderId)
    if (query.productId) params.set('productId', query.productId)
    if (query.requestedAtFrom) params.set('from', query.requestedAtFrom)
    if (query.requestedAtTo) params.set('to', query.requestedAtTo)
    if (query.search) params.set('search', query.search)
    setSearchParams(params, { replace: true })
  }, [query, setSearchParams])
  useEffect(() => {
    if (validationError) return
    let active = true
    setError(null); setRefreshing(items.length > 0); setLoading(items.length === 0)
    void productionDeviationsApi.list(query).then((result) => { if (active) { setItems(result.items); setPagination(result.pagination); setLastUpdatedAt(new Date().toLocaleString('id-ID')) } }).catch((caught: ApiError) => active && setError(caught.message)).finally(() => active && (setLoading(false), setRefreshing(false)))
    return () => { active = false }
  }, [query, validationError, refreshTick])

  useEffect(() => {
    const interval = window.setInterval(() => setRefreshTick((t) => t + 1), 15000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') setRefreshTick((t) => t + 1)
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [])

  const change = (patch: Partial<ProductionDeviationQueryState>) => setQuery((current) => ({ ...current, ...patch, page: patch.page ?? 1 }))
  if (loading) return <MasterDataLoadingState description="Memuat deviation approval queue dari backend." />
  if (error) return <MasterDataErrorState description={error} onRetry={() => setQuery((current) => ({ ...current }))} />
  return <div className="space-y-6" data-tour="deviation-queue"><div className="flex flex-wrap items-center gap-3"><Button variant="secondary" disabled={refreshing} onClick={() => setRefreshTick((t) => t + 1)}>{refreshing ? 'Menyegarkan...' : 'Refresh queue'}</Button>{lastUpdatedAt ? <span className="text-xs text-slate-500">Terakhir diperbarui {lastUpdatedAt} · auto-refresh 15 detik</span> : <span className="text-xs text-slate-500">auto-refresh 15 detik</span>}</div><section className="relative overflow-hidden rounded-[30px] bg-ink px-6 py-7 text-paper sm:px-8"><div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-signal"><ClipboardCheck size={15} />Supervisor Queue</div><h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Deviation Approval Queue</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-paper/65">Review actual material consumption beserta konteks produksi sebelum mengambil keputusan.</p></div><div className="rounded-2xl border border-paper/15 bg-paper/10 p-4"><div className="text-xs uppercase tracking-wide text-paper/60">Pending deviations</div><div className="mt-1 text-3xl font-semibold">{query.status === 'PENDING_APPROVAL' ? pagination.totalItems : '-'}</div></div></div></section>
    <Card><CardContent className="grid gap-3 py-5 lg:grid-cols-3"><Input value={query.search} onChange={(event) => change({ search: event.target.value })} placeholder="Cari PO, product, material, atau operator" /><select value={query.status} onChange={(event) => change({ status: event.target.value as ProductionDeviationQueryState['status'] })} className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-sm"><option value="PENDING_APPROVAL">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option><option value="CANCELLED">Cancelled</option></select><select value={query.productId} onChange={(event) => change({ productId: event.target.value })} className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-sm"><option value="">Semua Product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.code} - {product.name}</option>)}</select><select value={query.productionOrderId} onChange={(event) => change({ productionOrderId: event.target.value })} className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-sm"><option value="">Semua Production Order</option>{orders.map((order) => <option key={order.id} value={order.id}>{order.productionOrderNumber}</option>)}</select><Input type="date" value={query.requestedAtFrom} onChange={(event) => change({ requestedAtFrom: event.target.value })} /><Input type="date" value={query.requestedAtTo} onChange={(event) => change({ requestedAtTo: event.target.value })} /><select value={query.pageSize} onChange={(event) => change({ pageSize: Number(event.target.value) })} className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-sm">{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size} / halaman</option>)}</select></CardContent></Card>
    {validationError ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{validationError}</p> : null}
    {items.length === 0 ? <MasterDataEmptyState description="Tidak ada deviation yang sesuai dengan filter." /> : <Card><CardHeader><div className="flex items-center justify-between"><div><CardTitle>Deviation List</CardTitle><CardDescription>Target, actual, variance, operator, dan status keputusan.</CardDescription></div>{refreshing ? <LoaderCircle className="animate-spin text-slate-400" size={18} /> : null}</div></CardHeader><CardContent className="px-0 pb-0"><div className="overflow-x-auto"><table className="min-w-full text-left"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{['PO / Product', 'Step / Material', 'Operator', 'Target', 'Actual', 'Variance', 'Requested', 'Status', ''].map((label) => <th key={label} className="px-5 py-3">{label}</th>)}</tr></thead><tbody>{items.map((item, index) => <tr key={item.id} data-tour={index === 0 ? 'deviation-queue-row' : undefined} className="border-t border-slate-100 text-sm"><td className="px-5 py-4 font-semibold text-ink">{item.productionOrderNumber}<div className="mt-1 font-normal text-slate-500">{item.productCode} - {item.productName}</div></td><td className="px-5 py-4">{item.stepName}<div className="mt-1 text-slate-500">{item.rawMaterialName}</div></td><td className="px-5 py-4">{item.requestedBy}</td><td className="px-5 py-4">{quantity(item.targetQuantity, item.unitOfMeasureSymbol)}</td><td className="px-5 py-4">{quantity(item.actualQuantity, item.unitOfMeasureSymbol)}</td><td className="px-5 py-4">{quantity(item.varianceQuantity, item.unitOfMeasureSymbol)}</td><td className="px-5 py-4 text-slate-500">{formatDate(item.requestedAtUtc)}</td><td className="px-5 py-4"><DeviationStatusBadge status={item.status} /></td><td className="px-5 py-4"><Button asChild size="sm" variant="secondary"><Link to={`/production/deviations/${item.id}`}><Eye size={15} />Review</Link></Button></td></tr>)}</tbody></table></div><MasterDataPagination pagination={pagination} onPageChange={(page) => change({ page })} /></CardContent></Card>}</div>
}
