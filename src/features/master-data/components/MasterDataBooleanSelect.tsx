export function MasterDataBooleanSelect({
  value,
  onChange,
  trueLabel = 'Active',
  falseLabel = 'Inactive',
}: {
  value: boolean
  onChange: (value: boolean) => void
  trueLabel?: string
  falseLabel?: string
}) {
  return (
    <select
      value={value ? 'true' : 'false'}
      onChange={(event) => onChange(event.target.value === 'true')}
      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
    >
      <option value="true">{trueLabel}</option>
      <option value="false">{falseLabel}</option>
    </select>
  )
}
