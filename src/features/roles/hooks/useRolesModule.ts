import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/stores/uiStore'
import type { ApiError } from '@/types/api'
import type {
  MasterDataFormErrors,
  MasterDataPagination,
  MasterDataStatusFilter,
} from '@/features/master-data/types'
import { EMPTY_PAGINATION, hasFormErrors } from '@/features/master-data/utils'
import type { RoleFormValues, RoleListItem, RolesQueryState } from '@/features/roles/types'
import { emptyRoleFormValues, validateRoleForm } from '@/features/roles/validation'
import type { rolesApi } from '@/api/roles.api'
import type { PermissionItem } from '@/api/roles.api'

const DEFAULT_QUERY: RolesQueryState = {
  search: '',
  status: 'ALL',
  page: 1,
  pageSize: 10,
}

type FormMode = 'create' | 'edit'

interface UseRolesModuleOptions {
  api: typeof rolesApi
  permissions: { view: string; manage: string }
}

export function useRolesModule({ api, permissions }: UseRolesModuleOptions) {
  const { can } = useAuth()
  const pushToast = useUiStore((state) => state.pushToast)

  const [items, setItems] = useState<RoleListItem[]>([])
  const [query, setQuery] = useState<RolesQueryState>(DEFAULT_QUERY)
  const [searchInput, setSearchInput] = useState(DEFAULT_QUERY.search)
  const [pagination, setPagination] = useState<MasterDataPagination>(EMPTY_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [formValues, setFormValues] = useState<RoleFormValues>(emptyRoleFormValues)
  const [formErrors, setFormErrors] = useState<MasterDataFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [editingIsSystem, setEditingIsSystem] = useState(false)

  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [permissionsTarget, setPermissionsTarget] = useState<RoleListItem | null>(null)
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<Set<string>>(new Set())
  const [availablePermissions, setAvailablePermissions] = useState<PermissionItem[]>([])
  const [isPermissionsSubmitting, setIsPermissionsSubmitting] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<RoleListItem | null>(null)
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false)

  const [statusTarget, setStatusTarget] = useState<RoleListItem | null>(null)
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false)

  const deferredSearch = useDeferredValue(searchInput)
  const querySignature = JSON.stringify(query)

  const canManage = can(permissions.manage)

  const permissionGroups = useMemo(() => {
    const grouped = new Map<string, PermissionItem[]>()
    for (const p of availablePermissions) {
      const existing = grouped.get(p.module)
      if (existing) {
        existing.push(p)
      } else {
        grouped.set(p.module, [p])
      }
    }
    return Array.from(grouped.entries())
      .map(([module, perms]) => ({ module, permissions: perms }))
      .sort((a, b) => a.module.localeCompare(b.module))
  }, [availablePermissions])

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
  }, [querySignature])

  function handlePageChange(page: number) {
    setQuery((current) => ({ ...current, page }))
  }

  function handleStatusChange(status: MasterDataStatusFilter) {
    setQuery((current) => ({ ...current, status, page: 1 }))
  }

  function handlePageSizeChange(pageSize: number) {
    setQuery((current) => ({ ...current, pageSize, page: 1 }))
  }

  function openCreateDialog() {
    setFormMode('create')
    setEditingId(null)
    setEditingIsSystem(false)
    setFormValues(emptyRoleFormValues)
    setFormErrors({})
    setFormError(null)
    setIsFormOpen(true)
  }

  async function openEditDialog(item: RoleListItem) {
    setFormMode('edit')
    setEditingId(item.id)
    setEditingIsSystem(item.isSystem)
    setFormErrors({})
    setFormError(null)
    setIsFormOpen(true)
    setIsDetailLoading(true)

    try {
      const detail = await api.getById(item.id)
      setFormValues({
        name: detail.name,
        description: detail.description ?? '',
        isActive: detail.isActive,
      })
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
    const nextErrors = validateRoleForm(formValues)
    setFormErrors(nextErrors)
    setFormError(null)

    if (hasFormErrors(nextErrors)) {
      return
    }

    setIsFormSubmitting(true)

    try {
      if (formMode === 'create') {
        await api.create(formValues)
        pushToast('success', 'Role berhasil ditambahkan.')
      } else if (editingId) {
        await api.update(editingId, formValues)
        pushToast('success', 'Role berhasil diperbarui.')
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

  async function openPermissionsDialog(item: RoleListItem) {
    setPermissionsTarget(item)
    setIsPermissionsDialogOpen(true)

    try {
      const allPerms = await api.listPermissions()
      setAvailablePermissions(allPerms)

      const detail = await api.getById(item.id)
      setSelectedPermissionIds(new Set(detail.permissions.map((p) => p.id)))
    } catch {
      pushToast('error', 'Gagal memuat data permissions.')
    }
  }

  function closePermissionsDialog(open: boolean) {
    if (!open) {
      setIsPermissionsDialogOpen(false)
      setPermissionsTarget(null)
      setSelectedPermissionIds(new Set())
      setAvailablePermissions([])
    }
  }

  async function submitPermissionsForm(permissionIds: string[]) {
    if (!permissionsTarget) return

    setIsPermissionsSubmitting(true)

    try {
      await api.setPermissions(permissionsTarget.id, permissionIds)
      pushToast('success', 'Permissions role berhasil diperbarui.')
      setIsPermissionsDialogOpen(false)
      setPermissionsTarget(null)
      setSelectedPermissionIds(new Set())
      setAvailablePermissions([])
      await loadData(query, { background: true })
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      pushToast('error', apiError.message)
    } finally {
      setIsPermissionsSubmitting(false)
    }
  }

  function openDeleteDialog(item: RoleListItem) {
    setDeleteTarget(item)
    setIsDeleteDialogOpen(true)
  }

  function closeDeleteDialog(open: boolean) {
    if (!open) {
      setIsDeleteDialogOpen(false)
      setDeleteTarget(null)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return

    setIsDeleteSubmitting(true)

    try {
      await api.delete(deleteTarget.id)
      pushToast('success', 'Role berhasil dihapus.')
      setIsDeleteDialogOpen(false)
      setDeleteTarget(null)
      await loadData(query, { background: true })
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      pushToast('error', apiError.message)
    } finally {
      setIsDeleteSubmitting(false)
    }
  }

  function openStatusDialog(item: RoleListItem) {
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
        `Role berhasil diubah menjadi ${statusTarget.isActive ? 'Inactive' : 'Active'}.`,
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
    setQuery,
    pagination,
    isLoading,
    isRefreshing,
    error,
    reload: () => loadData(query),
    handlePageChange,
    handleStatusChange,
    handlePageSizeChange,
    canManage,
    isFormOpen,
    formMode,
    formValues,
    setFormValues,
    formErrors,
    formError,
    isFormSubmitting,
    isDetailLoading,
    editingIsSystem,
    openCreateDialog,
    openEditDialog,
    closeFormDialog,
    submitForm,
    isPermissionsDialogOpen,
    permissionsTarget,
    selectedPermissionIds,
    setSelectedPermissionIds,
    availablePermissions,
    permissionGroups,
    isPermissionsSubmitting,
    openPermissionsDialog,
    closePermissionsDialog,
    submitPermissionsForm,
    isDeleteDialogOpen,
    deleteTarget,
    isDeleteSubmitting,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    statusTarget,
    isStatusSubmitting,
    openStatusDialog,
    closeStatusDialog,
    confirmStatusChange,
  }
}
