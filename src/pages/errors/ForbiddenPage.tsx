import { StatusPage } from '@/pages/errors/StatusPage'

export function ForbiddenPage() {
  return (
    <StatusPage
      code="403"
      title="Akses ditolak"
      description="Akun Anda tidak memiliki izin untuk mengakses halaman ini."
    />
  )
}
