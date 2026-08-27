import type { MasterDataEntityBase } from '@/features/master-data/types'

export interface SupplierListItem extends MasterDataEntityBase {
  phone: string | null
  email: string | null
}

export interface SupplierDetail extends SupplierListItem {
  address: string | null
}

export interface SupplierFormValues {
  code: string
  name: string
  phone: string
  email: string
  address: string
  isActive: boolean
}
