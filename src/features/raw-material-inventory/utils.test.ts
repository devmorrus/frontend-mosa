import { describe, expect, it } from 'vitest'
import type { InventoryRawMaterialListItem } from './types'
import {
  getAggregateWarehouseLabel,
  getInventoryAggregateStatus,
  getInventoryFefoInfoMessage,
  resolveInventoryFefoWarehouseId,
} from './utils'

function createItem(overrides: Partial<InventoryRawMaterialListItem> = {}): InventoryRawMaterialListItem {
  return {
    materialId: 'material-1',
    materialCode: 'RM-001',
    materialName: 'Material 1',
    unit: 'KG',
    totalQuantity: 20,
    availableQuantity: 10,
    lots: [{
      lotId: 'lot-1',
      internalLotNumber: 'LOT-001',
      warehouseId: 'warehouse-1',
      warehouseCode: 'WH-01',
      warehouseName: 'Warehouse 1',
      quantity: 10,
      expiryDate: null,
      status: 'AVAILABLE',
      isExpired: false,
      isAvailableForProduction: true,
    }],
    ...overrides,
  }
}

describe('raw material inventory utilities', () => {
  it('summarizes one or multiple warehouses', () => {
    expect(getAggregateWarehouseLabel(createItem())).toBe('Warehouse 1')
    expect(getAggregateWarehouseLabel(createItem({ lots: [
      createItem().lots[0],
      { ...createItem().lots[0], lotId: 'lot-2', warehouseId: 'warehouse-2', warehouseName: 'Warehouse 2' },
    ] }))).toBe('Multi Warehouse (2)')
  })

  it('derives aggregate status from available and LOT states', () => {
    expect(getInventoryAggregateStatus(createItem())).toBe('AVAILABLE')
    expect(getInventoryAggregateStatus(createItem({ availableQuantity: 0, lots: [{ ...createItem().lots[0], status: 'BLOCKED', isAvailableForProduction: false }] }))).toBe('BLOCKED')
    expect(getInventoryAggregateStatus(createItem({ availableQuantity: 0, lots: [{ ...createItem().lots[0], status: 'CONSUMED', isExpired: true, isAvailableForProduction: false }] }))).toBe('EXPIRED')
    expect(getInventoryAggregateStatus(createItem({ availableQuantity: 0, lots: [{ ...createItem().lots[0], status: 'BLOCKED', isAvailableForProduction: false }, { ...createItem().lots[0], lotId: 'lot-2', status: 'CONSUMED', isAvailableForProduction: false }] }))).toBe('MIXED')
  })

  it('resolves FEFO warehouse only when it is unambiguous', () => {
    const item = createItem()
    expect(resolveInventoryFefoWarehouseId(item, 'warehouse-filter')).toBe('warehouse-filter')
    expect(resolveInventoryFefoWarehouseId(item, '')).toBe('warehouse-1')
    const multiWarehouse = createItem({ lots: [...item.lots, { ...item.lots[0], lotId: 'lot-2', warehouseId: 'warehouse-2' }] })
    expect(resolveInventoryFefoWarehouseId(multiWarehouse, '')).toBeNull()
    expect(getInventoryFefoInfoMessage(multiWarehouse, '')).toContain('Pilih warehouse')
  })
})
