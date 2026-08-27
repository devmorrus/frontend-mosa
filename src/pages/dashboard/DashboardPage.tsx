import {
  Boxes,
  ClipboardList,
  FlaskConical,
  LayoutDashboard,
  PackageSearch,
  ShoppingBasket,
  Truck,
  Warehouse,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { useAuth } from '@/hooks/useAuth'

interface ModulePreview {
  label: string
  permission: string
  description: string
  accent: string
  icon: ComponentType<{ size?: number; className?: string }>
}

const MODULE_PREVIEWS: ModulePreview[] = [
  {
    label: 'Supplier',
    permission: 'suppliers.view',
    description: 'Fondasi vendor, kontak, dan status kemitraan siap disambungkan ke data backend.',
    accent: 'from-[#d7efe7] to-[#f2f6ef]',
    icon: Truck,
  },
  {
    label: 'Material',
    permission: 'materials.view',
    description: 'Struktur bahan baku, spesifikasi, dan traceability disiapkan untuk tahap berikutnya.',
    accent: 'from-[#e8efe0] to-[#f7f4ea]',
    icon: Boxes,
  },
  {
    label: 'Product',
    permission: 'products.view',
    description: 'Ruang untuk katalog produk jadi dan relasinya dengan proses produksi sudah disediakan.',
    accent: 'from-[#f3ead8] to-[#f8f3e9]',
    icon: ShoppingBasket,
  },
  {
    label: 'Goods Receiving',
    permission: 'goodsreceiving.view',
    description: 'Alur penerimaan barang akan dibangun di atas shell dan permission yang sudah siap.',
    accent: 'from-[#e1edf1] to-[#f6f8f5]',
    icon: PackageSearch,
  },
  {
    label: 'Inventory',
    permission: 'inventory.view',
    description: 'Area stok dan mutasi tinggal melanjutkan integrasi list, filter, dan detail transaksi.',
    accent: 'from-[#e4ece9] to-[#f7f5ef]',
    icon: Warehouse,
  },
  {
    label: 'Recipe',
    permission: 'recipes.view',
    description: 'Fondasi resep dan komposisi proses akan mengisi struktur yang sama pada Day 3.',
    accent: 'from-[#efe7df] to-[#f8f2ed]',
    icon: ClipboardList,
  },
  {
    label: 'Production',
    permission: 'production.view',
    description: 'Jalur kerja produksi siap menerima form, monitoring batch, dan checkpoint operasional.',
    accent: 'from-[#dfe9e3] to-[#f5f5ef]',
    icon: FlaskConical,
  },
]

export function DashboardPage() {
  const { user, hasPermission } = useAuth()
  const visibleModules = MODULE_PREVIEWS.filter((module) => hasPermission(module.permission))

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(18,48,46,0.18)] sm:px-8 sm:py-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '34px 34px',
          }}
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(232,163,61,0.22),transparent_58%)]" />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              <LayoutDashboard size={14} className="text-signal" />
              Dashboard Foundation
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Selamat datang, {user?.name ?? 'pengguna'}.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">
              App shell MOSA sudah siap untuk mulai development modul fungsional. Hari ini fokus
              kita adalah fondasi yang konsisten, responsif, dan aman untuk dihubungkan ke backend.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:w-[22rem] lg:grid-cols-1 xl:grid-cols-2">
            <div className="rounded-2xl border border-paper/10 bg-paper/7 px-4 py-4 backdrop-blur-sm">
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Visible modules</div>
              <div className="mt-2 font-display text-2xl font-semibold text-paper">
                {visibleModules.length}
              </div>
              <p className="mt-1 text-sm text-paper/58">Ditampilkan berdasarkan permission user saat ini.</p>
            </div>
            <div className="rounded-2xl border border-paper/10 bg-paper/7 px-4 py-4 backdrop-blur-sm">
              <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Current phase</div>
              <div className="mt-2 font-display text-2xl font-semibold text-paper">Day 2</div>
              <p className="mt-1 text-sm text-paper/58">Foundation siap sebelum modul operasional penuh dibangun.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]">
        <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_18px_50px_rgba(18,48,46,0.08)] backdrop-blur-sm sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl font-semibold text-ink">Preview modul yang siap dilanjutkan</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Tidak ada data palsu di sini. Ini adalah preview jujur atas area yang sudah siap
                dipasangi fitur fungsional pada Day 3.
              </p>
            </div>
            <div className="hidden rounded-full border border-signal/30 bg-signal/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-signal sm:inline-flex">
              Day 3 Ready
            </div>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {visibleModules.map((module) => {
              const Icon = module.icon

              return (
                <article
                  key={module.label}
                  className="group rounded-[24px] border border-slate-200 bg-paper p-5 transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className={`rounded-[20px] bg-gradient-to-br ${module.accent} p-4`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/80 text-ink shadow-sm">
                        <Icon size={20} />
                      </div>
                      <span className="rounded-full border border-ink/10 bg-white/65 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink/70">
                        Day 3
                      </span>
                    </div>
                    <h3 className="mt-5 font-display text-xl font-semibold text-ink">{module.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{module.description}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <section className="rounded-[28px] border border-white/70 bg-white/78 p-6 shadow-[0_18px_50px_rgba(18,48,46,0.08)] backdrop-blur-sm sm:p-7">
            <div className="inline-flex rounded-full border border-ink/10 bg-ink/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/70">
              Workstream
            </div>
            <h2 className="mt-4 font-display text-2xl font-semibold text-ink">Yang sudah siap hari ini</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-600">
              <li className="rounded-2xl border border-slate-200/80 bg-paper px-4 py-3">
                Routing publik dan protected route sudah terkonsolidasi.
              </li>
              <li className="rounded-2xl border border-slate-200/80 bg-paper px-4 py-3">
                API client, auth state, dan session bootstrap sudah siap dipakai modul berikutnya.
              </li>
              <li className="rounded-2xl border border-slate-200/80 bg-paper px-4 py-3">
                Sidebar sudah merespons permission user dan mobile drawer sudah tersedia.
              </li>
            </ul>
          </section>

          <section className="overflow-hidden rounded-[28px] border border-ink/8 bg-[linear-gradient(180deg,#f2ede1_0%,#f7f6f2_100%)] p-6 shadow-[0_18px_50px_rgba(18,48,46,0.08)] sm:p-7">
            <div className="text-[11px] uppercase tracking-[0.18em] text-ink/48">Next handoff</div>
            <h2 className="mt-3 font-display text-2xl font-semibold text-ink">Foundation ke fitur</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Begitu development Day 3 dimulai, modul seperti Supplier, Material, Product, dan
              Inventory tinggal masuk ke shell ini tanpa harus membuat ulang auth, layout, atau
              navigasi.
            </p>
            <div className="mt-5 rounded-2xl border border-signal/25 bg-white/70 px-4 py-3 text-sm text-ink">
              Fokus visual tetap konsisten dengan layar login: `ink`, `paper`, `canvas`, dan aksen
              `signal`.
            </div>
          </section>
        </div>
      </section>
      {visibleModules.length === 0 && (
        <div className="rounded-[24px] border border-slate-200 bg-white/80 px-5 py-6 text-sm text-slate-500 shadow-sm">
          Permission user saat ini belum membuka preview modul tambahan. Dashboard foundation tetap
          aktif dan siap menerima modul ketika permission tersedia.
        </div>
      )}
    </div>
  )
}
