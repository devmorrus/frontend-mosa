import { LoaderCircle, Warehouse } from 'lucide-react'
import { warehousesApi } from '@/api/warehouses.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MasterDataStatusDialog } from '@/features/master-data/components/MasterDataStatusDialog'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import { useMasterDataModule } from '@/features/master-data/hooks/useMasterDataModule'
import { WarehouseFormDialog } from '@/features/warehouses/components/WarehouseFormDialog'
import { WarehouseTable } from '@/features/warehouses/components/WarehouseTable'
import { WarehouseToolbar } from '@/features/warehouses/components/WarehouseToolbar'
import type {
  WarehouseDetail,
  WarehouseFormValues,
  WarehouseListItem,
} from '@/features/warehouses/types'
import {
  emptyWarehouseFormValues,
  validateWarehouseForm,
} from '@/features/warehouses/validation'

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
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(12,28,26,0.16)] sm:px-8 sm:py-8">
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

          <div className="flex flex-wrap gap-3">
            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">
                  Total Warehouse
                </div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper">
                  {warehouseModule.pagination.totalItems}
                </div>
                <p className="mt-1 text-sm text-paper/60">Semua warehouse tercatat</p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Active</div>
                <div className="mt-2 font-display text-3xl font-semibold text-emerald-400">
                  {warehouseModule.items.filter((item) => item.isActive).length}
                </div>
                <p className="mt-1 text-sm text-paper/60">Siap dipakai operasional</p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">
                  Inactive
                </div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper/45">
                  {warehouseModule.items.filter((item) => !item.isActive).length}
                </div>
                <p className="mt-1 text-sm text-paper/60">Perlu direview kembali</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <WarehouseToolbar
        query={warehouseModule.query}
        searchValue={warehouseModule.searchInput}
        onSearchValueChange={warehouseModule.setSearchInput}
        onStatusChange={warehouseModule.handleStatusChange}
        onPageSizeChange={warehouseModule.handlePageSizeChange}
        onResetFilters={() => {
          warehouseModule.setSearchInput('')
          warehouseModule.setQuery((current) => ({
            ...current,
            search: '',
            status: 'ALL',
            page: 1,
          }))
        }}
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
        <div className="relative space-y-3">
          {warehouseModule.isRefreshing && (
            <div className="absolute -top-2 right-0 z-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
              <LoaderCircle size={13} className="animate-spin text-slate-400" />
              Menyegarkan data...
            </div>
          )}
          <WarehouseTable
            items={warehouseModule.items}
            pagination={warehouseModule.pagination}
            onPageChange={warehouseModule.handlePageChange}
            onEdit={warehouseModule.openEditDialog}
            onToggleStatus={warehouseModule.openStatusDialog}
            canUpdate={warehouseModule.canUpdate}
          />
        </div>
      )}

      <WarehouseFormDialog
        open={warehouseModule.isFormOpen}
        mode={warehouseModule.formMode}
        values={warehouseModule.formValues}
        errors={warehouseModule.formErrors}
        formError={warehouseModule.formError}
        isDetailLoading={warehouseModule.isDetailLoading}
        submitting={warehouseModule.isFormSubmitting}
        onValuesChange={warehouseModule.setFormValues}
        onOpenChange={warehouseModule.closeFormDialog}
        onSubmit={warehouseModule.submitForm}
      />

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
