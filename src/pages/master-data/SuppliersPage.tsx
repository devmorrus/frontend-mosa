import { Building2, LoaderCircle, Mail, Phone } from 'lucide-react'
import { suppliersApi } from '@/api/suppliers.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MasterDataBooleanSelect } from '@/features/master-data/components/MasterDataBooleanSelect'
import { MasterDataFormDialog } from '@/features/master-data/components/MasterDataFormDialog'
import { MasterDataFormFieldError } from '@/features/master-data/components/MasterDataFormFieldError'
import { MasterDataStatusBadge } from '@/features/master-data/components/MasterDataStatusBadge'
import { MasterDataStatusDialog } from '@/features/master-data/components/MasterDataStatusDialog'
import { MasterDataTable } from '@/features/master-data/components/MasterDataTable'
import { MasterDataEmptyState, MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { MasterDataToolbar } from '@/features/master-data/components/MasterDataToolbar'
import { useMasterDataModule } from '@/features/master-data/hooks/useMasterDataModule'
import type { ColumnDefinition } from '@/features/master-data/types'
import type { SupplierDetail, SupplierFormValues, SupplierListItem } from '@/features/suppliers/types'
import { emptySupplierFormValues, validateSupplierForm } from '@/features/suppliers/validation'
import { getFieldError } from '@/features/master-data/utils'

const columns: ColumnDefinition<SupplierListItem>[] = [
  {
    key: 'code',
    header: 'Code',
    render: (item) => <span className="font-mono text-xs font-semibold tracking-[0.16em] text-slate-500">{item.code}</span>,
  },
  {
    key: 'name',
    header: 'Supplier',
    render: (item) => (
      <div>
        <div className="font-semibold text-ink">{item.name}</div>
        <div className="mt-1 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Phone size={12} />
            {item.phone ?? '-'}
          </span>
          <span className="inline-flex items-center gap-1">
            <Mail size={12} />
            {item.email ?? '-'}
          </span>
        </div>
      </div>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    className: 'w-[140px]',
    render: (item) => <MasterDataStatusBadge isActive={item.isActive} />,
  },
]

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
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
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
              pencarian, pagination backend, dan kontrol status Active / Inactive.
            </p>
          </div>

          <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
            <CardContent className="p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Total supplier</div>
              <div className="mt-2 font-display text-3xl font-semibold text-paper">
                {supplierModule.pagination.totalItems}
              </div>
              <p className="mt-1 text-sm text-paper/60">
                Ditampilkan berdasarkan permission dan filter aktif.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      <MasterDataToolbar
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

      {supplierModule.isLoading ? (
        <MasterDataLoadingState description="Daftar supplier sedang dimuat dari backend." />
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
        <div className="space-y-3">
          {supplierModule.isRefreshing && (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
              <LoaderCircle size={14} className="animate-spin" />
              Menyegarkan data...
            </div>
          )}
          <MasterDataTable
            title="Supplier List"
            itemLabel="supplier"
            items={supplierModule.items}
            columns={columns}
            pagination={supplierModule.pagination}
            onPageChange={supplierModule.handlePageChange}
            onEdit={supplierModule.openEditDialog}
            onToggleStatus={supplierModule.openStatusDialog}
            canUpdate={supplierModule.canUpdate}
            getRowKey={(item) => item.id}
          />
        </div>
      )}

      <MasterDataFormDialog
        open={supplierModule.isFormOpen}
        title={supplierModule.formMode === 'create' ? 'Tambah Supplier' : 'Edit Supplier'}
        description="Pastikan data supplier sesuai dengan informasi operasional yang berlaku."
        onOpenChange={supplierModule.closeFormDialog}
        onSubmit={supplierModule.submitForm}
        submitting={supplierModule.isFormSubmitting}
        submitLabel={supplierModule.formMode === 'create' ? 'Simpan Supplier' : 'Perbarui Supplier'}
      >
        {supplierModule.isDetailLoading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            <LoaderCircle size={16} className="animate-spin" />
            Memuat detail supplier...
          </div>
        ) : (
          <div className="space-y-5">
            {supplierModule.formError && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {supplierModule.formError}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Code</label>
                <Input
                  value={supplierModule.formValues.code}
                  onChange={(event) =>
                    supplierModule.setFormValues((current) => ({ ...current, code: event.target.value }))
                  }
                  placeholder="SUP-001"
                />
                <MasterDataFormFieldError message={getFieldError(supplierModule.formErrors, 'code')} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Status</label>
                <MasterDataBooleanSelect
                  value={supplierModule.formValues.isActive}
                  onChange={(value) =>
                    supplierModule.setFormValues((current) => ({ ...current, isActive: value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Name</label>
              <Input
                value={supplierModule.formValues.name}
                onChange={(event) =>
                  supplierModule.setFormValues((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Supplier Nusantara Jaya"
              />
              <MasterDataFormFieldError message={getFieldError(supplierModule.formErrors, 'name')} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Phone</label>
                <Input
                  value={supplierModule.formValues.phone}
                  onChange={(event) =>
                    supplierModule.setFormValues((current) => ({ ...current, phone: event.target.value }))
                  }
                  placeholder="08xxxxxxxxxx"
                />
                <MasterDataFormFieldError message={getFieldError(supplierModule.formErrors, 'phone')} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Email</label>
                <Input
                  value={supplierModule.formValues.email}
                  onChange={(event) =>
                    supplierModule.setFormValues((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="supplier@company.com"
                />
                <MasterDataFormFieldError message={getFieldError(supplierModule.formErrors, 'email')} />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Address</label>
              <Textarea
                value={supplierModule.formValues.address}
                onChange={(event) =>
                  supplierModule.setFormValues((current) => ({ ...current, address: event.target.value }))
                }
                placeholder="Alamat lengkap supplier"
              />
              <MasterDataFormFieldError message={getFieldError(supplierModule.formErrors, 'address')} />
            </div>
          </div>
        )}
      </MasterDataFormDialog>

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
