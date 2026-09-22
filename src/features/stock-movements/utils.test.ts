import { describe, expect, it } from 'vitest'
import type { StockMovementListItem } from './types'
import {
  formatStockMovementQuantity,
  getStockMovementDisplayLabel,
  getStockMovementReferenceLabel,
  getStockMovementReferenceLink,
} from './utils'

function createItem(overrides: Partial<StockMovementListItem> = {}): StockMovementListItem {
  return {
    id: 'movement-1',
    warehouseId: 'warehouse-1',
    warehouseCode: 'WH-01',
    warehouseName: 'Warehouse 1',
    rawMaterialId: 'material-1',
    rawMaterialCode: 'RM-001',
    rawMaterialName: 'Material 1',
    rawMaterialLotId: 'lot-1',
    internalLotNumber: 'LOT-001',
    movementType: 'RECEIVING',
    quantity: 5,
    quantityDirection: 'IN',
    displayQuantity: 5,
    quantityBefore: 0,
    quantityAfter: 5,
    referenceType: 'GoodsReceiving',
    referenceId: 'receiving-1',
    referenceNumber: 'GR-00001',
    notes: null,
    createdBy: 'admin',
    createdAtUtc: '2026-09-10T10:00:00Z',
    ...overrides,
  }
}

describe('stock movement utilities', () => {
  it('formats quantity as absolute value and prefixes direction', () => {
    expect(formatStockMovementQuantity(-5)).toBe('5')
    expect(getStockMovementDisplayLabel(createItem())).toBe('+5')
    expect(getStockMovementDisplayLabel(createItem({ quantityDirection: 'OUT', displayQuantity: 5 }))).toBe('-5')
  })

  it('resolves canonical reference links', () => {
    expect(getStockMovementReferenceLink(createItem())).toBe('/goods-receiving/receiving-1')
    expect(getStockMovementReferenceLink(createItem({ referenceType: 'StockAdjustment', referenceId: 'adj-1' }))).toBe('/warehouse/stock-adjustments/adj-1')
    expect(getStockMovementReferenceLink(createItem({ referenceType: 'StockOpname', referenceId: 'op-1' }))).toBe('/warehouse/stock-opname/op-1')
    expect(getStockMovementReferenceLink(createItem({ referenceType: 'ProductionOrder', referenceId: 'po-1' }))).toBe('/production/orders/po-1')
    expect(getStockMovementReferenceLink(createItem({ referenceType: 'Unknown', referenceId: 'x-1' }))).toBeNull()
    expect(getStockMovementReferenceLink(createItem({ referenceId: '' }))).toBeNull()
  })

  it('prefers reference number for the reference label', () => {
    expect(getStockMovementReferenceLabel(createItem())).toBe('GR-00001')
    expect(getStockMovementReferenceLabel(createItem({ referenceNumber: null }))).toBe('GoodsReceiving')
  })
})
