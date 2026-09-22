import type { MasterDataPagination } from '@/features/master-data/types'

export const QcResultType = { Text: 1, Number: 2, Boolean: 3, PassFail: 4, NumericRange: 5, Options: 6 } as const
export interface QcParameter { id: string; name: string; description: string | null; resultType: number; isRequired: boolean; sequence: number; configJson: string | null }
export interface QcItem { id: string; parameterId: string; parameterName: string; resultType: number; isRequired: boolean; resultValue: string; isPassed: boolean | null; notes: string | null }
export interface QcQueueItem { finishedGoodsLotId: string; lotNumber: string; productId: string; productName: string; productionOrderId: string; productionOrderNumber: string; productionDate: string; actualOutput: number; uomSymbol: string; qcStatus: string | number; inventoryStatus: string | number; createdAtUtc: string; requiredParamCount: number; optionalParamCount: number }
export interface QcInspection { inspectionId: string | null; finishedGoodsLotId: string; lotNumber: string; lotQcStatus: string | number; inspectionStatus: string | number; inspectorId: string | null; inspectorName: string | null; inspectedAt: string | null; notes: string | null; items: QcItem[]; parameters: QcParameter[] }
export interface QcHistoryItem { id: string; status: string | number; inspectorName: string | null; inspectedAt: string | null; notes: string | null; itemCount: number }
export interface QcResultInput { parameterId: string; resultValue: string; isPassed: boolean | null; notes?: string | null }
export interface QcQuery { search: string; productId: string; productionOrderId: string; status: string; from: string; to: string; page: number; pageSize: number }
export interface QcPaged<T> { items: T[]; pagination: MasterDataPagination }
