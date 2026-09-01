import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MasterDataFormFieldError } from '@/features/master-data/components/MasterDataFormFieldError'
import { getFieldError } from '@/features/master-data/utils'
import {
  RecipeStepType,
  RecipeToleranceType,
  type RecipeStepFormValues,
} from '@/features/recipes/types'
import type { RawMaterialListItem } from '@/features/raw-materials/types'
import type { UnitOfMeasureOption } from '@/features/unit-of-measures/types'

interface RecipeStepEditorProps {
  steps: RecipeStepFormValues[]
  errors: Record<string, string[]>
  rawMaterials: RawMaterialListItem[]
  unitOptions: UnitOfMeasureOption[]
  onChange: (updater: (current: RecipeStepFormValues[]) => RecipeStepFormValues[]) => void
  onAdd: () => void
  onMoveUp?: (index: number) => void
  onMoveDown?: (index: number) => void
  readOnly?: boolean
  addLabel?: string
}

function buildUnitLabel(option: UnitOfMeasureOption) {
  return option.symbol ? `${option.name} (${option.symbol})` : `${option.name} (${option.code})`
}

function stepTypeLabel(stepType: RecipeStepType) {
  switch (stepType) {
    case RecipeStepType.Material:
      return 'Material'
    case RecipeStepType.Process:
      return 'Process'
    case RecipeStepType.Timer:
      return 'Timer'
    case RecipeStepType.Check:
      return 'Check'
    default:
      return 'Step'
  }
}

