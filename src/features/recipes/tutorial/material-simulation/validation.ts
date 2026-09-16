import { RecipeToleranceType } from '@/features/recipes/types'
import type { MaterialSimulationState, MaterialSimulationValidation } from './types'

export const MATERIAL_SIMULATION_PAGE_SIZE = 5
export const MAX_SIMULATED_LOTS = 20

export function normalizeActualQuantity(value: string) {
  return value.trim().replace(',', '.')
}

function parseActualQuantity(value: string) {
  const normalized = normalizeActualQuantity(value)
  if (!/^\d+(?:\.\d{1,4})?$/.test(normalized)) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function isWithinTolerance(total: number, target: number, type: RecipeToleranceType | null, value: number | null) {
  if (!type || type === RecipeToleranceType.None) return true
  const tolerance = value ?? 0
  if (type === RecipeToleranceType.PlusMinus) return total >= target - tolerance && total <= target + tolerance
  if (type === RecipeToleranceType.Min) return total >= target - tolerance
  return total <= target + tolerance
}

export function validateMaterialSimulation(
  state: MaterialSimulationState | undefined,
  target: number | null,
  toleranceType: RecipeToleranceType | null,
  toleranceValue: number | null,
): MaterialSimulationValidation {
  const lots = state?.lots ?? []
  const scannedLots = lots.filter((lot) => lot.isScanned)
  const lotErrors: Record<string, string> = {}
  let totalActual = 0

  for (const lot of scannedLots) {
    const actual = parseActualQuantity(lot.actualQuantity)
    if (actual === null || actual <= 0) lotErrors[lot.id] = 'Actual Quantity harus angka positif, maksimal 4 desimal.'
    else if (actual > lot.availableQuantity) lotErrors[lot.id] = 'Actual Quantity tidak boleh melebihi availability LOT simulasi.'
    else totalActual += actual
  }

  const pageSize = state?.pageSize ?? MATERIAL_SIMULATION_PAGE_SIZE
  const page = state?.page ?? 1
  const totalItems = lots.length
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize)
  const normalizedPage = totalPages === 0 ? 1 : Math.min(Math.max(page, 1), totalPages)
  const pagination = { page: normalizedPage, pageSize, totalItems, totalPages, hasPreviousPage: normalizedPage > 1, hasNextPage: normalizedPage < totalPages }
  const variance = target === null ? 0 : totalActual - target

  if (scannedLots.length === 0) return { isReady: false, totalActual, variance, message: 'Simulasikan minimal satu scan LOT untuk melanjutkan.', lotErrors, pagination }
  if (Object.keys(lotErrors).length > 0) return { isReady: false, totalActual, variance, message: 'Perbaiki Actual Quantity pada LOT simulasi.', lotErrors, pagination }
  if (target === null || !isWithinTolerance(totalActual, target, toleranceType, toleranceValue)) return { isReady: false, totalActual, variance, message: 'Total Actual belum memenuhi target dan tolerance recipe.', lotErrors, pagination }
  return { isReady: true, totalActual, variance, message: null, lotErrors, pagination }
}
