import type { MasterDataEntityBase } from '@/features/master-data/types'

export interface UnitOfMeasureListItem extends MasterDataEntityBase {
  symbol: string | null
}

export interface UnitOfMeasureDetail extends UnitOfMeasureListItem {}

export interface UnitOfMeasureFormValues {
  code: string
  name: string
  symbol: string
  isActive: boolean
}
