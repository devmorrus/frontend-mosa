import { useEffect, useState } from 'react'
import { Boxes, LoaderCircle, PackageSearch } from 'lucide-react'
import { rawMaterialsApi } from '@/api/rawMaterials.api'
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
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import { MasterDataToolbar } from '@/features/master-data/components/MasterDataToolbar'
import { getFieldError } from '@/features/master-data/utils'
import { useMasterDataModule } from '@/features/master-data/hooks/useMasterDataModule'
import type { ColumnDefinition } from '@/features/master-data/types'
import type {
  RawMaterialDetail,
  RawMaterialFormValues,
  RawMaterialListItem,
  RawMaterialQueryState,
} from '@/features/raw-materials/types'
import {
  emptyRawMaterialFormValues,
  validateRawMaterialForm,
} from '@/features/raw-materials/validation'
import type { UnitOfMeasureOption } from '@/features/unit-of-measures/types'
import type { ApiError } from '@/types/api'

const DEFAULT_QUERY: RawMaterialQueryState = {
  search: '',
  status: 'ALL',
  category: '',
  unitOfMeasureId: '',
  hasExpiry: 'ALL',
  page: 1,
  pageSize: 10,
}

const HAS_EXPIRY_FILTER_OPTIONS: Array<{
  label: string
  value: RawMaterialQueryState['hasExpiry']
}> = [
  { label: 'Semua expiry', value: 'ALL' },
  { label: 'Has Expiry', value: 'YES' },
  { label: 'No Expiry', value: 'NO' },
]

