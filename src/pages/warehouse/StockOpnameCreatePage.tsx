import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, ClipboardCheck, LoaderCircle } from 'lucide-react'
import { stockOpnamesApi } from '@/api/stockOpnames.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { validateStockOpnameCreate } from '@/features/stock-opname/validation'
import type { WarehouseListItem } from '@/features/warehouses/types'
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
      navigate(`/warehouse/stock-opname/${detail.id}`)
    } catch (caughtError) {
      setSubmitError((caughtError as ApiError).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button asChild variant="ghost" className="text-slate-500"><Link to="/warehouse/stock-opname"><ArrowLeft size={16} />Kembali</Link></Button>
      <section className="rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72"><ClipboardCheck size={14} className="text-signal" />Create Stock Opname</div>
        <h1 className="mt-5 font-display text-3xl font-semibold">Ambil snapshot LOT inventory</h1>
        <p className="mt-3 text-sm leading-7 text-paper/68">Setelah dibuat, backend akan mengambil LOT aktif pada warehouse sebagai dasar physical counting.</p>
      </section>

      <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><div className="flex gap-3"><AlertTriangle size={18} className="mt-0.5 shrink-0" /><p>Stock Opname akan menjadi dasar correction inventory saat diposting. Pastikan warehouse dan tanggal sudah benar.</p></div></div>

      <Card className="rounded-[28px] border-slate-200/80">
        <CardHeader><CardTitle>Header Opname</CardTitle></CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="text-sm font-semibold text-ink">Warehouse</label>
              <select className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm" value={warehouseId} onChange={(event) => setWarehouseId(event.target.value)}>
                <option value="">Pilih warehouse aktif</option>
                {warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name}</option>)}
              </select>
              {errors.warehouseId ? <p className="mt-1 text-xs text-red-600">{errors.warehouseId}</p> : null}
            </div>
            <div>
              <label className="text-sm font-semibold text-ink">Date</label>
              <input type="date" className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm" value={opnameDate} onChange={(event) => setOpnameDate(event.target.value)} />
              {errors.opnameDate ? <p className="mt-1 text-xs text-red-600">{errors.opnameDate}</p> : null}
            </div>
            <div>
              <label className="text-sm font-semibold text-ink">Notes</label>
              <Textarea className="mt-2 min-h-28 rounded-2xl" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Catatan opname opsional" />
            </div>
            {submitError ? <div className="rounded-2xl border border-red-100 bg-red-50 p-3 text-sm text-red-700">{submitError}</div> : null}
            <Button type="submit" disabled={isSubmitting} className="h-12 w-full rounded-2xl bg-ink text-paper hover:bg-ink/90">
              {isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : null}Create Stock Opname
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
