import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarDays, Factory, Play } from 'lucide-react'
import { productionOrdersApi } from '@/api/productionOrders.api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import { EMPTY_PAGINATION } from '@/features/master-data/utils'
import type { OperatorProductionQueueItem } from '@/features/operator-production/types'
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
  const [error, setError] = useState<string | null>(null)
  const [startingId, setStartingId] = useState<string | null>(null)

  async function loadQueue() {
    setIsLoading(true)
    setError(null)
    try {
      const result = await productionOrdersApi.getMyQueue(page, PAGE_SIZE)
      setItems(result.items)
      setPagination(result.pagination)
    } catch (caughtError) {
      setError((caughtError as ApiError).message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadQueue()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  async function startProduction(id: string) {
    setStartingId(id)
    setError(null)
    try {
      await productionOrdersApi.startProduction(id)
      navigate(`/operator/production/${id}`)
    } catch (caughtError) {
      setError((caughtError as ApiError).message)
    } finally {
      setStartingId(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-[30px] bg-ink px-6 py-8 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(232,163,61,0.24),transparent_52%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-paper/65">
            <Factory size={16} className="text-signal" /> My Production
          </div>
          <h1 className="mt-4 font-display text-3xl font-semibold sm:text-4xl">Pekerjaan Anda hari ini</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-paper/70">Pilih satu production order. Sistem hanya akan menampilkan langkah yang dapat Anda kerjakan sekarang.</p>
        </div>
      </section>

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
            return <Card key={item.id} data-tour={index === 0 ? 'operator-queue-row' : undefined} className="overflow-hidden">
              <CardContent className="flex flex-col gap-5 p-6 sm:p-7 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><Badge variant={isReleased ? 'signal' : 'default'}>{isReleased ? 'Released' : 'In progress'}</Badge><span className="text-xs font-semibold tracking-wide text-slate-500">{item.productionOrderNumber}</span></div>
                  <h2 className="mt-3 font-display text-2xl font-semibold text-ink">{item.productName}</h2>
                  <p className="mt-1 text-sm text-slate-500">{item.targetOutput} {uom} target output · Recipe v{item.recipeVersionNumber}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600"><span className="inline-flex items-center gap-2"><CalendarDays size={16} />{formatSchedule(item.scheduledDate)}</span><span>Step {item.progress.currentStepSequence ?? item.progress.totalSteps} of {item.progress.totalSteps} · {progress}%</span></div>
                </div>
                <Button size="lg" className="h-12 min-w-[164px]" disabled={startingId === item.id} onClick={() => isReleased ? void startProduction(item.id) : navigate(`/operator/production/${item.id}`)}><Play size={18} fill="currentColor" />{startingId === item.id ? 'Memulai...' : isReleased ? 'Start Production' : 'Continue'}</Button>
              </CardContent>
            </Card>
          })}
        </section>
      )}

      {!isLoading && !error && pagination.totalPages > 1 ? <div className="flex items-center justify-between rounded-2xl border border-ink/8 bg-white/70 p-3"><Button variant="secondary" disabled={!pagination.hasPreviousPage} onClick={() => setSearchParams({ page: String(page - 1) })}><ArrowLeft size={17} /> Previous</Button><span className="text-sm font-medium text-slate-600">Page {pagination.page} of {pagination.totalPages}</span><Button variant="secondary" disabled={!pagination.hasNextPage} onClick={() => setSearchParams({ page: String(page + 1) })}>Next <ArrowRight size={17} /></Button></div> : null}
    </div>
  )
}
