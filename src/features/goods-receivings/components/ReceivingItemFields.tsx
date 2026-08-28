import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MasterDataFormFieldError } from '@/features/master-data/components/MasterDataFormFieldError'
import type { GoodsReceivingItemFormValues } from '@/features/goods-receivings/types'
import { getReceivingItemFieldError } from '@/features/goods-receivings/utils'
import type { RawMaterialListItem } from '@/features/raw-materials/types'
import type { MasterDataFormErrors } from '@/features/master-data/types'

function buildMaterialLabel(material: RawMaterialListItem) {
  return `${material.name} (${material.code})`
}

export function ReceivingItemFields({
  index,
  item,
  materials,
  errors,
  disabled,
  onChange,
  onRemove,
  canRemove,
}: {
  index: number
  item: GoodsReceivingItemFormValues
  materials: RawMaterialListItem[]
  errors: MasterDataFormErrors
  disabled: boolean
  onChange: (updater: (current: GoodsReceivingItemFormValues) => GoodsReceivingItemFormValues) => void
  onRemove: () => void
  canRemove: boolean
}) {
  return (
    <article className="rounded-[28px] border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-display text-lg font-semibold text-ink">Item {index + 1}</h3>
          <p className="text-sm text-slate-500">Raw material dan UOM mengikuti master data aktif.</p>
        </div>
        {canRemove ? (
          <Button variant="secondary" size="sm" onClick={onRemove} disabled={disabled}>
            <Trash2 size={14} />
            Remove Item
          </Button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Raw Material</label>
          <select
            value={item.rawMaterialId}
            onChange={(event) => {
              const selected = materials.find((material) => material.id === event.target.value)
              onChange((current) => ({
                ...current,
                rawMaterialId: selected?.id ?? '',
                rawMaterialCode: selected?.code ?? '',
                rawMaterialName: selected?.name ?? '',
                unitOfMeasureId: selected?.unitOfMeasureId ?? '',
                unitOfMeasureCode: selected?.unitOfMeasureCode ?? '',
                unitOfMeasureName: selected?.unitOfMeasureName ?? '',
                hasExpiry: selected?.hasExpiry ?? false,
                expiryDate: selected?.hasExpiry ? current.expiryDate : '',
              }))
            }}
            disabled={disabled}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10 disabled:cursor-not-allowed disabled:bg-slate-100"
          >
            <option value="">Pilih raw material aktif</option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {buildMaterialLabel(material)}
              </option>
            ))}
          </select>
          <MasterDataFormFieldError
            message={getReceivingItemFieldError(errors, index, 'rawMaterialId')}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Quantity</label>
          <Input
            type="number"
            min={0}
            step="0.01"
            value={item.quantity}
            onChange={(event) => onChange((current) => ({ ...current, quantity: event.target.value }))}
            placeholder="0"
            disabled={disabled}
          />
          <MasterDataFormFieldError
            message={getReceivingItemFieldError(errors, index, 'quantity')}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">UOM</label>
          <Input value={item.unitOfMeasureName || item.unitOfMeasureCode} readOnly disabled />
          <MasterDataFormFieldError
            message={getReceivingItemFieldError(errors, index, 'unitOfMeasureId')}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Supplier LOT</label>
          <Input
            value={item.supplierLot}
            onChange={(event) => onChange((current) => ({ ...current, supplierLot: event.target.value }))}
            placeholder="LOT supplier"
            disabled={disabled}
          />
          <MasterDataFormFieldError
            message={getReceivingItemFieldError(errors, index, 'supplierLot')}
          />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Production Date</label>
          <Input
            type="date"
            value={item.productionDate}
            onChange={(event) =>
              onChange((current) => ({ ...current, productionDate: event.target.value }))
            }
            disabled={disabled}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-ink">Expiry Date</label>
          <Input
            type="date"
            value={item.expiryDate}
            onChange={(event) => onChange((current) => ({ ...current, expiryDate: event.target.value }))}
            disabled={disabled || !item.hasExpiry}
          />
          {!item.hasExpiry ? (
            <p className="mt-2 text-xs text-slate-500">
              Expiry date otomatis nonaktif untuk material tanpa expiry.
            </p>
          ) : null}
          <MasterDataFormFieldError
            message={getReceivingItemFieldError(errors, index, 'expiryDate')}
          />
        </div>
      </div>

      <div className="mt-5">
        <label className="mb-2 block text-sm font-semibold text-ink">Notes</label>
        <Textarea
          value={item.notes}
          onChange={(event) => onChange((current) => ({ ...current, notes: event.target.value }))}
          placeholder="Catatan item jika ada"
          className="min-h-[100px]"
          disabled={disabled}
        />
        <MasterDataFormFieldError message={getReceivingItemFieldError(errors, index, 'notes')} />
      </div>
    </article>
  )
}
