import { useDeferredValue, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/stores/uiStore'
import type { ApiError } from '@/types/api'
import type {
  MasterDataFormErrors,
  MasterDataPagination,
  MasterDataStatusFilter,
} from '@/features/master-data/types'
import { EMPTY_PAGINATION, hasFormErrors } from '@/features/master-data/utils'
import type { RoleLookupResponse, UserFormValues, UserListItem, UsersQueryState } from '@/features/users/types'
import { emptyUserFormValues, validatePasswordForm, validateUserForm } from '@/features/users/validation'
import type { usersApi } from '@/api/users.api'
import { rolesApi } from '@/api/roles.api'

const DEFAULT_QUERY: UsersQueryState = {
  search: '',
  roleId: '',
  status: 'ALL',
  page: 1,
  pageSize: 10,
}

type FormMode = 'create' | 'edit'

interface UseUsersModuleOptions {
  api: typeof usersApi
  permissions: { view: string; create: string; update: string }
}

export function useUsersModule({ api, permissions }: UseUsersModuleOptions) {
  const navigate = useNavigate()
  const { can } = useAuth()
  const pushToast = useUiStore((state) => state.pushToast)

  const [items, setItems] = useState<UserListItem[]>([])
  const [query, setQuery] = useState<UsersQueryState>(DEFAULT_QUERY)
  const [searchInput, setSearchInput] = useState(DEFAULT_QUERY.search)
  const [pagination, setPagination] = useState<MasterDataPagination>(EMPTY_PAGINATION)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [formValues, setFormValues] = useState<UserFormValues>(emptyUserFormValues)
  const [formErrors, setFormErrors] = useState<MasterDataFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)

  const [statusTarget, setStatusTarget] = useState<UserListItem | null>(null)
  const [isStatusSubmitting, setIsStatusSubmitting] = useState(false)

  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false)
  const [rolesTarget, setRolesTarget] = useState<UserListItem | null>(null)
  const [rolesFormValues, setRolesFormValues] = useState<string[]>([])
  const [availableRoles, setAvailableRoles] = useState<RoleLookupResponse[]>([])
  const [isRolesSubmitting, setIsRolesSubmitting] = useState(false)

  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [passwordTarget, setPasswordTarget] = useState<UserListItem | null>(null)
  const [passwordErrors, setPasswordErrors] = useState<MasterDataFormErrors>({})
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)

  const [isRevokeDialogOpen, setIsRevokeDialogOpen] = useState(false)
  const [revokeTarget, setRevokeTarget] = useState<UserListItem | null>(null)
  const [isRevokeSubmitting, setIsRevokeSubmitting] = useState(false)

  const deferredSearch = useDeferredValue(searchInput)
  const querySignature = JSON.stringify(query)

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

  function handleRoleChange(roleId: string) {
    setQuery((current) => ({ ...current, roleId, page: 1 }))
  }

  async function fetchAvailableRoles() {
    try {
      const roles = await rolesApi.listOptions()
      setAvailableRoles(roles)
    } catch {
      // silent — roles will be empty, shown as loading in dialog
    }
  }

  function openCreateDialog() {
    navigate('/admin/users/create')
  }

  function openDetailPage(item: UserListItem) {
    navigate(`/admin/users/${item.id}`)
  }

  async function openEditDialog(item: UserListItem) {
    setFormMode('edit')
    setEditingId(item.id)
    setFormErrors({})
    setFormError(null)
    setIsFormOpen(true)
    setIsDetailLoading(true)
    void fetchAvailableRoles()

    try {
      const detail = await api.getById(item.id)
      setFormValues({
        username: detail.username,
        fullName: detail.fullName,
        email: detail.email ?? '',
        password: '',
        roleIds: detail.roles.map((r) => r.id),
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
    const nextErrors = validateUserForm(formValues, formMode)
    setFormErrors(nextErrors)
    setFormError(null)

    if (hasFormErrors(nextErrors)) {
      return
    }

    setIsFormSubmitting(true)

    try {
      if (formMode === 'create') {
        await api.create(formValues)
        pushToast('success', 'User berhasil ditambahkan.')
      } else if (editingId) {
        await api.update(editingId, formValues)
        pushToast('success', 'User berhasil diperbarui.')
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

  function openStatusDialog(item: UserListItem) {
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
        `User berhasil diubah menjadi ${statusTarget.isActive ? 'Inactive' : 'Active'}.`,
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

  async function openRolesDialog(item: UserListItem) {
    setRolesTarget(item)
    setRolesFormValues(item.roles.map((r) => r.id))
    setIsRolesDialogOpen(true)

    try {
      const roles = await rolesApi.listOptions()
      setAvailableRoles(roles)
    } catch {
      pushToast('error', 'Gagal memuat daftar role.')
    }
  }

  function closeRolesDialog(open: boolean) {
    if (!open) {
      setIsRolesDialogOpen(false)
      setRolesTarget(null)
      setAvailableRoles([])
    }
  }

  async function submitRolesForm(roleIds: string[]) {
    if (!rolesTarget) return

    setIsRolesSubmitting(true)

    try {
      await api.assignRoles(rolesTarget.id, roleIds)
      pushToast('success', 'Roles user berhasil diperbarui.')
      setIsRolesDialogOpen(false)
      setRolesTarget(null)
      setAvailableRoles([])
      await loadData(query, { background: true })
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      pushToast('error', apiError.message)
    } finally {
      setIsRolesSubmitting(false)
    }
  }

  function openPasswordDialog(item: UserListItem) {
    setPasswordTarget(item)
    setPasswordErrors({})
    setIsPasswordDialogOpen(true)
  }

  function closePasswordDialog(open: boolean) {
    if (!open) {
      setIsPasswordDialogOpen(false)
      setPasswordTarget(null)
      setPasswordErrors({})
    }
  }

  async function submitPasswordForm(newPassword: string) {
    if (!passwordTarget) return

    const nextErrors = validatePasswordForm(newPassword)
    setPasswordErrors(nextErrors)

    if (hasFormErrors(nextErrors)) {
      return
    }

    setIsPasswordSubmitting(true)

    try {
      await api.changePassword(passwordTarget.id, newPassword)
      pushToast('success', 'Password user berhasil diubah.')
      setIsPasswordDialogOpen(false)
      setPasswordTarget(null)
      setPasswordErrors({})
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setPasswordErrors(apiError.errors ?? {})
      if (!apiError.errors) {
        pushToast('error', apiError.message)
      }
    } finally {
      setIsPasswordSubmitting(false)
    }
  }

  function openRevokeSessionsDialog(item: UserListItem) {
    setRevokeTarget(item)
    setIsRevokeDialogOpen(true)
  }

  function closeRevokeSessionsDialog(open: boolean) {
    if (!open) {
      setIsRevokeDialogOpen(false)
      setRevokeTarget(null)
    }
  }

  async function confirmRevokeSessions() {
    if (!revokeTarget) return

    setIsRevokeSubmitting(true)

    try {
      await api.revokeSessions(revokeTarget.id)
      pushToast('success', 'Sesi login user berhasil dicabut.')
      setIsRevokeDialogOpen(false)
      setRevokeTarget(null)
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      pushToast('error', apiError.message)
    } finally {
      setIsRevokeSubmitting(false)
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
    handleRoleChange,
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
    isRolesDialogOpen,
    rolesTarget,
    rolesFormValues,
    availableRoles,
    isRolesSubmitting,
    openRolesDialog,
    closeRolesDialog,
    submitRolesForm,
    isPasswordDialogOpen,
    passwordTarget,
    passwordErrors,
    isPasswordSubmitting,
    openPasswordDialog,
    closePasswordDialog,
    submitPasswordForm,
    isRevokeDialogOpen,
    revokeTarget,
    isRevokeSubmitting,
    openRevokeSessionsDialog,
    closeRevokeSessionsDialog,
    confirmRevokeSessions,
    openDetailPage,
  }
}
