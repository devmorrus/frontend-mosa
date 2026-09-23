import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarDays, Factory, Play, RefreshCw } from 'lucide-react'
import { productionOrdersApi } from '@/api/productionOrders.api'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ModuleHero } from '@/components/common/ModuleHero'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { breadcrumbs, entityLinks } from '@/routes/canonicalRoutes'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import { EMPTY_PAGINATION } from '@/features/master-data/utils'
import type { OperatorProductionQueueItem } from '@/features/operator-production/types'
import { getVoiceGuidanceSessionKey } from '@/features/operator-production/voiceGuidance'
import { ProductionOrderStatus } from '@/features/production-orders/types'
import type { MasterDataPagination } from '@/features/master-data/types'
import type { ApiError } from '@/types/api'

const PAGE_SIZE = 20

function parsePage(value: string | null) {
  const page = Number(value)
  return Number.isInteger(page) && page > 0 ? page : 1
}

function formatSchedule(value: string | null) {
  if (!value) return 'Belum dijadwalkan'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value))
}

export function OperatorProductionQueuePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const page = parsePage(searchParams.get('page'))
  const [items, setItems] = useState<OperatorProductionQueueItem[]>([])
  const [pagination, setPagination] = useState<MasterDataPagination>(EMPTY_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startingId, setStartingId] = useState<string | null>(null)
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)

  async function loadQueue(background = false) {
    if (background) setIsRefreshing(true)
    else setIsLoading(true)
    setError(null)
    try {
      const result = await productionOrdersApi.getMyQueue(page, PAGE_SIZE)
      setItems(result.items)
      setPagination(result.pagination)
      setLastUpdatedAt(new Date().toLocaleString('id-ID'))
    } catch (caughtError) {
      setError((caughtError as ApiError).message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    void loadQueue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  async function startProduction(id: string) {
    setStartingId(id)
    setError(null)
    try {
      await productionOrdersApi.startProduction(id)
      navigate(entityLinks.operatorProductionDetail(id))
    } catch (caughtError) {
      setError((caughtError as ApiError).message)
    } finally {
      setStartingId(null)
    }
  }

  function continueProduction(item: OperatorProductionQueueItem, isReleased: boolean) {
    sessionStorage.setItem(getVoiceGuidanceSessionKey(item.id), '1')
    if (isReleased) void startProduction(item.id)
    else navigate(entityLinks.operatorProductionDetail(item.id))
  }

  const releasedCount = useMemo(
    () => items.filter((item) => item.status === ProductionOrderStatus.Released).length,
    [items],
  )
  const inProgressCount = useMemo(
    () => items.filter((item) => item.status !== ProductionOrderStatus.Released).length,
    [items],
  )

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <Breadcrumb items={breadcrumbs.operatorProductionList()} />
      <ModuleHero
        eyebrow="Operator • My Production"
        title="Pekerjaan Anda hari ini"
        description="Pilih satu production order. Sistem hanya menampilkan langkah yang dapat Anda kerjakan sekarang dengan progress yang jelas."
        icon={<Factory size={13} className="text-signal" />}
        metrics={[
          { label: 'Antrean', value: pagination.totalItems, sub: 'order ditugaskan' },
          { label: 'Released', value: releasedCount, sub: 'siap dimulai', tone: 'success' },
          { label: 'In Progress', value: inProgressCount, sub: 'dilanjutkan', tone: 'muted' },
        ]}
      />

      <div className="flex flex-col gap-3 rounded-[24px] border border-white/70 bg-white/85 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <div className="font-display text-lg font-semibold text-ink">Antrean Produksi</div>
          <p className="mt-1 text-xs text-slate-500">
            {lastUpdatedAt ? `Terakhir diperbarui ${lastUpdatedAt} · auto-refresh 15 detik` : 'Auto-refresh 15 detik saat halaman terlihat.'}
          </p>
        </div>
        <Button variant="secondary" disabled={isLoading || isRefreshing} onClick={() => void loadQueue(true)}>
          <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          {isRefreshing ? 'Menyegarkan...' : 'Refresh antrean'}
        </Button>
      </div>

      {isLoading ? <MasterDataLoadingState description="Memuat antrean produksi Anda." /> : error ? (
        <MasterDataErrorState description={error} onRetry={() => void loadQueue()} />
      ) : items.length === 0 ? (
        <MasterDataEmptyState description="Belum ada production order released atau in progress yang ditugaskan kepada Anda." />
      ) : (
        <section data-tour="operator-queue" className="grid gap-4">
          {items.map((item, index) => {
            const isReleased = item.status === ProductionOrderStatus.Released
            const uom = item.unitOfMeasureSymbol ?? item.unitOfMeasureCode
            const progress = item.progress.totalSteps === 0 ? 0 : Math.round((item.progress.completedSteps / item.progress.totalSteps) * 100)
            return <Card key={item.id} data-tour={index === 0 ? 'operator-queue-row' : undefined} className="overflow-hidden rounded-[24px] border-slate-200/80 shadow-sm transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-5 p-6 sm:p-7 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><Badge variant={isReleased ? 'signal' : 'default'}>{isReleased ? 'Released' : 'In progress'}</Badge><span className="font-mono text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{item.productionOrderNumber}</span></div>
                  <h2 className="mt-3 font-display text-2xl font-semibold text-ink">{item.productName}</h2>
                  <p className="mt-1 text-sm text-slate-500">{item.targetOutput} {uom} target output · Recipe v{item.recipeVersionNumber}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600"><span className="inline-flex items-center gap-2"><CalendarDays size={16} />{formatSchedule(item.scheduledDate)}</span><span>Step {item.progress.currentStepSequence ?? item.progress.totalSteps} of {item.progress.totalSteps} · {progress}%</span></div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full transition-all ${isReleased ? 'bg-signal' : 'bg-blue-600'}`} style={{ width: `${progress}%` }} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2 md:items-end">
                  <Button size="lg" className="h-12 min-w-[164px]" disabled={startingId === item.id} onClick={() => continueProduction(item, isReleased)}><Play size={18} fill="currentColor" />{startingId === item.id ? 'Memulai...' : isReleased ? 'Start Production' : 'Continue'}</Button>
                  <span className="text-xs text-slate-400">{isReleased ? 'Mulai dari langkah pertama' : 'Lanjut ke langkah aktif'}</span>
                </div>
              </CardContent>
            </Card>
          })}
        </section>
      )}

      {!isLoading && !error && pagination.totalPages > 1 ? <div className="flex items-center justify-between gap-3 rounded-[24px] border border-white/70 bg-white/85 p-3 shadow-sm"><Button variant="secondary" disabled={!pagination.hasPreviousPage} onClick={() => setSearchParams({ page: String(page - 1) })}><ArrowLeft size={17} /> Previous</Button><span className="text-sm font-medium text-slate-600">Page {pagination.page} of {pagination.totalPages} · {pagination.totalItems} order</span><Button variant="secondary" disabled={!pagination.hasNextPage} onClick={() => setSearchParams({ page: String(page + 1) })}>Next <ArrowRight size={17} /></Button></div> : null}
    </div>
  )
}
