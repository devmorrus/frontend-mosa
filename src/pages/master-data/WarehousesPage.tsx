import { LoaderCircle, Warehouse } from 'lucide-react'
import { warehousesApi } from '@/api/warehouses.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
import type {
  WarehouseDetail,
  WarehouseFormValues,
  WarehouseListItem,
} from '@/features/warehouses/types'
import {
  emptyWarehouseFormValues,
  validateWarehouseForm,
} from '@/features/warehouses/validation'
import { getFieldError } from '@/features/master-data/utils'

const columns: ColumnDefinition<WarehouseListItem>[] = [
  {
    key: 'code',
    header: 'Code',
    render: (item) => <span className="font-mono text-xs font-semibold tracking-[0.16em] text-slate-500">{item.code}</span>,
  },
  {
    key: 'name',
    header: 'Warehouse',
    render: (item) => <span className="font-semibold text-ink">{item.name}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    className: 'w-[140px]',
    render: (item) => <MasterDataStatusBadge isActive={item.isActive} />,
  },
]

function toFormValues(detail: WarehouseDetail): WarehouseFormValues {
  return {
    code: detail.code,
    name: detail.name,
    isActive: detail.isActive,
  }
}

export function WarehousesPage() {
  const warehouseModule = useMasterDataModule<
    WarehouseListItem,
    WarehouseDetail,
    WarehouseFormValues
  >({
    api: warehousesApi,
    permissions: {
      view: 'warehouses.view',
      create: 'warehouses.create',
      update: 'warehouses.update',
    },
    emptyValues: emptyWarehouseFormValues,
    toFormValues,
    validate: validateWarehouseForm,
    entityName: 'Warehouse',
  })

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <Warehouse size={14} className="text-signal" />
              Master Data Warehouse
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Warehouse yang tertata
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Kelola gudang operasional dengan fondasi UI yang sama agar modul receiving, inventory,
              dan stock movement bisa langsung melanjutkan dari sini.
            </p>
          </div>

          <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
            <CardContent className="p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Total warehouse</div>
              <div className="mt-2 font-display text-3xl font-semibold text-paper">
                {warehouseModule.pagination.totalItems}
              </div>
              <p className="mt-1 text-sm text-paper/60">Siap dipakai sebagai fondasi modul gudang.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <MasterDataToolbar
        query={warehouseModule.query}
        searchValue={warehouseModule.searchInput}
        searchPlaceholder="Cari kode atau nama warehouse"
        onSearchValueChange={warehouseModule.setSearchInput}
        onStatusChange={warehouseModule.handleStatusChange}
        onPageSizeChange={warehouseModule.handlePageSizeChange}
        createLabel="Add Warehouse"
        onCreate={warehouseModule.openCreateDialog}
        canCreate={warehouseModule.canCreate}
      />

      {warehouseModule.isLoading ? (
        <MasterDataLoadingState description="Daftar warehouse sedang dimuat dari backend." />
      ) : warehouseModule.error ? (
        <MasterDataErrorState description={warehouseModule.error} onRetry={warehouseModule.reload} />
      ) : warehouseModule.items.length === 0 ? (
        <MasterDataEmptyState
          description="Belum ada warehouse yang cocok dengan filter saat ini."
          action={warehouseModule.canCreate ? <Button onClick={warehouseModule.openCreateDialog}>Tambah warehouse pertama</Button> : null}
        />
      ) : (
        <div className="space-y-3">
          {warehouseModule.isRefreshing && (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
              <LoaderCircle size={14} className="animate-spin" />
              Menyegarkan data...
            </div>
          )}
          <MasterDataTable
            title="Warehouse List"
            itemLabel="warehouse"
            items={warehouseModule.items}
            columns={columns}
            pagination={warehouseModule.pagination}
            onPageChange={warehouseModule.handlePageChange}
            onEdit={warehouseModule.openEditDialog}
            onToggleStatus={warehouseModule.openStatusDialog}
            canUpdate={warehouseModule.canUpdate}
            getRowKey={(item) => item.id}
          />
        </div>
      )}

      <MasterDataFormDialog
        open={warehouseModule.isFormOpen}
        title={warehouseModule.formMode === 'create' ? 'Tambah Warehouse' : 'Edit Warehouse'}
        description="Warehouse aktif akan tersedia untuk modul operasional yang membutuhkan lokasi."
        onOpenChange={warehouseModule.closeFormDialog}
        onSubmit={warehouseModule.submitForm}
        submitting={warehouseModule.isFormSubmitting}
        submitLabel={warehouseModule.formMode === 'create' ? 'Simpan Warehouse' : 'Perbarui Warehouse'}
      >
        {warehouseModule.isDetailLoading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            <LoaderCircle size={16} className="animate-spin" />
            Memuat detail warehouse...
          </div>
        ) : (
          <div className="space-y-5">
            {warehouseModule.formError && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {warehouseModule.formError}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Code</label>
                <Input
                  value={warehouseModule.formValues.code}
                  onChange={(event) =>
                    warehouseModule.setFormValues((current) => ({ ...current, code: event.target.value }))
                  }
                  placeholder="WH-001"
                />
                <MasterDataFormFieldError message={getFieldError(warehouseModule.formErrors, 'code')} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Status</label>
                <MasterDataBooleanSelect
                  value={warehouseModule.formValues.isActive}
                  onChange={(value) =>
                    warehouseModule.setFormValues((current) => ({ ...current, isActive: value }))
                  }
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Name</label>
              <Input
                value={warehouseModule.formValues.name}
                onChange={(event) =>
                  warehouseModule.setFormValues((current) => ({ ...current, name: event.target.value }))
                }
                placeholder="Gudang Bahan Baku Utama"
              />
              <MasterDataFormFieldError message={getFieldError(warehouseModule.formErrors, 'name')} />
            </div>
          </div>
        )}
      </MasterDataFormDialog>

      <MasterDataStatusDialog
        open={Boolean(warehouseModule.statusTarget)}
        entityLabel={warehouseModule.statusTarget?.name ?? 'warehouse'}
        nextStatusLabel={warehouseModule.statusTarget?.isActive ? 'Inactive' : 'Active'}
        onOpenChange={warehouseModule.closeStatusDialog}
        onConfirm={warehouseModule.confirmStatusChange}
        submitting={warehouseModule.isStatusSubmitting}
      />
    </div>
  )
}
