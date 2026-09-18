import { Building2, LoaderCircle } from 'lucide-react'
import { suppliersApi } from '@/api/suppliers.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MasterDataStatusDialog } from '@/features/master-data/components/MasterDataStatusDialog'
import { MasterDataEmptyState, MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
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

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <section data-tour="suppliers-header" className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(6,59,140,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,201,40,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <Building2 size={14} className="text-signal" />
              Master Data Supplier
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Supplier yang siap dikelola
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Gunakan daftar ini untuk mengelola data pemasok secara konsisten, lengkap dengan
              pencarian, pagination otomatis, dan kontrol status Active / Inactive.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Total Supplier</div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper">
                  {supplierModule.pagination.totalItems}
                </div>
                <p className="mt-1 text-sm text-paper/60">Semua pemasok tercatat</p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Active</div>
                <div className="mt-2 font-display text-3xl font-semibold text-blue-400">
                  {supplierModule.items.filter((i) => i.isActive).length}
                </div>
                <p className="mt-1 text-sm text-paper/60">Siap bertransaksi</p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Inactive</div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper/45">
                  {supplierModule.items.filter((i) => !i.isActive).length}
                </div>
                <p className="mt-1 text-sm text-paper/60">Perlu direview</p>
              </CardContent>
            </Card>
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
        <MasterDataLoadingState description="Daftar supplier sedang dimuat." />
      ) : supplierModule.error ? (
        <MasterDataErrorState description={supplierModule.error} onRetry={supplierModule.reload} />
      ) : supplierModule.items.length === 0 ? (
        <MasterDataEmptyState
          description="Belum ada supplier yang cocok dengan filter saat ini."
          action={
            supplierModule.canCreate ? (
              <Button onClick={supplierModule.openCreateDialog}>Tambah supplier pertama</Button>
            ) : null
          }
        />
      ) : (
        <div className="relative space-y-3">
          {supplierModule.isRefreshing && (
            <div className="absolute -top-2 right-0 z-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
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
      <MasterDataStatusDialog
        open={Boolean(supplierModule.statusTarget)}
        entityLabel={supplierModule.statusTarget?.name ?? 'supplier'}
        nextStatusLabel={supplierModule.statusTarget?.isActive ? 'Inactive' : 'Active'}
        onOpenChange={supplierModule.closeStatusDialog}
        onConfirm={supplierModule.confirmStatusChange}
        submitting={supplierModule.isStatusSubmitting}
      />
    </div>
  )
}
