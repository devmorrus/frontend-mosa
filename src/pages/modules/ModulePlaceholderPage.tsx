interface ModulePlaceholderPageProps {
  title: string
  description: string
}

/**
 * Day 2 foundation page for modules that are intentionally out of scope.
 * The route exists so navigation, permissions, layout, and responsive shell
 * can be verified now without pretending the real feature is implemented.
 */
export function ModulePlaceholderPage({
  title,
  description,
}: ModulePlaceholderPageProps) {
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{description}</p>

      <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-400">
        Halaman fungsional untuk modul ini akan mulai dikembangkan pada Day 3 di atas foundation
        yang sudah disiapkan.
      </div>
    </div>
  )
}
