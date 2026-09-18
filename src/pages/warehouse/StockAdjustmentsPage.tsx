import { useDeferredValue, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, LoaderCircle, Plus, SlidersHorizontal } from 'lucide-react'
import { rawMaterialLotsApi } from '@/api/rawMaterialLots.api'
import { rawMaterialsApi } from '@/api/rawMaterials.api'
import { stockAdjustmentsApi } from '@/api/stockAdjustments.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MasterDataEmptyState, MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'
import { EMPTY_PAGINATION } from '@/features/master-data/utils'
import type { RawMaterialLotListItem } from '@/features/raw-material-lots/types'
import type { RawMaterialListItem } from '@/features/raw-materials/types'
import type { StockAdjustmentListItem, StockAdjustmentQueryState } from '@/features/stock-adjustments/types'
import { emptyStockAdjustmentQuery } from '@/features/stock-adjustments/validation'
import type { WarehouseListItem } from '@/features/warehouses/types'
import { useAuth } from '@/hooks/useAuth'
import { fetchLookupIfAllowed } from '@/utils/lookupGuard'
import type { ApiError } from '@/types/api'

function formatDate(value: string | null) { return value ? new Date(value).toLocaleString('id-ID') : '-' }
function qty(value: number) { return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 }).format(value) }
function TypeBadge({ type }: { type: 'IN' | 'OUT' }) { return <Badge className={type === 'IN' ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-red-200 bg-red-50 text-red-700'}>{type}</Badge> }

export function StockAdjustmentsPage() {
  const { can } = useAuth()
  const canCreateAdjustment = can('stock-adjustments.create')
  const [query, setQuery] = useState<StockAdjustmentQueryState>(emptyStockAdjustmentQuery)
  const [searchInput, setSearchInput] = useState('')
  const deferredSearch = useDeferredValue(searchInput)
  const [items, setItems] = useState<StockAdjustmentListItem[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([])
  const [materials, setMaterials] = useState<RawMaterialListItem[]>([])
  const [lots, setLots] = useState<RawMaterialLotListItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setQuery((current) => current.search === deferredSearch.trim() ? current : { ...current, search: deferredSearch.trim(), page: 1 }), 350)
    return () => window.clearTimeout(timeoutId)
  }, [deferredSearch])

  useEffect(() => {
    async function loadLookups() {
      try {
        const [warehouseOptions, materialOptions, lotResult] = await Promise.all([
          fetchLookupIfAllowed('warehouses.view', () => warehousesApi.listOptions('ALL'), []),
          fetchLookupIfAllowed('materials.view', () => rawMaterialsApi.listActiveOptions(), []),
          fetchLookupIfAllowed('lots.view', () => rawMaterialLotsApi.list({ search: '', rawMaterialId: '', supplierId: '', warehouseId: '', status: 'ALL', expiryFrom: '', expiryTo: '', receivedDateFrom: '', receivedDateTo: '', page: 1, pageSize: 100 }), null),
        ])
        setWarehouses(warehouseOptions); setMaterials(materialOptions); setLots(lotResult?.items ?? [])
      } catch { setWarehouses([]); setMaterials([]); setLots([]) }
    }
    void loadLookups()
  }, [])

  async function loadData(nextQuery = query, background = false) {
    if (background) setIsRefreshing(true); else setIsLoading(true)
    setError(null)
    try {
      const result = await stockAdjustmentsApi.list(nextQuery)
      setItems(result.items); setPagination(result.pagination)
    } catch (caughtError) { setError((caughtError as ApiError).message) }
    finally { setIsLoading(false); setIsRefreshing(false) }
  }

  useEffect(() => { void loadData(query, items.length > 0) // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(query)])

  return <div className="space-y-6" data-tour="adjustment-queue">
    <section className="rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(6,59,140,0.16)] sm:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div><div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72"><SlidersHorizontal size={14} className="text-signal" />Stock Adjustments</div><h1 className="mt-5 font-display text-3xl font-semibold">Correction langsung per LOT</h1><p className="mt-3 max-w-xl text-sm leading-7 text-paper/68">Adjustment IN/OUT langsung memengaruhi inventory setelah konfirmasi.</p></div>{canCreateAdjustment ? <Button asChild className="bg-signal text-ink hover:bg-signal/90"><Link to="/warehouse/stock-adjustments/create" data-tour="adjustment-create-btn"><Plus size={16} />Create Adjustment</Link></Button> : null}</div>
    </section>

    <Card className="rounded-[28px] border-slate-200/80"><CardContent className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-6"><input className="h-11 rounded-2xl border border-slate-200 px-4 text-sm" placeholder="Cari adjustment, reason, reference" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} /><select className="h-11 rounded-2xl border border-slate-200 px-4 text-sm" value={query.warehouseId} onChange={(event) => setQuery((current) => ({ ...current, warehouseId: event.target.value, page: 1 }))}><option value="">Semua warehouse</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}</select><select className="h-11 rounded-2xl border border-slate-200 px-4 text-sm" value={query.rawMaterialId} onChange={(event) => setQuery((current) => ({ ...current, rawMaterialId: event.target.value, rawMaterialLotId: '', page: 1 }))}><option value="">Semua material</option>{materials.map((material) => <option key={material.id} value={material.id}>{material.name}</option>)}</select><select className="h-11 rounded-2xl border border-slate-200 px-4 text-sm" value={query.rawMaterialLotId} onChange={(event) => setQuery((current) => ({ ...current, rawMaterialLotId: event.target.value, page: 1 }))}><option value="">Semua LOT</option>{lots.filter((lot) => (!query.warehouseId || lot.warehouseId === query.warehouseId) && (!query.rawMaterialId || lot.rawMaterialId === query.rawMaterialId)).map((lot) => <option key={lot.id} value={lot.id}>{lot.internalLotNumber}</option>)}</select><select className="h-11 rounded-2xl border border-slate-200 px-4 text-sm" value={query.adjustmentType} onChange={(event) => setQuery((current) => ({ ...current, adjustmentType: event.target.value as StockAdjustmentQueryState['adjustmentType'], page: 1 }))}><option value="ALL">Semua type</option><option value="IN">IN</option><option value="OUT">OUT</option></select><input type="date" className="h-11 rounded-2xl border border-slate-200 px-4 text-sm" value={query.dateFrom} onChange={(event) => setQuery((current) => ({ ...current, dateFrom: event.target.value, page: 1 }))} /></CardContent></Card>

    {isLoading ? <MasterDataLoadingState description="Stock adjustment sedang dimuat." /> : error ? <MasterDataErrorState description={error} onRetry={() => void loadData(query)} /> : items.length === 0 ? <MasterDataEmptyState description="Belum ada stock adjustment." action={canCreateAdjustment ? <Button asChild><Link to="/warehouse/stock-adjustments/create">Create Adjustment</Link></Button> : undefined} /> : <Card className="overflow-hidden rounded-[28px] border-slate-200/80"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{['Adjustment Number', 'Warehouse', 'Material', 'LOT', 'Before', 'Type', 'Adjustment', 'After', 'Reason', 'Posted By', 'Action'].map((label) => <th key={label} className="px-5 py-3">{label}</th>)}</tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="px-5 py-4 font-semibold text-ink">{item.stockAdjustmentNumber}<div className="text-xs text-slate-400">{formatDate(item.postedAtUtc)}</div></td><td className="px-5 py-4">{item.warehouseName}</td><td className="px-5 py-4">{item.rawMaterialName}<div className="text-xs text-slate-400">{item.rawMaterialCode}</div></td><td className="px-5 py-4 font-medium">{item.internalLotNumber}</td><td className="px-5 py-4">{qty(item.quantityBefore)}</td><td className="px-5 py-4"><TypeBadge type={item.adjustmentType} /></td><td className="px-5 py-4 font-semibold">{qty(item.adjustmentQuantity)}</td><td className="px-5 py-4">{qty(item.quantityAfter)}</td><td className="px-5 py-4 max-w-56 truncate">{item.reason}</td><td className="px-5 py-4">{item.postedBy}</td><td className="px-5 py-4"><Button asChild size="sm" variant="secondary"><Link to={`/warehouse/stock-adjustments/${item.id}`}><Eye size={15} />Open</Link></Button></td></tr>)}</tbody></table></div><MasterDataPagination pagination={pagination} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} /></Card>}
    {isRefreshing ? <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500"><LoaderCircle size={14} className="animate-spin" />Menyegarkan data...</div> : null}
  </div>
}
