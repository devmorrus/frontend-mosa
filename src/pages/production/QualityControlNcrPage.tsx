import { useEffect, useState } from 'react'
import { AlertOctagon, ClipboardPlus, Pencil, Plus, RotateCcw, Search } from 'lucide-react'
import { qcApi } from '@/api/qc.api'
import { AppPagination } from '@/components/common/AppPagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MasterDataTableSkeleton } from '@/features/master-data/components/MasterDataStates'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { QcNcr, QcQueueItem } from '@/features/quality-control/types'
import type { MasterDataPagination } from '@/features/master-data/types'
import type { ApiError } from '@/types/api'
import { useUiStore } from '@/stores/uiStore'

const emptyPagination: MasterDataPagination = {
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
}

const statusOptions = [
  { value: '', label: 'Semua Status' },
  { value: '1', label: 'Open' },
  { value: '2', label: 'In Progress' },
  { value: '3', label: 'Resolved' },
  { value: '4', label: 'Closed' },
]

const statusLabel = (status: number) =>
  statusOptions.find((item) => item.value === String(status))?.label ?? String(status)

const statusBadge: Record<number, string> = {
  1: 'bg-rose-50 text-rose-700',
  2: 'bg-amber-50 text-amber-700',
  3: 'bg-blue-50 text-blue-700',
  4: 'bg-slate-100 text-slate-500',
}

interface NcrFormValues {
  finishedGoodsLotId: string
  title: string
  description: string
  rootCause: string
  correctiveAction: string
  preventiveAction: string
  assignedTo: string
  dueDate: string
  status: number
}

const initialForm: NcrFormValues = {
  finishedGoodsLotId: '',
  title: '',
  description: '',
  rootCause: '',
  correctiveAction: '',
  preventiveAction: '',
  assignedTo: '',
  dueDate: '',
  status: 1,
}

