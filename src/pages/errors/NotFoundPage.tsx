import { StatusPage } from '@/pages/errors/StatusPage'

export function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      title="Halaman tidak ditemukan"
      description="URL yang Anda tuju tidak tersedia atau sudah dipindahkan."
    />
  )
}
