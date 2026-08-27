export function MasterDataBooleanSelect({
  value,
  onChange,
}: {
  value: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <select
      value={value ? 'active' : 'inactive'}
      onChange={(event) => onChange(event.target.value === 'active')}
      className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-ink outline-none transition-all focus:border-ink focus:ring-4 focus:ring-ink/10"
    >
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  )
}
