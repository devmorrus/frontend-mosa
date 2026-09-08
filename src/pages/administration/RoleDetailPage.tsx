import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { rolesApi } from '@/api/roles.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MasterDataLoadingState, MasterDataErrorState } from '@/features/master-data/components/MasterDataStates'
import { RolePermissionsDialog } from '@/features/roles/components/RolePermissionsDialog'
import type { PermissionItem } from '@/api/roles.api'
import type { RoleDetail } from '@/features/roles/types'

export function RoleDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<RoleDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissionGroups, setPermissionGroups] = useState<Array<{ module: string; permissions: PermissionItem[] }>>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        const [roleDetail, grouped] = await Promise.all([rolesApi.getById(id), rolesApi.listGroupedPermissions()])
        setDetail(roleDetail)
        setPermissionGroups(grouped)
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Gagal memuat detail role.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id])

  if (loading) return <MasterDataLoadingState description="Memuat detail role..." />
  if (error || !detail) return <MasterDataErrorState description={error ?? 'Role tidak ditemukan.'} onRetry={() => navigate('/admin/roles')} />

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{detail.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-500">Deskripsi</div>
          <div className="font-medium">{detail.description ?? '-'}</div>
        </CardContent>
      </Card>

      <RolePermissionsDialog
        open
        roleName={detail.name}
        currentPermissionIds={detail.permissions.map((permission) => permission.id)}
        permissionGroups={permissionGroups}
        submitting={saving}
        onOpenChange={() => navigate('/admin/roles')}
        onSubmit={async (permissionIds) => {
          if (!id) return
          setSaving(true)
          try {
            await rolesApi.setPermissions(id, permissionIds)
            navigate('/admin/roles')
          } finally {
            setSaving(false)
          }
        }}
      />

      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate('/admin/roles')}>Kembali</Button>
      </div>
    </div>
  )
}
