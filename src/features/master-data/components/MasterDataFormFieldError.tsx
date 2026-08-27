export function MasterDataFormFieldError({ message }: { message: string | null }) {
  if (!message) return null

  return <p className="mt-1.5 text-xs text-red-600">{message}</p>
}
