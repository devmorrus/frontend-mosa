export function MasterDataStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
        isActive
          ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200'
          : 'bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200'
      }`}
    >
      <span className="relative flex h-2 w-2">
        {isActive && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-400'}`}
        />
      </span>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  )
}
