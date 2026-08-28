import { useEffect, useState } from 'react'
import { LoaderCircle, ShoppingBasket } from 'lucide-react'
import { productsApi } from '@/api/products.api'
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
import type { ProductDetail, ProductFormValues, ProductListItem } from '@/features/products/types'
import {
  emptyProductFormValues,
  validateProductForm,
} from '@/features/products/validation'
import type { UnitOfMeasureOption } from '@/features/unit-of-measures/types'
import type { ApiError } from '@/types/api'

const columns: ColumnDefinition<ProductListItem>[] = [
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
    header: 'Product',
    render: (item) => <span className="font-semibold text-ink">{item.name}</span>,
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
    key: 'shelfLifeDays',
    header: 'Shelf Life',
    render: (item) => <span className="text-slate-600">{item.shelfLifeDays ? `${item.shelfLifeDays} hari` : '-'}</span>,
  },
  {
    key: 'status',
    header: 'Status',
    className: 'w-[140px]',
    render: (item) => <MasterDataStatusBadge isActive={item.isActive} />,
  },
]

function toFormValues(detail: ProductDetail): ProductFormValues {
  return {
    code: detail.code,
    name: detail.name,
    unitOfMeasureId: detail.unitOfMeasure.id,
    shelfLifeDays: detail.shelfLifeDays?.toString() ?? '',
    isActive: detail.isActive,
  }
}

function buildUnitOptionLabel(option: UnitOfMeasureOption) {
  return option.symbol ? `${option.name} (${option.code} / ${option.symbol})` : `${option.name} (${option.code})`
}

