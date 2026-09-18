export function FullScreenSpinner() {
  return (
    <div className="flex h-dvh w-full items-center justify-center bg-slate-50">
      <div
        className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600"
        role="status"
        aria-label="Memuat"
      />
    </div>
  )
}
