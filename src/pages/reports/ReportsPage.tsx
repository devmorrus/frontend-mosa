import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  Download,
  Factory,
  FileSpreadsheet,
  Filter,
  LoaderCircle,
  RotateCcw,
  Search,
  Tags,
  Waypoints,
} from 'lucide-react'
import { reportsApi, emptyReportQuery, type ReportCode, type ReportQuery, type ReportRow } from '@/api/reports.api'
import { productsApi } from '@/api/products.api'
import { rawMaterialsApi } from '@/api/rawMaterials.api'
import { suppliersApi } from '@/api/suppliers.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MasterDataEmptyState, MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { MasterDataPagination } from '@/features/master-data/components/MasterDataPagination'
import type { MasterDataPagination as PaginationMeta } from '@/features/master-data/types'
import { EMPTY_PAGINATION } from '@/features/master-data/utils'
import { fetchLookupIfAllowed } from '@/utils/lookupGuard'
import type { ProductListItem } from '@/features/products/types'
import type { RawMaterialListItem } from '@/features/raw-materials/types'
import type { SupplierListItem } from '@/features/suppliers/types'
import type { WarehouseListItem } from '@/features/warehouses/types'
import type { ApiError } from '@/types/api'
import { cn } from '@/lib/utils'

type FilterKey = keyof ReportQuery

interface ReportColumn {
  key: string
  label: string
}

interface ReportDefinition {
  code: ReportCode
  rpt: string
  category: 'Inventory' | 'Production' | 'Quality' | 'Traceability' | 'Stock Control'
  name: string
  description: string
  filters: FilterKey[]
  columns: ReportColumn[]
}

