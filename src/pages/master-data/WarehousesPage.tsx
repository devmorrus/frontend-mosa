import { LoaderCircle, Warehouse } from 'lucide-react'
import { warehousesApi } from '@/api/warehouses.api'
import { Button } from '@/components/ui/button'
import { WarehouseStatusDialog } from '@/features/warehouses/components/WarehouseStatusDialog'
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

  const activeOnPage = warehouseModule.items.filter((item) => item.isActive).length
  const inactiveOnPage = warehouseModule.items.length - activeOnPage

  return (
    <div className="space-y-5">
      <section className="relative overflow-hidden rounded-[24px] border border-ink/10 bg-[linear-gradient(135deg,#062f75_0%,#0647a6_55%,#0b5ed7_100%)] px-5 py-5 text-paper shadow-[0_18px_50px_rgba(6,59,140,0.18)] sm:px-6 sm:py-6">
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-signal/25 blur-3xl" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/80">
              <Warehouse size={13} className="text-signal" />
              Master Data • Warehouse
            </div>
            <h1 className="mt-3 font-display text-2xl font-semibold leading-snug text-paper sm:text-3xl">
              Warehouse yang tertata
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-paper/70">
              Kelola gudang operasional agar receiving, inventory, dan stock movement siap dipakai.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:w-[340px]">
            <div className="rounded-xl border border-paper/10 bg-paper/10 px-3 py-2.5 backdrop-blur-sm">
              <div className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/55">Total</div>
              <div className="mt-1 font-display text-2xl font-semibold leading-none text-paper">{warehouseModule.pagination.totalItems}</div>
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
        <MasterDataLoadingState description="Daftar warehouse sedang dimuat." />
      ) : warehouseModule.error ? (
        <MasterDataErrorState description={warehouseModule.error} onRetry={warehouseModule.reload} />
      ) : warehouseModule.items.length === 0 ? (
        <MasterDataEmptyState
          title="Belum ada warehouse"
          description="Tambahkan warehouse pertama agar bisa dipakai operasional, atau reset filter saat ini."
          action={warehouseModule.canCreate ? <Button onClick={warehouseModule.openCreateDialog}>Tambah warehouse pertama</Button> : null}
        />
      ) : (
        <div className="relative space-y-3">
          {warehouseModule.isRefreshing && (
            <div className="pointer-events-none absolute -top-1 right-1 z-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
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

      <WarehouseStatusDialog
        open={Boolean(warehouseModule.statusTarget)}
        warehouseName={warehouseModule.statusTarget?.name ?? 'warehouse'}
        warehouseCode={warehouseModule.statusTarget?.code ?? ''}
        nextStatusLabel={warehouseModule.statusTarget?.isActive ? 'Inactive' : 'Active'}
        onOpenChange={warehouseModule.closeStatusDialog}
        onConfirm={warehouseModule.confirmStatusChange}
        submitting={warehouseModule.isStatusSubmitting}
      />
    </div>
  )
}
