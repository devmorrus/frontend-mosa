import { FolderTree } from 'lucide-react'
import { menusApi } from '@/api/menus.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MasterDataEmptyState, MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { useMenusModule } from '@/features/menus/hooks/useMenusModule'
import { MenuTree } from '@/features/menus/components/MenuTree'
import { MenuFormDialog } from '@/features/menus/components/MenuFormDialog'
import { MenuDeleteDialog } from '@/features/menus/components/MenuDeleteDialog'
import { MenuToolbar } from '@/features/menus/components/MenuToolbar'
import type { MenuTreeNode } from '@/features/menus/types'

export function MenusPage() {
  const menusModule = useMenusModule({
    api: menusApi,
    permissions: {
      view: 'menus.view',
      create: 'menus.create',
      update: 'menus.update',
      delete: 'menus.delete',
    },
  })

  function countNodes(nodes: MenuTreeNode[]): number {
    let count = 0
    for (const node of nodes) {
      count++
      count += countNodes(node.children)
    }
    return count
  }

  function countActive(nodes: MenuTreeNode[]): number {
    let count = 0
    for (const node of nodes) {
      if (node.isActive) count++
      count += countActive(node.children)
    }
    return count
  }

  function countInactive(nodes: MenuTreeNode[]): number {
    let count = 0
    for (const node of nodes) {
      if (!node.isActive) count++
      count += countInactive(node.children)
    }
    return count
  }

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(12,28,26,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <FolderTree size={14} className="text-signal" />
              Administration Menus
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Kelola menu sistem
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Atur struktur hierarki menu sidebar, tentukan permission akses, dan
              kelola urutan navigasi pengguna secara terpusat.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Total Menu</div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper">
                  {menusModule.isTreeLoading ? '—' : countNodes(menusModule.menuTree)}
                </div>
                <p className="mt-1 text-sm text-paper/60">Semua menu tercatat</p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Active</div>
                <div className="mt-2 font-display text-3xl font-semibold text-emerald-400">
                  {menusModule.isTreeLoading ? '—' : countActive(menusModule.menuTree)}
                </div>
                <p className="mt-1 text-sm text-paper/60">Siap ditampilkan</p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Inactive</div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper/45">
                  {menusModule.isTreeLoading ? '—' : countInactive(menusModule.menuTree)}
                </div>
                <p className="mt-1 text-sm text-paper/60">Tersembunyi dari sidebar</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Toolbar ── */}
      <MenuToolbar
        onExpandAll={menusModule.expandAll}
        onCollapseAll={menusModule.collapseAll}
        includeInactive={menusModule.includeInactive}
        onIncludeInactiveChange={menusModule.setIncludeInactive}
        createLabel="Add Menu"
        onCreate={menusModule.openCreateDialog}
        canCreate={menusModule.canCreate}
      />

      {/* ── Tree area ── */}
      {menusModule.isTreeLoading ? (
        <MasterDataLoadingState description="Struktur menu sedang dimuat dari backend." />
      ) : menusModule.treeError ? (
        <MasterDataErrorState description={menusModule.treeError} onRetry={menusModule.reloadTree} />
      ) : menusModule.menuTree.length === 0 ? (
        <MasterDataEmptyState
          description="Belum ada menu yang terdaftar di sistem."
          action={
            menusModule.canCreate ? (
              <Button onClick={menusModule.openCreateDialog}>Tambah menu pertama</Button>
            ) : null
          }
        />
      ) : (
        <MenuTree
          items={menusModule.menuTree}
          expandedIds={menusModule.expandedIds}
          onToggleExpand={menusModule.toggleExpanded}
          onEdit={menusModule.openEditDialog}
          onAddChild={menusModule.openCreateChildDialog}
          onDelete={menusModule.openDeleteDialog}
          canUpdate={menusModule.canUpdate}
          canCreate={menusModule.canCreate}
          canDelete={menusModule.canDelete}
          filterText=""
        />
      )}

      {/* ── Form Dialog (Tambah / Edit) ── */}
      <MenuFormDialog
        open={menusModule.isFormOpen}
        mode={menusModule.formMode}
        values={menusModule.formValues}
        errors={menusModule.formErrors}
        formError={menusModule.formError}
        isDetailLoading={menusModule.isDetailLoading}
        submitting={menusModule.isFormSubmitting}
        menuTree={menusModule.menuTree}
        availablePermissions={menusModule.availablePermissions}
        onValuesChange={menusModule.setFormValues}
        onOpenChange={menusModule.closeFormDialog}
        onSubmit={menusModule.submitForm}
      />

      {/* ── Delete Dialog ── */}
      <MenuDeleteDialog
        open={menusModule.isDeleteDialogOpen}
        menu={menusModule.deleteTarget}
        error={menusModule.deleteError}
        submitting={menusModule.isDeleteSubmitting}
        onOpenChange={menusModule.closeDeleteDialog}
        onConfirm={menusModule.confirmDelete}
      />
    </div>
  )
}
