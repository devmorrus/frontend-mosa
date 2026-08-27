import { useDeferredValue, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/stores/uiStore'
import type { ApiError } from '@/types/api'
import type {
  MasterDataEntityBase,
  MasterDataFormErrors,
  MasterDataListResult,
  MasterDataPermissions,
  MasterDataQueryState,
} from '@/features/master-data/types'
import {
  DEFAULT_MASTER_DATA_QUERY,
  EMPTY_PAGINATION,
  hasFormErrors,
} from '@/features/master-data/utils'

interface MasterDataApi<ListItem, DetailItem, FormValues> {
  list: (query: MasterDataQueryState) => Promise<MasterDataListResult<ListItem>>
  getById: (id: string) => Promise<DetailItem>
  create: (values: FormValues) => Promise<DetailItem>
  update: (id: string, values: FormValues) => Promise<DetailItem>
  changeStatus: (id: string, isActive: boolean) => Promise<DetailItem>
}

interface UseMasterDataModuleOptions<
  ListItem extends MasterDataEntityBase,
  DetailItem extends MasterDataEntityBase,
  FormValues,
> {
  api: MasterDataApi<ListItem, DetailItem, FormValues>
  permissions: MasterDataPermissions
  emptyValues: FormValues
  toFormValues: (detail: DetailItem) => FormValues
  validate: (values: FormValues) => MasterDataFormErrors
  entityName: string
}

type FormMode = 'create' | 'edit'

export function useMasterDataModule<
  ListItem extends MasterDataEntityBase,
  DetailItem extends MasterDataEntityBase,
  FormValues,
>({
  api,
  permissions,
  emptyValues,
  toFormValues,
  validate,
  entityName,
}: UseMasterDataModuleOptions<ListItem, DetailItem, FormValues>) {
  const { can } = useAuth()
  const pushToast = useUiStore((state) => state.pushToast)
  const [items, setItems] = useState<ListItem[]>([])
  const [query, setQuery] = useState<MasterDataQueryState>(DEFAULT_MASTER_DATA_QUERY)
  const [searchInput, setSearchInput] = useState(DEFAULT_MASTER_DATA_QUERY.search)
  const [pagination, setPagination] = useState(EMPTY_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [formValues, setFormValues] = useState<FormValues>(emptyValues)
  const [formErrors, setFormErrors] = useState<MasterDataFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [statusTarget, setStatusTarget] = useState<ListItem | DetailItem | null>(null)
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false)
  const deferredSearch = useDeferredValue(searchInput)

  const canCreate = can(permissions.create)
  const canUpdate = can(permissions.update)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setQuery((current) =>
        current.search === deferredSearch.trim()
          ? current
          : { ...current, search: deferredSearch.trim(), page: 1 },
      )
    }, 350)

    return () => window.clearTimeout(timeoutId)
  }, [deferredSearch])

  async function loadData(nextQuery = query, { background = false } = {}) {
    if (background) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    setError(null)

    try {
      const result = await api.list(nextQuery)
      setItems(result.items)
      setPagination(result.pagination)

      if (result.pagination.totalPages > 0 && nextQuery.page > result.pagination.totalPages) {
        setQuery((current) => ({ ...current, page: result.pagination.totalPages }))
      }
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setError(apiError.message)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    void loadData(query, { background: items.length > 0 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.page, query.pageSize, query.search, query.status])

  function handlePageChange(page: number) {
    setQuery((current) => ({ ...current, page }))
  }

  function handleStatusChange(status: MasterDataQueryState['status']) {
    setQuery((current) => ({ ...current, status, page: 1 }))
  }

  function handlePageSizeChange(pageSize: number) {
    setQuery((current) => ({ ...current, pageSize, page: 1 }))
  }

  function openCreateDialog() {
    setFormMode('create')
    setEditingId(null)
    setFormValues(emptyValues)
    setFormErrors({})
    setFormError(null)
    setIsFormOpen(true)
  }

  async function openEditDialog(item: ListItem) {
    setFormMode('edit')
    setEditingId(item.id)
    setFormErrors({})
    setFormError(null)
    setIsFormOpen(true)
    setIsDetailLoading(true)

    try {
      const detail = await api.getById(item.id)
      setFormValues(toFormValues(detail))
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setFormError(apiError.message)
    } finally {
      setIsDetailLoading(false)
    }
  }

  function closeFormDialog(open: boolean) {
    setIsFormOpen(open)
    if (!open) {
      setFormErrors({})
      setFormError(null)
      setIsDetailLoading(false)
    }
  }

  async function submitForm() {
    const nextErrors = validate(formValues)
    setFormErrors(nextErrors)
    setFormError(null)

    if (hasFormErrors(nextErrors)) {
      return
    }

    setIsFormSubmitting(true)

    try {
      if (formMode === 'create') {
        await api.create(formValues)
        pushToast('success', `${entityName} berhasil ditambahkan.`)
      } else if (editingId) {
        await api.update(editingId, formValues)
        pushToast('success', `${entityName} berhasil diperbarui.`)
      }

      setIsFormOpen(false)
      await loadData(query, { background: true })
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setFormErrors(apiError.errors ?? {})
      setFormError(apiError.errors ? null : apiError.message)
    } finally {
      setIsFormSubmitting(false)
    }
  }

  function openStatusDialog(item: ListItem) {
    setStatusTarget(item)
  }

  function closeStatusDialog(open: boolean) {
    if (!open) {
      setStatusTarget(null)
    }
  }

  async function confirmStatusChange() {
    if (!statusTarget) return

    setIsStatusSubmitting(true)

    try {
      await api.changeStatus(statusTarget.id, !statusTarget.isActive)
      pushToast(
        'success',
        `${entityName} berhasil diubah menjadi ${statusTarget.isActive ? 'Inactive' : 'Active'}.`,
      )
      setStatusTarget(null)
      await loadData(query, { background: true })
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      pushToast('error', apiError.message)
    } finally {
      setIsStatusSubmitting(false)
    }
  }

  return {
    items,
    query,
    searchInput,
    setSearchInput,
    pagination,
    isLoading,
    isRefreshing,
    error,
    reload: () => loadData(query),
    handlePageChange,
    handleStatusChange,
    handlePageSizeChange,
    canCreate,
    canUpdate,
    isFormOpen,
    formMode,
    formValues,
    setFormValues,
    formErrors,
    formError,
    isFormSubmitting,
    isDetailLoading,
    openCreateDialog,
    openEditDialog,
    closeFormDialog,
    submitForm,
    statusTarget,
    isStatusSubmitting,
    openStatusDialog,
    closeStatusDialog,
    confirmStatusChange,
  }
}
