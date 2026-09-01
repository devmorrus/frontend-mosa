import { RecipeToleranceType } from '@/features/recipes/types'
import type { ValidatedMaterialLot } from '@/features/operator-production/types'

export function evaluateTolerance(total: number, target: number, type: RecipeToleranceType | null, value: number | null) {
  const tolerance = value ?? 0
  const lowerLimit = !type || type === RecipeToleranceType.None ? target : type === RecipeToleranceType.PlusMinus ? target - tolerance : null
  const upperLimit = !type || type === RecipeToleranceType.None ? target : type === RecipeToleranceType.PlusMinus ? target + tolerance : type === RecipeToleranceType.Max ? target + tolerance : null
  const isWithinTolerance = !type || type === RecipeToleranceType.None ? total === target : type === RecipeToleranceType.PlusMinus ? total >= target - tolerance && total <= target + tolerance : type === RecipeToleranceType.Min ? total >= target + tolerance : total <= target + tolerance
  return { total, variance: total - target, lowerLimit, upperLimit, isWithinTolerance }
}

export function validateReason(value: string) {
  const normalized = value.trim()
  return normalized.length >= 1 && normalized.length <= 2000 ? null : 'Alasan deviasi wajib diisi (maksimum 2.000 karakter).'
}

export function validateLots(lots: ValidatedMaterialLot[]) {
  if (!lots.length) return 'Scan minimal satu LOT material.'
  const ids = new Set<string>()
  for (const lot of lots) {
    if (ids.has(lot.lotId)) return 'LOT tidak boleh dipilih lebih dari satu kali.'
    ids.add(lot.lotId)
    if (!/^\d+(?:[.,]\d{1,4})?$/.test(lot.actualQuantity.trim()) || Number(lot.actualQuantity.replace(',', '.')) <= 0) return `Actual Quantity ${lot.lotNumber} harus angka positif, maksimal 4 desimal.`
    if (Number(lot.actualQuantity.replace(',', '.')) > lot.availableQuantity) return `Actual Quantity ${lot.lotNumber} melebihi stock tersedia.`
  }
  return null
}
