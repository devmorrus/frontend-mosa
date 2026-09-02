import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUiStore } from '@/stores/uiStore'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/api/auth.api'
import type { ApiError } from '@/types/api'
import type { MasterDataFormErrors, MasterDataPagination } from '@/features/master-data/types'
import { EMPTY_PAGINATION, hasFormErrors } from '@/features/master-data/utils'
import type { MenuFormValues, MenuListItem, MenuTreeNode } from '@/features/menus/types'
import { emptyMenuFormValues, validateMenuForm } from '@/features/menus/validation'
import type { menusApi } from '@/api/menus.api'
import type { PermissionItem } from '@/api/roles.api'
import { rolesApi } from '@/api/roles.api'

type FormMode = 'create' | 'edit'

interface UseMenusModuleOptions {
  api: typeof menusApi
  permissions: { view: string; create: string; update: string; delete: string }
}

export function useMenusModule({ api, permissions }: UseMenusModuleOptions) {
  const { can } = useAuth()
  const pushToast = useUiStore((state) => state.pushToast)
  const setSidebarItems = useAuthStore((state) => state.setSidebarItems)

  async function refreshSidebar() {
    try {
      const sidebarItems = await authApi.refreshSidebar()
      setSidebarItems(sidebarItems)
    } catch {
      // sidebar refresh failed silently
    }
  }

  const [menuTree, setMenuTree] = useState<MenuTreeNode[]>([])
  const [isTreeLoading, setIsTreeLoading] = useState(true)
  const [treeError, setTreeError] = useState<string | null>(null)
  const [includeInactive, setIncludeInactive] = useState(true)

  const [pagination, _setPagination] = useState<MasterDataPagination>(EMPTY_PAGINATION)
  const [isLoading, _setIsLoading] = useState(false)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<FormMode>('create')
  const [formValues, setFormValues] = useState<MenuFormValues>(emptyMenuFormValues)
  const [formErrors, setFormErrors] = useState<MasterDataFormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isDetailLoading, setIsDetailLoading] = useState(false)
  const [editingIsSystem, setEditingIsSystem] = useState(false)

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<MenuTreeNode | null>(null)
  const [isDeleteSubmitting, setIsDeleteSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const [availablePermissions, setAvailablePermissions] = useState<PermissionItem[]>([])

  const canCreate = can(permissions.create)
  const canUpdate = can(permissions.update)
  const canDelete = can(permissions.delete)

  const loadTree = useCallback(async () => {
    setIsTreeLoading(true)
    setTreeError(null)
    try {
      const tree = await api.tree(includeInactive)
      setMenuTree(tree)
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setTreeError(apiError.message)
    } finally {
      setIsTreeLoading(false)
    }
  }, [api, includeInactive])

  useEffect(() => {
    void loadTree()
  }, [loadTree])

  useEffect(() => {
    void rolesApi.listPermissions().then(setAvailablePermissions).catch(() => {})
  }, [])

  function toggleExpanded(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function expandAll() {
    const allIds = new Set<string>()
    function walk(nodes: MenuTreeNode[]) {
      for (const node of nodes) {
        if (node.children.length > 0) {
          allIds.add(node.id)
          walk(node.children)
        }
      }
    }
    walk(menuTree)
    setExpandedIds(allIds)
  }

  function collapseAll() {
    setExpandedIds(new Set())
  }

  function openCreateDialog() {
    setFormMode('create')
    setEditingId(null)
    setEditingIsSystem(false)
    setFormValues(emptyMenuFormValues)
    setFormErrors({})
    setFormError(null)
    setIsFormOpen(true)
  }

  function openCreateChildDialog(parentId: string) {
    setFormMode('create')
    setEditingId(null)
    setEditingIsSystem(false)
    setFormValues({ ...emptyMenuFormValues, parentId })
    setFormErrors({})
    setFormError(null)
    setIsFormOpen(true)
  }

  async function openEditDialog(item: MenuListItem | MenuTreeNode) {
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
        code: detail.code,
        name: detail.name,
        path: detail.path ?? '',
        icon: detail.icon ?? '',
        requiredPermissionCode: detail.requiredPermissionCode ?? '',
        parentId: detail.parentId,
        sortOrder: detail.sortOrder,
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
    const nextErrors = validateMenuForm(formValues, formMode)
    setFormErrors(nextErrors)
    setFormError(null)

    if (hasFormErrors(nextErrors)) {
      return
    }

    setIsFormSubmitting(true)

    try {
      if (formMode === 'create') {
        await api.create(formValues)
        pushToast('success', 'Menu berhasil ditambahkan.')
      } else if (editingId) {
        await api.update(editingId, formValues)
        pushToast('success', 'Menu berhasil diperbarui.')
      }

      setIsFormOpen(false)
      await loadTree()
      await refreshSidebar()
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setFormErrors(apiError.errors ?? {})
      setFormError(apiError.errors ? null : apiError.message)
    } finally {
      setIsFormSubmitting(false)
    }
  }

  function openDeleteDialog(item: MenuTreeNode) {
    setDeleteTarget(item)
    setDeleteError(null)
    setIsDeleteDialogOpen(true)
  }

  function closeDeleteDialog(open: boolean) {
    if (!open) {
      setIsDeleteDialogOpen(false)
      setDeleteTarget(null)
      setDeleteError(null)
    }
  }

  function mapDeleteError(apiError: ApiError): string {
    // Backend sekarang mengirim detail role/child spesifik, pakai langsung
    if (apiError.code === 'menu_has_permissions' || apiError.code === 'menu_has_children') {
      return apiError.message
    }
    switch (apiError.code) {
      case 'system_menu_delete_blocked':
        return 'Menu sistem tidak dapat dihapus. Menu ini diperlukan untuk operasi inti aplikasi.'
      default:
        return apiError.message
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return

    setIsDeleteSubmitting(true)
    setDeleteError(null)

    try {
      await api.delete(deleteTarget.id)
      pushToast('success', 'Menu berhasil dihapus.')
      setIsDeleteDialogOpen(false)
      setDeleteTarget(null)
      await loadTree()
      await refreshSidebar()
    } catch (caughtError) {
      const apiError = caughtError as ApiError
      setDeleteError(mapDeleteError(apiError))
    } finally {
      setIsDeleteSubmitting(false)
    }
  }

  return {
    menuTree,
    isTreeLoading,
    treeError,
    includeInactive,
    setIncludeInactive,
    reloadTree: loadTree,
    pagination,
    isLoading,
    canCreate,
    canUpdate,
    canDelete,
    expandedIds,
    toggleExpanded,
    expandAll,
    collapseAll,
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
    openCreateChildDialog,
    openEditDialog,
    closeFormDialog,
    submitForm,
    isDeleteDialogOpen,
    deleteTarget,
    isDeleteSubmitting,
    deleteError,
    openDeleteDialog,
    closeDeleteDialog,
    confirmDelete,
    availablePermissions,
  }
}
