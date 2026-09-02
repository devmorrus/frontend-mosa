export interface TraceabilityLotReference {
  lotId: string
  lotNumber: string
  lotType: string
  productOrMaterialId: string
  code: string
  name: string
  supplierLot: string | null
  expiryDate: string | null
  warehouseCode: string
}

export interface BatchGenealogy {
  finishedGoodsLot: TraceabilityLotReference
  production: {
    productionOrderId: string
    productionOrderNumber: string
    productId: string
    productCode: string
    productName: string
    recipeVersionId: string
    recipeVersionNumber: number
    recipeName: string
    warehouseId: string
    warehouseCode: string
    assignedOperator: string | null
    completedBy: string | null
    completedAtUtc: string | null
    status: string | number
    targetOutput: number
    actualOutput: number | null
    yieldValue: number | null
    unitOfMeasureCode: string
    unitOfMeasureSymbol: string | null
    productionDate: string
  }
  executions: TraceabilityExecution[]
  consumptions: TraceabilityConsumption[]
  rawMaterialLots: TraceabilityLotReference[]
  qc: TraceabilityQc
  deviations: TraceabilityDeviation[]
  createdAtUtc: string
}

export interface TraceabilityConsumption {
  materialConsumptionId: string
  rawMaterialId: string
  rawMaterialCode: string
  rawMaterialName: string
  rawMaterialLotId: string
  internalLotNumber: string
  supplierLot: string | null
  actualQuantity: number
  warehouseCode: string
  unitOfMeasureId: string
  unitOfMeasureCode: string
  unitOfMeasureSymbol: string | null
  productionStepExecutionId: string
  stepSequence: number
  stepName: string
  goodsReceivingId: string
  receivingNumber: string
  receivingDate: string
  supplierId: string
  supplierName: string
}

export interface TraceabilityExecution {
  stepExecutionId: string
  sequence: number
  stepName: string
  stepType: string | number
  status: string | number
  startedAtUtc: string | null
  completedAtUtc: string | null
  operatorNotes: string | null
  isConfirmed: boolean
}

export interface TraceabilityQc {
  inspectionId: string | null
  lotQcStatus: string | number
  inventoryStatus: string | number
  inspectionStatus: string | number | null
  inspectorId: string | null
  inspectorName: string | null
  inspectedAt: string | null
  notes: string | null
}

export interface TraceabilityDeviation {
  id: string
  status: string | number
  reason: string
  requestedBy: string
  requestedAtUtc: string
  reviewedBy: string | null
  reviewedAtUtc: string | null
  reviewNotes: string | null
  targetQuantity: number
  actualQuantity: number
  varianceQuantity: number
  unitOfMeasureSymbol: string
}

export interface ForwardTraceability {
  rawMaterialLot: {
    rawMaterialLotId: string
    internalLotNumber: string
    supplierLot: string | null
    rawMaterialId: string
    rawMaterialCode: string
    rawMaterialName: string
    supplierId: string
    supplierName: string
    goodsReceivingId: string
    receivingNumber: string
    receivingDate: string
    expiryDate: string | null
    warehouseId: string
    warehouseCode: string
    warehouseName: string
    currentQuantity: number
    unitOfMeasureCode: string
    unitOfMeasureSymbol: string | null
    lotStatus: string | number
  }
  usages: Array<{
    productionOrderId: string
    productionOrderNumber: string
    productCode: string
    productName: string
    recipeVersionNumber: number
    recipeName: string
    productionDate: string
    actualQuantityUsed: number
    actualMaterialUnitOfMeasureCode: string
    actualMaterialUnitOfMeasureSymbol: string | null
    stepSequence: number
    stepName: string
    operator: string | null
    finishedGoodsLot: TraceabilityLotReference
    finishedGoodsActualOutput: number
    finishedGoodsUnitOfMeasureCode: string
    finishedGoodsUnitOfMeasureSymbol: string | null
    fgQcStatus: string | number
    fgInventoryStatus: string | number
  }>
  totalUsages: number
  totalQuantityUsed: number
}

export interface AffectedBatchItem {
  finishedGoodsLotId: string
  finishedGoodsLotNumber: string
  productId: string
  productCode: string
  productName: string
  productionOrderId: string
  productionOrderNumber: string
  productionDate: string
  actualMaterialUsed: number
  actualMaterialUnitOfMeasureCode: string
  actualMaterialUnitOfMeasureSymbol: string | null
  finishedGoodsActualOutput: number
  finishedGoodsUnitOfMeasureCode: string
  finishedGoodsUnitOfMeasureSymbol: string | null
  qcStatus: string | number
  inventoryStatus: string | number
}

export interface AffectedBatchSummary {
  rawMaterialLot: ForwardTraceability['rawMaterialLot']
  totalProductionsAffected: number
  totalFGLotsAffected: number
  totalActualMaterialUsed: number
  batches: AffectedBatchItem[]
}