export function ProductsPage() {
  const [uomOptions, setUomOptions] = useState<UnitOfMeasureOption[]>([])
  const [isUomLoading, setIsUomLoading] = useState(true)
  const [uomError, setUomError] = useState<string | null>(null)
  const [formUnitOverride, setFormUnitOverride] = useState<UnitOfMeasureOption | null>(null)
  const productModule = useMasterDataModule<ProductListItem, ProductDetail, ProductFormValues>({
    api: productsApi,
    permissions: {
      view: 'products.view',
      create: 'products.create',
      update: 'products.update',
    },
    emptyValues: emptyProductFormValues,
    toFormValues,
    validate: validateProductForm,
    entityName: 'Product',
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
        !productModule.isFormOpen ||
        !productModule.formValues.unitOfMeasureId ||
        uomOptions.some((option) => option.id === productModule.formValues.unitOfMeasureId)
      ) {
        setFormUnitOverride(null)
        return
      }

      try {
        const detail = await unitOfMeasuresApi.getById(productModule.formValues.unitOfMeasureId)
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
  }, [productModule.formValues.unitOfMeasureId, productModule.isFormOpen, uomOptions])

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <ShoppingBasket size={14} className="text-signal" />
              Master Data Product
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Product master yang siap dipakai lintas modul
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Kelola product code, UOM, shelf life, dan status dengan pola UI yang sama seperti
              master data lain agar onboarding user warehouse tetap konsisten.
            </p>
          </div>

          <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
            <CardContent className="p-5">
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">
                Total product
              </div>
              <div className="mt-2 font-display text-3xl font-semibold text-paper">
                {productModule.pagination.totalItems}
              </div>
              <p className="mt-1 text-sm text-paper/60">Pagination backend dan status control aktif.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <MasterDataToolbar
        query={productModule.query}
        searchValue={productModule.searchInput}
        searchPlaceholder="Cari kode atau nama product"
        onSearchValueChange={productModule.setSearchInput}
        onStatusChange={productModule.handleStatusChange}
        onPageSizeChange={productModule.handlePageSizeChange}
        createLabel="Add Product"
        onCreate={productModule.openCreateDialog}
        canCreate={productModule.canCreate}
      />

      {productModule.isLoading ? (
        <MasterDataLoadingState description="Daftar product sedang dimuat dari backend." />
      ) : productModule.error ? (
        <MasterDataErrorState description={productModule.error} onRetry={productModule.reload} />
      ) : productModule.items.length === 0 ? (
        <MasterDataEmptyState
          description="Belum ada product yang cocok dengan filter saat ini."
          action={
            productModule.canCreate ? (
              <Button onClick={productModule.openCreateDialog}>Tambah product pertama</Button>
            ) : null
          }
        />
      ) : (
        <div className="space-y-3">
          {productModule.isRefreshing && (
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">
              <LoaderCircle size={14} className="animate-spin" />
              Menyegarkan data...
            </div>
          )}
          <MasterDataTable
            title="Product List"
            itemLabel="product"
            items={productModule.items}
            columns={columns}
            pagination={productModule.pagination}
            onPageChange={productModule.handlePageChange}
            onEdit={productModule.openEditDialog}
            onToggleStatus={productModule.openStatusDialog}
            canUpdate={productModule.canUpdate}
            getRowKey={(item) => item.id}
          />
        </div>
      )}

      <MasterDataFormDialog
        open={productModule.isFormOpen}
        title={productModule.formMode === 'create' ? 'Tambah Product' : 'Edit Product'}
        description="Gunakan hanya UOM aktif dan isi shelf life jika memang dibutuhkan secara operasional."
        onOpenChange={productModule.closeFormDialog}
        onSubmit={productModule.submitForm}
        submitting={productModule.isFormSubmitting}
        submitLabel={productModule.formMode === 'create' ? 'Simpan Product' : 'Perbarui Product'}
      >
        {productModule.isDetailLoading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
            <LoaderCircle size={16} className="animate-spin" />
            Memuat detail product...
          </div>
        ) : (
          <div className="space-y-5">
            {productModule.formError && (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {productModule.formError}
              </div>
            )}

            {uomError && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                {uomError}
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Product Code</label>
                <Input
                  value={productModule.formValues.code}
                  onChange={(event) =>
                    productModule.setFormValues((current) => ({
                      ...current,
                      code: event.target.value,
                    }))
                  }
                  placeholder="PRD-001"
                />
                <MasterDataFormFieldError message={getFieldError(productModule.formErrors, 'code')} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Status</label>
                <MasterDataBooleanSelect
                  value={productModule.formValues.isActive}
                  onChange={(value) =>
                    productModule.setFormValues((current) => ({ ...current, isActive: value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Product Name</label>
                <Input
                  value={productModule.formValues.name}
                  onChange={(event) =>
                    productModule.setFormValues((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Frozen Croissant Butter"
                />
                <MasterDataFormFieldError message={getFieldError(productModule.formErrors, 'name')} />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-ink">Unit of Measure</label>
                <select
                  value={productModule.formValues.unitOfMeasureId}
                  onChange={(event) =>
                    productModule.setFormValues((current) => ({
                      ...current,
                      unitOfMeasureId: event.target.value,
                    }))
                  }
                  disabled={isUomLoading}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10 disabled:cursor-not-allowed disabled:bg-slate-100"
                >
                  <option value="">{isUomLoading ? 'Memuat UOM...' : 'Pilih UOM aktif'}</option>
                  {[...uomOptions, ...(formUnitOverride ? [formUnitOverride] : [])]
                    .filter((option, index, all) => all.findIndex((candidate) => candidate.id === option.id) === index)
                    .map((option) => (
                    <option key={option.id} value={option.id}>
                      {buildUnitOptionLabel(option)}
                      {formUnitOverride?.id === option.id ? ' - existing selection' : ''}
                    </option>
                  ))}
                </select>
                <MasterDataFormFieldError
                  message={getFieldError(productModule.formErrors, 'unitOfMeasureId')}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">Shelf Life Days</label>
              <Input
                type="number"
                min={0}
                value={productModule.formValues.shelfLifeDays}
                onChange={(event) =>
                  productModule.setFormValues((current) => ({
                    ...current,
                    shelfLifeDays: event.target.value,
                  }))
                }
                placeholder="Kosongkan jika tidak ada shelf life"
              />
              <MasterDataFormFieldError
                message={getFieldError(productModule.formErrors, 'shelfLifeDays')}
              />
            </div>
          </div>
        )}
      </MasterDataFormDialog>

      <MasterDataStatusDialog
        open={Boolean(productModule.statusTarget)}
        entityLabel={productModule.statusTarget?.name ?? 'product'}
        nextStatusLabel={productModule.statusTarget?.isActive ? 'Inactive' : 'Active'}
        onOpenChange={productModule.closeStatusDialog}
        onConfirm={productModule.confirmStatusChange}
        submitting={productModule.isStatusSubmitting}
      />
    </div>
  )
}
