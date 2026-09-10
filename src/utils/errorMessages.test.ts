import { describe, expect, it } from 'vitest'
import { resolveBusinessErrorMessage } from './errorMessages'

describe('business error messages (TASKING 5)', () => {
  it('maps critical UAT-flow codes to Indonesian text', () => {
    expect(resolveBusinessErrorMessage('material_consumption_exceeds_available', 'orig')).toContain('Stok LOT')
    expect(resolveBusinessErrorMessage('timer_not_elapsed', 'orig')).toContain('Timer')
    expect(resolveBusinessErrorMessage('check_confirmation_required', 'orig')).toContain('konfirmasi')
    expect(resolveBusinessErrorMessage('deviation_reason_required', 'orig')).toContain('deviasi')
    expect(resolveBusinessErrorMessage('already_decided', 'orig')).toContain('tercatat')
    expect(resolveBusinessErrorMessage('step_not_current', 'orig')).toContain('giliran')
  })

  it('translates English LOT validation free text', () => {
    expect(resolveBusinessErrorMessage('raw_material_lot_validation_failed', 'Lot not found.')).toContain('tidak ditemukan')
    expect(resolveBusinessErrorMessage('raw_material_lot_validation_failed', 'LOT has expired.')).toContain('kedaluwarsa')
    expect(resolveBusinessErrorMessage(undefined, 'LOT has been depleted.')).toContain('habis')
  })

  it('never returns a bare status and preserves unknown messages', () => {
    expect(resolveBusinessErrorMessage('some_future_code', 'Backend says hi.')).toBe('Backend says hi.')
    expect(resolveBusinessErrorMessage(undefined, 'Terjadi kesalahan pada server.')).toBe('Terjadi kesalahan pada server.')
  })

  it('does not misfire LOT patterns on unrelated domains', () => {
    expect(resolveBusinessErrorMessage('menu_has_children', 'Menu has children.')).toBe('Menu has children.')
  })
})