const columns: ColumnDefinition<RawMaterialListItem>[] = [
  {
    key: 'code',
    header: 'Code',
    render: (item) => (
      <span className="font-mono text-xs font-semibold tracking-[0.16em] text-slate-500">
        {item.code}
      </span>
    ),
  },
  {
    key: 'name',
    header: 'Material',
    render: (item) => (
      <div>
        <div className="font-semibold text-ink">{item.name}</div>
        <div className="mt-1 text-xs text-slate-500">Category: {item.category ?? '-'}</div>
      </div>
    ),
  },
  {
    key: 'uom',
    header: 'UOM',
    render: (item) => (
      <div>
        <div className="font-semibold text-ink">{item.unitOfMeasureName}</div>
        <div className="mt-1 text-xs font-mono uppercase tracking-[0.16em] text-slate-500">
          {item.unitOfMeasureCode}
        </div>
      </div>
    ),
  },
  {
    key: 'expiry',
    header: 'Expiry',
    render: (item) => (
      <div>
        <div className="font-semibold text-ink">{item.hasExpiry ? 'Yes' : 'No'}</div>
        <div className="mt-1 text-xs text-slate-500">
          Shelf life: {item.shelfLifeDays ? `${item.shelfLifeDays} hari` : '-'}
        </div>
      </div>
    ),
  },
  {
    key: 'minimumStock',
    header: 'Minimum Stock',
    render: (item) => (
      <span className="font-semibold text-ink">
        {new Intl.NumberFormat('id-ID', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(item.minimumStock)}
      </span>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    className: 'w-[140px]',
    render: (item) => <MasterDataStatusBadge isActive={item.isActive} />,
  },
]

function toFormValues(detail: RawMaterialDetail): RawMaterialFormValues {
  return {
    code: detail.code,
    name: detail.name,
    category: detail.category ?? '',
    unitOfMeasureId: detail.unitOfMeasure.id,
    hasExpiry: detail.hasExpiry,
    shelfLifeDays: detail.shelfLifeDays?.toString() ?? '',
    minimumStock: detail.minimumStock.toString(),
    isActive: detail.isActive,
  }
}

function buildUnitOptionLabel(option: UnitOfMeasureOption) {
  return option.symbol ? `${option.name} (${option.code} / ${option.symbol})` : `${option.name} (${option.code})`
}

function mergeCurrentUnit(
  options: UnitOfMeasureOption[],
  currentUnit: UnitOfMeasureOption | null,
) {
  if (!currentUnit) {
    return options
  }

  return options.some((option) => option.id === currentUnit.id)
    ? options
    : [...options, currentUnit]
}

export function RawMaterialsPage() {
  const [uomOptions, setUomOptions] = useState<UnitOfMeasureOption[]>([])
  const [isUomLoading, setIsUomLoading] = useState(true)
  const [uomError, setUomError] = useState<string | null>(null)
  const [formUnitOverride, setFormUnitOverride] = useState<UnitOfMeasureOption | null>(null)
  const rawMaterialModule = useMasterDataModule<
    RawMaterialListItem,
    RawMaterialDetail,
    RawMaterialFormValues,
    RawMaterialQueryState
  >({
    api: rawMaterialsApi,
    permissions: {
      view: 'materials.view',
      create: 'materials.create',
      update: 'materials.update',
    },
    emptyValues: emptyRawMaterialFormValues,
    toFormValues,
    validate: validateRawMaterialForm,
    entityName: 'Raw Material',
    initialQuery: DEFAULT_QUERY,
  })

  useEffect(() => {
    async function loadUnitOptions() {
      setIsUomLoading(true)
      setUomError(null)

      try {
        const items = await unitOfMeasuresApi.listActiveOptions()
        setUomOptions(items)
      } catch (caughtError) {
        const apiError = caughtError as ApiError
        setUomError(apiError.message)
      } finally {
        setIsUomLoading(false)
      }
    }

    void loadUnitOptions()
  }, [])

  useEffect(() => {
    async function loadCurrentUnitOverride() {
      if (
        !rawMaterialModule.isFormOpen ||
        !rawMaterialModule.formValues.unitOfMeasureId ||
        uomOptions.some((option) => option.id === rawMaterialModule.formValues.unitOfMeasureId)
      ) {
        setFormUnitOverride(null)
        return
      }

      try {
        const detail = await unitOfMeasuresApi.getById(rawMaterialModule.formValues.unitOfMeasureId)
        setFormUnitOverride({
          id: detail.id,
          code: detail.code,
          name: detail.name,
          symbol: detail.symbol,
        })
      } catch {
        setFormUnitOverride(null)
      }
    }

    void loadCurrentUnitOverride()
  }, [rawMaterialModule.formValues.unitOfMeasureId, rawMaterialModule.isFormOpen, uomOptions])

  const formUnitOptions = mergeCurrentUnit(uomOptions, formUnitOverride)

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <Boxes size={14} className="text-signal" />
              Master Data Raw Material
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Material siap dipakai untuk receiving
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Kelola bahan baku beserta UOM, expiry, minimum stock, dan status aktif agar Goods
              Receiving memiliki master data yang siap dipilih.
            </p>
          </div>

          <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
            <CardContent className="p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">
                Total material
              </div>
              <div className="mt-2 font-display text-3xl font-semibold text-paper">
                {rawMaterialModule.pagination.totalItems}
              </div>
              <p className="mt-1 text-sm text-paper/60">Search, filter, dan pagination backend aktif.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <MasterDataToolbar
        query={rawMaterialModule.query}
        searchValue={rawMaterialModule.searchInput}
        searchPlaceholder="Cari kode, nama, atau kategori material"
        onSearchValueChange={rawMaterialModule.setSearchInput}
        onStatusChange={rawMaterialModule.handleStatusChange}
        onPageSizeChange={rawMaterialModule.handlePageSizeChange}
        createLabel="Add Material"
        onCreate={rawMaterialModule.openCreateDialog}
        canCreate={rawMaterialModule.canCreate}
        filters={
          <>
            <Input
              value={rawMaterialModule.query.category}
              onChange={(event) =>
                rawMaterialModule.setQuery((current) => ({
                  ...current,
                  category: event.target.value,
                  page: 1,
                }))
              }
              placeholder="Filter kategori"
              className="h-12 rounded-2xl"
            />
            <select
              value={rawMaterialModule.query.unitOfMeasureId}
              onChange={(event) =>
                rawMaterialModule.setQuery((current) => ({
                  ...current,
                  unitOfMeasureId: event.target.value,
                  page: 1,
                }))
              }
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
            >
              <option value="">Semua UOM</option>
              {uomOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {buildUnitOptionLabel(option)}
                </option>
              ))}
            </select>
            <select
              value={rawMaterialModule.query.hasExpiry}
              onChange={(event) =>
                rawMaterialModule.setQuery((current) => ({
                  ...current,
                  hasExpiry: event.target.value as RawMaterialQueryState['hasExpiry'],
                  page: 1,
                }))
              }
              className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
            >
              {HAS_EXPIRY_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </>
        }
      />

      {rawMaterialModule.isLoading ? (
        <MasterDataLoadingState description="Daftar raw material sedang dimuat dari backend." />
      ) : rawMaterialModule.error ? (
        <MasterDataErrorState
          description={rawMaterialModule.error}
          onRetry={rawMaterialModule.reload}
        />
      ) : rawMaterialModule.items.length === 0 ? (
        <MasterDataEmptyState
          description="Belum ada raw material yang cocok dengan filter saat ini."
          action={
            rawMaterialModule.canCreate ? (
              <Button onClick={rawMaterialModule.openCreateDialog}>Tambah material pertama</Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-3">
          {rawMaterialModule.isRefreshing && (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
              <LoaderCircle size={14} className="animate-spin" />
              Menyegarkan data...
            </div>
          )}
          <MasterDataTable
            title="Raw Material List"
            itemLabel="material"
            items={rawMaterialModule.items}
            columns={columns}
            pagination={rawMaterialModule.pagination}
            onPageChange={rawMaterialModule.handlePageChange}
            onEdit={rawMaterialModule.openEditDialog}
            onToggleStatus={rawMaterialModule.openStatusDialog}
            canUpdate={rawMaterialModule.canUpdate}
            getRowKey={(item) => item.id}
          />
        </div>
      )}

      <MasterDataFormDialog
        open={rawMaterialModule.isFormOpen}
        title={rawMaterialModule.formMode === 'create' ? 'Tambah Raw Material' : 'Edit Raw Material'}
        description="Pilih hanya UOM aktif untuk data baru dan pastikan rule expiry mengikuti kebutuhan operasional."
        onOpenChange={rawMaterialModule.closeFormDialog}
        onSubmit={rawMaterialModule.submitForm}
        submitting={rawMaterialModule.isFormSubmitting}
        submitLabel={
          rawMaterialModule.formMode === 'create' ? 'Simpan Raw Material' : 'Perbarui Raw Material'
        }
      >
        {rawMaterialModule.isDetailLoading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            <LoaderCircle size={16} className="animate-spin" />
            Memuat detail raw material...
          </div>
        ) : (
          <div className="space-y-5">
            {rawMaterialModule.formError && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {rawMaterialModule.formError}
              </div>
            )}

            {uomError && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {uomError}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Material Code</label>
                <Input
                  value={rawMaterialModule.formValues.code}
                  onChange={(event) =>
                    rawMaterialModule.setFormValues((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                  placeholder="RM-001"
                />
                <MasterDataFormFieldError
                  message={getFieldError(rawMaterialModule.formErrors, 'code')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Status</label>
                <MasterDataBooleanSelect
                  value={rawMaterialModule.formValues.isActive}
                  onChange={(value) =>
                    rawMaterialModule.setFormValues((current) => ({ ...current, isActive: value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Material Name</label>
                <Input
                  value={rawMaterialModule.formValues.name}
                  onChange={(event) =>
                    rawMaterialModule.setFormValues((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Tepung Terigu Protein Tinggi"
                />
                <MasterDataFormFieldError
                  message={getFieldError(rawMaterialModule.formErrors, 'name')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Category</label>
                <Input
                  value={rawMaterialModule.formValues.category}
                  onChange={(event) =>
                    rawMaterialModule.setFormValues((current) => ({
                      ...current,
                      category: event.target.value,
                    }))
                  }
                  placeholder="Dry Goods"
                />
                <MasterDataFormFieldError
                  message={getFieldError(rawMaterialModule.formErrors, 'category')}
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Unit of Measure</label>
                <select
                  value={rawMaterialModule.formValues.unitOfMeasureId}
                  onChange={(event) =>
                    rawMaterialModule.setFormValues((current) => ({
                      ...current,
                      unitOfMeasureId: event.target.value,
                    }))
                  }
                  disabled={isUomLoading}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">{isUomLoading ? 'Memuat UOM...' : 'Pilih UOM aktif'}</option>
                  {formUnitOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {buildUnitOptionLabel(option)}
                      {formUnitOverride?.id === option.id ? ' - existing selection' : ''}
                    </option>
                  ))}
                </select>
                <MasterDataFormFieldError
                  message={getFieldError(rawMaterialModule.formErrors, 'unitOfMeasureId')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Has Expiry</label>
                <MasterDataBooleanSelect
                  value={rawMaterialModule.formValues.hasExpiry}
                  trueLabel="Yes"
                  falseLabel="No"
                  onChange={(value) =>
                    rawMaterialModule.setFormValues((current) => ({
                      ...current,
                      hasExpiry: value,
                      shelfLifeDays: value ? current.shelfLifeDays : '',
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Shelf Life Days</label>
                <Input
                  type="number"
                  min={0}
                  value={rawMaterialModule.formValues.shelfLifeDays}
                  onChange={(event) =>
                    rawMaterialModule.setFormValues((current) => ({
                      ...current,
                      shelfLifeDays: event.target.value,
                    }))
                  }
                  placeholder="30"
                  disabled={!rawMaterialModule.formValues.hasExpiry}
                />
                {!rawMaterialModule.formValues.hasExpiry && (
                  <p className="mt-2 text-xs text-slate-500">
                    Shelf life dikosongkan saat material tidak memiliki expiry.
                  </p>
                )}
                <MasterDataFormFieldError
                  message={getFieldError(rawMaterialModule.formErrors, 'shelfLifeDays')}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Minimum Stock</label>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={rawMaterialModule.formValues.minimumStock}
                  onChange={(event) =>
                    rawMaterialModule.setFormValues((current) => ({
                      ...current,
                      minimumStock: event.target.value,
                    }))
                  }
                  placeholder="0"
                />
                <MasterDataFormFieldError
                  message={getFieldError(rawMaterialModule.formErrors, 'minimumStock')}
                />
              </div>
            </div>
          </div>
        )}
      </MasterDataFormDialog>

      <MasterDataStatusDialog
        open={Boolean(rawMaterialModule.statusTarget)}
        entityLabel={rawMaterialModule.statusTarget?.name ?? 'raw material'}
        nextStatusLabel={rawMaterialModule.statusTarget?.isActive ? 'Inactive' : 'Active'}
        onOpenChange={rawMaterialModule.closeStatusDialog}
        onConfirm={rawMaterialModule.confirmStatusChange}
        submitting={rawMaterialModule.isStatusSubmitting}
      />

      {!rawMaterialModule.isFormOpen && uomError ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          Source UOM aktif belum berhasil dimuat: {uomError}
        </div>
      ) : null}

      {!rawMaterialModule.isFormOpen && !uomError && isUomLoading ? (
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500">
          <PackageSearch size={16} className="animate-pulse" />
          Menyiapkan source UOM aktif...
        </div>
      ) : null}
    </div>
  )
}
