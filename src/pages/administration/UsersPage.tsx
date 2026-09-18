import { useEffect, useState } from 'react'
import { LoaderCircle, Users } from 'lucide-react'
import { usersApi } from '@/api/users.api'
import { rolesApi } from '@/api/roles.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MasterDataStatusDialog } from '@/features/master-data/components/MasterDataStatusDialog'
import { MasterDataEmptyState, MasterDataErrorState, MasterDataLoadingState } from '@/features/master-data/components/MasterDataStates'
import { useUsersModule } from '@/features/users/hooks/useUsersModule'

import { UserFormDialog } from '@/features/users/components/UserFormDialog'
import { UserRolesDialog } from '@/features/users/components/UserRolesDialog'
import { UserPasswordDialog } from '@/features/users/components/UserPasswordDialog'
import { UserTable } from '@/features/users/components/UserTable'
import { UserToolbar } from '@/features/users/components/UserToolbar'

export function UsersPage() {
  const [roleOptions, setRoleOptions] = useState<Array<{ value: string; label: string }>>([])
  const userModule = useUsersModule({
    api: usersApi,
    permissions: {
      view: 'users.view',
      create: 'users.create',
      update: 'users.update',
    },
  })

  useEffect(() => {
    void rolesApi.listOptions().then((items) => {
      setRoleOptions(items.map((item) => ({ value: item.id, label: item.name })))
    }).catch(() => setRoleOptions([]))
  }, [])

  return (
    <div className="space-y-6">
      {/* ── Hero ── */}
      <section data-tour="admin-menu" className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(6,59,140,0.16)] sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,201,40,0.22),transparent_55%)]" />
        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <Users size={14} className="text-signal" />
              Administration Users
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Kelola user sistem
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              Gunakan daftar ini untuk mengelola data user, role assignment, dan
              status keaktifan secara konsisten dan aman.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Total User</div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper">
                  {userModule.pagination.totalItems}
                </div>
                <p className="mt-1 text-sm text-paper/60">Semua user tercatat</p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Active</div>
                <div className="mt-2 font-display text-3xl font-semibold text-blue-400">
                  {userModule.items.filter((i) => i.isActive).length}
                </div>
                <p className="mt-1 text-sm text-paper/60">Siap mengakses sistem</p>
              </CardContent>
            </Card>

            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="p-5">
                <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Inactive</div>
                <div className="mt-2 font-display text-3xl font-semibold text-paper/45">
                  {userModule.items.filter((i) => !i.isActive).length}
                </div>
                <p className="mt-1 text-sm text-paper/60">Perlu direview</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── Toolbar ── */}
      <div data-tour="users-menu">
        <UserToolbar
        query={userModule.query}
        searchValue={userModule.searchInput}
        searchPlaceholder="Cari username, nama lengkap, atau role user"
        onSearchValueChange={userModule.setSearchInput}
        roleOptions={roleOptions}
        onRoleChange={userModule.handleRoleChange}
        onStatusChange={userModule.handleStatusChange}
        onPageSizeChange={userModule.handlePageSizeChange}
        createLabel="Add User"
        onCreate={userModule.openCreateDialog}
        canCreate={userModule.canCreate}
      />
      </div>

      {/* ── Table area ── */}
      {userModule.isLoading ? (
        <MasterDataLoadingState description="Daftar user sedang dimuat dari backend." />
      ) : userModule.error ? (
        <MasterDataErrorState description={userModule.error} onRetry={userModule.reload} />
      ) : userModule.items.length === 0 ? (
        <MasterDataEmptyState
          description="Belum ada user yang cocok dengan filter saat ini."
          action={
            userModule.canCreate ? (
              <Button onClick={userModule.openCreateDialog}>Tambah user pertama</Button>
            ) : null
          }
        />
      ) : (
        <div className="relative space-y-3">
          {userModule.isRefreshing && (
            <div className="absolute -top-2 right-0 z-10 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
              <LoaderCircle size={13} className="animate-spin text-slate-400" />
              Menyegarkan data...
            </div>
          )}
          <UserTable
            items={userModule.items}
            pagination={userModule.pagination}
            onPageChange={userModule.handlePageChange}
            onDetail={userModule.openDetailPage}
            onEdit={userModule.openEditDialog}
            onToggleStatus={userModule.openStatusDialog}
            onRoles={userModule.openRolesDialog}
            onPassword={userModule.openPasswordDialog}
            onRevokeSessions={userModule.openRevokeSessionsDialog}
            canUpdate={userModule.canUpdate}
          />
        </div>
      )}

      {/* ── Form Dialog (Tambah / Edit) ── */}
      <UserFormDialog
        open={userModule.isFormOpen}
        mode={userModule.formMode}
        values={userModule.formValues}
        errors={userModule.formErrors}
        formError={userModule.formError}
        isDetailLoading={userModule.isDetailLoading}
        submitting={userModule.isFormSubmitting}
        availableRoles={userModule.availableRoles}
        onValuesChange={userModule.setFormValues}
        onOpenChange={userModule.closeFormDialog}
        onSubmit={userModule.submitForm}
      />

      {/* ── Roles Dialog ── */}
      <UserRolesDialog
        open={userModule.isRolesDialogOpen}
        username={userModule.rolesTarget?.username ?? ''}
        currentRoleIds={userModule.rolesFormValues}
        availableRoles={userModule.availableRoles}
        submitting={userModule.isRolesSubmitting}
        onOpenChange={userModule.closeRolesDialog}
        onSubmit={userModule.submitRolesForm}
      />

      {/* ── Password Dialog ── */}
      <UserPasswordDialog
        open={userModule.isPasswordDialogOpen}
        username={userModule.passwordTarget?.username ?? ''}
        submitting={userModule.isPasswordSubmitting}
        onOpenChange={userModule.closePasswordDialog}
        onConfirm={userModule.submitPasswordForm}
      />

      {/* ── Status Change Dialog ── */}
      <MasterDataStatusDialog
        open={Boolean(userModule.statusTarget)}
        entityLabel={userModule.statusTarget?.fullName ?? 'user'}
        nextStatusLabel={userModule.statusTarget?.isActive ? 'Inactive' : 'Active'}
        onOpenChange={userModule.closeStatusDialog}
        onConfirm={userModule.confirmStatusChange}
        submitting={userModule.isStatusSubmitting}
      />
    </div>
  )
}
