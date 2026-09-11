import { useAuthStore } from '@/stores/authStore'

/**
 * Guard for filter/dropdown lookups (warehouse, supplier, material, ...).
 *
 * Root cause it fixes: pages used to fire lookup requests unconditionally,
 * so every role without the lookup permission produced a 403 in the console
 * (and sometimes a broken filter) even though the page itself was allowed.
 * Check the permission first so the request is never sent.
 */
export function canFetchLookup(permission: string): boolean {
  return useAuthStore.getState().hasPermission(permission)
}

export async function fetchLookupIfAllowed<T>(
  permission: string,
  loader: () => Promise<T>,
  fallback: T,
): Promise<T> {
  if (!canFetchLookup(permission)) {
    return fallback
  }

  try {
    return await loader()
  } catch {
    return fallback
  }
}
