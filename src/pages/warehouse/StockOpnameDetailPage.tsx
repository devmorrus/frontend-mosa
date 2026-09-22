import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardCheck, Layers3, LoaderCircle, Save } from 'lucide-react'
import { stockOpnamesApi } from '@/api/stockOpnames.api'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { ModuleHero } from '@/components/common/ModuleHero'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import type { StockOpnameDetail, StockOpnameItem } from '@/features/stock-opname/types'
import { getStockOpnameSummary } from '@/features/stock-opname/validation'
import { getStockOpnameProgress, getStockOpnameStatusLabel, getStockOpnameStatusTone, getStockOpnameVarianceLabel, getStockOpnameVarianceTone } from '@/features/stock-opname/utils'
import { useAuth } from '@/hooks/useAuth'
import { breadcrumbs, canonicalRoutes } from '@/routes/canonicalRoutes'
import type { ApiError } from '@/types/api'

function formatQuantity(value: number | null, unit?: string | null) {
  if (value === null) return '-'
  return `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 }).format(value)} ${unit ?? ''}`.trim()
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'
}

const workflow = ['DRAFT', 'INPROGRESS', 'READYTOPOST', 'POSTED'] as const

export function StockOpnameDetailPage() {
  const { id } = useParams()
  const { can } = useAuth()
  const [detail, setDetail] = useState<StockOpnameDetail | null>(null)
  const [counts, setCounts] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  async function loadData() {
    if (!id) return
    setIsLoading(true)
    setError(null)
    try {
      let result = await stockOpnamesApi.getById(id)
      if (result.status === 'DRAFT' && result.items.length > 0) result = await stockOpnamesApi.start(id)
      setDetail(result)
      setCounts(Object.fromEntries(result.items.map((item) => [item.id, item.physicalQuantity === null ? '' : String(item.physicalQuantity)])))
    } catch (caughtError) {
      setError((caughtError as ApiError).message)
    } finally {
      setIsLoading(false)
    }
  }

  // The loader intentionally synchronizes the route id with backend state.
  // eslint-disable-next-line react-hooks/exhaustive-deps, react/set-state-in-effect
  useEffect(() => { void loadData() }, [id])
  const summary = useMemo(() => getStockOpnameSummary(detail?.items ?? []), [detail])
  const canUpdateCount = can('stock-opname.update')
  const canPostOpname = can('stock-opname.post')
  const isEditable = (detail?.status === 'DRAFT' || detail?.status === 'INPROGRESS') && canUpdateCount
  const canPost = (detail?.status === 'INPROGRESS' || detail?.status === 'READYTOPOST') && canPostOpname
  const allCounted = detail ? detail.items.every((item) => counts[item.id] !== '' && Number(counts[item.id]) >= 0) : false
  const progress = getStockOpnameProgress(detail?.items ?? [])

  async function saveCounts() {
    if (!id || !detail) return null
    setIsSaving(true)
    setActionError(null)
    try {
      const result = await stockOpnamesApi.saveCounts(id, { items: detail.items.map((item) => ({ itemId: item.id, physicalQuantity: Number(counts[item.id]), notes: item.notes })) })
      setDetail(result)
      setCounts(Object.fromEntries(result.items.map((item) => [item.id, item.physicalQuantity === null ? '' : String(item.physicalQuantity)])))
      return result
    } catch (caughtError) {
      setActionError((caughtError as ApiError).message)
      return null
    } finally {
      setIsSaving(false)
    }
  }

  async function postOpname() {
    if (!id || !detail) return
    setIsPosting(true)
    setActionError(null)
    try {
      const latestDetail = isEditable ? await saveCounts() : detail
      if (!latestDetail) return
      let result = latestDetail.status === 'INPROGRESS' ? await stockOpnamesApi.ready(id) : latestDetail
      result = await stockOpnamesApi.post(result.id)
      setDetail(result)
      setConfirmOpen(false)
      await loadData()
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setActionError(apiError.code === 'stale_snapshot' ? 'Stock berubah sejak opname dibuat. Refresh opname atau buat opname baru sebelum posting.' : apiError.message)
    } finally {
      setIsPosting(false)
    }
  }

  if (isLoading) return <MasterDataLoadingState description="Detail stock opname sedang dimuat." />
  if (error || !detail) return <MasterDataErrorState description={error ?? 'Stock opname tidak ditemukan.'} onRetry={() => void loadData()} />

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs.stockOpnameDetail(detail.stockOpnameNumber)} />
      <Button asChild variant="secondary" className="text-slate-600">
        <Link to={canonicalRoutes.stockOpname}>
          <ArrowLeft size={16} />Kembali ke Stock Opname
        </Link>
      </Button>
      <ModuleHero
        eyebrow="Warehouse • Stock Opname"
        title={detail.stockOpnameNumber}
        description={`${detail.warehouseName} (${detail.warehouseCode}) · ${formatDate(detail.opnameDate)} — Created by ${detail.createdBy ?? '-'} · Updated ${formatDate(detail.updatedAtUtc)}`}
        icon={<ClipboardCheck size={13} className="text-signal" />}
        side={<Badge className={getStockOpnameStatusTone(detail.status)}>{getStockOpnameStatusLabel(detail.status)}</Badge>}
        bottom={
          <div className="grid gap-2 sm:grid-cols-4">
            {workflow.map((status, index) => {
              const currentIndex = workflow.indexOf(detail.status as (typeof workflow)[number])
              const completed = currentIndex >= index
              return (
                <div
                  key={status}
                  className={`rounded-xl border px-3 py-2.5 backdrop-blur-sm ${completed ? 'border-paper/20 bg-paper/15' : 'border-paper/10 bg-paper/10'}`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex size-6 items-center justify-center rounded-full text-xs font-semibold ${completed ? 'bg-white text-[#062f75]' : 'bg-paper/20 text-paper/60'}`}
                    >
                      {completed ? <CheckCircle2 size={14} /> : index + 1}
                    </span>
                    <span className={`text-xs font-semibold ${completed ? 'text-paper' : 'text-paper/60'}`}>
                      {getStockOpnameStatusLabel(status)}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        }
      />

    <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex gap-3"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><p>Posting akan menyesuaikan inventory berdasarkan physical count. Pastikan seluruh LOT sudah dihitung dan variance diverifikasi.</p></div></div>{actionError ? <div className="rounded-[24px] border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{actionError}</div> : null}

    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5" data-tour="opname-variance"><SummaryMetric label="Counted" value={`${summary.totalLotCounted}/${detail.items.length}`} note={`${progress}% selesai`} /><SummaryMetric label="Matching LOT" value={summary.matchingLot} note="tanpa variance" tone="green" /><SummaryMetric label="Positive variance" value={summary.positiveVariance} note="surplus" tone="blue" /><SummaryMetric label="Negative variance" value={summary.negativeVariance} note="shortage" tone="rose" /><SummaryMetric label="Total correction" value={formatQuantity(summary.totalCorrection)} note={`Net ${formatQuantity(summary.netVariance)}`} /></div>

    <Card className="overflow-hidden border-slate-200 bg-white shadow-sm" data-tour="opname-count-table"><CardHeader className="border-b border-slate-100 p-5 sm:p-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><CardTitle className="flex items-center gap-2 text-xl"><Layers3 size={19} className="text-[#0b5ed7]" />Inventory Snapshot</CardTitle><p className="mt-1 text-sm text-slate-500">Masukkan physical quantity untuk setiap LOT sebelum menyimpan atau posting.</p></div><div className="flex flex-wrap gap-2">{isEditable ? <Button disabled={!allCounted || isSaving} onClick={() => void saveCounts()} className="bg-[#063b8c] text-white hover:bg-[#052f70]"><Save size={16} />{isSaving ? 'Saving...' : 'Save Count'}</Button> : null}{canPost ? <Button data-tour="opname-post-btn" disabled={!allCounted || isPosting} onClick={() => setConfirmOpen(true)} className="bg-rose-700 text-white hover:bg-rose-800"><CheckCircle2 size={16} />Post Stock Opname</Button> : null}</div></div></CardHeader><div className="hidden overflow-x-auto md:block"><table className="min-w-[900px] text-left text-sm"><thead className="bg-slate-50/80 text-xs uppercase tracking-[0.12em] text-slate-500"><tr>{['Material', 'LOT', 'System Qty', 'Physical Qty', 'Variance'].map((label) => <th key={label} className="px-5 py-3">{label}</th>)}</tr></thead><tbody>{detail.items.map((item) => <DesktopCountRow key={item.id} item={item} count={counts[item.id] ?? ''} isEditable={isEditable} onChange={(value) => setCounts((current) => ({ ...current, [item.id]: value }))} />)}</tbody></table></div><div className="space-y-3 p-4 md:hidden">{detail.items.map((item) => <MobileCountCard key={item.id} item={item} count={counts[item.id] ?? ''} isEditable={isEditable} onChange={(value) => setCounts((current) => ({ ...current, [item.id]: value }))} />)}</div></Card>

    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}><DialogContent><DialogHeader><DialogTitle>Post Stock Opname?</DialogTitle><DialogDescription>Inventory akan disesuaikan berdasarkan physical count. Pastikan semua variance sudah diverifikasi karena tindakan ini berdampak pada stok sistem.</DialogDescription></DialogHeader><div className="grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-4 text-sm"><div><span className="text-slate-500">Total correction</span><p className="font-semibold">{formatQuantity(summary.totalCorrection)}</p></div><div><span className="text-slate-500">Variance lines</span><p className="font-semibold">{summary.positiveVariance + summary.negativeVariance}</p></div></div><DialogFooter><Button variant="secondary" onClick={() => setConfirmOpen(false)}>Batal</Button><Button disabled={isPosting} onClick={() => void postOpname()} className="bg-rose-700 text-white hover:bg-rose-800">{isPosting ? <LoaderCircle size={16} className="animate-spin" /> : null}Post Stock Opname</Button></DialogFooter></DialogContent></Dialog>
    </div>
  )
}

function SummaryMetric({ label, value, note, tone = 'slate' }: { label: string; value: string | number; note: string; tone?: 'slate' | 'green' | 'blue' | 'rose' }) { const classes = tone === 'green' ? 'text-emerald-700' : tone === 'blue' ? 'text-blue-700' : tone === 'rose' ? 'text-rose-700' : 'text-ink'; return <Card className="border-slate-200 bg-white shadow-sm"><CardContent className="p-4"><div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</div><div className={`mt-2 truncate font-display text-xl font-semibold sm:text-2xl ${classes}`}>{value}</div><div className="mt-1 truncate text-xs text-slate-400">{note}</div></CardContent></Card> }

function DesktopCountRow({ item, count, isEditable, onChange }: { item: StockOpnameItem; count: string; isEditable: boolean; onChange: (value: string) => void }) { return <tr className="border-b border-slate-200/70 align-top transition-colors hover:bg-blue-50/30"><td className="px-5 py-4"><div className="font-semibold text-ink">{item.rawMaterialName}</div><div className="text-xs text-slate-500">{item.rawMaterialCode}</div></td><td className="px-5 py-4 font-medium text-[#063b8c]">{item.rawMaterialLotNumber}</td><td className="px-5 py-4 tabular-nums text-slate-600">{formatQuantity(item.systemQuantity, item.unitOfMeasureSymbol)}</td><td className="px-5 py-3"><input disabled={!isEditable} aria-label={`Physical quantity ${item.rawMaterialLotNumber}`} inputMode="decimal" type="number" min="0" step="0.0001" className="h-12 min-w-32 rounded-2xl border border-slate-200 px-4 text-base outline-none focus:border-[#0b5ed7] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100" value={count} onChange={(event) => onChange(event.target.value)} /></td><td className="px-5 py-4"><VarianceBadge value={item.varianceQuantity} unit={item.unitOfMeasureSymbol} /></td></tr> }

function MobileCountCard({ item, count, isEditable, onChange }: { item: StockOpnameItem; count: string; isEditable: boolean; onChange: (value: string) => void }) { return <article className="rounded-2xl border border-slate-200 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold text-ink">{item.rawMaterialName}</p><p className="mt-0.5 text-xs text-slate-500">{item.rawMaterialCode} · {item.rawMaterialLotNumber}</p></div><VarianceBadge value={item.varianceQuantity} unit={item.unitOfMeasureSymbol} /></div><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-xs text-slate-400">System quantity</dt><dd className="mt-0.5 font-semibold tabular-nums">{formatQuantity(item.systemQuantity, item.unitOfMeasureSymbol)}</dd></div><div><dt className="text-xs text-slate-400">Physical quantity</dt><dd className="mt-1"><input disabled={!isEditable} aria-label={`Physical quantity ${item.rawMaterialLotNumber}`} inputMode="decimal" type="number" min="0" step="0.0001" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#0b5ed7] focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100" value={count} onChange={(event) => onChange(event.target.value)} /></dd></div></dl></article> }

function VarianceBadge({ value, unit }: { value: number | null; unit?: string | null }) { return <Badge className={getStockOpnameVarianceTone(value)}>{getStockOpnameVarianceLabel(value)}{value !== null ? ` ${formatQuantity(value, unit)}` : ''}</Badge> }
