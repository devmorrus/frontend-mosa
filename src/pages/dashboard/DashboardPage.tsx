import { useEffect, useState } from 'react'
import type { ComponentType, Dispatch, ReactNode, SetStateAction } from 'react'
import { Link } from 'react-router-dom'
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Command,
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
  Sparkles,
  TrendingUp,
  Warehouse,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { dashboardApi, type DashboardSummary, type DashboardSummaryQuery } from '@/api/dashboard.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { ForbiddenPage } from '@/pages/errors/ForbiddenPage'
import { cn } from '@/lib/utils'
import type { ApiError } from '@/types/api'
import type { WarehouseListItem } from '@/features/warehouses/types'

const numberFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })

const chartPalette = {
  primary: '#0b5ed7',
  primaryDark: '#063b8c',
  slate: '#64748b',
  slateSoft: '#cbd5e1',
  signal: '#ffc928',
  emerald: '#059669',
  amber: '#d97706',
  rose: '#dc2626',
  indigo: '#4f46e5',
  cyan: '#0891b2',
}

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

function tooltipFormatter(value: unknown) {
  return typeof value === 'number' ? formatNumber(value) : String(value ?? '')
}

function chartLabelFormatter(value: unknown) {
  return typeof value === 'number' ? formatNumber(value) : String(value ?? '')
}

function getDeviationTone(value: number) {
  if (value < 0) return 'text-red-600'
  if (value > 0) return 'text-blue-700'
  return 'text-slate-600'
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(Math.max(value, 0), 100)
}

function formatPeriod(dateFrom: string, dateTo: string) {
  return `${dateFrom || 'awal data'} sampai ${dateTo || 'hari ini'}`
}

function buildLink(path: string, params: Record<string, string | undefined>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value)
  })
  const query = search.toString()
  return query ? `${path}?${query}` : path
}

function SectionHeader({ title, description, eyebrow }: { title: string; description: string; eyebrow?: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-ink/45">{eyebrow}</div> : null}
      <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  )
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string; icon: ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="rounded-xl border border-paper/10 bg-paper/8 px-3 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-paper/52">
        <Icon size={13} />
        <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em]">{label}</span>
      </div>
      <div className="mt-1 font-display text-xl font-semibold leading-none text-paper">{value}</div>
    </div>
  )
}

