import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, CheckCircle2, ClipboardCheck, LoaderCircle, Save } from 'lucide-react'
import { stockOpnamesApi } from '@/api/stockOpnames.api'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import type { StockOpnameDetail, StockOpnameStatus } from '@/features/stock-opname/types'
import { getStockOpnameSummary } from '@/features/stock-opname/validation'
import type { ApiError } from '@/types/api'

function formatQuantity(value: number | null, unit?: string | null) {
  if (value === null) return '-'
  return `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 4 }).format(value)} ${unit ?? ''}`.trim()
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString('id-ID') : '-'
}

function statusClass(status: StockOpnameStatus) {
  if (status === 'POSTED') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (status === 'CANCELLED') return 'border-slate-200 bg-slate-100 text-slate-500'
  if (status === 'READYTOPOST') return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-blue-200 bg-blue-50 text-blue-700'
}

function varianceClass(value: number | null) {
  if (value === null) return 'border-slate-200 bg-slate-50 text-slate-500'
  if (value === 0) return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (value > 0) return 'border-blue-200 bg-blue-50 text-blue-700'
  return 'border-red-200 bg-red-50 text-red-700'
}

export function StockOpnameDetailPage() {
  const { id } = useParams()
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

  useEffect(() => { void loadData() }, [id])

  const summary = useMemo(() => getStockOpnameSummary(detail?.items ?? []), [detail])
  const isEditable = detail?.status === 'DRAFT' || detail?.status === 'INPROGRESS'
  const canPost = detail?.status === 'INPROGRESS' || detail?.status === 'READYTOPOST'
  const allCounted = detail ? detail.items.every((item) => counts[item.id] !== '' && Number(counts[item.id]) >= 0) : false

  async function saveCounts() {
    if (!id || !detail) return
    setIsSaving(true)
    setActionError(null)
    try {
      const result = await stockOpnamesApi.saveCounts(id, {
        items: detail.items.map((item) => ({ itemId: item.id, physicalQuantity: Number(counts[item.id]), notes: item.notes })),
      })
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
      <Button asChild variant="ghost" className="text-slate-500"><Link to="/warehouse/stock-opname"><ArrowLeft size={16} />Kembali</Link></Button>
      <section className="rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72"><ClipboardCheck size={14} className="text-signal" />{detail.stockOpnameNumber}</div>
            <h1 className="mt-5 font-display text-3xl font-semibold">{detail.warehouseName}</h1>
            <p className="mt-2 text-sm text-paper/65">Tanggal {formatDate(detail.opnameDate)} · Created by {detail.createdBy ?? '-'}</p>
          </div>
          <Badge className={statusClass(detail.status)}>{detail.status}</Badge>
        </div>
      </section>

      <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex gap-3"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><p>Posting Stock Opname akan menyesuaikan inventory berdasarkan hasil physical count. Pastikan seluruh quantity sudah benar.</p></div></div>
      {actionError ? <div className="rounded-[24px] border border-red-100 bg-red-50 p-4 text-sm text-red-700">{actionError}</div> : null}

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="rounded-[24px]"><CardContent className="p-4"><div className="text-xs uppercase text-slate-400">Total LOT Counted</div><div className="mt-2 text-2xl font-semibold">{summary.totalLotCounted}/{detail.items.length}</div></CardContent></Card>
        <Card className="rounded-[24px]"><CardContent className="p-4"><div className="text-xs uppercase text-slate-400">Matching LOT</div><div className="mt-2 text-2xl font-semibold text-emerald-700">{summary.matchingLot}</div></CardContent></Card>
        <Card className="rounded-[24px]"><CardContent className="p-4"><div className="text-xs uppercase text-slate-400">Positive Variance</div><div className="mt-2 text-2xl font-semibold text-blue-700">{summary.positiveVariance}</div></CardContent></Card>
        <Card className="rounded-[24px]"><CardContent className="p-4"><div className="text-xs uppercase text-slate-400">Negative Variance</div><div className="mt-2 text-2xl font-semibold text-red-700">{summary.negativeVariance}</div></CardContent></Card>
        <Card className="rounded-[24px]"><CardContent className="p-4"><div className="text-xs uppercase text-slate-400">Total Correction</div><div className="mt-2 text-2xl font-semibold">{formatQuantity(summary.totalCorrection)}</div><div className="text-xs text-slate-400">Net {formatQuantity(summary.netVariance)}</div></CardContent></Card>
      </div>

      <Card className="overflow-hidden rounded-[28px] border-slate-200/80">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><CardTitle>Inventory Snapshot</CardTitle><div className="flex gap-2">{isEditable ? <Button disabled={!allCounted || isSaving} onClick={() => void saveCounts()}><Save size={16} />{isSaving ? 'Saving...' : 'Save Count'}</Button> : null}{canPost ? <Button disabled={!allCounted || isPosting} onClick={() => setConfirmOpen(true)} className="bg-red-700 text-white hover:bg-red-800"><CheckCircle2 size={16} />POST STOCK OPNAME</Button> : null}</div></CardHeader>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>{['Material', 'LOT', 'System Qty', 'Physical Qty', 'Variance'].map((label) => <th key={label} className="px-5 py-3">{label}</th>)}</tr></thead>
            <tbody>
              {detail.items.map((item) => <tr key={item.id} className="border-t border-slate-100 align-top">
                <td className="sticky left-0 z-10 bg-white px-5 py-4 font-semibold text-ink shadow-[8px_0_14px_rgba(15,23,42,0.04)]">{item.rawMaterialName}<div className="text-xs text-slate-400">{item.rawMaterialCode}</div></td>
                <td className="px-5 py-4 font-medium">{item.rawMaterialLotNumber}</td>
                <td className="px-5 py-4">{formatQuantity(item.systemQuantity, item.unitOfMeasureSymbol)}</td>
                <td className="px-5 py-3"><input disabled={!isEditable} inputMode="decimal" type="number" min="0" step="0.0001" className="h-12 min-w-32 rounded-2xl border border-slate-200 px-4 text-base disabled:bg-slate-100" value={counts[item.id] ?? ''} onChange={(event) => setCounts((current) => ({ ...current, [item.id]: event.target.value }))} /></td>
                <td className="px-5 py-4"><Badge className={varianceClass(item.varianceQuantity)}>{item.varianceQuantity === 0 ? 'Match' : item.varianceQuantity && item.varianceQuantity > 0 ? 'Surplus ' : item.varianceQuantity && item.varianceQuantity < 0 ? 'Shortage ' : ''}{formatQuantity(item.varianceQuantity, item.unitOfMeasureSymbol)}</Badge></td>
              </tr>)}
            </tbody>
          </table>
        </div>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Konfirmasi Posting Stock Opname</DialogTitle><DialogDescription>Posting Stock Opname akan menyesuaikan inventory berdasarkan hasil physical count. Pastikan seluruh quantity sudah benar.</DialogDescription></DialogHeader>
          <div className="rounded-2xl bg-slate-50 p-4 text-sm">Total correction: <b>{formatQuantity(summary.totalCorrection)}</b> · Variance lines: <b>{summary.positiveVariance + summary.negativeVariance}</b></div>
          <DialogFooter><Button variant="secondary" onClick={() => setConfirmOpen(false)}>Batal</Button><Button disabled={isPosting} onClick={() => void postOpname()} className="bg-red-700 text-white hover:bg-red-800">{isPosting ? <LoaderCircle size={16} className="animate-spin" /> : null}POST STOCK OPNAME</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
