import { useEffect, useState } from 'react'
import { Factory, LoaderCircle, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { productionOrdersApi } from '@/api/productionOrders.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  MasterDataFormFieldError,
} from '@/features/master-data/components/MasterDataFormFieldError'
import {
  MasterDataLoadingState,
} from '@/features/master-data/components/MasterDataStates'
import {
  emptyProductionOrderFormValues,
  validateProductionOrderForm,
  getFieldError,
  hasFormErrors,
  type ProductionOrderFormErrors,
} from '@/features/production-orders/validation'
import type {
  ProductionOrderFormValues,
  RecipeVersionOption,
} from '@/features/production-orders/types'
import type { ProductListItem } from '@/features/products/types'
import type { WarehouseListItem } from '@/features/warehouses/types'
import type { UserListItem } from '@/features/users/types'
import type { ApiError } from '@/types/api'

export function ProductionOrderCreatePage() {
  const navigate = useNavigate()
  const [values, setValues] = useState<ProductionOrderFormValues>(emptyProductionOrderFormValues)
  const [errors, setErrors] = useState<ProductionOrderFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [products, setProducts] = useState<ProductListItem[]>([])
  const [warehouses, setWarehouses] = useState<WarehouseListItem[]>([])
  const [users, setUsers] = useState<UserListItem[]>([])
  const [recipes, setRecipes] = useState<Array<{
    id: string
    name: string
    status: number
    currentVersion: { id: string; versionNumber: number; standardOutputQuantity: number; unitOfMeasure: { id: string; code: string; name: string; symbol: string | null } } | null
  }>>([])
  const [recipeVersions, setRecipeVersions] = useState<RecipeVersionOption[]>([])
  const [isLoadingLookups, setIsLoadingLookups] = useState(true)
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false)
  const [isLoadingVersions, setIsLoadingVersions] = useState(false)
  const [noApprovedRecipe, setNoApprovedRecipe] = useState(false)

  useEffect(() => {
    async function loadLookups() {
      try {
        const [productList, warehouseList, userList] = await Promise.all([
          productionOrdersApi.listActiveProducts(),
          productionOrdersApi.listActiveWarehouses(),
          productionOrdersApi.listActiveUsers(),
        ])
        setProducts(productList)
        setWarehouses(warehouseList)
        setUsers(userList)
      } catch {
        // keep form usable
      } finally {
        setIsLoadingLookups(false)
      }
    }
    void loadLookups()
  }, [])

  useEffect(() => {
    if (!values.productId) {
      setRecipes([])
      setRecipeVersions([])
      setNoApprovedRecipe(false)
      updateField('recipeVersionId', '')
      updateField('unitOfMeasureId', '')
      return
    }

    async function loadRecipes() {
      setIsLoadingRecipes(true)
      try {
        const recipeList = await productionOrdersApi.listRecipesByProduct(values.productId)
        const approvedRecipes = recipeList.filter(
          (r) => r.status === 3 && r.currentVersion !== null,
        )
        setRecipes(approvedRecipes)

        if (approvedRecipes.length === 0) {
          setNoApprovedRecipe(true)
          setRecipeVersions([])
          updateField('recipeVersionId', '')
          updateField('unitOfMeasureId', '')
        } else {
          setIsLoadingVersions(true)
          const allVersionResults = await Promise.all(
            approvedRecipes.map((r) => productionOrdersApi.listApprovedRecipeVersions(r.id)),
          )
          const allVersions = allVersionResults.flat()
          setRecipeVersions(allVersions)
          setNoApprovedRecipe(allVersions.length === 0)
          if (allVersions.length === 1) {
            updateField('recipeVersionId', allVersions[0].id)
            updateField('unitOfMeasureId', allVersions[0].unitOfMeasure.id)
          } else {
            updateField('recipeVersionId', '')
            updateField('unitOfMeasureId', '')
          }
          setIsLoadingVersions(false)
        }
      } catch {
        setRecipes([])
        setRecipeVersions([])
        setNoApprovedRecipe(true)
      } finally {
        setIsLoadingRecipes(false)
        setIsLoadingVersions(false)
      }
    }
    void loadRecipes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.productId])

  async function loadRecipeVersions(recipeId: string) {
    setIsLoadingVersions(true)
    try {
      const versions = await productionOrdersApi.listApprovedRecipeVersions(recipeId)
      setRecipeVersions(versions)
      if (versions.length === 0) {
        setNoApprovedRecipe(true)
        updateField('recipeVersionId', '')
        updateField('unitOfMeasureId', '')
      } else {
        setNoApprovedRecipe(false)
        if (versions.length === 1) {
          updateField('recipeVersionId', versions[0].id)
          updateField('unitOfMeasureId', versions[0].unitOfMeasure.id)
        } else {
          updateField('recipeVersionId', '')
          updateField('unitOfMeasureId', '')
        }
      }
    } catch {
      setRecipeVersions([])
      setNoApprovedRecipe(true)
    } finally {
      setIsLoadingVersions(false)
    }
  }

  function updateField(field: keyof ProductionOrderFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    if (errors[field]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[field]
        return next
      })
    }
    setFormError(null)
  }

  function handleRecipeSelect(recipeId: string) {
    updateField('recipeVersionId', '')
    updateField('unitOfMeasureId', '')
    if (recipeId) {
      void loadRecipeVersions(recipeId)
    } else {
      setRecipeVersions([])
    }
  }

  function handleVersionSelect(versionId: string) {
    updateField('recipeVersionId', versionId)
    const selected = recipeVersions.find((v) => v.id === versionId)
    if (selected) {
      updateField('unitOfMeasureId', selected.unitOfMeasure.id)
    }
  }

  async function handleSubmit() {
    const validationErrors = validateProductionOrderForm(values)
    if (hasFormErrors(validationErrors)) {
      setErrors(validationErrors)
      return
    }

    setIsSubmitting(true)
    setFormError(null)

    try {
      const result = await productionOrdersApi.create(values)
      navigate(`/production/orders/${result.id}`)
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setFormError(apiError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoadingLookups) {
    return (
      <div className="space-y-6">
        <MasterDataLoadingState description="Memuat data lookup..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
            <Factory size={14} className="text-signal" />
            Production Order
          </div>
          <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
            Buat Production Order Baru
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
            Pilih product dan approved recipe untuk membuat production order.
          </p>
        </div>
      </section>

      <Card className="rounded-[28px] border-white/70 bg-white/85 shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="space-y-6">
            {formError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {formError}
              </div>
            ) : null}

            <div data-tour="po-scaling-info" className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Product <span className="text-rose-500">*</span>
                </label>
                <select
                  data-tour="po-product-select"
                  value={values.productId}
                  onChange={(event) => {
                    updateField('productId', event.target.value)
                    handleRecipeSelect('')
                  }}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
                >
                  <option value="">Pilih product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.code} - {product.name}
                    </option>
                  ))}
                </select>
                <MasterDataFormFieldError message={getFieldError(errors, 'productId') ?? null} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Approved Recipe <span className="text-rose-500">*</span>
                </label>
                <select
                  data-tour="po-recipe-select"
                  value={
                    recipeVersions.length === 1 && values.recipeVersionId
                      ? values.recipeVersionId
                      : (() => {
                          const selectedVersion = recipeVersions.find(
                            (v) => v.id === values.recipeVersionId,
                          )
                          return selectedVersion ? values.recipeVersionId : ''
                        })()
                  }
                  onChange={(event) => handleVersionSelect(event.target.value)}
                  disabled={!values.productId || isLoadingRecipes || isLoadingVersions}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10 disabled:bg-slate-50 disabled:text-slate-400"
                >
                  <option value="">
                    {isLoadingRecipes || isLoadingVersions
                      ? 'Memuat recipe...'
                      : !values.productId
                        ? 'Pilih product terlebih dahulu'
                        : noApprovedRecipe
                          ? 'Tidak ada approved recipe'
                          : 'Pilih recipe & version'}
                  </option>
                  {recipes.map((recipe) =>
                    recipeVersions
                      .filter((v) => v.recipeId === recipe.id)
                      .map((version) => (
                        <option key={version.id} value={version.id}>
                          {recipe.name} v{version.versionNumber} (Output: {version.standardOutputQuantity} {version.unitOfMeasure.code})
                        </option>
                      )),
                  )}
                </select>
                <MasterDataFormFieldError message={getFieldError(errors, 'recipeVersionId') ?? null} />
                {noApprovedRecipe && values.productId && !isLoadingRecipes ? (
                  <p className="text-xs text-amber-600">
                    Product ini belum memiliki approved recipe. Silakan buat dan approve recipe terlebih dahulu.
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Target Output <span className="text-rose-500">*</span>
                </label>
                <Input
                  data-tour="po-target-output"
                  type="number"
                  value={values.targetOutput}
                  onChange={(event) => updateField('targetOutput', event.target.value)}
                  placeholder="Masukkan target output"
                  min="0.01"
                  step="any"
                  className="h-12 rounded-2xl"
                />
                <MasterDataFormFieldError message={getFieldError(errors, 'targetOutput') ?? null} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Unit of Measure <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={
                    recipeVersions.find((v) => v.id === values.recipeVersionId)
                      ?.unitOfMeasure.code ?? ''
                  }
                  disabled
                  placeholder="Otomatis dari recipe"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
                />
                <MasterDataFormFieldError message={getFieldError(errors, 'unitOfMeasureId') ?? null} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Warehouse <span className="text-rose-500">*</span>
                </label>
                <select
                  data-tour="po-warehouse-select"
                  value={values.warehouseId}
                  onChange={(event) => updateField('warehouseId', event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
                >
                  <option value="">Pilih warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.code} - {warehouse.name}
                    </option>
                  ))}
                </select>
                <MasterDataFormFieldError message={getFieldError(errors, 'warehouseId') ?? null} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Scheduled Date
                </label>
                <Input
                  type="date"
                  value={values.scheduledDate}
                  onChange={(event) => updateField('scheduledDate', event.target.value)}
                  className="h-12 rounded-2xl"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium text-slate-700">
                  Operator (Optional)
                </label>
                <select
                  value={values.assignedOperatorId}
                  onChange={(event) => updateField('assignedOperatorId', event.target.value)}
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
                >
                  <option value="">Tidak ada operator</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.fullName} ({user.username})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-100 pt-6">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/production/orders')}
                disabled={isSubmitting}
              >
                Batal
              </Button>
              <Button
                data-tour="po-save-draft-btn"
                type="button"
                onClick={() => void handleSubmit()}
                disabled={isSubmitting || noApprovedRecipe}
                className="min-w-[160px]"
              >
                {isSubmitting ? (
                  <LoaderCircle size={16} className="mr-2 animate-spin" />
                ) : (
                  <Save size={16} className="mr-2" />
                )}
                Simpan Draft
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
