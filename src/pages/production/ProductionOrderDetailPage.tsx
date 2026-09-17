import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Factory,
  LoaderCircle,
  Pencil,
  Save,
  Trash2,
  X,
  XCircle,
} from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { productionOrdersApi } from '@/api/productionOrders.api'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import { breadcrumbs, entityLinks } from '@/routes/canonicalRoutes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MasterDataFormFieldError } from '@/features/master-data/components/MasterDataFormFieldError'
import {
  MasterDataLoadingState,
  MasterDataErrorState,
} from '@/features/master-data/components/MasterDataStates'
import { ProductionOrderStatusBadge } from '@/features/production-orders/components/ProductionOrderStatusBadge'
import { ProductionOrderCancelDialog } from '@/features/production-orders/components/ProductionOrderCancelDialog'
import { ProductionOrderReleaseDialog } from '@/features/production-orders/components/ProductionOrderReleaseDialog'
import {
  ProductionOrderStatus,
  type ProductionOrderDetail as ProductionOrderDetailType,
  type ProductionOrderFormValues,
  type RecipeVersionOption,
} from '@/features/production-orders/types'
import {
  emptyProductionOrderFormValues,
  validateProductionOrderForm,
  hasFormErrors,
  getFieldError,
  type ProductionOrderFormErrors,
  formatDateTimeLabel,
} from '@/features/production-orders/validation'
import { useAuth } from '@/hooks/useAuth'
import type { ProductListItem } from '@/features/products/types'
import type { WarehouseListItem } from '@/features/warehouses/types'
import type { UserListItem } from '@/features/users/types'
import type { ApiError } from '@/types/api'
import { fetchLookupIfAllowed } from '@/utils/lookupGuard'

