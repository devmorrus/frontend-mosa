import { useAuth } from '@/hooks/useAuth'

export function DashboardPage() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">
        Selamat datang, {user?.name ?? 'pengguna'}. Modul-modul akan tersedia pada tahap
        berikutnya.
      </p>

      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
        Area konten siap menerima modul (Supplier, Material, Product, dst.) pada Day 3.
      </div>
    </div>
  )
}
