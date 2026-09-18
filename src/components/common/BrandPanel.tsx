interface PipelineNode {
  code: string
  label: string
}

const PIPELINE: PipelineNode[] = [
  { code: 'SUP', label: 'Supplier' },
  { code: 'MAT', label: 'Material' },
  { code: 'PROD', label: 'Production' },
  { code: 'QC', label: 'Quality Control' },
  { code: 'DIST', label: 'Distribution' },
]

/**
 * Left-hand panel for auth screens. The vertical pipeline is not
 * decoration — it's literally MOSA's operating model (Supplier → Material
 * → Production → QC → Distribution), with the QC checkpoint highlighted
 * since that's the gate everything else passes through.
 */
export function BrandPanel() {
  return (
    <div className="relative hidden min-h-dvh w-[50%] shrink-0 flex-col justify-between overflow-hidden bg-ink px-12 py-12 text-paper lg:flex xl:px-16 xl:py-16">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_left,rgba(255,201,40,0.24),transparent_60%)]" />
      <div className="pointer-events-none absolute -bottom-24 left-10 h-56 w-56 rounded-full bg-signal/10 blur-3xl" />

      <div className="relative space-y-5">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full bg-signal" />
          <span className="font-display text-sm font-semibold tracking-[0.26em] text-paper">
            MOSA
          </span>
        </div>

        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-paper/15 bg-paper/6 px-3 py-1.5 text-[11px] font-medium tracking-[0.18em] text-paper/70 uppercase backdrop-blur-sm">
          Production Visibility
        </div>
      </div>

      <div className="relative">
        <h2 className="max-w-sm font-display text-[2rem] font-semibold leading-[1.2] text-paper xl:text-[2.4rem]">
          Satu alur yang rapi, dari pemasok hingga produk siap distribusi.
        </h2>
        <p className="mt-4 max-w-md text-sm leading-7 text-paper/68 xl:text-[15px]">
          MOSA membantu tim produksi memantau material, proses, dan checkpoint kualitas
          dalam satu sistem operasional yang konsisten.
        </p>

        <ol className="mt-12 flex flex-col gap-6">
          {PIPELINE.map((node, index) => {
            const isCheckpoint = node.code === 'QC'
            const isLast = index === PIPELINE.length - 1

            return (
              <li key={node.code} className="relative flex items-center gap-4">
                {!isLast && (
                  <span
                    aria-hidden
                    className="absolute left-[15px] top-8 h-6 w-px bg-ink-line"
                  />
                )}
                <span
                  className={[
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]',
                    isCheckpoint
                      ? 'border-signal bg-signal/15 text-signal shadow-[0_0_0_6px_rgba(255,201,40,0.08)]'
                      : 'border-ink-line bg-paper/6 text-paper/70',
                  ].join(' ')}
                >
                  {node.code}
                </span>
                <span
                  className={[
                    'text-sm',
                    isCheckpoint ? 'font-medium text-paper' : 'text-paper/60',
                  ].join(' ')}
                >
                  {node.label}
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="relative flex items-end justify-between gap-6">
        <p className="max-w-xs text-xs leading-relaxed text-paper/45">
          Sistem operasional produksi MOSA melacak setiap bahan dari pemasok sampai produk lolos
          kontrol kualitas.
        </p>
        <div className="rounded-2xl border border-paper/10 bg-paper/6 px-4 py-3 backdrop-blur-sm">
          <div className="text-[11px] uppercase tracking-[0.18em] text-paper/45">Focus area</div>
          <div className="mt-1 font-display text-lg font-semibold text-paper">Quality Control</div>
        </div>
      </div>
    </div>
  )
}
