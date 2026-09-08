import { useCallback, useEffect, useMemo, useState } from 'react'
import { EMPTY_PAGINATION } from '@/features/master-data/utils'
import type { MasterDataPagination } from '@/features/master-data/types'

/**
 * Hook pagination standar Tasking 4.
 * - Query state (filter/search) terpisah dari table state (page/pageSize).
 * - Setiap perubahan filter mereset page ke 1.
 * - Mendukung background refresh tanpa menghapus data sebelumnya.
 */
export function usePaginatedQuery<TFilter extends Record<string, unknown>, TItem>({
  initialFilter,
  initialPageSize = 10,
  fetcher,
}: {
  initialFilter: TFilter
  initialPageSize?: number
  fetcher: (query: TFilter & { page: number; pageSize: number }) => Promise<{
    items: TItem[]
    pagination: MasterDataPagination
  }>
}) {
  const [filter, setFilter] = useState<TFilter>(initialFilter)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [items, setItems] = useState<TItem[]>([])
  const [pagination, setPagination] = useState<MasterDataPagination>(EMPTY_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const query = useMemo(
    () => ({ ...filter, page, pageSize }),
    [filter, page, pageSize],
  )

  const load = useCallback(async () => {
    const isFirstLoad = items.length === 0 && page === 1
    if (isFirstLoad) setIsLoading(true)
    else setIsRefreshing(true)
    setError(null)
    try {
      const result = await fetcher(query)
      setItems(result.items)
      setPagination(result.pagination)
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Gagal memuat data.'
      setError(message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(query)])

  useEffect(() => {
    void load()
  }, [load])

  const updateFilter = useCallback((patch: Partial<TFilter>) => {
    setFilter((current) => ({ ...current, ...patch }))
    setPage(1)
  }, [])

  const resetFilter = useCallback(() => {
    setFilter(initialFilter)
    setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialFilter)])

  const handlePageChange = useCallback((next: number) => setPage(next), [])
  const handlePageSizeChange = useCallback((next: number) => {
    setPageSize(next)
    setPage(1)
  }, [])

  return {
    filter,
    setFilter: updateFilter,
    resetFilter,
    page,
    pageSize,
    query,
    items,
    pagination,
    isLoading,
    isRefreshing,
    error,
    reload: load,
    handlePageChange,
    handlePageSizeChange,
  }
}