export function RecipeStepEditor({
  steps,
  errors,
  rawMaterials,
  unitOptions,
  onChange,
  onAdd,
  onMoveUp,
  onMoveDown,
  readOnly = false,
  addLabel = 'Add Step',
}: RecipeStepEditorProps) {
  const updateStep = (
    index: number,
    updater: (step: RecipeStepFormValues) => RecipeStepFormValues,
  ) => {
    onChange((current) => current.map((step, stepIndex) => (stepIndex === index ? updater(step) : step)))
  }

  const removeStep = (index: number) => {
    onChange((current) => current.filter((_, stepIndex) => stepIndex !== index))
  }

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const selectedMaterial = rawMaterials.find((item) => item.id === step.rawMaterialId)

        return (
          <div key={step.id} className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3" data-tour="recipe-step-sequence">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-400">
                  <GripVertical size={16} />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Step {index + 1}
                  </div>
                  <div className="mt-1 font-semibold text-ink">{stepTypeLabel(step.stepType)}</div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {readOnly ? null : (
                  <>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={() => onMoveUp?.(index)}
                      disabled={index === 0}
                      aria-label={`Move step ${index + 1} up`}
                    >
                      <ArrowUp size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={() => onMoveDown?.(index)}
                      disabled={index === steps.length - 1}
                      aria-label={`Move step ${index + 1} down`}
                    >
                      <ArrowDown size={16} />
                    </Button>
                  </>
                )}
                <select
                  data-tour="recipe-step-type-select"
                  value={step.stepType}
                  disabled={readOnly}
                  onChange={(event) => {
                    const nextType = Number(event.target.value) as RecipeStepType
                    updateStep(index, (current) => ({
                      ...current,
                      stepType: nextType,
                      rawMaterialId: nextType === RecipeStepType.Material ? current.rawMaterialId : '',
                      targetQuantity: nextType === RecipeStepType.Material ? current.targetQuantity : '',
                      unitOfMeasureId: nextType === RecipeStepType.Material ? current.unitOfMeasureId : '',
                      toleranceType: nextType === RecipeStepType.Material ? current.toleranceType : '',
                      toleranceValue: nextType === RecipeStepType.Material ? current.toleranceValue : '',
                      timerSeconds: nextType === RecipeStepType.Timer ? current.timerSeconds : '',
                      checkItems: nextType === RecipeStepType.Check ? current.checkItems : [],
                      instruction:
                        nextType === RecipeStepType.Material
                          ? current.instruction
                          : current.instruction,
                    }))
                  }}
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
                >
                  <option value={RecipeStepType.Material}>Material</option>
                  <option value={RecipeStepType.Process}>Process</option>
                  <option value={RecipeStepType.Timer}>Timer</option>
                  <option value={RecipeStepType.Check}>Check</option>
                </select>

                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  onClick={() => removeStep(index)}
                  disabled={readOnly || steps.length === 1}
                  aria-label={`Remove step ${index + 1}`}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-4" data-tour="recipe-material-step-fields">
              {step.stepType === RecipeStepType.Material ? (
                <>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ink">Raw Material</label>
                      <select
                        value={step.rawMaterialId}
                        disabled={readOnly}
                        onChange={(event) => {
                          const material = rawMaterials.find((item) => item.id === event.target.value)
                          updateStep(index, (current) => ({
                            ...current,
                            rawMaterialId: event.target.value,
                            unitOfMeasureId: material?.unitOfMeasureId ?? '',
                          }))
                        }}
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
                      >
                        <option value="">Pilih raw material</option>
                        {rawMaterials.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.code} - {item.name}
                          </option>
                        ))}
                      </select>
                      <MasterDataFormFieldError message={getFieldError(errors, `steps.${index}.rawMaterialId`)} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ink">UOM Material</label>
                      <select
                        value={step.unitOfMeasureId}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateStep(index, (current) => ({ ...current, unitOfMeasureId: event.target.value }))
                        }
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
                      >
                        <option value="">Pilih UOM</option>
                        {unitOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {buildUnitLabel(option)}
                          </option>
                        ))}
                      </select>
                      {selectedMaterial && (
                        <p className="mt-1.5 text-xs text-slate-500">
                          Default dari material: {selectedMaterial.unitOfMeasureName} ({selectedMaterial.unitOfMeasureCode})
                        </p>
                      )}
                      <MasterDataFormFieldError message={getFieldError(errors, `steps.${index}.unitOfMeasureId`)} />
                    </div>
                  </div>

                  <div className="grid gap-4 lg:grid-cols-4">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ink">Target Quantity</label>
                      <Input
                        value={step.targetQuantity}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateStep(index, (current) => ({ ...current, targetQuantity: event.target.value }))
                        }
                        inputMode="decimal"
                        placeholder="20"
                      />
                      <MasterDataFormFieldError message={getFieldError(errors, `steps.${index}.targetQuantity`)} />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ink">Tolerance Type</label>
                      <select
                        value={step.toleranceType}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateStep(index, (current) => ({
                            ...current,
                            toleranceType: event.target.value ? Number(event.target.value) as RecipeToleranceType : '',
                          }))
                        }
                        className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
                      >
                        <option value="">No tolerance</option>
                        <option value={RecipeToleranceType.PlusMinus}>Plus/Minus</option>
                        <option value={RecipeToleranceType.Min}>Minimum</option>
                        <option value={RecipeToleranceType.Max}>Maximum</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ink">Tolerance Value</label>
                      <Input
                        value={step.toleranceValue}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateStep(index, (current) => ({ ...current, toleranceValue: event.target.value }))
                        }
                        inputMode="decimal"
                        placeholder="0.5"
                      />
                      <MasterDataFormFieldError message={getFieldError(errors, `steps.${index}.toleranceValue`)} />
                    </div>

                    <div className="lg:col-span-1">
                      <label className="mb-2 block text-sm font-semibold text-ink">Instruction</label>
                      <Input
                        value={step.instruction}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateStep(index, (current) => ({ ...current, instruction: event.target.value }))
                        }
                        placeholder="Optional note"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-ink">Instruction</label>
                    <Textarea
                      value={step.instruction}
                      disabled={readOnly}
                      onChange={(event) =>
                        updateStep(index, (current) => ({ ...current, instruction: event.target.value }))
                      }
                      placeholder={
                        step.stepType === RecipeStepType.Process
                          ? 'Grinding hingga halus'
                          : step.stepType === RecipeStepType.Timer
                            ? 'Mixing'
                            : 'QC visual check'
                      }
                      className="min-h-[110px]"
                    />
                    <MasterDataFormFieldError message={getFieldError(errors, `steps.${index}.instruction`)} />
                  </div>

                  {step.stepType === RecipeStepType.Timer ? (
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-ink">Timer Seconds</label>
                      <Input
                        value={step.timerSeconds}
                        disabled={readOnly}
                        onChange={(event) =>
                          updateStep(index, (current) => ({ ...current, timerSeconds: event.target.value }))
                        }
                        inputMode="numeric"
                        placeholder="600"
                      />
                      <MasterDataFormFieldError message={getFieldError(errors, `steps.${index}.timerSeconds`)} />
                    </div>
                  ) : (
                    step.stepType === RecipeStepType.Check ? (
                      <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/70 p-4">
                        <div className="mb-3 text-sm font-semibold text-ink">Checklist pemeriksaan</div>
                        <div className="space-y-2">
                          {step.checkItems.map((item, itemIndex) => (
                            <div key={`${step.id}-${itemIndex}`} className="flex gap-2">
                              <Input value={item} disabled={readOnly} placeholder="Contoh: Warna campuran merata" onChange={(event) => updateStep(index, (current) => ({ ...current, checkItems: current.checkItems.map((value, valueIndex) => valueIndex === itemIndex ? event.target.value : value) }))} />
                              <Button type="button" variant="secondary" size="icon" disabled={readOnly} onClick={() => updateStep(index, (current) => ({ ...current, checkItems: current.checkItems.filter((_, valueIndex) => valueIndex !== itemIndex) }))}><Trash2 size={16} /></Button>
                            </div>
                          ))}
                        </div>
                        <Button type="button" variant="secondary" size="sm" disabled={readOnly || step.checkItems.length >= 20} className="mt-3" onClick={() => updateStep(index, (current) => ({ ...current, checkItems: [...current.checkItems, ''] }))}><Plus size={15} />Tambah checklist</Button>
                        <MasterDataFormFieldError message={getFieldError(errors, `steps.${index}.checkItems`)} />
                      </div>
                    ) : <div className="rounded-[24px] border border-dashed border-slate-200 bg-white/70 p-4 text-sm leading-6 text-slate-500">Step tipe ini tidak membutuhkan quantity material.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}

      <Button data-tour="recipe-add-step-btn" type="button" variant="secondary" onClick={onAdd} disabled={readOnly}>
        <Plus size={16} />
        {addLabel}
      </Button>
      <MasterDataFormFieldError message={getFieldError(errors, 'steps')} />
    </div>
  )
}
