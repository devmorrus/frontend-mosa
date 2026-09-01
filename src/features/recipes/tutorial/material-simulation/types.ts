import type { MasterDataPagination } from '@/features/master-data/types'

export interface SimulatedMaterialLot {
  id: string
  lotCode: string
  materialCode: string
  materialName: string
  availableQuantity: number
  actualQuantity: string
  isScanned: boolean
}

export interface MaterialSimulationState {
  lots: SimulatedMaterialLot[]
  page: number
  pageSize: number
}

export interface MaterialSimulationSeed {
  stepId: string
  sequence: number
  materialCode: string
  materialName: string
  targetQuantity: number
}

export interface MaterialSimulationValidation {
  isReady: boolean
  totalActual: number
  variance: number
  message: string | null
  lotErrors: Record<string, string>
  pagination: MasterDataPagination
}
