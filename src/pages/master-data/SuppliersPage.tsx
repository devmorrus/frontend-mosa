import { Building2, LoaderCircle } from 'lucide-react'
import { suppliersApi } from '@/api/suppliers.api'
import { Button } from '@/components/ui/button'
import { SupplierStatusDialog } from '@/features/suppliers/components/SupplierStatusDialog'
import { MasterDataEmptyState, MasterDataErrorState, MasterDataTableSkeleton } from '@/features/master-data/components/MasterDataStates'
import { useMasterDataModule } from '@/features/master-data/hooks/useMasterDataModule'
import type { SupplierDetail, SupplierFormValues, SupplierListItem } from '@/features/suppliers/types'
import { emptySupplierFormValues, validateSupplierForm } from '@/features/suppliers/validation'
import { SupplierFormDialog } from '@/features/suppliers/components/SupplierFormDialog'
import { SupplierTable } from '@/features/suppliers/components/SupplierTable'
import { SupplierToolbar } from '@/features/suppliers/components/SupplierToolbar'

function toFormValues(detail: SupplierDetail): SupplierFormValues {
  return {
    code: detail.code,
    name: detail.name,
    phone: detail.phone ?? '',
    email: detail.email ?? '',
    address: detail.address ?? '',
    isActive: detail.isActive,
  }
}

export function SuppliersPage() {
  const supplierModule = useMasterDataModule<SupplierListItem, SupplierDetail, SupplierFormValues>({
    api: suppliersApi,
    permissions: {
      view: 'suppliers.view',
      create: 'suppliers.create',
      update: 'suppliers.update',
    },
    emptyValues: emptySupplierFormValues,
    toFormValues,
    validate: validateSupplierForm,
    entityName: 'Supplier',
  })

  const activeOnPage = supplierModule.items.filter((i) => i.isActive).length
  const inactiveOnPage = supplierModule.items.length - activeOnPage

  return (
    <div className="space-y-5">
      {/* ── Hero compact ── */}
      <section data-tour="suppliers-header" className="relative overflow-hidden rounded-[24px] border border-ink/10 bg-[linear-gradient(135deg,#062f75_0%,#0647a6_55%,#0b5ed7_100%)] px-5 py-5 text-paper shadow-[0_18px_50px_rgba(6,59,140,0.18)] sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-signal/25 blur-3xl" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/80">
              <Building2 size={13} className="text-signal" />
              Master Data • Supplier
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold leading-snug text-paper sm:text-3xl">
              Supplier yang siap dikelola
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-paper/70">
              Kelola pemasok untuk Goods Receiving dengan pencarian, filter status, dan kontrol Active / Inactive.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:w-[340px]">
            <div className="rounded-xl border border-paper/10 bg-paper/10 px-3 py-2.5 backdrop-blur-sm">
              <div className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/55">Total</div>
              <div className="mt-1 font-display text-2xl font-semibold leading-none text-paper">{supplierModule.pagination.totalItems}</div>
              <div className="mt-1.5 truncate text-xs text-paper/60">Terdaftar</div>
            </div>
            <div className="rounded-xl border border-paper/10 bg-paper/10 px-3 py-2.5 backdrop-blur-sm" title="Active di halaman ini">
              <div className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/55">Active</div>
              <div className="mt-1 font-display text-2xl font-semibold leading-none text-emerald-200">{activeOnPage}</div>
              <div className="mt-1.5 truncate text-xs text-paper/60">Halaman ini</div>
            </div>
            <div className="rounded-xl border border-paper/10 bg-paper/10 px-3 py-2.5 backdrop-blur-sm" title="Inactive di halaman ini">
              <div className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/55">Inactive</div>
              <div className="mt-1 font-display text-2xl font-semibold leading-none text-paper/70">{inactiveOnPage}</div>
              <div className="mt-1.5 truncate text-xs text-paper/60">Halaman ini</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Toolbar ── */}
      <SupplierToolbar
        query={supplierModule.query}
        searchValue={supplierModule.searchInput}
        searchPlaceholder="Cari kode, nama, phone, atau email supplier"
        onSearchValueChange={supplierModule.setSearchInput}
        onStatusChange={supplierModule.handleStatusChange}
        onPageSizeChange={supplierModule.handlePageSizeChange}
        createLabel="Add Supplier"
        onCreate={supplierModule.openCreateDialog}
        canCreate={supplierModule.canCreate}
      />

      {/* ── Table area ── */}
      {supplierModule.isLoading ? (
        <MasterDataTableSkeleton rows={supplierModule.query.pageSize} label="Daftar supplier sedang dimuat" />
      ) : supplierModule.error ? (
        <MasterDataErrorState description={supplierModule.error} onRetry={supplierModule.reload} />
      ) : supplierModule.items.length === 0 ? (
        <MasterDataEmptyState
          title="Belum ada supplier"
          description="Tambahkan pemasok pertama agar bisa dipakai di Goods Receiving, atau reset filter saat ini."
          action={
            supplierModule.canCreate ? (
              <Button onClick={supplierModule.openCreateDialog}>Tambah supplier pertama</Button>
            ) : null
          }
        />
      ) : (
        <div className="relative space-y-3">
          {supplierModule.isRefreshing && (
            <div className="pointer-events-none absolute -top-1 right-1 z-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
              <LoaderCircle size={13} className="animate-spin text-slate-400" />
              Menyegarkan data...
            </div>
          )}
          <SupplierTable
            items={supplierModule.items}
            pagination={supplierModule.pagination}
            onPageChange={supplierModule.handlePageChange}
            onEdit={supplierModule.openEditDialog}
            onToggleStatus={supplierModule.openStatusDialog}
            canUpdate={supplierModule.canUpdate}
          />
        </div>
      )}

      {/* ── Form Dialog (Tambah / Edit) ── */}
      <SupplierFormDialog
        open={supplierModule.isFormOpen}
        mode={supplierModule.formMode}
        values={supplierModule.formValues}
        errors={supplierModule.formErrors}
        formError={supplierModule.formError}
        isDetailLoading={supplierModule.isDetailLoading}
        submitting={supplierModule.isFormSubmitting}
        onValuesChange={supplierModule.setFormValues}
        onOpenChange={supplierModule.closeFormDialog}
        onSubmit={supplierModule.submitForm}
      />

      {/* ── Status Change Dialog ── */}
      <SupplierStatusDialog
        open={Boolean(supplierModule.statusTarget)}
        supplierName={supplierModule.statusTarget?.name ?? 'supplier'}
        supplierCode={supplierModule.statusTarget?.code ?? ''}
        nextStatusLabel={supplierModule.statusTarget?.isActive ? 'Inactive' : 'Active'}
        onOpenChange={supplierModule.closeStatusDialog}
        onConfirm={supplierModule.confirmStatusChange}
        submitting={supplierModule.isStatusSubmitting}
      />
    </div>
  )
}
