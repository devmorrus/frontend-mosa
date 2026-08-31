import { LoaderCircle, ShieldEllipsis } from 'lucide-react'
import { rolesApi } from '@/api/roles.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MasterDataStatusDialog } from '@/features/master-data/components/MasterDataStatusDialog'
import { MasterDataEmptyState, MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { useRolesModule } from '@/features/roles/hooks/useRolesModule'

import { RoleFormDialog } from '@/features/roles/components/RoleFormDialog'
import { RolePermissionsDialog } from '@/features/roles/components/RolePermissionsDialog'
import { RoleDeleteDialog } from '@/features/roles/components/RoleDeleteDialog'
import { RoleTable } from '@/features/roles/components/RoleTable'
import { RoleToolbar } from '@/features/roles/components/RoleToolbar'

export function RolesPage() {
  const roleModule = useRolesModule({
    api: rolesApi,
    permissions: {
      view: 'roles.view',
      manage: 'roles.manage',
    },
  })

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(12,28,26,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <ShieldEllipsis size={14} className="text-signal" />
              Administration Roles
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Kelola role akses
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Tentukan role dan permissions untuk mengontrol akses pengguna ke setiap modul 
              dan fitur dalam sistem MOSA.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Total Role</div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper">
                  {roleModule.pagination.totalItems}
                </div>
                <p className="mt-1 text-sm text-paper/60">Semua role tercatat</p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Active</div>
                <div className="mt-2 font-display text-3xl font-semibold text-emerald-400">
                  {roleModule.items.filter((i) => i.isActive).length}
                </div>
                <p className="mt-1 text-sm text-paper/60">Siap digunakan</p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">System</div>
                <div className="mt-2 font-display text-3xl font-semibold text-purple-400">
                  {roleModule.items.filter((i) => i.isSystem).length}
                </div>
                <p className="mt-1 text-sm text-paper/60">Role terlindungi</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Toolbar ── */}
      <RoleToolbar
        query={roleModule.query}
        searchValue={roleModule.searchInput}
        searchPlaceholder="Cari nama atau deskripsi role"
        onSearchValueChange={roleModule.setSearchInput}
        onStatusChange={roleModule.handleStatusChange}
        onPageSizeChange={roleModule.handlePageSizeChange}
        createLabel="Add Role"
        onCreate={roleModule.openCreateDialog}
        canManage={roleModule.canManage}
      />

      {/* ── Table area ── */}
      {roleModule.isLoading ? (
        <MasterDataLoadingState description="Daftar role sedang dimuat dari backend." />
      ) : roleModule.error ? (
        <MasterDataErrorState description={roleModule.error} onRetry={roleModule.reload} />
      ) : roleModule.items.length === 0 ? (
        <MasterDataEmptyState
          description="Belum ada role yang cocok dengan filter saat ini."
          action={
            roleModule.canManage ? (
              <Button onClick={roleModule.openCreateDialog}>Tambah role pertama</Button>
            ) : null
          }
        />
      ) : (
        <div className="relative space-y-3">
          {roleModule.isRefreshing && (
            <div className="absolute -top-2 right-0 z-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
              <LoaderCircle size={13} className="animate-spin text-slate-400" />
              Menyegarkan data...
            </div>
          )}
          <RoleTable
            items={roleModule.items}
            pagination={roleModule.pagination}
            onPageChange={roleModule.handlePageChange}
            onEdit={roleModule.openEditDialog}
            onPermissions={roleModule.openPermissionsDialog}
            onToggleStatus={roleModule.openStatusDialog}
            onDelete={roleModule.openDeleteDialog}
            canManage={roleModule.canManage}
          />
        </div>
      )}

      {/* ── Form Dialog (Tambah / Edit) ── */}
      <RoleFormDialog
        open={roleModule.isFormOpen}
        mode={roleModule.formMode}
        values={roleModule.formValues}
        errors={roleModule.formErrors}
        formError={roleModule.formError}
        isDetailLoading={roleModule.isDetailLoading}
        submitting={roleModule.isFormSubmitting}
        isSystem={roleModule.editingIsSystem}
        onValuesChange={roleModule.setFormValues}
        onOpenChange={roleModule.closeFormDialog}
        onSubmit={roleModule.submitForm}
      />

      {/* ── Permissions Dialog ── */}
      <RolePermissionsDialog
        open={roleModule.isPermissionsDialogOpen}
        roleName={roleModule.permissionsTarget?.name ?? ''}
        currentPermissionIds={Array.from(roleModule.selectedPermissionIds)}
        permissionGroups={roleModule.permissionGroups}
        submitting={roleModule.isPermissionsSubmitting}
        onOpenChange={roleModule.closePermissionsDialog}
        onSubmit={roleModule.submitPermissionsForm}
      />

      {/* ── Delete Dialog ── */}
      <RoleDeleteDialog
        open={roleModule.isDeleteDialogOpen}
        role={roleModule.deleteTarget}
        submitting={roleModule.isDeleteSubmitting}
        onOpenChange={roleModule.closeDeleteDialog}
        onConfirm={roleModule.confirmDelete}
      />

      {/* ── Status Change Dialog ── */}
      <MasterDataStatusDialog
        open={Boolean(roleModule.statusTarget)}
        entityLabel={roleModule.statusTarget?.name ?? 'role'}
        nextStatusLabel={roleModule.statusTarget?.isActive ? 'Inactive' : 'Active'}
        onOpenChange={roleModule.closeStatusDialog}
        onConfirm={roleModule.confirmStatusChange}
        submitting={roleModule.isStatusSubmitting}
      />
    </div>
  )
}