export function ProductionOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { can } = useAuth()

  const [order, setOrder] = useState<ProductionOrderDetailType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [editValues, setEditValues] = useState<ProductionOrderFormValues>(emptyProductionOrderFormValues)
  const [editErrors, setEditErrors] = useState<ProductionOrderFormErrors>({})
  const [isSaving, setIsSaving] = useState(false)

  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isReleaseDialogOpen, setIsReleaseDialogOpen] = useState(false)
  const [isCheckingMaterials, setIsCheckingMaterials] = useState(false)
  const [isReleasing, setIsReleasing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

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
  const [isLoadingVersions, setIsLoadingVersions] = useState(false)

  const isDraft = order?.status === ProductionOrderStatus.Draft
  const isMaterialShortage = order?.status === ProductionOrderStatus.MaterialShortage
  const isReady = order?.status === ProductionOrderStatus.Ready
  const isReleased = order?.status === ProductionOrderStatus.Released
  const isCancelled = order?.status === ProductionOrderStatus.Cancelled
  // Backend only allows editing Draft orders (UpdateDraft rejects anything else
  // with 409), so the edit action must not be offered on MaterialShortage.
  const canEdit = isDraft && can('production-orders.update')
  const canCancel = (isDraft || isMaterialShortage || isReady) && can('production-orders.cancel')
  const canCheckMaterials = (isDraft || isMaterialShortage) && can('production-orders.release')
  const canRelease = isReady && can('production-orders.release')

  const standardOutput = order?.recipeVersion.standardOutputQuantity ?? 0
  const scalingFactor = standardOutput > 0 && order ? order.targetOutput / standardOutput : 0

  async function loadOrder() {
    if (!id) return
    setIsLoading(true)
    setError(null)
    setActionError(null)
    try {
      const result = await productionOrdersApi.getById(id)
      setOrder(result)
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setError(apiError.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOrder()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (!isEditing || !order) return

    async function loadEditLookups() {
      try {
        const [productList, warehouseList, userList] = await Promise.all([
          fetchLookupIfAllowed('products.view', () => productionOrdersApi.listActiveProducts(), []),
          fetchLookupIfAllowed('warehouses.view', () => productionOrdersApi.listActiveWarehouses(), []),
          fetchLookupIfAllowed('users.view', () => productionOrdersApi.listActiveUsers(), []),
        ])
        setProducts(productList)
        setWarehouses(warehouseList)
        setUsers(userList)

        if (order) {
          const recipeList = await fetchLookupIfAllowed('recipes.view', () => productionOrdersApi.listRecipesByProduct(order.product.id), [])
          setRecipes(recipeList)

          if (order.recipeVersion.recipeId) {
            const versions = await fetchLookupIfAllowed('recipes.view', () => productionOrdersApi.listApprovedRecipeVersions(order.recipeVersion.recipeId), [])
            setRecipeVersions(versions)
          }
        }
      } catch {
        // keep form usable
      }
    }
    void loadEditLookups()
  }, [isEditing, order])

  function startEdit() {
    if (!order) return
    setEditValues({
      productId: order.product.id,
      recipeVersionId: order.recipeVersion.id,
      warehouseId: order.warehouse.id,
      targetOutput: String(order.targetOutput),
      unitOfMeasureId: order.unitOfMeasure.id,
      scheduledDate: order.scheduledDate
        ? new Date(order.scheduledDate).toISOString().split('T')[0]
        : '',
      assignedOperatorId: order.assignedOperator?.id ?? '',
    })
    setEditErrors({})
    setIsEditing(true)
  }

  function cancelEdit() {
    setIsEditing(false)
    setEditErrors({})
  }

  function updateEditField(field: keyof ProductionOrderFormValues, value: string) {
    setEditValues((current) => ({ ...current, [field]: value }))
    if (editErrors[field]) {
      setEditErrors((current) => {
        const next = { ...current }
        delete next[field]
        return next
      })
    }
  }

  async function handleEditRecipeSelect(recipeId: string) {
    updateEditField('recipeVersionId', '')
    updateEditField('unitOfMeasureId', '')
    if (recipeId) {
      setIsLoadingVersions(true)
      try {
        const versions = await fetchLookupIfAllowed('recipes.view', () => productionOrdersApi.listApprovedRecipeVersions(recipeId), [])
        setRecipeVersions(versions)
        if (versions.length === 1) {
          updateEditField('recipeVersionId', versions[0].id)
          updateEditField('unitOfMeasureId', versions[0].unitOfMeasure.id)
        }
      } catch {
        setRecipeVersions([])
      } finally {
        setIsLoadingVersions(false)
      }
    } else {
      setRecipeVersions([])
    }
  }

  async function handleEditVersionSelect(versionId: string) {
    updateEditField('recipeVersionId', versionId)
    const selected = recipeVersions.find((v) => v.id === versionId)
    if (selected) {
      updateEditField('unitOfMeasureId', selected.unitOfMeasure.id)
    }
  }

  async function handleSaveDraft() {
    if (!id) return
    const validationErrors = validateProductionOrderForm(editValues)
    if (hasFormErrors(validationErrors)) {
      setEditErrors(validationErrors)
      return
    }

    setIsSaving(true)
    try {
      const result = await productionOrdersApi.updateDraft(id, editValues)
      setOrder(result)
      setIsEditing(false)
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setEditErrors({ form: [apiError.message] })
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCancelOrder(reason: string) {
    if (!id) return
    try {
      const result = await productionOrdersApi.cancel(id, reason)
      setOrder(result)
      setIsCancelDialogOpen(false)
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      throw apiError
    }
  }

  async function handleCheckMaterials() {
    if (!id) return
    setIsCheckingMaterials(true)
    setActionError(null)
    try {
      await productionOrdersApi.checkMaterials(id)
      await loadOrder()
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setActionError(`Check Materials gagal: ${apiError.message}`)
    } finally {
      setIsCheckingMaterials(false)
    }
  }

  async function handleRelease() {
    if (!id) return
    setIsReleasing(true)
    setActionError(null)
    try {
      await productionOrdersApi.release(id)
      await loadOrder()
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setActionError(`Release gagal: ${apiError.message}`)
      throw caughtError
    } finally {
      setIsReleasing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <MasterDataLoadingState description="Memuat production order..." />
      </div>
    )
  }

  if (error && !order) {
    return (
      <div className="space-y-6">
        <MasterDataErrorState description={error} onRetry={() => void loadOrder()} />
      </div>
    )
  }

  if (!order) return null

  const hasAnyShortage = order.materialRequirements.some((req) => !req.isSufficient)

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbs.productionOrderDetail(order.productionOrderNumber)} />
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <button
              onClick={() => navigate('/production/orders')}
              className="mb-4 inline-flex items-center gap-1.5 text-sm text-paper/60 transition-colors hover:text-paper"
            >
              <ArrowLeft size={14} />
              Kembali ke daftar
            </button>
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <Factory size={14} className="text-signal" />
              {order.productionOrderNumber}
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              {order.product.name}
            </h1>
            <p className="mt-3 text-sm leading-7 text-paper/68 sm:text-base">
              {order.recipeVersion.recipeName} v{order.recipeVersion.versionNumber} &middot;{' '}
              {order.targetOutput} {order.unitOfMeasure.code}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {canEdit && !isEditing ? (
              <Button variant="secondary" onClick={startEdit} className="border-paper/20 bg-paper/10 text-paper hover:bg-paper/20">
                <Pencil size={14} className="mr-2" />
                Edit Draft
              </Button>
            ) : null}
            {canCancel && !isEditing ? (
              <Button variant="secondary" onClick={() => setIsCancelDialogOpen(true)} className="border-rose-400/30 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20">
                <Trash2 size={14} className="mr-2" />
                Cancel
              </Button>
            ) : null}
            {canCheckMaterials && !isEditing ? (
              <Button
                data-tour="po-check-material-btn"
                variant="secondary"
                onClick={() => void handleCheckMaterials()}
                disabled={isCheckingMaterials || isReleasing}
                className="border-paper/20 bg-paper/10 text-paper hover:bg-paper/20"
              >
                {isCheckingMaterials ? (
                  <LoaderCircle size={14} className="mr-2 animate-spin" />
                ) : (
                  <ClipboardCheck size={14} className="mr-2" />
                )}
                Check Materials
              </Button>
            ) : null}
            {canRelease && !isEditing ? (
              <Button
                data-tour="po-release-btn"
                onClick={() => setIsReleaseDialogOpen(true)}
                disabled={isReleasing || isCheckingMaterials}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {isReleasing ? (
                  <LoaderCircle size={14} className="mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 size={14} className="mr-2" />
                )}
                Release
              </Button>
            ) : null}
          </div>
        </div>
      </section>

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {actionError ? (
        <div className="flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span>{actionError}</span>
          <button onClick={() => setActionError(null)} className="ml-3 shrink-0 text-rose-500 hover:text-rose-700">
            <X size={14} />
          </button>
        </div>
      ) : null}

      {isEditing ? (
        <Card className="rounded-[28px] border-white/70 bg-white/85 shadow-sm">
          <CardContent className="p-6 sm:p-8">
            <div className="space-y-6">
              {editErrors.form ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {editErrors.form[0]}
                </div>
              ) : null}

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Product <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editValues.productId}
                    onChange={(event) => {
                      updateEditField('productId', event.target.value)
                      void handleEditRecipeSelect(event.target.value)
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
                  <MasterDataFormFieldError message={getFieldError(editErrors, 'productId') ?? null} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Approved Recipe <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editValues.recipeVersionId}
                    onChange={(event) => void handleEditVersionSelect(event.target.value)}
                    disabled={!editValues.productId || isLoadingVersions}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">
                      {isLoadingVersions ? 'Memuat recipe...' : 'Pilih recipe & version'}
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
                  <MasterDataFormFieldError message={getFieldError(editErrors, 'recipeVersionId') ?? null} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Target Output <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={editValues.targetOutput}
                    onChange={(event) => updateEditField('targetOutput', event.target.value)}
                    placeholder="Masukkan target output"
                    min="0.01"
                    step="any"
                    className="h-12 rounded-2xl"
                  />
                  <MasterDataFormFieldError message={getFieldError(editErrors, 'targetOutput') ?? null} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Unit of Measure <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={
                      recipeVersions.find((v) => v.id === editValues.recipeVersionId)
                        ?.unitOfMeasure.code ?? order.unitOfMeasure.code
                    }
                    disabled
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500 outline-none"
                  />
                  <MasterDataFormFieldError message={getFieldError(editErrors, 'unitOfMeasureId') ?? null} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    Warehouse <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editValues.warehouseId}
                    onChange={(event) => updateEditField('warehouseId', event.target.value)}
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
                  >
                    <option value="">Pilih warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.code} - {warehouse.name}
                      </option>
                    ))}
                  </select>
                  <MasterDataFormFieldError message={getFieldError(editErrors, 'warehouseId') ?? null} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Scheduled Date</label>
                  <Input
                    type="date"
                    value={editValues.scheduledDate}
                    onChange={(event) => updateEditField('scheduledDate', event.target.value)}
                    className="h-12 rounded-2xl"
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Operator (Optional)</label>
                  <select
                    value={editValues.assignedOperatorId}
                    onChange={(event) => updateEditField('assignedOperatorId', event.target.value)}
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
                <Button type="button" variant="secondary" onClick={cancelEdit} disabled={isSaving}>
                  Batal
                </Button>
                <Button type="button" onClick={() => void handleSaveDraft()} disabled={isSaving} className="min-w-[140px]">
                  {isSaving ? (
                    <LoaderCircle size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Save size={16} className="mr-2" />
                  )}
                  Simpan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card className="rounded-[28px] border-white/70 bg-white/85 shadow-sm">
                <CardHeader>
                  <CardTitle>Detail Production Order</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <DetailItem label="PO Number" value={order.productionOrderNumber} />
                    <DetailItem label="Status">
                      <div data-tour="po-status-badge">
                        <ProductionOrderStatusBadge status={order.status} />
                      </div>
                    </DetailItem>
                    <DetailItem label="Product" value={`${order.product.code} - ${order.product.name}`} />
                    <DetailItem label="Recipe">
                      {can('recipes.view') ? (
                        <Link
                          to={entityLinks.recipeVersionDetail(order.recipeVersion.recipeId, order.recipeVersion.id)}
                          className="font-medium text-ink underline underline-offset-4"
                          data-tour="po-link-recipe"
                        >
                          {order.recipeVersion.recipeName} v{order.recipeVersion.versionNumber}
                        </Link>
                      ) : (
                        `${order.recipeVersion.recipeName} v${order.recipeVersion.versionNumber}`
                      )}
                    </DetailItem>
                    <DetailItem label="Target Output" value={`${order.targetOutput} ${order.unitOfMeasure.code}`} />
                    <DetailItem label="Warehouse" value={`${order.warehouse.code} - ${order.warehouse.name}`} />
                    <DetailItem label="Scheduled Date" value={order.scheduledDate ? new Date(order.scheduledDate).toLocaleDateString('id-ID') : '-'} />
                    <DetailItem label="Operator" value={order.assignedOperator?.fullName ?? '-'} />
                    <DetailItem label="Created By" value={order.createdBy ?? '-'} />
                    <DetailItem label="Created At" value={formatDateTimeLabel(order.createdAtUtc)} />
                  </div>

                  {isReleased ? (
                    <div className="border-t border-slate-100 pt-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <DetailItem label="Released By" value={order.releasedBy ?? '-'} />
                        <DetailItem label="Released At" value={formatDateTimeLabel(order.releasedAtUtc)} />
                      </div>
                    </div>
                  ) : null}

                  {isCancelled ? (
                    <div className="border-t border-slate-100 pt-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <DetailItem label="Cancelled By" value={order.cancelledBy ?? '-'} />
                        <DetailItem label="Cancelled At" value={formatDateTimeLabel(order.cancelledAtUtc)} />
                        <DetailItem label="Reason" value={order.cancellationReason ?? '-'} />
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {isMaterialShortage && order.materialRequirements.length > 0 && hasAnyShortage ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                  <AlertTriangle size={14} className="mr-2 inline" />
                  Material belum mencukupi. Production Order belum dapat di-release.
                  Lakukan restock material yang mengalami shortage, lalu klik <strong>Check Materials</strong> untuk memverifikasi ulang.
                </div>
              ) : null}
            </div>

            <div className="space-y-6">
              <Card className="rounded-[28px] border-white/70 bg-white/85 shadow-sm">
                <CardHeader>
                  <CardTitle>Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Material Requirements
                    </div>
                    <div className="mt-1 text-2xl font-semibold text-ink">
                      {order.materialRequirements.length}
                    </div>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Last Updated
                    </div>
                    <div className="mt-1 text-sm text-ink">
                      {formatDateTimeLabel(order.updatedAtUtc)}
                    </div>
                    {order.updatedBy ? (
                      <div className="text-xs text-slate-500">by {order.updatedBy}</div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="rounded-[28px] border-white/70 bg-white/85 shadow-sm">
              <CardHeader>
                <CardTitle>Recipe Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <DetailItem label="Recipe Version">
                    {can('recipes.view') ? (
                      <Link
                        to={entityLinks.recipeVersionDetail(order.recipeVersion.recipeId, order.recipeVersion.id)}
                        className="font-medium text-ink underline underline-offset-4"
                      >
                        {order.recipeVersion.recipeName} V{order.recipeVersion.versionNumber}
                      </Link>
                    ) : (
                      `${order.recipeVersion.recipeName} V${order.recipeVersion.versionNumber}`
                    )}
                  </DetailItem>
                  <DetailItem label="Standard Output" value={`${standardOutput} ${order.unitOfMeasure.code}`} />
                  <DetailItem label="Target Output" value={`${order.targetOutput} ${order.unitOfMeasure.code}`} />
                  <DetailItem label="Scaling Factor">
                    <Badge variant="default" className="border-sky-300 bg-sky-100 text-sky-800">
                      {scalingFactor > 0 ? `${scalingFactor}x` : '-'}
                    </Badge>
                  </DetailItem>
                </div>
                <p className="mt-4 rounded-2xl bg-sand/35 p-4 text-sm text-slate-600">
                  Recipe quantity adalah kebutuhan bahan untuk Standard Output. Required di bawah dihitung ulang untuk Target Output Production Order ini.
                </p>
              </CardContent>
            </Card>

            {order.materialRequirements.length > 0 ? (
              <Card data-tour="po-material-requirements" className="rounded-[28px] border-white/70 bg-white/85 shadow-sm">
                <CardHeader>
                  <CardTitle>Material Requirements</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-separate border-spacing-0">
                      <thead>
                        <tr className="bg-slate-50/80 text-left">
                          {['Material', `Recipe Qty / ${standardOutput} ${order.unitOfMeasure.code}`, 'Required for This Order', 'Available', 'Shortage', 'Status'].map(
                            (header) => (
                              <th
                                key={header}
                                className="px-6 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500"
                              >
                                {header}
                              </th>
                            ),
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {order.materialRequirements.map((req) => {
                          const shortage = Math.max(0, req.scaledRequiredQuantity - req.availableQuantity)
                          return (
                            <tr key={req.id} className="border-b border-slate-200/70 bg-white">
                              <td className="px-6 py-4 text-sm font-medium text-ink">
                                {can('lots.view') ? (
                                  <Link
                                    to={entityLinks.lotList({ rawMaterialId: req.rawMaterialId })}
                                    className="underline underline-offset-4 hover:text-ink"
                                    title="Lihat LOT material ini"
                                  >
                                    {req.rawMaterialCode} - {req.rawMaterialName}
                                  </Link>
                                ) : (
                                  <>{req.rawMaterialCode} - {req.rawMaterialName}</>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500">
                                {req.recipeTargetQuantity} {req.unitOfMeasure.code}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {req.scaledRequiredQuantity} {req.unitOfMeasure.code}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600">
                                {req.availableQuantity} {req.unitOfMeasure.code}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {shortage > 0 ? (
                                  <span className="text-rose-600 font-medium">
                                    {shortage} {req.unitOfMeasure.code}
                                  </span>
                                ) : (
                                  <span className="text-slate-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm">
                                {req.isSufficient ? (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                                    <CheckCircle2 size={12} />
                                    Sufficient
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700">
                                    <XCircle size={12} />
                                    Shortage
                                  </span>
                                )}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>
        </>
      )}

      <ProductionOrderCancelDialog
        open={isCancelDialogOpen}
        onOpenChange={setIsCancelDialogOpen}
        onConfirm={handleCancelOrder}
        productionOrderNumber={order.productionOrderNumber}
      />

      <ProductionOrderReleaseDialog
        open={isReleaseDialogOpen}
        onOpenChange={setIsReleaseDialogOpen}
        onConfirm={handleRelease}
        productionOrderNumber={order.productionOrderNumber}
        summary={`Target ${order.targetOutput} ${order.unitOfMeasure.symbol ?? order.unitOfMeasure.code} · Recipe v${order.recipeVersion.versionNumber}.`}
      />
    </div>
  )
}

function DetailItem({
  label,
  value,
  children,
}: {
  label: string
  value?: string
  children?: React.ReactNode
}) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm text-ink">
        {children ?? value}
      </div>
    </div>
  )
}