export function QualityControlNcrPage() {
  const pushToast = useUiStore((state) => state.pushToast)
  const [items, setItems] = useState<QcNcr[]>([])
  const [pagination, setPagination] = useState(emptyPagination)
  const [query, setQuery] = useState({ search: '', status: '', page: 1, pageSize: 10 })
  const [form, setForm] = useState<NcrFormValues>(initialForm)
  const [editing, setEditing] = useState<QcNcr | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [rejectedLots, setRejectedLots] = useState<QcQueueItem[]>([])
  const [lotsLoading, setLotsLoading] = useState(false)
  const [reopening, setReopening] = useState<QcNcr | null>(null)
  const [reopenReason, setReopenReason] = useState('')
  const [reopeningSaving, setReopeningSaving] = useState(false)

  async function load() {
    setLoading(true)
    setLoadError(null)
    try {
      const result = await qcApi.listNcrs(query)
      setItems(result.items)
      setPagination(result.pagination)
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setLoadError(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadRejectedLots() {
    setLotsLoading(true)
    try {
      const result = await qcApi.list({
        search: '',
        productId: '',
        productionOrderId: '',
        status: 'REJECTED',
        from: '',
        to: '',
        page: 1,
        pageSize: 50,
      })
      setRejectedLots(result.items)
    } catch {
      // biarkan dropdown kosong; error list utama sudah ditangani client terpusat
    } finally {
      setLotsLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.search, query.status, query.page, query.pageSize])

  function changeQuery(values: Partial<typeof query>) {
    setQuery((current) => ({ ...current, ...values, page: values.page ?? 1 }))
  }

  function openCreate() {
    setEditing(null)
    setForm(initialForm)
    setOpen(true)
    if (rejectedLots.length === 0) {
      void loadRejectedLots()
    }
  }

  function openEdit(item: QcNcr) {
    // Closed NCR is a sealed archive — it can only be continued via Reopen.
    if (item.status === 4) return
    setEditing(item)
    setForm({
      finishedGoodsLotId: item.finishedGoodsLotId,
      title: item.title,
      description: item.description,
      rootCause: item.rootCause ?? '',
      correctiveAction: item.correctiveAction ?? '',
      preventiveAction: item.preventiveAction ?? '',
      assignedTo: item.assignedTo ?? '',
      dueDate: item.dueDate?.slice(0, 10) ?? '',
      status: item.status,
    })
    setOpen(true)
  }

  const isClosing = editing !== null && form.status === 4

  function openReopen(item: QcNcr) {
    setReopening(item)
    setReopenReason('')
  }

  async function submitReopen() {
    if (!reopening) return
    if (reopenReason.trim().length < 10) {
      pushToast('warning', 'Alasan reopen wajib diisi minimal 10 karakter.')
      return
    }
    setReopeningSaving(true)
    try {
      await qcApi.reopenNcr(reopening.id, reopenReason)
      pushToast('success', 'NCR dibuka kembali ke In Progress.')
      setReopening(null)
      await load()
    } catch {
      // error sudah ditampilkan oleh client terpusat
    } finally {
      setReopeningSaving(false)
    }
  }

  async function submit() {
    if (editing) {
      if (!form.title.trim() || !form.description.trim()) {
        pushToast('warning', 'Title dan description wajib diisi.')
        return
      }
      if (form.status === 4 && (!form.rootCause.trim() || !form.correctiveAction.trim())) {
        pushToast('warning', 'Root Cause dan Corrective Action wajib diisi sebelum NCR ditutup.')
        return
      }
    } else if (!form.finishedGoodsLotId.trim() || !form.title.trim() || !form.description.trim()) {
      pushToast('warning', 'LOT yang ditolak QC, title, dan description wajib diisi.')
      return
    }

    setSaving(true)
    try {
      if (editing) {
        await qcApi.updateNcr(editing.id, form)
        pushToast('success', 'NCR diperbarui.')
      } else {
        await qcApi.createNcr(form)
        pushToast('success', 'NCR dibuat.')
      }
      setOpen(false)
      await load()
    } catch {
      // error sudah ditampilkan oleh client terpusat
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[24px] bg-[linear-gradient(135deg,#641b2d_0%,#9f1239_55%,#be123c_100%)] px-5 py-6 text-paper shadow-[0_18px_50px_rgba(159,18,57,0.18)] sm:px-7">
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-paper/60">
              Quality Control
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold">NCR &amp; CAPA</h1>
            <p className="mt-2 max-w-xl text-sm text-paper/70">
              Kelola ketidaksesuaian hasil QC dan tindakan perbaikannya.
            </p>
          </div>
          <Button variant="outline" onClick={openCreate}>
            <Plus size={17} /> NCR Baru
          </Button>
        </div>
      </section>

      <section className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <Input
              className="pl-11"
              value={query.search}
              onChange={(event) => changeQuery({ search: event.target.value })}
              placeholder="Cari nomor NCR, title, atau LOT"
            />
          </div>
          <select
            value={query.status}
            onChange={(event) => changeQuery({ status: event.target.value })}
            className="h-14 rounded-2xl border border-slate-200 bg-white px-4 text-sm"
          >
            {statusOptions.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
          <AlertOctagon size={19} className="text-rose-700" />
          <h2 className="font-display text-xl font-semibold text-ink">Daftar NCR</h2>
        </div>
        {loading ? (
          <div className="p-4"><MasterDataTableSkeleton rows={query.pageSize} label="Daftar NCR sedang dimuat" /></div>
        ) : loadError ? (
          <div className="p-12 text-center">
            <p className="font-display text-xl font-semibold text-ink">
              Terjadi kendala saat memuat data
            </p>
            <p className="mt-2 text-sm text-slate-500">{loadError}</p>
            <Button variant="secondary" className="mt-5" onClick={() => void load()}>
              Coba lagi
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Belum ada NCR. NCR dibuat untuk LOT yang ditolak QC.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">NCR</th>
                  <th className="px-5 py-3">LOT / Product</th>
                  <th className="px-5 py-3">Title</th>
                  <th className="px-5 py-3">PIC</th>
                  <th className="px-5 py-3">Due Date</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-semibold text-ink">
                      {item.ncrNumber}
                      <div className="mt-1 text-xs font-normal text-slate-400">
                        {item.productionOrderNumber ?? '-'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-700">{item.lotNumber}</div>
                      <div className="mt-1 text-xs text-slate-400">{item.productName}</div>
                    </td>
                    <td className="max-w-xs px-5 py-4 text-slate-600">{item.title}</td>
                    <td className="px-5 py-4 text-slate-600">{item.assignedTo ?? '-'}</td>
                    <td className="px-5 py-4 text-slate-500">
                      {item.dueDate ? new Date(item.dueDate).toLocaleDateString('id-ID') : '-'}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusBadge[item.status] ?? 'bg-slate-100 text-slate-600'}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        {item.status === 4 ? (
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => openReopen(item)}
                            aria-label="Buka kembali NCR"
                            title="Buka kembali (Reopen)"
                          >
                            <RotateCcw size={16} />
                          </Button>
                        ) : (
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={() => openEdit(item)}
                            aria-label="Edit NCR"
                          >
                            <Pencil size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <AppPagination
          pagination={pagination}
          onPageChange={(page) => setQuery((current) => ({ ...current, page }))}
          onPageSizeChange={(pageSize) =>
            setQuery((current) => ({ ...current, pageSize, page: 1 }))
          }
        />
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Update NCR & CAPA' : 'NCR Baru'}</DialogTitle>
            <DialogDescription>
              {editing
                ? 'Lengkapi analisis akar masalah dan tindakan perbaikan.'
                : 'NCR hanya dapat dibuat untuk finished-goods LOT berstatus Rejected.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid max-h-[65vh] gap-4 overflow-y-auto pr-1">
            {!editing && (
              <label className="text-sm font-semibold text-slate-600">
                LOT yang ditolak QC
                <select
                  value={form.finishedGoodsLotId}
                  onChange={(event) =>
                    setForm({ ...form, finishedGoodsLotId: event.target.value })
                  }
                  className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm"
                >
                  <option value="">
                    {lotsLoading ? 'Memuat LOT...' : 'Pilih LOT Rejected'}
                  </option>
                  {rejectedLots.map((lot) => (
                    <option key={lot.finishedGoodsLotId} value={lot.finishedGoodsLotId}>
                      {lot.lotNumber} - {lot.productName}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="text-sm font-semibold text-slate-600">
              Title
              <Input
                className="mt-1"
                value={form.title}
                onChange={(event) => setForm({ ...form, title: event.target.value })}
              />
            </label>
            <label className="text-sm font-semibold text-slate-600">
              Description
              <textarea
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                className="mt-1 min-h-24 w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-ink"
              />
            </label>
            {editing && (
              <>
                <label className="text-sm font-semibold text-slate-600">
                  Root Cause{isClosing && <span className="text-red-400"> *</span>}
                  <textarea
                    value={form.rootCause}
                    onChange={(event) => setForm({ ...form, rootCause: event.target.value })}
                    className="mt-1 min-h-20 w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-ink"
                  />
                  {isClosing && !form.rootCause.trim() && (
                    <span className="mt-1 block text-xs font-normal text-red-500">
                      Wajib diisi untuk menutup NCR.
                    </span>
                  )}
                </label>
                <label className="text-sm font-semibold text-slate-600">
                  Corrective Action{isClosing && <span className="text-red-400"> *</span>}
                  <textarea
                    value={form.correctiveAction}
                    onChange={(event) =>
                      setForm({ ...form, correctiveAction: event.target.value })
                    }
                    className="mt-1 min-h-20 w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-ink"
                  />
                  {isClosing && !form.correctiveAction.trim() && (
                    <span className="mt-1 block text-xs font-normal text-red-500">
                      Wajib diisi untuk menutup NCR.
                    </span>
                  )}
                </label>
                <label className="text-sm font-semibold text-slate-600">
                  Preventive Action
                  <textarea
                    value={form.preventiveAction}
                    onChange={(event) =>
                      setForm({ ...form, preventiveAction: event.target.value })
                    }
                    className="mt-1 min-h-20 w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-ink"
                  />
                </label>
              </>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-semibold text-slate-600">
                PIC
                <Input
                  className="mt-1"
                  value={form.assignedTo}
                  onChange={(event) => setForm({ ...form, assignedTo: event.target.value })}
                />
              </label>
              <label className="text-sm font-semibold text-slate-600">
                Due Date
                <Input
                  className="mt-1"
                  type="date"
                  value={form.dueDate}
                  onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
                />
              </label>
            </div>
            {editing && (
              <label className="text-sm font-semibold text-slate-600">
                Status
                <select
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: Number(event.target.value) })}
                  className="mt-1 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm"
                >
                  {statusOptions
                    .filter((status) => status.value)
                    .map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                </select>
              </label>
            )}
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpen(false)} disabled={saving}>
              Batal
            </Button>
            <Button onClick={() => void submit()} disabled={saving}>
              <ClipboardPlus size={16} />
              {saving ? 'Menyimpan...' : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={reopening !== null} onOpenChange={(value) => !value && setReopening(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Buka Kembali NCR</DialogTitle>
            <DialogDescription>
              {reopening
                ? `${reopening.ncrNumber} akan kembali ke In Progress. Tindakan ini tercatat di audit trail dan tidak menghapus analisis CAPA yang sudah ada.`
                : 'Buka kembali NCR yang sudah Closed.'}
            </DialogDescription>
          </DialogHeader>
          <label className="text-sm font-semibold text-slate-600">
            Alasan reopen <span className="text-red-400">*</span>
            <textarea
              value={reopenReason}
              onChange={(event) => setReopenReason(event.target.value)}
              placeholder="Contoh: ditemukan ketidaksesuaian berulang pada LOT berikutnya, perlu investigasi lanjutan"
              className="mt-1 min-h-24 w-full rounded-2xl border border-slate-200 p-4 text-sm font-normal outline-none focus:border-ink"
            />
          </label>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setReopening(null)}
              disabled={reopeningSaving}
            >
              Batal
            </Button>
            <Button onClick={() => void submitReopen()} disabled={reopeningSaving}>
              <RotateCcw size={16} />
              {reopeningSaving ? 'Membuka...' : 'Reopen'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