const REPORTS: ReportDefinition[] = [
  { code: 'raw-material-stock', rpt: 'RPT-01', category: 'Inventory', name: 'Raw Material Stock', description: 'Aggregate stock raw material per warehouse dan material.', filters: ['search', 'warehouseId', 'materialId', 'status', 'lowStockOnly'], columns: [{ key: 'warehouseCode', label: 'Warehouse' }, { key: 'materialCode', label: 'Material' }, { key: 'materialName', label: 'Name' }, { key: 'totalQuantity', label: 'Total' }, { key: 'availableQuantity', label: 'Available' }, { key: 'lotCount', label: 'LOT' }, { key: 'minimumStock', label: 'Min Stock' }, { key: 'isLowStock', label: 'Low' }] },
  { code: 'lot-inventory', rpt: 'RPT-02', category: 'Inventory', name: 'LOT Inventory', description: 'Daftar LOT inventory lengkap dengan status, expiry, supplier, dan warehouse.', filters: ['search', 'warehouseId', 'materialId', 'supplierId', 'status', 'expiryFrom', 'expiryTo', 'internalLotNumber'], columns: [{ key: 'internalLotNumber', label: 'LOT' }, { key: 'rawMaterialCode', label: 'Material' }, { key: 'supplierName', label: 'Supplier' }, { key: 'warehouseCode', label: 'Warehouse' }, { key: 'currentQuantity', label: 'Qty' }, { key: 'expiryDate', label: 'Expiry' }, { key: 'status', label: 'Status' }] },
  { code: 'goods-receiving', rpt: 'RPT-03', category: 'Inventory', name: 'Goods Receiving', description: 'Report penerimaan barang per item aktual.', filters: ['search', 'dateFrom', 'dateTo', 'supplierId', 'warehouseId', 'materialId', 'status'], columns: [{ key: 'receivingNumber', label: 'GR Number' }, { key: 'receivingDate', label: 'Date' }, { key: 'supplierName', label: 'Supplier' }, { key: 'warehouseCode', label: 'Warehouse' }, { key: 'materialCode', label: 'Material' }, { key: 'receivedQuantity', label: 'Qty' }, { key: 'status', label: 'Status' }] },
  { code: 'material-consumption', rpt: 'RPT-04', category: 'Production', name: 'Material Consumption', description: 'Konsumsi material produksi per LOT.', filters: ['search', 'dateFrom', 'dateTo', 'productId', 'materialId', 'warehouseId', 'productionOrderId', 'operatorId', 'lotNumber'], columns: [{ key: 'productionOrderNumber', label: 'PO' }, { key: 'productCode', label: 'Product' }, { key: 'rawMaterialCode', label: 'Material' }, { key: 'internalLotNumber', label: 'LOT' }, { key: 'targetQuantity', label: 'Target' }, { key: 'actualQuantity', label: 'Actual' }, { key: 'varianceQuantity', label: 'Variance' }, { key: 'deviationStatus', label: 'Deviation' }] },
  { code: 'production', rpt: 'RPT-05', category: 'Production', name: 'Production', description: 'Report production order, output, status, operator, dan FG LOT.', filters: ['search', 'dateFrom', 'dateTo', 'productId', 'warehouseId', 'productionOrderId', 'operatorId', 'status'], columns: [{ key: 'productionOrderNumber', label: 'PO' }, { key: 'productCode', label: 'Product' }, { key: 'targetOutput', label: 'Target' }, { key: 'actualOutput', label: 'Actual' }, { key: 'status', label: 'Status' }, { key: 'warehouseCode', label: 'Warehouse' }, { key: 'finishedGoodsLotNumber', label: 'FG LOT' }, { key: 'qcStatus', label: 'QC' }] },
  { code: 'target-vs-actual', rpt: 'RPT-06', category: 'Production', name: 'Target vs Actual', description: 'Perbandingan target material recipe dengan konsumsi aktual.', filters: ['search', 'dateFrom', 'dateTo', 'productId', 'materialId', 'productionOrderId', 'deviationOnly'], columns: [{ key: 'productionOrderNumber', label: 'PO' }, { key: 'productCode', label: 'Product' }, { key: 'rawMaterialCode', label: 'Material' }, { key: 'scaledTargetQuantity', label: 'Target' }, { key: 'actualConsumption', label: 'Actual' }, { key: 'varianceQuantity', label: 'Variance' }, { key: 'isWithinTolerance', label: 'Within' }, { key: 'deviationStatus', label: 'Deviation' }] },
  { code: 'qc', rpt: 'RPT-07', category: 'Quality', name: 'QC', description: 'Status QC finished goods beserta inspector dan keputusan.', filters: ['search', 'dateFrom', 'dateTo', 'productId', 'warehouseId', 'qcStatus'], columns: [{ key: 'finishedGoodsLotNumber', label: 'FG LOT' }, { key: 'productionOrderNumber', label: 'PO' }, { key: 'productCode', label: 'Product' }, { key: 'warehouseCode', label: 'Warehouse' }, { key: 'yieldValue', label: 'Yield' }, { key: 'qcStatus', label: 'QC' }, { key: 'inspectorName', label: 'Inspector' }, { key: 'inspectedAt', label: 'Inspected' }] },
  { code: 'traceability', rpt: 'RPT-08', category: 'Traceability', name: 'Traceability', description: 'Hubungan material LOT yang dikonsumsi dengan production order dan FG LOT.', filters: ['search', 'dateFrom', 'dateTo', 'productId', 'materialId', 'warehouseId', 'lotNumber'], columns: [{ key: 'productionOrderNumber', label: 'PO' }, { key: 'finishedGoodsLotNumber', label: 'FG LOT' }, { key: 'productCode', label: 'Product' }, { key: 'rawMaterialCode', label: 'Material' }, { key: 'internalLotNumber', label: 'RM LOT' }, { key: 'supplierName', label: 'Supplier' }, { key: 'actualQuantity', label: 'Qty' }, { key: 'postedAtUtc', label: 'Posted' }] },
  { code: 'yield', rpt: 'RPT-09', category: 'Production', name: 'Yield', description: 'Yield finished goods berdasarkan target output dan actual output.', filters: ['search', 'dateFrom', 'dateTo', 'productId', 'recipeVersionId', 'qcStatus'], columns: [{ key: 'productionOrderNumber', label: 'PO' }, { key: 'finishedGoodsLotNumber', label: 'FG LOT' }, { key: 'productCode', label: 'Product' }, { key: 'targetOutput', label: 'Target' }, { key: 'actualOutput', label: 'Actual' }, { key: 'yieldValue', label: 'Yield' }, { key: 'productionDate', label: 'Date' }, { key: 'qcStatus', label: 'QC' }] },
  { code: 'stock-control', rpt: 'RPT-10', category: 'Stock Control', name: 'Stock Adjustment / Opname', description: 'Perubahan stock dari adjustment manual dan variance stock opname.', filters: ['search', 'dateFrom', 'dateTo', 'warehouseId', 'materialId', 'sourceType'], columns: [{ key: 'sourceType', label: 'Source' }, { key: 'sourceNumber', label: 'Number' }, { key: 'transactionDate', label: 'Date' }, { key: 'warehouseCode', label: 'Warehouse' }, { key: 'rawMaterialCode', label: 'Material' }, { key: 'internalLotNumber', label: 'LOT' }, { key: 'quantityBefore', label: 'Before' }, { key: 'adjustmentQuantity', label: 'Delta' }, { key: 'quantityAfter', label: 'After' }] },
]

