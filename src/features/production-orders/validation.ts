import type { ProductionOrderFormValues } from '@/features/production-orders/types'
import type { ProductionOrderStatus } from '@/features/production-orders/types'

export const emptyProductionOrderFormValues: ProductionOrderFormValues = {
  productId: '',
  recipeVersionId: '',
  warehouseId: '',
  targetOutput: '',
  unitOfMeasureId: '',
  scheduledDate: '',
  assignedOperatorId: '',
}

export function normalizeProductionOrderFormValues(
  values: ProductionOrderFormValues,
): ProductionOrderFormValues {
  return {
    productId: values.productId.trim(),
    recipeVersionId: values.recipeVersionId.trim(),
    warehouseId: values.warehouseId.trim(),
    targetOutput: values.targetOutput.trim(),
    unitOfMeasureId: values.unitOfMeasureId.trim(),
    scheduledDate: values.scheduledDate.trim(),
    assignedOperatorId: values.assignedOperatorId.trim(),
  }
}

export interface ProductionOrderFormErrors {
  [key: string]: string[]
}

export function validateProductionOrderForm(
  values: ProductionOrderFormValues,
): ProductionOrderFormErrors {
  const errors: ProductionOrderFormErrors = {}
  const normalized = normalizeProductionOrderFormValues(values)

  if (!normalized.productId) {
    errors.productId = ['Product wajib dipilih.']
  }

  if (!normalized.recipeVersionId) {
    errors.recipeVersionId = ['Recipe wajib dipilih.']
  }

  if (!normalized.warehouseId) {
    errors.warehouseId = ['Warehouse wajib dipilih.']
  }

  const targetOutput = Number(normalized.targetOutput)
  if (!normalized.targetOutput || isNaN(targetOutput) || targetOutput <= 0) {
    errors.targetOutput = ['Target Output harus lebih dari 0.']
  }

  if (!normalized.unitOfMeasureId) {
    errors.unitOfMeasureId = ['Unit of Measure wajib dipilih.']
  }

  return errors
}

export function hasFormErrors(errors: ProductionOrderFormErrors): boolean {
  return Object.keys(errors).length > 0
}

export function getFieldError(
  errors: ProductionOrderFormErrors,
  field: string,
): string | undefined {
  const fieldErrors = errors[field]
  return fieldErrors && fieldErrors.length > 0 ? fieldErrors[0] : undefined
}

const STATUS_LABELS: Record<ProductionOrderStatus, string> = {
  1: 'Draft',
  2: 'Material Shortage',
  3: 'Ready',
  4: 'Scheduled',
  5: 'Released',
  6: 'In Progress',
  7: 'Waiting QC',
  8: 'Completed',
  9: 'Cancelled',
}

export function getProductionOrderStatusLabel(status: ProductionOrderStatus): string {
  return STATUS_LABELS[status] ?? 'Unknown'
}

const STATUS_FILTER_LABELS: Record<string, string> = {
  ALL: 'Semua status',
  DRAFT: 'Draft',
  MATERIAL_SHORTAGE: 'Material Shortage',
  READY: 'Ready',
  SCHEDULED: 'Scheduled',
  RELEASED: 'Released',
  IN_PROGRESS: 'In Progress',
  WAITING_QC: 'Waiting QC',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

export function getProductionOrderStatusFilterLabel(filter: string): string {
  return STATUS_FILTER_LABELS[filter] ?? filter
}

export function formatDateLabel(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateTimeLabel(dateString: string | null): string {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
