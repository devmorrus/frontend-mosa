import { LoaderCircle, Ruler } from 'lucide-react'
import { unitOfMeasuresApi } from '@/api/unitOfMeasures.api'
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
  UnitOfMeasureDetail,
  UnitOfMeasureFormValues,
  UnitOfMeasureListItem,
} from '@/features/unit-of-measures/types'
import {
  emptyUnitOfMeasureFormValues,
  validateUnitOfMeasureForm,
} from '@/features/unit-of-measures/validation'
import { getFieldError } from '@/features/master-data/utils'

const columns: ColumnDefinition<UnitOfMeasureListItem>[] = [
  {
    key: 'code',
    header: 'Code',
    render: (item) => <span className="font-mono text-xs font-semibold tracking-[0.16em] text-slate-500">{item.code}</span>,
  },
  {
    key: 'name',
    header: 'Unit',
    render: (item) => (
      <div>
        <div className="font-semibold text-ink">{item.name}</div>
        <div className="mt-1 text-xs text-slate-500">Symbol: {item.symbol ?? '-'}</div>
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

function toFormValues(detail: UnitOfMeasureDetail): UnitOfMeasureFormValues {
  return {
    code: detail.code,
    name: detail.name,
    symbol: detail.symbol ?? '',
    isActive: detail.isActive,
  }
}

export function UnitsPage() {
  const unitModule = useMasterDataModule<
    UnitOfMeasureListItem,
    UnitOfMeasureDetail,
    UnitOfMeasureFormValues
  >({
    api: unitOfMeasuresApi,
    permissions: {
      view: 'uoms.view',
      create: 'uoms.create',
      update: 'uoms.update',
    },
    emptyValues: emptyUnitOfMeasureFormValues,
    toFormValues,
    validate: validateUnitOfMeasureForm,
    entityName: 'Unit of Measure',
  })

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <Ruler size={14} className="text-signal" />
              Master Data Units
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Unit of Measure yang seragam
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Kelola satuan ukuran dengan pola reusable yang sama, agar integrasi ke material dan
              product nanti tinggal melanjutkan fondasi ini.
            </p>
          </div>

          <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
            <CardContent className="p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Total unit</div>
              <div className="mt-2 font-display text-3xl font-semibold text-paper">
                {unitModule.pagination.totalItems}
              </div>
              <p className="mt-1 text-sm text-paper/60">Sinkron dengan pagination backend.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <MasterDataToolbar
        query={unitModule.query}
        searchValue={unitModule.searchInput}
        searchPlaceholder="Cari kode, nama, atau simbol unit"
        onSearchValueChange={unitModule.setSearchInput}
        onStatusChange={unitModule.handleStatusChange}
        onPageSizeChange={unitModule.handlePageSizeChange}
        createLabel="Add Unit"
        onCreate={unitModule.openCreateDialog}
        canCreate={unitModule.canCreate}
      />

      {unitModule.isLoading ? (
        <MasterDataLoadingState description="Daftar unit sedang dimuat dari backend." />
      ) : unitModule.error ? (
        <MasterDataErrorState description={unitModule.error} onRetry={unitModule.reload} />
      ) : unitModule.items.length === 0 ? (
        <MasterDataEmptyState
          description="Belum ada unit yang cocok dengan filter saat ini."
          action={unitModule.canCreate ? <Button onClick={unitModule.openCreateDialog}>Tambah unit pertama</Button> : null}
        />
      ) : (
        <div className="space-y-3">
          {unitModule.isRefreshing && (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
              <LoaderCircle size={14} className="animate-spin" />
              Menyegarkan data...
            </div>
          )}
          <MasterDataTable
            title="Unit List"
            itemLabel="unit"
            items={unitModule.items}
            columns={columns}
            pagination={unitModule.pagination}
            onPageChange={unitModule.handlePageChange}
            onEdit={unitModule.openEditDialog}
            onToggleStatus={unitModule.openStatusDialog}
            canUpdate={unitModule.canUpdate}
            getRowKey={(item) => item.id}
          />
        </div>
      )}

      <MasterDataFormDialog
        open={unitModule.isFormOpen}
        title={unitModule.formMode === 'create' ? 'Tambah Unit' : 'Edit Unit'}
        description="Satuan ukuran akan dipakai lintas modul, jadi pastikan kode dan nama konsisten."
        onOpenChange={unitModule.closeFormDialog}
        onSubmit={unitModule.submitForm}
        submitting={unitModule.isFormSubmitting}
        submitLabel={unitModule.formMode === 'create' ? 'Simpan Unit' : 'Perbarui Unit'}
      >
        {unitModule.isDetailLoading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            <LoaderCircle size={16} className="animate-spin" />
            Memuat detail unit...
          </div>
        ) : (
          <div className="space-y-5">
            {unitModule.formError && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {unitModule.formError}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Code</label>
                <Input
                  value={unitModule.formValues.code}
                  onChange={(event) =>
                    unitModule.setFormValues((current) => ({ ...current, code: event.target.value }))
                  }
                  placeholder="KG"
                />
                <MasterDataFormFieldError message={getFieldError(unitModule.formErrors, 'code')} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Status</label>
                <MasterDataBooleanSelect
                  value={unitModule.formValues.isActive}
                  onChange={(value) =>
                    unitModule.setFormValues((current) => ({ ...current, isActive: value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Name</label>
                <Input
                  value={unitModule.formValues.name}
                  onChange={(event) =>
                    unitModule.setFormValues((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Kilogram"
                />
                <MasterDataFormFieldError message={getFieldError(unitModule.formErrors, 'name')} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Symbol</label>
                <Input
                  value={unitModule.formValues.symbol}
                  onChange={(event) =>
                    unitModule.setFormValues((current) => ({ ...current, symbol: event.target.value }))
                  }
                  placeholder="kg"
                />
                <MasterDataFormFieldError message={getFieldError(unitModule.formErrors, 'symbol')} />
              </div>
            </div>
          </div>
        )}
      </MasterDataFormDialog>

      <MasterDataStatusDialog
        open={Boolean(unitModule.statusTarget)}
        entityLabel={unitModule.statusTarget?.name ?? 'unit'}
        nextStatusLabel={unitModule.statusTarget?.isActive ? 'Inactive' : 'Active'}
        onOpenChange={unitModule.closeStatusDialog}
        onConfirm={unitModule.confirmStatusChange}
        submitting={unitModule.isStatusSubmitting}
      />
    </div>
  )
}
