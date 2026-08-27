import type { MasterDataEntityBase } from '@/features/master-data/types'

export interface WarehouseListItem extends MasterDataEntityBase {}

export interface WarehouseDetail extends WarehouseListItem {}

export interface WarehouseFormValues {
  code: string
  name: string
  isActive: boolean
}
