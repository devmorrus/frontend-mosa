import type { MasterDataEntityBase, MasterDataQueryState } from '@/features/master-data/types'
import type { UnitOfMeasureOption } from '@/features/unit-of-measures/types'

export interface ProductListItem extends MasterDataEntityBase {
  unitOfMeasureId: string
  unitOfMeasureCode: string
  unitOfMeasureName: string
  shelfLifeDays: number | null
}

export interface ProductDetail extends MasterDataEntityBase {
  unitOfMeasure: UnitOfMeasureOption
  shelfLifeDays: number | null
}

export interface ProductFormValues {
  code: string
  name: string
  unitOfMeasureId: string
  shelfLifeDays: string
  isActive: boolean
}

export interface ProductQueryState extends MasterDataQueryState {
  unitOfMeasureId: string
}