const categories = ['Inventory', 'Production', 'Quality', 'Traceability', 'Stock Control'] as const
const statusOptions = ['AVAILABLE', 'QUARANTINED', 'HOLD', 'CONSUMED', 'EXPIRED', 'DEPLETED', 'DRAFT', 'POSTED', 'CANCELLED', 'IN_PROGRESS', 'COMPLETED', 'MATERIAL_SHORTAGE']
const qcStatusOptions = ['WAITING_QC', 'PASSED', 'HOLD', 'REJECTED']

function valueText(value: unknown) {
  if (value === null || value === undefined || value === '') return '-'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'number') return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 }).format(value)
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleString('id-ID')
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) return new Date(value).toLocaleDateString('id-ID')
  return String(value)
}

function isRequestCanceled(error: unknown) {
  return typeof error === 'object' && error !== null && (('code' in error && error.code === 'ERR_CANCELED') || ('name' in error && error.name === 'CanceledError'))
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ReportsPage() {
  const params = useParams()
  const navigate = useNavigate()
  const routeCode = REPORTS.some((report) => report.code === params.reportCode) ? params.reportCode as ReportCode : 'raw-material-stock'
  const [activeCode, setActiveCode] = useState<ReportCode>(routeCode)
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | ReportDefinition['category']>('ALL')
  const [query, setQuery] = useState<ReportQuery>(emptyReportQuery)
  const [items, setItems] = useState<ReportRow[]>([])
  const [pagination, setPagination] = useState<PaginationMeta>(EMPTY_PAGINATION)
  const [loadedAt, setLoadedAt] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([])
  const [materials, setMaterials] = useState<RawMaterialListItem[]>([])
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [suppliers, setSuppliers] = useState<SupplierListItem[]>([])
  const latestReportRequest = useRef(0)
  const reportAbortController = useRef<AbortController | null>(null)

  const activeReport = REPORTS.find((report) => report.code === activeCode) ?? REPORTS[0]

  useEffect(() => {
    setActiveCode(routeCode)
    setQuery(emptyReportQuery)
  }, [routeCode])

  useEffect(() => {
    // Each filter lookup needs its own view permission (e.g. management has
    // reports.view but not warehouses.view). Skipped lookups stay empty
    // instead of producing 403s.
    void Promise.all([
      fetchLookupIfAllowed('warehouses.view', () => warehousesApi.listOptions('ALL'), []).then(setWarehouses),
      fetchLookupIfAllowed('materials.view', () => rawMaterialsApi.listActiveOptions(), []).then(setMaterials),
      fetchLookupIfAllowed('products.view', () => productsApi.listActiveOptions(), []).then(setProducts),
      fetchLookupIfAllowed('suppliers.view', () => suppliersApi.listOptions('ALL'), []).then(setSuppliers),
    ]).catch(() => undefined)
  }, [])

  async function loadReport(nextQuery = query, reportCode = activeCode) {
    const requestId = latestReportRequest.current + 1
    latestReportRequest.current = requestId
    reportAbortController.current?.abort()
    const abortController = new AbortController()
    reportAbortController.current = abortController
    setIsLoading(true)
    setError(null)
    try {
      const result = await reportsApi.list(reportCode, nextQuery, abortController.signal)
      if (latestReportRequest.current !== requestId) return
      setItems(result.items)
      setPagination(result.pagination)
      setLoadedAt(new Date().toLocaleString('id-ID'))
    } catch (caughtError) {
      if (latestReportRequest.current !== requestId) return
      if (isRequestCanceled(caughtError)) return
      const apiError = caughtError as ApiError
      setError(apiError.message)
    } finally {
      if (reportAbortController.current === abortController) reportAbortController.current = null
      if (latestReportRequest.current === requestId) setIsLoading(false)
    }
  }

  useEffect(() => {
    const resetQuery = { ...emptyReportQuery, page: 1 }
    setQuery(resetQuery)
    void loadReport(resetQuery, activeCode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCode])

  function updateQuery(patch: Partial<ReportQuery>) {
    setQuery((current) => ({ ...current, ...patch, page: patch.page ?? 1 }))
  }

  function resetFilters() {
    const reset = { ...emptyReportQuery, pageSize: query.pageSize }
    setQuery(reset)
    void loadReport(reset)
  }

  function selectReport(code: ReportCode) {
    setQuery(emptyReportQuery)
    setActiveCode(code)
    navigate(`/reports/${code}`)
  }

  const visibleReports = useMemo(
    () => selectedCategory === 'ALL' ? REPORTS : REPORTS.filter((report) => report.category === selectedCategory),
    [selectedCategory],
  )

  async function exportReport(format: 'xlsx' | 'csv') {
    setIsExporting(format)
    try {
      const result = await reportsApi.export(activeReport.code, query, format)
      downloadBlob(result.blob, result.fileName)
    } finally {
      setIsExporting(null)
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#063b8c]"><FileSpreadsheet size={23} /></div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0b5ed7]">Analytics / Reports</p>
              <h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">Reporting Center</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-500">Pilih laporan operasional, gunakan filter, lalu export data sesuai kebutuhan.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-[330px] sm:gap-3">
            <HeroMetric label="Reports" value={REPORTS.length} />
            <HeroMetric label="Kategori" value={categories.length} tone="blue" />
            <HeroMetric label="Export" value="CSV / XLSX" tone="green" />
          </div>
        </div>
      </section>

      <Card data-tour="reports-menu" className="border-slate-200 shadow-sm">
        <CardHeader className="gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><CardTitle className="flex items-center gap-2"><BarChart3 size={19} className="text-[#0b5ed7]" /> Choose a report</CardTitle><CardDescription>Pilih laporan berdasarkan kategori dan kebutuhan operasional.</CardDescription></div>
          <div data-tour="reports-category" className="flex max-w-full gap-2 overflow-x-auto pb-1">
            {(['ALL', ...categories] as const).map((category) => (
              <button key={category} type="button" onClick={() => setSelectedCategory(category)} className={cn('whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors', selectedCategory === category ? 'border-[#063b8c] bg-[#063b8c] text-white' : 'border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-[#063b8c]')}>
                {category === 'ALL' ? 'Semua' : category}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {visibleReports.map((report) => <ReportSelectorCard key={report.code} report={report} active={activeCode === report.code} onSelect={() => selectReport(report.code)} />)}
        </CardContent>
      </Card>

      <div className="min-w-0 space-y-5">
          <Card className="min-w-0 border-slate-200 shadow-sm">
            <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0b5ed7]"><ReportIcon category={activeReport.category} size={15} />{activeReport.rpt} / {activeReport.category}</div><CardTitle className="mt-2 font-display text-2xl">{activeReport.name}</CardTitle><CardDescription className="mt-2">{activeReport.description}</CardDescription><p className="mt-2 text-xs text-slate-400">Last loaded: {loadedAt ?? '-'}</p></div>
              <div data-tour="reports-export" className="flex flex-col gap-2 sm:flex-row">
                <Button variant="secondary" onClick={() => void exportReport('csv')} disabled={Boolean(isExporting)}><Download size={16} />{isExporting === 'csv' ? 'Exporting...' : 'CSV'}</Button>
                <Button className="bg-[#063b8c] hover:bg-[#052f70]" onClick={() => void exportReport('xlsx')} disabled={Boolean(isExporting)}><Download size={16} />{isExporting === 'xlsx' ? 'Exporting...' : 'Excel'}</Button>
              </div>
            </CardHeader>
          </Card>

          <Card data-tour="reports-filter" className="border-slate-200 shadow-sm">
            <CardHeader><CardTitle className="flex items-center gap-2"><Filter size={19} className="text-[#0b5ed7]" /> Filter Report</CardTitle><CardDescription>Apply filter akan memuat ulang data dan export memakai filter aktif yang sama.</CardDescription></CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {activeReport.filters.includes('search') ? <Input placeholder="Search" value={query.search} onChange={(event) => updateQuery({ search: event.target.value })} /> : null}
              {activeReport.filters.includes('dateFrom') ? <Input data-tour="reports-date-filter" type="date" value={query.dateFrom} onChange={(event) => updateQuery({ dateFrom: event.target.value })} /> : null}
              {activeReport.filters.includes('dateTo') ? <Input type="date" value={query.dateTo} onChange={(event) => updateQuery({ dateTo: event.target.value })} /> : null}
              {activeReport.filters.includes('expiryFrom') ? <Input type="date" value={query.expiryFrom} onChange={(event) => updateQuery({ expiryFrom: event.target.value })} /> : null}
              {activeReport.filters.includes('expiryTo') ? <Input type="date" value={query.expiryTo} onChange={(event) => updateQuery({ expiryTo: event.target.value })} /> : null}
              {activeReport.filters.includes('warehouseId') ? <Select value={query.warehouseId} onChange={(value) => updateQuery({ warehouseId: value })} options={warehouses.map((x) => ({ value: x.id, label: x.name }))} placeholder="Semua warehouse" /> : null}
              {activeReport.filters.includes('materialId') ? <Select dataTour="reports-relevant-filter" value={query.materialId} onChange={(value) => updateQuery({ materialId: value })} options={materials.map((x) => ({ value: x.id, label: `${x.code} - ${x.name}` }))} placeholder="Semua material" /> : null}
              {activeReport.filters.includes('productId') ? <Select dataTour="reports-relevant-filter" value={query.productId} onChange={(value) => updateQuery({ productId: value })} options={products.map((x) => ({ value: x.id, label: `${x.code} - ${x.name}` }))} placeholder="Semua product" /> : null}
              {activeReport.filters.includes('supplierId') ? <Select value={query.supplierId} onChange={(value) => updateQuery({ supplierId: value })} options={suppliers.map((x) => ({ value: x.id, label: x.name }))} placeholder="Semua supplier" /> : null}
              {activeReport.filters.includes('productionOrderId') ? <Input placeholder="Production Order ID" value={query.productionOrderId} onChange={(event) => updateQuery({ productionOrderId: event.target.value })} /> : null}
              {activeReport.filters.includes('operatorId') ? <Input placeholder="Operator ID" value={query.operatorId} onChange={(event) => updateQuery({ operatorId: event.target.value })} /> : null}
              {activeReport.filters.includes('recipeVersionId') ? <Input placeholder="Recipe Version ID" value={query.recipeVersionId} onChange={(event) => updateQuery({ recipeVersionId: event.target.value })} /> : null}
              {activeReport.filters.includes('internalLotNumber') ? <Input placeholder="Internal LOT" value={query.internalLotNumber} onChange={(event) => updateQuery({ internalLotNumber: event.target.value })} /> : null}
              {activeReport.filters.includes('lotNumber') ? <Input placeholder="LOT Number" value={query.lotNumber} onChange={(event) => updateQuery({ lotNumber: event.target.value })} /> : null}
              {activeReport.filters.includes('status') ? <Select value={query.status} onChange={(value) => updateQuery({ status: value })} options={statusOptions.map((x) => ({ value: x, label: x }))} placeholder="Semua status" /> : null}
              {activeReport.filters.includes('qcStatus') ? <Select value={query.qcStatus} onChange={(value) => updateQuery({ qcStatus: value })} options={qcStatusOptions.map((x) => ({ value: x, label: x }))} placeholder="Semua QC status" /> : null}
              {activeReport.filters.includes('sourceType') ? <Select value={query.sourceType} onChange={(value) => updateQuery({ sourceType: value })} options={[{ value: 'ADJUSTMENT', label: 'Adjustment' }, { value: 'OPNAME', label: 'Opname' }]} placeholder="Semua source" /> : null}
              {activeReport.filters.includes('lowStockOnly') ? <Toggle label="Low stock only" checked={query.lowStockOnly} onChange={(checked) => updateQuery({ lowStockOnly: checked })} /> : null}
              {activeReport.filters.includes('deviationOnly') ? <Toggle label="Deviation only" checked={query.deviationOnly} onChange={(checked) => updateQuery({ deviationOnly: checked })} /> : null}
              <Select value={String(query.pageSize)} onChange={(value) => updateQuery({ pageSize: Number(value) })} options={[{ value: '20', label: '20 / halaman' }, { value: '50', label: '50 / halaman' }, { value: '100', label: '100 / halaman' }]} placeholder="Jumlah per halaman" />
              <div className="flex flex-col gap-2 sm:flex-row md:col-span-2 xl:col-span-3">
                <Button className="bg-[#063b8c] hover:bg-[#052f70]" onClick={() => void loadReport(query)}><Search size={16} />Apply</Button>
                <Button variant="secondary" onClick={resetFilters}><RotateCcw size={16} />Reset</Button>
              </div>
            </CardContent>
          </Card>

          <Card data-tour="reports-result" className="overflow-hidden border-slate-200 shadow-sm">
            {isLoading ? <div className="p-6"><MasterDataLoadingState description="Report sedang dimuat dari backend." /></div> : error ? <div className="p-6"><MasterDataErrorState description={error} onRetry={() => void loadReport(query)} /></div> : items.length === 0 ? <div className="p-6"><MasterDataEmptyState description="Tidak ada data report untuk filter saat ini." /></div> : <ReportTable report={activeReport} rows={items} />}
            {!isLoading && !error && items.length > 0 ? <MasterDataPagination pagination={pagination} onPageChange={(page) => { const next = { ...query, page }; setQuery(next); void loadReport(next) }} /> : null}
          </Card>
          {isExporting ? <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500"><LoaderCircle size={14} className="animate-spin" />Menyiapkan export {isExporting.toUpperCase()}...</div> : null}
      </div>
    </div>
  )
}

function ReportTable({ report, rows }: { report: ReportDefinition; rows: ReportRow[] }) {
  return (
    <>
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.08em] text-slate-500">
            <tr>{report.columns.map((column) => <th key={column.key} className="whitespace-nowrap p-4 font-semibold">{column.label}</th>)}</tr>
          </thead>
          <tbody>{rows.map((row, index) => <tr key={index} className="border-t border-slate-100 transition-colors hover:bg-blue-50/30">{report.columns.map((column) => <td key={column.key} className="whitespace-nowrap p-4 text-slate-700">{renderReportValue(column.key, row[column.key])}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <div className="space-y-3 p-4 md:hidden">
        {rows.map((row, index) => (
          <article key={index} className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div><p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0b5ed7]">Record {index + 1}</p><p className="mt-1 font-semibold text-ink">{valueText(row[report.columns[0]?.key])}</p></div>
              {report.columns.find((column) => ['status', 'qcStatus', 'deviationStatus'].includes(column.key)) ? <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#063b8c]">{valueText(row[report.columns.find((column) => ['status', 'qcStatus', 'deviationStatus'].includes(column.key))?.key ?? ''])}</span> : null}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {report.columns.slice(1).map((column) => <div key={column.key}><dt className="text-xs text-slate-400">{column.label}</dt><dd className="mt-0.5 break-words font-medium text-slate-700">{renderReportValue(column.key, row[column.key])}</dd></div>)}
            </dl>
          </article>
        ))}
      </div>
    </>
  )
}

function Select({ value, onChange, options, placeholder, dataTour }: { value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }>; placeholder: string; dataTour?: string }) {
  return <select data-tour={dataTour} className="h-14 min-w-0 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink" value={value} onChange={(event) => onChange(event.target.value)}><option value="">{placeholder}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="flex h-14 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700"><input className="size-4 accent-[#063b8c]" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />{label}</label>
}

function renderReportValue(key: string, value: unknown) {
  if (['status', 'qcStatus', 'deviationStatus'].includes(key) && value) {
    return <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#063b8c]">{valueText(value)}</span>
  }
  if (typeof value === 'boolean') {
    return <span className={value ? 'inline-flex items-center gap-1 text-emerald-700' : 'text-slate-500'}>{value ? <CheckCircle2 size={14} /> : null}{valueText(value)}</span>
  }
  return valueText(value)
}

function ReportIcon({ category, size = 18 }: { category: ReportDefinition['category']; size?: number }) {
  const Icon = category === 'Inventory' ? Boxes : category === 'Production' ? Factory : category === 'Quality' ? CheckCircle2 : category === 'Traceability' ? Waypoints : Tags
  return <Icon size={size} />
}

function HeroMetric({ label, value, tone = 'slate' }: { label: string; value: string | number; tone?: 'slate' | 'blue' | 'green' }) {
  const toneClass = tone === 'blue' ? 'border-blue-200 bg-blue-100 text-[#063b8c]' : tone === 'green' ? 'border-emerald-200 bg-emerald-100 text-emerald-800' : 'border-slate-200 bg-slate-100 text-ink'
  return <div className={`rounded-2xl border px-3 py-3 ${toneClass}`}><p className="text-[10px] font-semibold uppercase tracking-[0.14em] opacity-70">{label}</p><p className="mt-1 font-display text-lg font-semibold sm:text-xl">{value}</p></div>
}

function ReportSelectorCard({ report, active, onSelect }: { report: ReportDefinition; active: boolean; onSelect: () => void }) {
  return <button type="button" onClick={onSelect} className={cn('min-h-[132px] rounded-2xl border p-4 text-left transition-all', active ? 'border-[#063b8c] bg-[#063b8c] text-white shadow-[0_12px_24px_rgba(6,59,140,0.18)]' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/40')}>
    <div className="flex items-start justify-between gap-3"><div className={cn('flex size-9 items-center justify-center rounded-xl', active ? 'bg-white/15 text-white' : 'bg-blue-50 text-[#0b5ed7]')}><ReportIcon category={report.category} size={17} /></div><span className="text-[11px] font-semibold uppercase tracking-[0.14em] opacity-60">{report.rpt}</span></div>
    <p className="mt-4 font-semibold">{report.name}</p>
    <p className="mt-1 line-clamp-2 text-xs opacity-70">{report.description}</p>
  </button>
}
