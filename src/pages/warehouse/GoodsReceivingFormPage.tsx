import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, LoaderCircle, PackageSearch, Plus } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { StatusBadge } from '@/components/common/StatusBadge'
import { breadcrumbs, entityLinks } from '@/routes/canonicalRoutes'
import { rawMaterialsApi } from '@/api/rawMaterials.api'
import { suppliersApi } from '@/api/suppliers.api'
import { warehousesApi } from '@/api/warehouses.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ReceivingItemFields } from '@/features/goods-receivings/components/ReceivingItemFields'
import { useGoodsReceivingForm } from '@/features/goods-receivings/hooks/useGoodsReceivingForm'
import {
  formatDateTimeLabel,
  getReceivingFieldError,
  materialDetailToListItem,
  mergeSelectedMaterial,
  mergeSelectedSupplier,
  mergeSelectedWarehouse,
} from '@/features/goods-receivings/utils'
import { MasterDataFormFieldError } from '@/features/master-data/components/MasterDataFormFieldError'
import {
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import { useAuth } from '@/hooks/useAuth'
import { canFetchLookup, fetchLookupIfAllowed } from '@/utils/lookupGuard'
import type { RawMaterialListItem } from '@/features/raw-materials/types'
import type { SupplierListItem } from '@/features/suppliers/types'
import type { WarehouseListItem } from '@/features/warehouses/types'
import type { ApiError } from '@/types/api'

export function GoodsReceivingFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { can } = useAuth()
  const form = useGoodsReceivingForm(id)
  const [suppliers, setSuppliers] = useState<SupplierListItem[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([])
  const [materials, setMaterials] = useState<RawMaterialListItem[]>([])
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [isLookupLoading, setIsLookupLoading] = useState(true)
  const [supplierOverride, setSupplierOverride] = useState<SupplierListItem | null>(null)
  const [warehouseOverride, setWarehouseOverride] = useState<WarehouseListItem | null>(null)
  const [materialOverrides, setMaterialOverrides] = useState<Record<string, RawMaterialListItem>>({})

  const canSave = id ? can('receiving.update') : can('receiving.create')
  const canPost = can('receiving.post')
  const isInteractionDisabled = form.isReadOnly || !canSave
  const canShowPostAction =
    Boolean(id) &&
    Boolean(form.detail) &&
    form.detail?.status === 'DRAFT' &&
    canPost &&
    !form.isSubmitting &&
    !form.isPosting

  useEffect(() => {
    async function loadLookups() {
      setIsLookupLoading(true)
      setLookupError(null)

      try {
        const [supplierResult, warehouseResult, materialResult] = await Promise.allSettled([
          fetchLookupIfAllowed('suppliers.view', () => suppliersApi.listOptions('ACTIVE'), []),
          fetchLookupIfAllowed('warehouses.view', () => warehousesApi.listOptions('ACTIVE'), []),
          fetchLookupIfAllowed('materials.view', () => rawMaterialsApi.listActiveOptions(), []),
        ])
        if (supplierResult.status === 'fulfilled') setSuppliers(supplierResult.value)
        if (warehouseResult.status === 'fulfilled') setWarehouses(warehouseResult.value)
        if (materialResult.status === 'fulfilled') setMaterials(materialResult.value)
        const rejected = [supplierResult, warehouseResult, materialResult].find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined
        if (rejected) {
          const apiError = rejected.reason as ApiError
          if ((apiError as ApiError)?.status !== 403) setLookupError(apiError.message)
        }
      } catch (caughtError) {
        const apiError = caughtError as ApiError
        setLookupError(apiError.message)
      } finally {
        setIsLookupLoading(false)
      }
    }

    void loadLookups()
  }, [])

  useEffect(() => {
    async function loadInactiveSelections() {
      if (!form.detail) return

      try {
        if (form.formValues.supplierId && !suppliers.some((item) => item.id === form.formValues.supplierId)) {
          if (canFetchLookup('suppliers.view')) {
            const detail = await suppliersApi.getById(form.formValues.supplierId)
            setSupplierOverride(detail)
          }
        } else {
          setSupplierOverride(null)
        }

        if (
          form.formValues.warehouseId &&
          !warehouses.some((item) => item.id === form.formValues.warehouseId)
        ) {
          if (canFetchLookup('warehouses.view')) {
            const detail = await warehousesApi.getById(form.formValues.warehouseId)
            setWarehouseOverride(detail)
          }
        } else {
          setWarehouseOverride(null)
        }

        const missingMaterialIds = form.formValues.items
          .map((item) => item.rawMaterialId)
          .filter(
            (materialId) =>
              materialId &&
              !materials.some((material) => material.id === materialId) &&
              !materialOverrides[materialId],
          )

        if (missingMaterialIds.length > 0 && canFetchLookup('materials.view')) {
          const details = await Promise.all(missingMaterialIds.map((materialId) => rawMaterialsApi.getById(materialId)))
          setMaterialOverrides((current) => ({
            ...current,
            ...Object.fromEntries(details.map((detail) => [detail.id, materialDetailToListItem(detail)])),
          }))
        }
      } catch {
        // keep form usable; backend submit still validates references
      }
    }

    void loadInactiveSelections()
  }, [form.detail, form.formValues.items, form.formValues.supplierId, form.formValues.warehouseId, suppliers, warehouses, materials, materialOverrides])

  const supplierOptions = useMemo(
    () => mergeSelectedSupplier(suppliers, supplierOverride),
    [suppliers, supplierOverride],
  )

  const warehouseOptions = useMemo(
    () => mergeSelectedWarehouse(warehouses, warehouseOverride),
    [warehouses, warehouseOverride],
  )

  const materialOptions = useMemo(
    () =>
      Object.values(materialOverrides).reduce(
        (current, material) => mergeSelectedMaterial(current, material),
        materials,
      ),
    [materials, materialOverrides],
  )

  const generatedLots = useMemo(
    () => (form.detail?.items ?? []).filter((item) => item.internalLot),
    [form.detail],
  )
  const isPosted = form.detail?.status === 'POSTED'

  async function handleSubmit() {
    const result = await form.submit()
    if (!result) return

    if (!id) {
      navigate(`/goods-receiving/${result.id}`, { replace: true })
      return
    }

    await form.reload()
  }

  if (form.isLoading) {
    return <MasterDataLoadingState description="Detail goods receiving sedang dimuat." />
  }

  if (form.loadError) {
    return <MasterDataErrorState description={form.loadError} onRetry={() => void form.reload()} />
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={form.detail ? breadcrumbs.receivingDetail(form.detail.receivingNumber) : breadcrumbs.receivingList()} />
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Button asChild variant="ghost" className="-ml-3 h-auto px-3 py-2">
              <Link to="/goods-receiving">
                <ArrowLeft size={16} />
                Kembali ke receiving list
              </Link>
            </Button>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <PackageSearch size={14} className="text-signal" />
              {id ? 'Goods Receiving Detail' : 'Create Goods Receiving'}
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              {id ? form.detail?.receivingNumber ?? 'Goods Receiving' : 'Buat draft receiving baru'}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              {id
                ? 'Draft masih bisa diperbarui. Dokumen non-draft otomatis tampil read-only sesuai rule backend.'
                : 'Pilih supplier, warehouse, lalu tambahkan item bahan baku yang datang dari supplier.'}
            </p>
          </div>

          {form.detail ? (
            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="space-y-2 p-5 text-sm">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">
                  Status
                </div>
                <div className="font-display text-2xl font-semibold text-paper">
                  <StatusBadge domain="receiving" value={form.detail.status} />
                </div>
                <p className="text-paper/60">Created by {form.detail.createdBy ?? 'system'}</p>
                <p className="text-paper/60">Updated {formatDateTimeLabel(form.detail.updatedAtUtc ?? form.detail.createdAtUtc)}</p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </section>

      {form.isReadOnly ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Dokumen dengan status <span className="font-semibold">{form.detail?.status}</span> tidak
          dapat diedit melalui form draft.
        </div>
      ) : null}

      {!form.isReadOnly && !canSave ? (
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 text-sm text-slate-600">
          Anda hanya memiliki akses lihat untuk halaman ini. Form receiving ditampilkan dalam mode
          read-only.
        </div>
      ) : null}

      {form.formError ? (
        <div className="rounded-[28px] border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          {form.formError}
        </div>
      ) : null}

      {form.postError ? (
        <div className="rounded-[28px] border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">
          {form.postError}
        </div>
      ) : null}

      {lookupError ? (
        <div className="rounded-[28px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Gagal memuat source lookup receiving: {lookupError}
        </div>
      ) : null}

      <Card>
        <CardContent className="space-y-6 p-6">
          {form.detail ? (
            <div data-tour="receiving-summary" className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Receiving Number</p>
                <p className="mt-1 font-medium text-ink">{form.detail.receivingNumber}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Receiving Date</p>
                <p className="mt-1 font-medium text-ink">{formatDateTimeLabel(form.detail.receivingDate)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Supplier</p>
                <p className="mt-1 font-medium text-ink">{form.detail.supplierName}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Warehouse</p>
                <p className="mt-1 font-medium text-ink">{form.detail.warehouseName}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Created By</p>
                <p className="mt-1 font-medium text-ink">{form.detail.createdBy ?? '-'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Posted By</p>
                <p className="mt-1 font-medium text-ink">{form.detail.postedBy ?? '-'}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Posted At</p>
                <p className="mt-1 font-medium text-ink">{formatDateTimeLabel(form.detail.postedAtUtc)}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Status</p>
                <p data-tour="receiving-internal-lot-badge" className="mt-1 font-medium text-ink">{form.detail.status}</p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Supplier</label>
              <select
                data-tour="receiving-supplier-select"
                value={form.formValues.supplierId}
                onChange={(event) => form.updateHeader('supplierId', event.target.value)}
                disabled={isInteractionDisabled || isLookupLoading}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">{isLookupLoading ? 'Memuat supplier...' : 'Pilih supplier aktif'}</option>
                {supplierOptions.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                    {supplierOverride?.id === supplier.id ? ' - existing selection' : ''}
                  </option>
                ))}
              </select>
              <MasterDataFormFieldError message={getReceivingFieldError(form.formErrors, 'supplierId')} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Warehouse</label>
              <select
                data-tour="receiving-warehouse-select"
                value={form.formValues.warehouseId}
                onChange={(event) => form.updateHeader('warehouseId', event.target.value)}
                disabled={isInteractionDisabled || isLookupLoading}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">{isLookupLoading ? 'Memuat warehouse...' : 'Pilih warehouse aktif'}</option>
                {warehouseOptions.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                    {warehouseOverride?.id === warehouse.id ? ' - existing selection' : ''}
                  </option>
                ))}
              </select>
              <MasterDataFormFieldError message={getReceivingFieldError(form.formErrors, 'warehouseId')} />
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Receiving Date</label>
              <Input
                data-tour="receiving-date-input"
                type="date"
                value={form.formValues.receivingDate}
                onChange={(event) => form.updateHeader('receivingDate', event.target.value)}
                disabled={isInteractionDisabled}
              />
              <MasterDataFormFieldError message={getReceivingFieldError(form.formErrors, 'receivingDate')} />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Receiving Number</label>
              <Input
                value={form.detail?.receivingNumber ?? 'Auto-generated after save'}
                readOnly
                disabled
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Notes</label>
            <Textarea
              value={form.formValues.notes}
              onChange={(event) => form.updateHeader('notes', event.target.value)}
              placeholder="Catatan receiving jika diperlukan"
              className="min-h-[120px]"
              disabled={isInteractionDisabled}
            />
            <MasterDataFormFieldError message={getReceivingFieldError(form.formErrors, 'notes')} />
          </div>
        </CardContent>
      </Card>

      {form.detail && generatedLots.length > 0 ? (
        <Card data-tour="receiving-generated-lots">
          <CardContent className="space-y-3 p-6">
            <h2 className="font-display text-xl font-semibold text-ink">
              Generated LOTs ({generatedLots.length})
            </h2>
            <p className="text-sm text-slate-500">
              LOT internal dibuat saat posting. Klik untuk membuka detail LOT.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {generatedLots.map((item) => (
                <Link
                  key={item.id}
                  to={entityLinks.lotList({ search: item.internalLot ?? '' })}
                  className="rounded-2xl border border-ink/10 p-4 transition-colors hover:border-ink hover:bg-sand/30"
                >
                  <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {item.rawMaterialCode} — {item.rawMaterialName}
                  </div>
                  <div className="mt-1 font-semibold text-ink underline underline-offset-4">
                    {item.internalLot}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Qty {item.quantity} {item.unitOfMeasureCode}
                    {item.supplierLot ? ` • Supplier LOT ${item.supplierLot}` : ''}
                  </div>
                </Link>
              ))}
            </div>
            {!isPosted ? (
              <p className="text-xs text-slate-500">
                Dokumen belum POSTED — daftar di atas adalah preview internal LOT yang akan dibuat.
              </p>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink">Receiving Items</h2>
            <p className="text-sm text-slate-500">Minimal satu item diperlukan untuk menyimpan draft receiving.</p>
          </div>
          {!isInteractionDisabled ? (
            <Button data-tour="receiving-add-item-btn" onClick={form.addItem} variant="secondary" disabled={isLookupLoading}>
              <Plus size={16} />
              Add Item
            </Button>
          ) : null}
        </div>

        {getReceivingFieldError(form.formErrors, 'items') ? (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {getReceivingFieldError(form.formErrors, 'items')}
          </div>
        ) : null}

        <div data-tour="receiving-item-row" className="space-y-4">
          {form.formValues.items.map((item, index) => (
            <ReceivingItemFields
              key={item.clientId}
              index={index}
              item={item}
              materials={materialOptions}
              errors={form.formErrors}
              disabled={isInteractionDisabled || isLookupLoading}
              canRemove={!isInteractionDisabled && form.formValues.items.length > 1}
              onRemove={() => form.removeItem(index)}
              onChange={(updater) => form.updateItem(index, updater)}
            />
          ))}
        </div>
      </section>

      <div className="sticky bottom-0 z-10 rounded-[28px] border border-slate-200/80 bg-white/92 p-4 shadow-[0_-8px_32px_rgba(15,23,42,0.08)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            {form.detail ? (
              <>
                Dibuat {formatDateTimeLabel(form.detail.createdAtUtc)}
                {form.detail.postedAtUtc ? ` • Posted ${formatDateTimeLabel(form.detail.postedAtUtc)}` : ''}
              </>
            ) : (
              'Receiving number akan dibuat otomatis setelah draft berhasil disimpan.'
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="secondary">
              <Link to="/goods-receiving">Kembali ke list</Link>
            </Button>
            {canShowPostAction ? (
              <Button
                data-tour="receiving-post-btn"
                variant="secondary"
                onClick={form.openPostConfirmation}
                disabled={form.isPosting || form.isSubmitting}
              >
                {form.isPosting ? <LoaderCircle size={16} className="animate-spin" /> : null}
                {form.isPosting ? 'Posting Receiving...' : 'Post Receiving'}
              </Button>
            ) : null}
            {!isInteractionDisabled ? (
              <Button data-tour="receiving-save-draft-btn" onClick={() => void handleSubmit()} disabled={form.isSubmitting || form.isPosting || isLookupLoading}>
                {form.isSubmitting ? <LoaderCircle size={16} className="animate-spin" /> : null}
                Save Draft
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <Dialog open={form.showPostConfirmation} onOpenChange={form.closePostConfirmation}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Post Receiving</DialogTitle>
            <DialogDescription>
              Posting receiving akan membuat Internal LOT dan menambahkan stock. Lanjutkan?
            </DialogDescription>
          </DialogHeader>

          {form.detail ? (
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              <p className="font-medium text-ink">{form.detail.receivingNumber}</p>
              <p className="mt-1">Supplier {form.detail.supplierName}</p>
              <p>Warehouse {form.detail.warehouseName}</p>
              <p>Status saat ini {form.detail.status}</p>
            </div>
          ) : null}

          {form.postError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {form.postError}
            </div>
          ) : null}

          <DialogFooter>
            <Button variant="secondary" onClick={() => form.closePostConfirmation(false)} disabled={form.isPosting}>
              Cancel
            </Button>
            <Button onClick={() => void form.submitPost()} disabled={form.isPosting}>
              {form.isPosting ? <LoaderCircle size={16} className="animate-spin" /> : null}
              {form.isPosting ? 'Posting Receiving...' : 'Post Receiving'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
