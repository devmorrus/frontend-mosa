import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usersApi } from '@/api/users.api'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MasterDataLoadingState, MasterDataErrorState } from '@/features/master-data/components/MasterDataStates'
import { MasterDataStatusDialog } from '@/features/master-data/components/MasterDataStatusDialog'
import type { UserDetail } from '@/features/users/types'

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusOpen, setStatusOpen] = useState(false)

  useEffect(() => {
    async function load() {
      if (!id) return
      setLoading(true)
      setError(null)
      try {
        setDetail(await usersApi.getById(id))
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Gagal memuat detail user.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [id])

  if (loading) return <MasterDataLoadingState description="Memuat detail user..." />
  if (error || !detail) return <MasterDataErrorState description={error ?? 'User tidak ditemukan.'} onRetry={() => navigate('/admin/users')} />

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{detail.fullName}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <div className="text-sm text-slate-500">Username</div>
            <div className="font-medium">{detail.username}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Email</div>
            <div className="font-medium">{detail.email ?? '-'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Status</div>
            <div className="font-medium">{detail.isActive ? 'Active' : 'Inactive'}</div>
          </div>
          <div>
            <div className="text-sm text-slate-500">Last Login</div>
            <div className="font-medium">{detail.lastLoginAtUtc ? new Date(detail.lastLoginAtUtc).toLocaleString('id-ID') : '-'}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-sm text-slate-500">Assigned Role</div>
            <div className="font-medium">{detail.roles.length > 0 ? detail.roles.map((role) => role.name).join(', ') : '-'}</div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => navigate(`/admin/users/${detail.id}?edit=1`)}>Edit</Button>
        <Button variant="secondary" onClick={() => navigate('/admin/users')}>Kembali</Button>
      </div>

      <MasterDataStatusDialog
        open={statusOpen}
        entityLabel={detail.fullName}
        nextStatusLabel={detail.isActive ? 'Inactive' : 'Active'}
        onOpenChange={setStatusOpen}
        onConfirm={() => setStatusOpen(false)}
        submitting={false}
      />
    </div>
  )
}
