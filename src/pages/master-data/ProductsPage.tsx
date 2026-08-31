import { useEffect, useState } from 'react'
import { LoaderCircle, ShoppingBasket } from 'lucide-react'
import { productsApi } from '@/api/products.api'
import { unitOfMeasuresApi } from '@/api/unitOfMeasures.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MasterDataStatusDialog } from '@/features/master-data/components/MasterDataStatusDialog'
import {
  MasterDataEmptyState,
  MasterDataErrorState,
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import { useMasterDataModule } from '@/features/master-data/hooks/useMasterDataModule'
import { ProductFormDialog } from '@/features/products/components/ProductFormDialog'
import { ProductTable } from '@/features/products/components/ProductTable'
import { ProductToolbar } from '@/features/products/components/ProductToolbar'
import type {
  ProductDetail,
  ProductFormValues,
  ProductListItem,
} from '@/features/products/types'
import {
  emptyProductFormValues,
  validateProductForm,
} from '@/features/products/validation'
import type { UnitOfMeasureOption } from '@/features/unit-of-measures/types'
import type { ApiError } from '@/types/api'

function toFormValues(detail: ProductDetail): ProductFormValues {
  return {
    code: detail.code,
    name: detail.name,
    unitOfMeasureId: detail.unitOfMeasure.id,
    shelfLifeDays: detail.shelfLifeDays?.toString() ?? '',
    isActive: detail.isActive,
  }
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

  const formUnitOptions = mergeCurrentUnit(uomOptions, formUnitOverride)
  const currentFormUnit =
    formUnitOptions.find((option) => option.id === productModule.formValues.unitOfMeasureId) ??
    formUnitOverride

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(12,28,26,0.16)] sm:px-8 sm:py-8">
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

          <div className="flex flex-wrap gap-3">
            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">
                  Total Product
                </div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper">
                  {productModule.pagination.totalItems}
                </div>
                <p className="mt-1 text-sm text-paper/60">Semua product tercatat</p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Active</div>
                <div className="mt-2 font-display text-3xl font-semibold text-emerald-400">
                  {productModule.items.filter((item) => item.isActive).length}
                </div>
                <p className="mt-1 text-sm text-paper/60">Siap dipakai lintas modul</p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">
                  Inactive
                </div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper/45">
                  {productModule.items.filter((item) => !item.isActive).length}
                </div>
                <p className="mt-1 text-sm text-paper/60">Perlu direview kembali</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <ProductToolbar
        query={productModule.query}
        searchValue={productModule.searchInput}
        onSearchValueChange={productModule.setSearchInput}
        onStatusChange={productModule.handleStatusChange}
        onPageSizeChange={productModule.handlePageSizeChange}
        onResetFilters={() => {
          productModule.setSearchInput('')
          productModule.setQuery((current) => ({
            ...current,
            search: '',
            status: 'ALL',
            page: 1,
          }))
        }}
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
        <div className="relative space-y-3">
          {productModule.isRefreshing && (
            <div className="absolute -top-2 right-0 z-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
              <LoaderCircle size={13} className="animate-spin text-slate-400" />
              Menyegarkan data...
            </div>
          )}
          <ProductTable
            items={productModule.items}
            pagination={productModule.pagination}
            onPageChange={productModule.handlePageChange}
            onEdit={productModule.openEditDialog}
            onToggleStatus={productModule.openStatusDialog}
            canUpdate={productModule.canUpdate}
          />
        </div>
      )}

      <ProductFormDialog
        open={productModule.isFormOpen}
        mode={productModule.formMode}
        values={productModule.formValues}
        errors={productModule.formErrors}
        formError={productModule.formError}
        uomError={uomError}
        isUomLoading={isUomLoading}
        isDetailLoading={productModule.isDetailLoading}
        submitting={productModule.isFormSubmitting}
        unitOptions={formUnitOptions}
        currentUnit={currentFormUnit ?? null}
        onValuesChange={productModule.setFormValues}
        onOpenChange={productModule.closeFormDialog}
        onSubmit={productModule.submitForm}
      />

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
