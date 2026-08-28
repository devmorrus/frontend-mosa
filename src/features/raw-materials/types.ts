import type { MasterDataEntityBase, MasterDataQueryState } from '@/features/master-data/types'
import type { UnitOfMeasureOption } from '@/features/unit-of-measures/types'

export interface RawMaterialListItem extends MasterDataEntityBase {
  category: string | null
  unitOfMeasureId: string
  unitOfMeasureCode: string
  unitOfMeasureName: string
  hasExpiry: boolean
  shelfLifeDays: number | null
  minimumStock: number
}

export interface RawMaterialDetail extends MasterDataEntityBase {
  category: string | null
  unitOfMeasure: UnitOfMeasureOption
  hasExpiry: boolean
  shelfLifeDays: number | null
  minimumStock: number
}

export interface RawMaterialFormValues {
  code: string
  name: string
  category: string
  unitOfMeasureId: string
  hasExpiry: boolean
  shelfLifeDays: string
  minimumStock: string
  isActive: boolean
}

export interface RawMaterialQueryState extends MasterDataQueryState {
  category: string
  unitOfMeasureId: string
  hasExpiry: 'ALL' | 'YES' | 'NO'
}
