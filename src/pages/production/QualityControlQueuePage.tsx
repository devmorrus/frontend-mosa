import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { qcApi } from '@/api/qc.api'
import { productsApi } from '@/api/products.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import { MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import type { ProductListItem } from '@/features/products/types'
import type { QcPaged, QcQuery, QcQueueItem } from '@/features/quality-control/types'

const initial: QcQuery = { search: '', productId: '', productionOrderId: '', status: 'WAITING_QC', from: '', to: '', page: 1, pageSize: 10 }

export function QualityControlQueuePage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState(initial)
  const [data, setData] = useState<QcPaged<QcQueueItem> | null>(null)
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)

  const loadQueue = useCallback(async (background = false) => {
    if (background && !data) return
    if (background) setIsRefreshing(true)
    setError(null)
    try {
      const result = await qcApi.list(query)
      setData(result)
      setLastUpdatedAt(new Date().toLocaleString('id-ID'))
    } catch (caught) {
      setError((caught as Error).message)
    } finally {
      setIsRefreshing(false)
    }
  }, [query, data])

  useEffect(() => {
    void productsApi.listActiveOptions().then(setProducts).catch(() => setProducts([]))
  }, [])

  useEffect(() => {
    setError(null)
    void qcApi.list(query).then((result) => {
      setData(result)
      setLastUpdatedAt(new Date().toLocaleString('id-ID'))
    }).catch((caught) => setError((caught as Error).message))
  }, [query])

  useEffect(() => {
    const interval = window.setInterval(() => void loadQueue(true), 15000)
    const onVisible = () => {
      if (document.visibilityState === 'visible') void loadQueue(true)
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [loadQueue])

  if (error) return <MasterDataErrorState description={error} onRetry={() => setQuery({ ...query })} />
  if (!data) return <MasterDataLoadingState description="Memuat QC queue." />
  const update = (value: Partial<QcQuery>) => setQuery((current) => ({ ...current, ...value, page: value.page ?? 1 }))
  return (
    <div className="space-y-6" data-tour="qc-queue">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><div className="text-xs font-semibold uppercase tracking-[.16em] text-blue-700">Quality Control</div><h1 className="mt-2 font-display text-3xl font-semibold text-ink">QC Queue</h1></div>
        <div className="flex flex-wrap items-center gap-3">
          {lastUpdatedAt ? <span className="text-xs text-slate-500">Terakhir diperbarui {lastUpdatedAt} · auto-refresh 15 detik</span> : null}
          <Button variant="secondary" disabled={isRefreshing} onClick={() => void loadQueue(true)}>{isRefreshing ? 'Menyegarkan...' : 'Refresh queue'}</Button>
        </div>
      </div>
      <Card><CardContent className="grid gap-3 p-5 md:grid-cols-3"><Input placeholder="Search FG LOT / Product / PO" value={query.search} onChange={(e) => update({ search: e.target.value })} /><select className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-sm" value={query.productId} onChange={(e) => update({ productId: e.target.value })}><option value="">Semua product</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select><select className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-sm" value={query.status} onChange={(e) => update({ status: e.target.value })}><option value="WAITING_QC">Waiting QC</option><option value="HOLD">Hold</option><option value="PASSED">Passed</option><option value="REJECTED">Rejected</option><option value="">Semua status</option></select><Input placeholder="Production Order ID / GUID / PO Number (opsional)" value={query.productionOrderId} onChange={(e) => update({ productionOrderId: e.target.value })} /><Input type="date" value={query.from} onChange={(e) => update({ from: e.target.value })} /><Input type="date" value={query.to} onChange={(e) => update({ to: e.target.value })} /></CardContent></Card>
      <Card><CardHeader><CardTitle>{query.status === 'WAITING_QC' ? `Waiting QC (${data.pagination.totalItems})` : 'QC Queue'}</CardTitle></CardHeader><CardContent className="p-0"><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-4">FG LOT</th><th className="p-4">Product</th><th className="p-4">PO</th><th className="p-4">Actual</th><th className="p-4">Production Date</th><th className="p-4">Status</th><th className="p-4" /></tr></thead><tbody>{data.items.map((item, index) => <tr key={item.finishedGoodsLotId} data-tour={index === 0 ? 'qc-queue-row' : undefined} className="border-t"><td className="p-4 font-semibold">{item.lotNumber}</td><td className="p-4">{item.productName}</td><td className="p-4">{item.productionOrderNumber}</td><td className="p-4">{item.actualOutput} {item.uomSymbol}</td><td className="p-4">{new Date(item.productionDate).toLocaleDateString('id-ID')}</td><td className="p-4">{item.qcStatus}</td><td className="p-4"><Button size="sm" onClick={() => navigate(`/quality-control/${item.finishedGoodsLotId}`)}>Inspect</Button></td></tr>)}{!data.items.length ? <tr><td colSpan={7} className="p-10 text-center text-slate-500">Tidak ada batch pada queue.</td></tr> : null}</tbody></table></div><MasterDataPagination pagination={data.pagination} onPageChange={(page) => update({ page })} /></CardContent></Card>
    </div>
  )
}