function CompactMetricLink({
  label,
  value,
  caption,
  icon: Icon,
  to,
  tone = 'default',
}: {
  label: string
  value: string | number
  caption: string
  icon: ComponentType<{ size?: number; className?: string }>
  to: string
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'signal'
}) {
  const toneClass = {
    default: 'border-slate-200 bg-white text-ink hover:border-ink/20',
    success: 'border-emerald-200 bg-emerald-50/45 text-emerald-800 hover:border-emerald-300',
    warning: 'border-amber-200 bg-amber-50/55 text-amber-800 hover:border-amber-300',
    danger: 'border-red-200 bg-red-50/55 text-red-700 hover:border-red-300',
    signal: 'border-blue-200 bg-blue-50/45 text-blue-800 hover:border-blue-300',
  }[tone]

  return (
    <Link
      to={to}
      aria-label={`${label}: ${value}`}
      className={cn(
        'group grid min-h-[104px] w-full min-w-0 grid-cols-[40px_minmax(0,1fr)_16px] items-center gap-3 overflow-hidden rounded-[22px] border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(15,23,42,0.08)]',
        toneClass,
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-current shadow-sm ring-1 ring-current/10">
        <Icon size={18} />
      </div>
      <div className="min-w-0 overflow-hidden">
        <div className="truncate text-[11px] font-semibold uppercase tracking-[0.1em] opacity-65">{label}</div>
        <div className="mt-1 truncate font-display text-3xl font-semibold leading-none">{value}</div>
        <p className="mt-2 truncate text-sm leading-5 opacity-70" title={caption}>{caption}</p>
      </div>
      <ArrowRight size={16} className="shrink-0 opacity-55 transition group-hover:translate-x-1" />
    </Link>
  )
}

export function DashboardPage() {
  const { user, hasPermission } = useAuth()
  const canViewDashboard = hasPermission('dashboard.view')
  const canViewWarehouses = hasPermission('warehouses.view')
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
    // Never fire the summary request without the permission: the backend
    // answers 403 and the console fills with errors for roles like operator.
    if (!hasPermission('dashboard.view')) {
      setIsLoading(false)
      setIsRefreshing(false)
      return
    }

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
    // The warehouse filter is optional: skip the lookup entirely when the
    // role may not list warehouses, instead of producing a 403.
    if (!canViewWarehouses) {
      return
    }

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
  }, [canViewWarehouses])

  useEffect(() => {
    if (!canViewDashboard) {
      setIsLoading(false)
      return
    }
    void loadDashboard(query, Boolean(summary))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(query), canViewDashboard])

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

  // The route guard already redirects here, this is a second layer so the
  // page never fires dashboard API calls without the permission.
  if (!canViewDashboard) {
    return <ForbiddenPage />
  }

  return (
    <div className="space-y-6">
      <DashboardHero
        userName={user?.name ?? 'pengguna'}
        selectedWarehouseName={selectedWarehouse?.name ?? 'Semua warehouse'}
        period={formatPeriod(query.dateFrom, query.dateTo)}
        summary={summary}
      />

      <DashboardFilters
        query={query}
        setQuery={setQuery}
        warehouses={warehouses}
        canViewWarehouses={canViewWarehouses}
        isRefreshing={isRefreshing}
        onRefresh={() => void loadDashboard(query, true)}
      />

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

function DashboardHero({
  userName,
  selectedWarehouseName,
  period,
  summary,
}: {
  userName: string
  selectedWarehouseName: string
  period: string
  summary: DashboardSummary | null
}) {
  return (
    <section className="relative overflow-hidden rounded-[24px] border border-ink/10 bg-[linear-gradient(135deg,#062f75_0%,#0647a6_48%,#0b5ed7_100%)] px-5 py-5 text-paper shadow-[0_18px_50px_rgba(6,59,140,0.18)] sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-signal/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 right-8 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
        <div className="min-w-0">
          <Badge variant="subtle" className="gap-2 border-paper/[0.12] bg-paper/10 px-3 py-1 text-paper shadow-none">
            <Command size={13} className="text-signal" />
            Manufacturing Command Center
          </Badge>
          <h1 className="mt-4 max-w-3xl font-display text-2xl font-semibold leading-snug text-paper sm:text-3xl">
            Monitoring produksi, inventory, QC, dan performance dalam satu ringkasan.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-paper/70">
            Selamat datang, {userName}. Pantau progress production order, ketersediaan material, antrian QC, dan capaian output dalam satu ringkasan periode berjalan.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-4">
            <MiniStat label="Total PO" value={summary ? formatNumber(summary.production.total) : '—'} icon={Factory} />
            <MiniStat label="Active LOT" value={summary ? formatNumber(summary.inventory.totalActiveLot) : '—'} icon={Layers} />
            <MiniStat label="Waiting QC" value={summary ? formatNumber(summary.qc.waitingQc) : '—'} icon={ClipboardCheck} />
            <MiniStat label="Yield" value={summary ? formatPercent(summary.performance.overallYield) : '—'} icon={TrendingUp} />
          </div>
        </div>

        <Card className="rounded-[20px] border-paper/[0.14] bg-paper/10 text-paper shadow-[0_16px_50px_rgba(0,0,0,0.08)] backdrop-blur-md">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-paper/50">Current scope</div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/20 bg-emerald-300/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-100">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                Live
              </span>
            </div>
            <div className="mt-4 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-paper/12 text-signal ring-4 ring-paper/8">
                <Warehouse size={18} />
              </div>
              <div className="min-w-0">
                <div className="truncate font-display text-xl font-semibold leading-tight text-paper">{selectedWarehouseName}</div>
                <p className="mt-1 text-[13px] leading-5 text-paper/[0.62]">Period {period}.</p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-paper/10 bg-paper/[0.07] px-3 py-2.5 text-[13px] leading-5 text-paper/[0.68]">
              Fokus: shortage, low stock, QC hold/reject, dan pending approval.
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

function DashboardFilters({
  query,
  setQuery,
  warehouses,
  canViewWarehouses,
  isRefreshing,
  onRefresh,
}: {
  query: DashboardSummaryQuery
  setQuery: Dispatch<SetStateAction<DashboardSummaryQuery>>
  warehouses: WarehouseListItem[]
  canViewWarehouses: boolean
  isRefreshing: boolean
  onRefresh: () => void
}) {
  return (
    <Card data-tour="dashboard-period" className="overflow-hidden border-white/80 bg-white/[0.88]">
      <div className="grid gap-5 p-5 sm:p-6 xl:grid-cols-[18rem_minmax(0,1fr)] xl:items-end">
        <div>
          <Badge variant="default" className="w-fit gap-2 bg-ink/8 text-ink shadow-none">
            <Sparkles size={13} />
            Control Panel
          </Badge>
          <CardTitle className="mt-3 text-2xl">Global Filter</CardTitle>
          <CardDescription className="mt-1">Filter ini dikirim langsung ke endpoint dashboard summary.</CardDescription>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1.35fr_auto]">
          <label className="block min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"><CalendarDays size={14} />Dari</span>
            <Input type="date" value={query.dateFrom} onChange={(event) => setQuery((current) => ({ ...current, dateFrom: event.target.value }))} />
          </label>
          <label className="block min-w-0">
            <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"><CalendarDays size={14} />Sampai</span>
            <Input type="date" value={query.dateTo} onChange={(event) => setQuery((current) => ({ ...current, dateTo: event.target.value }))} />
          </label>
          {canViewWarehouses ? (
            <label className="block min-w-0">
              <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"><Warehouse size={14} />Warehouse</span>
              <select className="h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink shadow-sm outline-none transition focus-visible:border-ink focus-visible:ring-4 focus-visible:ring-ink/10" value={query.warehouseId} onChange={(event) => setQuery((current) => ({ ...current, warehouseId: event.target.value }))}>
                <option value="">Semua warehouse</option>
                {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
              </select>
            </label>
          ) : null}
          <Button variant="secondary" onClick={onRefresh} disabled={isRefreshing} className="h-14 self-end rounded-2xl border-ink/10 px-5 text-ink hover:border-ink/20 hover:bg-blue-50">
            {isRefreshing ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
            Refresh
          </Button>
        </div>
      </div>
    </Card>
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
  const openProduction = Math.max(
    summary.production.total - summary.production.completed - summary.production.cancelled,
    0,
  )
  const riskAlerts =
    summary.production.materialShortage +
    summary.inventory.lowStockMaterialCount +
    summary.qc.hold +
    summary.qc.reject
  const pendingDecisions = summary.performance.pendingDeviationCount + summary.qc.hold

  return (
    <div className="space-y-10">
      <InsightStrip
        openProduction={openProduction}
        riskAlerts={riskAlerts}
        pendingDecisions={pendingDecisions}
        yieldValue={summary.performance.overallYield}
      />

      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(420px,0.9fr)]">
        <ProductionAnalytics summary={summary} productionFilters={productionFilters} />
        <PerformancePanel summary={summary} filterParams={filterParams} deviation={deviation} />
        <InventoryAnalytics summary={summary} filterParams={filterParams} />
        <QualityAnalytics summary={summary} filterParams={filterParams} />
      </section>
    </div>
  )
}

function AnalyticsCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <Card className={cn('overflow-hidden border-slate-200/75 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]', className)}>
      {children}
    </Card>
  )
}

function ProductionAnalytics({ summary, productionFilters }: { summary: DashboardSummary; productionFilters: Record<string, string | undefined> }) {
  const data = [
    { name: 'Draft', value: summary.production.draft, fill: chartPalette.slateSoft },
    { name: 'Ready', value: summary.production.ready, fill: chartPalette.cyan },
    { name: 'Released', value: summary.production.released, fill: chartPalette.indigo },
    { name: 'In Progress', value: summary.production.inProgress, fill: chartPalette.primary },
    { name: 'Completed', value: summary.production.completed, fill: chartPalette.emerald },
    { name: 'Shortage', value: summary.production.materialShortage, fill: chartPalette.rose },
    { name: 'Cancelled', value: summary.production.cancelled, fill: chartPalette.slate },
  ]

  return (
    <section className="space-y-4" data-tour="dashboard-production">
      <SectionHeader eyebrow="Production Flow" title="Production Analytics" description="Komposisi status production order berdasarkan periode filter." />
      <AnalyticsCard>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 16, right: 10, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} interval={0} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                <Tooltip formatter={tooltipFormatter} cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 18px 40px rgba(15,23,42,0.08)' }} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {data.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                  <LabelList dataKey="value" position="top" formatter={chartLabelFormatter} fill="#0f172a" fontSize={12} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            <CompactMetricLink label="Total PO" value={formatNumber(summary.production.total)} caption="Semua status" icon={Factory} to={buildLink('/production/orders', productionFilters)} />
            <CompactMetricLink label="In Progress" value={formatNumber(summary.production.inProgress)} caption="Sedang diproses" icon={Gauge} to={buildLink('/production/orders', { ...productionFilters, status: 'IN_PROGRESS' })} tone="signal" />
            <CompactMetricLink label="Completed" value={formatNumber(summary.production.completed)} caption="Termasuk QC" icon={CheckCircle2} to={buildLink('/production/orders', { ...productionFilters, status: 'COMPLETED' })} tone="success" />
            <div data-tour="dashboard-shortage"><CompactMetricLink label="Shortage" value={formatNumber(summary.production.materialShortage)} caption="Tindak lanjut" icon={AlertTriangle} to={buildLink('/production/orders', { ...productionFilters, status: 'MATERIAL_SHORTAGE' })} tone={summary.production.materialShortage > 0 ? 'danger' : 'default'} /></div>
          </div>
        </CardContent>
      </AnalyticsCard>
    </section>
  )
}

function InventoryAnalytics({ summary, filterParams }: { summary: DashboardSummary; filterParams: Record<string, string | undefined> }) {
  const data = [
    { name: 'Active LOT', value: summary.inventory.totalActiveLot, fill: chartPalette.primary },
    { name: 'Low Stock', value: summary.inventory.lowStockMaterialCount, fill: chartPalette.amber },
    { name: 'Expiring LOT', value: summary.inventory.expiringLotCount, fill: chartPalette.cyan },
  ]

  return (
    <section className="space-y-4" data-tour="dashboard-inventory">
      <SectionHeader eyebrow="Warehouse Signal" title="Inventory Analytics" description="Risk view raw material LOT aktif, low stock, dan expiry window backend." />
      <AnalyticsCard>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 10, right: 24, left: 18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 12 }} width={86} />
                <Tooltip formatter={tooltipFormatter} cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={28}>
                  {data.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                  <LabelList dataKey="value" position="right" formatter={chartLabelFormatter} fill="#0f172a" fontSize={12} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            <CompactMetricLink label="Raw Stock" value={formatNumber(summary.inventory.totalRawMaterialsWithStock)} caption="Material aktif" icon={Boxes} to={buildLink('/inventory', { warehouseId: filterParams.warehouseId })} />
            <CompactMetricLink label="Active LOT" value={formatNumber(summary.inventory.totalActiveLot)} caption="Available" icon={Layers} to={buildLink('/lots', { warehouseId: filterParams.warehouseId, status: 'AVAILABLE' })} tone="success" />
            <CompactMetricLink label="Low Stock" value={formatNumber(summary.inventory.lowStockMaterialCount)} caption="Di bawah minimum" icon={ShieldAlert} to={buildLink('/inventory', { warehouseId: filterParams.warehouseId, status: 'LOW_STOCK' })} tone={summary.inventory.lowStockMaterialCount > 0 ? 'warning' : 'default'} />
            <CompactMetricLink label="Expiring" value={formatNumber(summary.inventory.expiringLotCount)} caption="30 hari" icon={PackageSearch} to={buildLink('/lots', { warehouseId: filterParams.warehouseId, status: 'AVAILABLE' })} tone={summary.inventory.expiringLotCount > 0 ? 'warning' : 'default'} />
          </div>
        </CardContent>
      </AnalyticsCard>
    </section>
  )
}

function QualityAnalytics({ summary, filterParams }: { summary: DashboardSummary; filterParams: Record<string, string | undefined> }) {
  const data = [
    { name: 'Pass', value: summary.qc.pass, fill: chartPalette.emerald },
    { name: 'Waiting QC', value: summary.qc.waitingQc, fill: chartPalette.primary },
    { name: 'Hold', value: summary.qc.hold, fill: chartPalette.amber },
    { name: 'Reject', value: summary.qc.reject, fill: chartPalette.rose },
  ]
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <section className="space-y-4" data-tour="dashboard-qc">
      <SectionHeader eyebrow="Release Gate" title="Quality Control" description="Distribusi status QC finished goods lot sesuai periode produksi." />
      <AnalyticsCard>
        <CardContent className="flex min-w-0 flex-col gap-5 p-5 sm:p-6">
          <div className="relative mx-auto h-60 w-full min-w-0 max-w-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" nameKey="name" innerRadius={70} outerRadius={100} paddingAngle={3} stroke="#ffffff" strokeWidth={4}>
                  {data.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={tooltipFormatter} contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
              <div>
                <div className="font-display text-3xl font-semibold leading-none text-ink">{formatNumber(total)}</div>
                <div className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">QC Total</div>
              </div>
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
            <CompactMetricLink label="Waiting QC" value={formatNumber(summary.qc.waitingQc)} caption="Menunggu inspeksi" icon={ClipboardCheck} to={buildLink('/quality-control', { ...filterParams, status: 'WAITING_QC' })} tone="signal" />
            <CompactMetricLink label="Hold" value={formatNumber(summary.qc.hold)} caption="Perlu keputusan" icon={PauseCircle} to={buildLink('/quality-control', { ...filterParams, status: 'HOLD' })} tone={summary.qc.hold > 0 ? 'warning' : 'default'} />
            <CompactMetricLink label="Reject" value={formatNumber(summary.qc.reject)} caption="LOT rejected" icon={ShieldAlert} to={buildLink('/quality-control', { ...filterParams, status: 'REJECTED' })} tone={summary.qc.reject > 0 ? 'danger' : 'default'} />
            <CompactMetricLink label="QC Total" value={formatNumber(summary.qc.total)} caption={`${formatNumber(summary.qc.pass)} pass`} icon={PackageCheck} to={buildLink('/quality-control', filterParams)} tone="success" />
          </div>
        </CardContent>
      </AnalyticsCard>
    </section>
  )
}

function InsightStrip({
  openProduction,
  riskAlerts,
  pendingDecisions,
  yieldValue,
}: {
  openProduction: number
  riskAlerts: number
  pendingDecisions: number
  yieldValue: number
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <InsightTile label="Open Production" value={formatNumber(openProduction)} caption="PO belum selesai" icon={Activity} tone="blue" />
      <InsightTile label="Risk Alerts" value={formatNumber(riskAlerts)} caption="Shortage, stock, QC risk" icon={AlertTriangle} tone={riskAlerts > 0 ? 'red' : 'blue'} />
      <InsightTile label="Pending Decisions" value={formatNumber(pendingDecisions)} caption="Hold + approval" icon={ShieldAlert} tone={pendingDecisions > 0 ? 'amber' : 'blue'} />
      <InsightTile label="Yield Health" value={formatPercent(yieldValue)} caption="Overall output yield" icon={TrendingUp} tone="green" />
    </section>
  )
}

function InsightTile({ label, value, caption, icon: Icon, tone }: { label: string; value: string; caption: string; icon: ComponentType<{ size?: number; className?: string }>; tone: 'blue' | 'amber' | 'red' | 'green' }) {
  const toneClass = {
    blue: 'border-blue-100 bg-blue-50/70 text-blue-800',
    amber: 'border-amber-100 bg-amber-50/80 text-amber-800',
    red: 'border-red-100 bg-red-50/80 text-red-700',
    green: 'border-emerald-100 bg-emerald-50/80 text-emerald-800',
  }[tone]

  return (
    <div className={cn('rounded-[24px] border px-5 py-4 shadow-[0_14px_36px_rgba(6,59,140,0.06)] backdrop-blur-sm', toneClass)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-60">{label}</div>
          <div className="mt-2 font-display text-3xl font-semibold leading-none">{value}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/75 shadow-sm">
          <Icon size={18} />
        </div>
      </div>
      <p className="mt-3 text-sm opacity-[0.68]">{caption}</p>
    </div>
  )
}

function PerformancePanel({ summary, filterParams, deviation }: { summary: DashboardSummary; filterParams: Record<string, string | undefined>; deviation: number }) {
  const yieldProgress = clampPercent(summary.performance.overallYield)
  const outputData = [
    { name: 'Target', value: summary.performance.targetOutput, fill: chartPalette.slate },
    { name: 'Actual', value: summary.performance.actualOutput, fill: chartPalette.primary },
  ]
  const gaugeData = [{ name: 'Yield', value: yieldProgress, fill: chartPalette.primary }]

  return (
    <AnalyticsCard className="border-blue-100/80 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)]">
      <CardHeader className="pb-4">
        <Badge variant="default" className="w-fit gap-2 bg-ink/8 text-ink shadow-none"><Gauge size={13} />Performance</Badge>
        <CardTitle className="mt-2">Output vs target</CardTitle>
        <CardDescription>Target, actual, yield, deviation, dan approval pending dari backend.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 px-5 pb-5 sm:px-6 sm:pb-6 2xl:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Output Comparison</div>
            <Scale size={18} className="text-slate-400" />
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={outputData} layout="vertical" margin={{ top: 8, right: 28, left: 4, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#475569', fontSize: 12 }} width={58} />
                <Tooltip formatter={tooltipFormatter} cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 16, border: '1px solid #e2e8f0' }} />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={28}>
                  {outputData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                  <LabelList dataKey="value" position="right" formatter={chartLabelFormatter} fill="#0f172a" fontSize={12} fontWeight={700} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div data-tour="dashboard-yield" className="grid gap-4 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[160px_minmax(0,1fr)] sm:items-center 2xl:grid-cols-1">
          <div className="relative h-40">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" data={gaugeData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" cornerRadius={18} background={{ fill: '#e2e8f0' }} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-center">
              <div>
                <div className="font-display text-3xl font-semibold text-ink">{formatPercent(summary.performance.overallYield)}</div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Yield</div>
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"><TrendingUp size={16} />Overall Yield</div>
            <p className="mt-3 text-sm leading-6 text-slate-600">Average yield: <span className="font-semibold text-ink">{formatPercent(summary.performance.averageYield)}</span></p>
            <p className="mt-2 text-sm leading-6 text-slate-600">Gauge dibatasi 0-100% untuk visual, angka tetap mengikuti data backend.</p>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 2xl:col-span-2">
          <Link data-tour="dashboard-deviation" to={buildLink('/production/deviations', { ...filterParams, status: 'ALL' })} className="group rounded-[24px] border border-slate-200 bg-white/[0.82] p-4 transition hover:-translate-y-0.5 hover:border-ink/20 hover:shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Deviation</div>
              <ArrowRight size={15} className="text-slate-400 transition group-hover:translate-x-1" />
            </div>
            <div className={cn('mt-2 font-display text-2xl font-semibold', getDeviationTone(deviation))}>{formatNumber(deviation)}</div>
            <p className="mt-1 text-sm text-slate-500">{formatNumber(summary.performance.deviationCount)} deviation record</p>
          </Link>
          <Link to={buildLink('/production/deviations', { ...filterParams, status: 'PENDING_APPROVAL' })} className="group rounded-[24px] border border-amber-100 bg-amber-50/[0.82] p-4 transition hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700/70">Pending Approval</div>
              <ArrowRight size={15} className="text-amber-700/50 transition group-hover:translate-x-1" />
            </div>
            <div className="mt-2 font-display text-2xl font-semibold text-amber-800">{formatNumber(summary.performance.pendingDeviationCount)}</div>
            <p className="mt-1 text-sm text-amber-800/65">Butuh review supervisor</p>
          </Link>
        </div>
      </CardContent>
    </AnalyticsCard>
  )
}
