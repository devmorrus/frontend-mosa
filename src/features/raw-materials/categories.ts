/**
 * Closed category catalogue for raw materials (mirrors backend
 * `RawMaterialCategories.Allowed`). Rendered as a dropdown so stored
 * values stay consistent for filters and reports. Empty string means
 * "Tanpa kategori".
 */
export const RAW_MATERIAL_CATEGORIES = [
  'Dry Goods',
  'Spices',
  'Wet Goods',
  'Dairy & Eggs',
  'Meat & Poultry',
  'Seafood',
  'Vegetables & Fruits',
  'Frozen',
  'Packaging',
  'Chemical',
  'Other',
] as const

export type RawMaterialCategory = (typeof RAW_MATERIAL_CATEGORIES)[number]

export function isAllowedRawMaterialCategory(value: string): boolean {
  const trimmed = value.trim()
  return (
    trimmed.length === 0 ||
    (RAW_MATERIAL_CATEGORIES as readonly string[]).includes(trimmed)
  )
}
