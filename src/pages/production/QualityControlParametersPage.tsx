import { useEffect, useState } from 'react'
import { ClipboardList, LoaderCircle, Pencil, Plus, Power, Search } from 'lucide-react'
import { qcApi } from '@/api/qc.api'
import { productsApi } from '@/api/products.api'
import { AppPagination } from '@/components/common/AppPagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useUiStore } from '@/stores/uiStore'
import type { ProductListItem } from '@/features/products/types'
import type { QcParameterAdmin, QcParameterFormValues } from '@/features/quality-control/types'
import type { MasterDataPagination } from '@/features/master-data/types'

const initialForm: QcParameterFormValues = { productId: '', name: '', description: '', resultType: '1', isRequired: true, sequence: '1', configJson: '' }
const resultTypes = [{ value: '1', label: 'Text' }, { value: '2', label: 'Number' }, { value: '3', label: 'Boolean' }, { value: '4', label: 'Pass / Fail' }, { value: '5', label: 'Numeric Range' }, { value: '6', label: 'Options' }]
const emptyPagination: MasterDataPagination = { page: 1, pageSize: 10, totalItems: 0, totalPages: 0, hasPreviousPage: false, hasNextPage: false }

export function QualityControlParametersPage() {
  const pushToast = useUiStore((state) => state.pushToast)
  const [items, setItems] = useState<QcParameterAdmin[]>([])
  const [products, setProducts] = useState<ProductListItem[]>([])
  const [pagination, setPagination] = useState(emptyPagination)
  const [query, setQuery] = useState({ search: '', productId: '', status: '', page: 1, pageSize: 10 })
  const [form, setForm] = useState(initialForm)
  const [editing, setEditing] = useState<QcParameterAdmin | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    try {
      const result = await qcApi.listParameters(query)
      setItems(result.items)
      setPagination(result.pagination)
    } catch { /* centralized client displays the error */ } finally { setLoading(false) }
  }

  useEffect(() => { void productsApi.listActiveOptions().then(setProducts).catch(() => undefined) }, [])
  useEffect(() => { void load() }, [query])

  function openCreate() { setEditing(null); setForm(initialForm); setOpen(true) }
  function openEdit(item: QcParameterAdmin) { setEditing(item); setForm({ productId: item.productId, name: item.name, description: item.description ?? '', resultType: String(item.resultType), isRequired: item.isRequired, sequence: String(item.sequence), configJson: item.configJson ?? '' }); setOpen(true) }
  function changeQuery(values: Partial<typeof query>) { setQuery((current) => ({ ...current, ...values, page: values.page ?? 1 })) }
  async function submit() {
    if (!form.productId || form.name.trim().length < 3 || Number(form.sequence) < 1) { pushToast('warning', 'Product, nama minimal 3 karakter, dan sequence wajib diisi.'); return }
    setSaving(true)
    try { if (editing) await qcApi.updateParameter(editing.id, form); else await qcApi.createParameter(form); setOpen(false); pushToast('success', editing ? 'Parameter QC diperbarui.' : 'Parameter QC dibuat.'); await load() } catch { /* centralized client */ } finally { setSaving(false) }
  }
  async function toggle(item: QcParameterAdmin) { try { await qcApi.changeParameterStatus(item.id, item.status !== 1); pushToast('success', 'Status parameter diperbarui.'); await load() } catch { /* centralized client */ } }

  return <div className="space-y-5">
    <section className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#062f75_0%,#0647a6_55%,#0b5ed7_100%)] px-5 py-6 text-paper shadow-[0_18px_50px_rgba(6,59,140,0.18)] sm:px-7">
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-paper/60">Quality Control</p><h1 className="mt-2 font-display text-3xl font-semibold">QC Parameters</h1><p className="mt-2 max-w-xl text-sm text-paper/70">Kelola parameter inspeksi yang digunakan pada setiap produk.</p></div><Button variant="outline" onClick={openCreate}><Plus size={17} /> Parameter Baru</Button></div>
    </section>
    <section className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm"><div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_180px]"><div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} /><Input className="pl-11" value={query.search} onChange={(event) => changeQuery({ search: event.target.value })} placeholder="Cari parameter" /></div><select value={query.productId} onChange={(event) => changeQuery({ productId: event.target.value })} className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-sm"><option value="">Semua Product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.code} - {product.name}</option>)}</select><select value={query.status} onChange={(event) => changeQuery({ status: event.target.value })} className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-sm"><option value="">Semua Status</option><option value="1">Active</option><option value="2">Inactive</option></select></div></section>
    <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm"><div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4"><ClipboardList size={19} className="text-blue-700" /><h2 className="font-display text-xl font-semibold text-ink">Daftar Parameter</h2></div>{loading ? <div className="flex items-center justify-center gap-2 p-12 text-sm text-slate-500"><LoaderCircle className="animate-spin" size={18} /> Memuat parameter...</div> : items.length === 0 ? <div className="p-12 text-center text-sm text-slate-500">Belum ada parameter QC.</div> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Parameter</th><th className="px-5 py-3">Product</th><th className="px-5 py-3">Tipe</th><th className="px-5 py-3">Sequence</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Aksi</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} className="border-t border-slate-100"><td className="px-5 py-4"><div className="font-semibold text-ink">{item.name}</div><div className="mt-1 text-xs text-slate-400">{item.isRequired ? 'Required' : 'Optional'}</div></td><td className="px-5 py-4 text-slate-600">{products.find((product) => product.id === item.productId)?.name ?? item.productId}</td><td className="px-5 py-4 text-slate-600">{resultTypes.find((type) => Number(type.value) === item.resultType)?.label ?? item.resultType}</td><td className="px-5 py-4 text-slate-600">{item.sequence}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{item.status === 1 ? 'Active' : 'Inactive'}</span></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Button size="icon" variant="secondary" onClick={() => openEdit(item)} aria-label="Edit"><Pencil size={16} /></Button><Button size="icon" variant="secondary" onClick={() => void toggle(item)} aria-label="Ubah status"><Power size={16} /></Button></div></td></tr>)}</tbody></table></div>}<AppPagination pagination={pagination} onPageChange={(page) => setQuery((current) => ({ ...current, page }))} onPageSizeChange={(pageSize) => setQuery((current) => ({ ...current, pageSize, page: 1 }))} /></section>
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? 'Edit QC Parameter' : 'Parameter QC Baru'}</DialogTitle><DialogDescription>Parameter ini akan digunakan saat inspeksi produk.</DialogDescription></DialogHeader><div className="grid gap-4"><label className="text-sm font-semibold text-slate-600">Product<select value={form.productId} onChange={(event) => setForm({ ...form, productId: event.target.value })} className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm"><option value="">Pilih product</option>{products.map((product) => <option key={product.id} value={product.id}>{product.code} - {product.name}</option>)}</select></label><label className="text-sm font-semibold text-slate-600">Nama Parameter<Input className="mt-1" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Contoh: Moisture" /></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-600">Tipe<select value={form.resultType} onChange={(event) => setForm({ ...form, resultType: event.target.value })} className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm">{resultTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></label><label className="text-sm font-semibold text-slate-600">Sequence<Input className="mt-1" type="number" min="1" value={form.sequence} onChange={(event) => setForm({ ...form, sequence: event.target.value })} /></label></div><label className="text-sm font-semibold text-slate-600">Deskripsi<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 min-h-24 w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-ink" /></label><label className="flex items-center gap-3 text-sm font-semibold text-slate-600"><input type="checkbox" checked={form.isRequired} onChange={(event) => setForm({ ...form, isRequired: event.target.checked })} /> Required</label></div><DialogFooter><Button variant="secondary" onClick={() => setOpen(false)} disabled={saving}>Batal</Button><Button onClick={() => void submit()} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button></DialogFooter></DialogContent></Dialog>
  </div>
}
