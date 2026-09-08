import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  Gauge,
  Layers,
  LoaderCircle,
  PackageCheck,
  PackageSearch,
  PauseCircle,
  RefreshCcw,
  Scale,
  ShieldAlert,
  Target,
  TrendingUp,
} from 'lucide-react'
import { dashboardApi, type DashboardSummary, type DashboardSummaryQuery } from '@/api/dashboard.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/utils'
import type { ApiError } from '@/types/api'
import type { WarehouseListItem } from '@/features/warehouses/types'

const numberFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })

function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

function startOfMonthInputValue() {
  const now = new Date()
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString().slice(0, 10)
}

function formatNumber(value: number) {
  return numberFormatter.format(value)
}

function formatPercent(value: number) {
  return `${formatNumber(value)}%`
}

function getDeviationTone(value: number) {
  if (value < 0) return 'text-red-600'
  if (value > 0) return 'text-emerald-700'
  return 'text-slate-600'
}

function buildLink(path: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value)
  })
  const query = search.toString()
  return query ? `${path}?${query}` : path
}

interface KpiCardProps {
  label: string
  value: string | number
  caption: string
  icon: ComponentType<{ size?: number; className?: string }>
  to?: string
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'signal'
}

function KpiCard({ label, value, caption, icon: Icon, to, tone = 'default' }: KpiCardProps) {
  const toneClass = {
    default: 'border-slate-200 bg-white text-ink',
    success: 'border-emerald-100 bg-emerald-50/80 text-emerald-800',
    warning: 'border-amber-100 bg-amber-50/85 text-amber-800',
    danger: 'border-red-100 bg-red-50/85 text-red-700',
    signal: 'border-signal/20 bg-[#fff7e9] text-ink',
  }[tone]

  const content = (
    <Card className={cn('h-full rounded-[24px] border shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_18px_45px_rgba(18,48,46,0.11)]', toneClass)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] opacity-65">{label}</p>
            <div className="mt-3 font-display text-3xl font-semibold leading-none sm:text-4xl">{value}</div>
          </div>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/75 shadow-sm">
            <Icon size={20} />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 text-sm opacity-70">
          <span>{caption}</span>
          {to ? <ArrowRight size={16} className="shrink-0" /> : null}
        </div>
      </CardContent>
    </Card>
  )

  return to ? <Link to={to}>{content}</Link> : content
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const [query, setQuery] = useState<DashboardSummaryQuery>({
    dateFrom: startOfMonthInputValue(),
    dateTo: todayInputValue(),
    warehouseId: '',
  })
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lookupError, setLookupError] = useState<string | null>(null)

  async function loadDashboard(nextQuery = query, background = false) {
    if (nextQuery.dateFrom && nextQuery.dateTo && nextQuery.dateFrom > nextQuery.dateTo) {
      setError('Tanggal awal harus lebih kecil atau sama dengan tanggal akhir.')
      setIsLoading(false)
      return
    }

    if (background) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }
    setError(null)

    try {
      const result = await dashboardApi.getSummary(nextQuery)
      setSummary(result)
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setError(apiError.message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    async function loadWarehouses() {
      try {
        const result = await warehousesApi.listOptions('ALL')
        setWarehouses(result)
      } catch (caughtError) {
        const apiError = caughtError as ApiError
        setLookupError(apiError.message)
      }
    }

    void loadWarehouses()
  }, [])

  useEffect(() => {
    void loadDashboard(query, Boolean(summary))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(query)])

  const selectedWarehouse = warehouses.find((warehouse) => warehouse.id === query.warehouseId)
  const filterParams = {
    warehouseId: query.warehouseId || undefined,
    dateFrom: query.dateFrom || undefined,
    dateTo: query.dateTo || undefined,
    from: query.dateFrom || undefined,
    to: query.dateTo || undefined,
  }
  const productionFilters = {
    dateFrom: query.dateFrom || undefined,
    dateTo: query.dateTo || undefined,
  }
  const deviation = summary ? summary.performance.actualOutput - summary.performance.targetOutput : 0

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.18)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.24),transparent_58%)]" />
        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <Badge variant="subtle" className="gap-2 px-4 py-1.5">
              <Gauge size={14} className="text-signal" />
              Operational Dashboard
            </Badge>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Monitoring produksi, inventory, QC, dan performance dalam satu ringkasan.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-paper/68 sm:text-base">
              Selamat datang, {user?.name ?? 'pengguna'}. Semua KPI diambil dari aggregate backend dashboard, bukan hasil fetch seluruh data operasional di browser.
            </p>
          </div>

          <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none xl:w-[23rem]">
            <CardContent className="p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Current scope</div>
              <div className="mt-2 font-display text-2xl font-semibold text-paper">{selectedWarehouse?.name ?? 'Semua warehouse'}</div>
              <p className="mt-2 text-sm leading-6 text-paper/60">
                Period {query.dateFrom || 'awal data'} sampai {query.dateTo || 'hari ini'}.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card data-tour="dashboard-period">
        <CardHeader className="pb-3">
          <CardTitle>Global Filter</CardTitle>
          <CardDescription>Filter ini dikirim langsung ke endpoint dashboard summary.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.3fr_auto]">
          <Input type="date" value={query.dateFrom} onChange={(event) => setQuery((current) => ({ ...current, dateFrom: event.target.value }))} />
          <Input type="date" value={query.dateTo} onChange={(event) => setQuery((current) => ({ ...current, dateTo: event.target.value }))} />
          <select className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none focus-visible:border-ink focus-visible:ring-4 focus-visible:ring-ink/10" value={query.warehouseId} onChange={(event) => setQuery((current) => ({ ...current, warehouseId: event.target.value }))}>
            <option value="">Semua warehouse</option>
            {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
          </select>
          <Button variant="secondary" onClick={() => void loadDashboard(query, true)} disabled={isRefreshing}>
            {isRefreshing ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
            Refresh
          </Button>
        </CardContent>
      </Card>

      {lookupError ? <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">Gagal memuat lookup warehouse: {lookupError}</div> : null}

      {isLoading ? (
        <div className="rounded-[28px] border border-slate-200/80 bg-white/85 p-10 text-center shadow-sm">
          <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-ink/45" />
          <h3 className="mt-4 font-display text-xl font-semibold text-ink">Memuat dashboard</h3>
          <p className="mt-2 text-sm text-slate-500">Aggregate operasional sedang dimuat dari backend.</p>
        </div>
      ) : error ? (
        <div className="rounded-[28px] border border-red-100 bg-white/90 p-10 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-9 w-9 text-red-500" />
          <h3 className="mt-4 font-display text-xl font-semibold text-ink">Dashboard belum bisa dimuat</h3>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <Button onClick={() => void loadDashboard(query)} variant="secondary" className="mt-5"><RefreshCcw size={16} />Coba lagi</Button>
        </div>
      ) : summary ? (
        <DashboardContent summary={summary} filterParams={filterParams} productionFilters={productionFilters} deviation={deviation} />
      ) : null}
    </div>
  )
}

function DashboardContent({
  summary,
  filterParams,
  productionFilters,
  deviation,
}: {
  summary: DashboardSummary
  filterParams: Record<string, string | undefined>
  productionFilters: Record<string, string | undefined>
  deviation: number
}) {
  return (
    <div className="space-y-8">
      <section className="space-y-4" data-tour="dashboard-production">
        <SectionHeader title="Production" description="Status production order berdasarkan periode filter." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Total Production Order" value={formatNumber(summary.production.total)} caption="Semua status PO" icon={Factory} to={buildLink('/production/orders', productionFilters)} />
          <KpiCard label="In Progress" value={formatNumber(summary.production.inProgress)} caption="Sedang diproses operator" icon={Gauge} to={buildLink('/production/orders', { ...productionFilters, status: 'IN_PROGRESS' })} tone="signal" />
          <KpiCard label="Completed" value={formatNumber(summary.production.completed)} caption="Termasuk waiting QC" icon={CheckCircle2} to={buildLink('/production/orders', { ...productionFilters, status: 'COMPLETED' })} tone="success" />
          <div data-tour="dashboard-shortage"><KpiCard label="Material Shortage" value={formatNumber(summary.production.materialShortage)} caption="Butuh tindak lanjut stock" icon={AlertTriangle} to={buildLink('/production/orders', { ...productionFilters, status: 'MATERIAL_SHORTAGE' })} tone={summary.production.materialShortage > 0 ? 'danger' : 'default'} /></div>
        </div>
      </section>

      <section className="space-y-4" data-tour="dashboard-inventory">
        <SectionHeader title="Inventory" description="Snapshot raw material LOT aktif, low stock, dan expiry window backend." />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Raw Material Stock" value={formatNumber(summary.inventory.totalRawMaterialsWithStock)} caption="Material dengan stock aktif" icon={Boxes} to={buildLink('/inventory', { warehouseId: filterParams.warehouseId })} />
          <KpiCard label="Active LOT" value={formatNumber(summary.inventory.totalActiveLot)} caption="Available, qty > 0, belum expired" icon={Layers} to={buildLink('/lots', { warehouseId: filterParams.warehouseId, status: 'AVAILABLE' })} tone="success" />
          <KpiCard label="Low Stock" value={formatNumber(summary.inventory.lowStockMaterialCount)} caption="Di bawah minimum stock" icon={ShieldAlert} to={buildLink('/inventory', { warehouseId: filterParams.warehouseId, status: 'LOW_STOCK' })} tone={summary.inventory.lowStockMaterialCount > 0 ? 'warning' : 'default'} />
          <KpiCard label="Expiring LOT" value={formatNumber(summary.inventory.expiringLotCount)} caption="Expired dalam 30 hari" icon={PackageSearch} to={buildLink('/lots', { warehouseId: filterParams.warehouseId, status: 'AVAILABLE' })} tone={summary.inventory.expiringLotCount > 0 ? 'warning' : 'default'} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.8fr)]">
          <div className="space-y-4" data-tour="dashboard-qc">
          <SectionHeader title="Quality Control" description="Distribusi status QC finished goods lot sesuai periode produksi." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
            <KpiCard label="Waiting QC" value={formatNumber(summary.qc.waitingQc)} caption="Menunggu inspeksi" icon={ClipboardCheck} to={buildLink('/quality-control', { ...filterParams, status: 'WAITING_QC' })} tone="signal" />
            <KpiCard label="Hold" value={formatNumber(summary.qc.hold)} caption="Perlu keputusan QC" icon={PauseCircle} to={buildLink('/quality-control', { ...filterParams, status: 'HOLD' })} tone={summary.qc.hold > 0 ? 'warning' : 'default'} />
            <KpiCard label="Reject" value={formatNumber(summary.qc.reject)} caption="LOT rejected" icon={ShieldAlert} to={buildLink('/quality-control', { ...filterParams, status: 'REJECTED' })} tone={summary.qc.reject > 0 ? 'danger' : 'default'} />
            <KpiCard label="QC Total" value={formatNumber(summary.qc.total)} caption={`${formatNumber(summary.qc.pass)} pass`} icon={PackageCheck} to={buildLink('/quality-control', filterParams)} />
          </div>
        </div>

        <Card className="overflow-hidden border-ink/8 bg-[linear-gradient(180deg,#f2ede1_0%,#f7f6f2_100%)]">
          <CardHeader>
            <Badge variant="default" className="w-fit">Performance</Badge>
            <CardTitle className="mt-2">Output vs target</CardTitle>
            <CardDescription>Target, actual, yield, deviation, dan approval pending dari backend.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <MetricTile label="Target Output" value={formatNumber(summary.performance.targetOutput)} icon={Target} />
              <MetricTile label="Actual Output" value={formatNumber(summary.performance.actualOutput)} icon={Scale} />
            </div>
            <div data-tour="dashboard-yield" className="rounded-[24px] border border-white/70 bg-white/75 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Yield</div>
                  <div className="mt-2 font-display text-4xl font-semibold text-ink">{formatPercent(summary.performance.overallYield)}</div>
                  <p className="mt-2 text-sm text-slate-500">Average yield: {formatPercent(summary.performance.averageYield)}</p>
                </div>
                <TrendingUp className="text-signal" size={28} />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link data-tour="dashboard-deviation" to={buildLink('/production/deviations', { ...filterParams, status: 'ALL' })} className="rounded-[22px] border border-slate-200 bg-white/80 p-4 transition hover:border-ink/20">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Deviation</div>
                <div className={cn('mt-2 font-display text-2xl font-semibold', getDeviationTone(deviation))}>{formatNumber(deviation)}</div>
                <p className="mt-1 text-sm text-slate-500">{formatNumber(summary.performance.deviationCount)} deviation record</p>
              </Link>
              <Link to={buildLink('/production/deviations', { ...filterParams, status: 'PENDING_APPROVAL' })} className="rounded-[22px] border border-amber-100 bg-amber-50/80 p-4 transition hover:border-amber-300">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700/70">Pending Approval</div>
                <div className="mt-2 font-display text-2xl font-semibold text-amber-800">{formatNumber(summary.performance.pendingDeviationCount)}</div>
                <p className="mt-1 text-sm text-amber-800/65">Butuh review supervisor</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}

function MetricTile({ label, value, icon: Icon }: { label: string; value: string; icon: ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="rounded-[22px] border border-white/70 bg-white/75 p-4">
      <div className="flex items-center justify-between gap-3 text-slate-500">
        <span className="text-xs font-semibold uppercase tracking-[0.16em]">{label}</span>
        <Icon size={18} />
      </div>
      <div className="mt-3 font-display text-2xl font-semibold text-ink">{value}</div>
    </div>
  )
}
