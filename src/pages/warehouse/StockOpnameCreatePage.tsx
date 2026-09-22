import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, Check, ClipboardCheck, LoaderCircle } from 'lucide-react'
import { stockOpnamesApi } from '@/api/stockOpnames.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { validateStockOpnameCreate } from '@/features/stock-opname/validation'
import type { WarehouseListItem } from '@/features/warehouses/types'
import { breadcrumbs, canonicalRoutes, entityLinks } from '@/routes/canonicalRoutes'
import { fetchLookupIfAllowed } from '@/utils/lookupGuard'
import type { ApiError } from '@/types/api'

function todayInput() {
  return new Date().toISOString().slice(0, 10)
}

export function StockOpnameCreatePage() {
  const navigate = useNavigate()
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([])
  const [warehouseId, setWarehouseId] = useState('')
  const [opnameDate, setOpnameDate] = useState(todayInput())
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    void fetchLookupIfAllowed('warehouses.view', () => warehousesApi.listOptions('ACTIVE'), []).then(setWarehouses).catch(() => setWarehouses([]))
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateStockOpnameCreate({ warehouseId, opnameDate })
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const detail = await stockOpnamesApi.create({ warehouseId, opnameDate: new Date(opnameDate).toISOString(), notes: notes.trim() || null })
      navigate(entityLinks.stockOpnameDetail(detail.id))
    } catch (caughtError) {
      setSubmitError((caughtError as ApiError).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return <div className="space-y-6"><Breadcrumb items={breadcrumbs.stockOpnameCreate()} /><Button asChild variant="secondary" className="text-slate-600"><Link to={canonicalRoutes.stockOpname}><ArrowLeft size={16} />Kembali ke Stock Opname</Link></Button><section className="rounded-[28px] border border-slate-200 bg-white px-5 py-6 shadow-sm sm:px-7"><div className="flex items-start gap-4"><div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#063b8c]"><ClipboardCheck size={23} /></div><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0b5ed7]">Warehouse / Stock Opname</p><h1 className="mt-1 font-display text-2xl font-semibold text-ink sm:text-3xl">Create Stock Opname</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Ambil snapshot LOT aktif untuk memulai physical counting dan review variance.</p></div></div></section>

    <Card className="border-slate-200 bg-white shadow-sm"><CardContent className="p-4 sm:p-6"><div className="grid gap-3 sm:grid-cols-5">{['Pilih warehouse', 'Snapshot LOT', 'Physical count', 'Review variance', 'Post correction'].map((step, index) => <div key={step} className="flex items-center gap-3 sm:block"><div className={`flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${index === 0 ? 'bg-[#063b8c] text-white' : 'bg-slate-100 text-slate-400'}`}>{index === 0 ? <Check size={16} /> : index + 1}</div><p className={`text-sm sm:mt-2 ${index === 0 ? 'font-semibold text-ink' : 'text-slate-500'}`}>{step}</p></div>)}</div></CardContent></Card>

    <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex gap-3"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><div><p className="font-semibold">Snapshot inventory akan dibuat saat submit.</p><p className="mt-1 leading-6">LOT aktif dari warehouse yang dipilih menjadi dasar physical counting. Inventory baru berubah setelah dokumen diposting.</p></div></div></div>

    <Card className="border-slate-200 bg-white shadow-sm"><CardHeader><CardTitle className="text-xl">Opname setup</CardTitle><p className="text-sm text-slate-500">Tentukan konteks dokumen sebelum mengambil snapshot LOT.</p></CardHeader><CardContent><form className="space-y-5" onSubmit={handleSubmit}><div><label htmlFor="stock-opname-warehouse" className="text-sm font-semibold text-ink">Warehouse <span className="text-rose-600">*</span></label><p className="mt-1 text-xs text-slate-500">Snapshot LOT akan diambil dari warehouse ini.</p><select id="stock-opname-warehouse" className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#0b5ed7] focus:ring-4 focus:ring-blue-100" value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)}><option value="">Pilih warehouse aktif</option>{warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name} ({warehouse.code})</option>)}</select>{errors.warehouseId ? <p className="mt-1 text-xs text-rose-600">{errors.warehouseId}</p> : null}</div><div><label htmlFor="stock-opname-date" className="text-sm font-semibold text-ink">Tanggal opname <span className="text-rose-600">*</span></label><p className="mt-1 text-xs text-slate-500">Tanggal yang digunakan untuk dokumen physical counting.</p><input id="stock-opname-date" type="date" className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-[#0b5ed7] focus:ring-4 focus:ring-blue-100" value={opnameDate} onChange={(event) => setOpnameDate(event.target.value)} />{errors.opnameDate ? <p className="mt-1 text-xs text-rose-600">{errors.opnameDate}</p> : null}</div><div><label htmlFor="stock-opname-notes" className="text-sm font-semibold text-ink">Catatan</label><p className="mt-1 text-xs text-slate-500">Opsional, misalnya alasan atau konteks pelaksanaan opname.</p><Textarea id="stock-opname-notes" className="mt-2 min-h-28 rounded-2xl" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Tambahkan catatan opname" /></div>{submitError ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{submitError}</div> : null}<Button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-2xl bg-[#063b8c] text-white hover:bg-[#052f70]">{isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : <ClipboardCheck size={16} />}Create Stock Opname</Button></form></CardContent></Card>
  </div>
}
