import type { ReactNode } from 'react'

export interface ModuleHeroMetric {
  label: string
  value: ReactNode
  sub?: string
  tone?: 'default' | 'success' | 'muted'
  title?: string
}

interface ModuleHeroProps {
  eyebrow: string
  title: string
  description?: string
  icon?: ReactNode
  metrics?: ModuleHeroMetric[]
  actions?: ReactNode
  side?: ReactNode
  bottom?: ReactNode
  dataTour?: string
}

function metricValueClass(tone: ModuleHeroMetric['tone']) {
  if (tone === 'success') return 'text-emerald-200'
  if (tone === 'muted') return 'text-paper/70'
  return 'text-paper'
}

function metricsGridClass(count: number) {
  if (count <= 1) return 'grid grid-cols-1 gap-2 sm:gap-3 lg:w-[200px]'
  if (count === 2) return 'grid grid-cols-2 gap-2 sm:gap-3 lg:w-[280px]'
  if (count === 3) return 'grid grid-cols-3 gap-2 sm:gap-3 lg:w-[340px]'
  return 'grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:w-[480px]'
}

/**
 * Hero biru standar modul, konsisten dengan Master Data.
 * Dipakai semua submenu Warehouse agar section hero tidak lagi putih.
 */
export function ModuleHero({
  eyebrow,
  title,
  description,
  icon,
  metrics,
  actions,
  side,
  bottom,
  dataTour,
}: ModuleHeroProps) {
  const showRight = Boolean(side ?? (metrics && metrics.length > 0))

  return (
    <section
      data-tour={dataTour}
      className="relative overflow-hidden rounded-[24px] border border-ink/10 bg-[linear-gradient(135deg,#062f75_0%,#0647a6_55%,#0b5ed7_100%)] px-5 py-5 text-paper shadow-[0_18px_50px_rgba(6,59,140,0.18)] sm:px-6 sm:py-6"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      <div className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full bg-signal/25 blur-3xl" />
      <div className={`relative grid gap-5 ${showRight ? 'lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center' : ''}`}>
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-paper/80">
            {icon}
            {eyebrow}
          </div>
          <h1 className="mt-3 font-display text-2xl font-semibold leading-snug text-paper sm:text-3xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-paper/70">{description}</p>
          ) : null}
          {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
        </div>

        {side ? (
          <div className="min-w-0">{side}</div>
        ) : metrics && metrics.length > 0 ? (
          <div className={metricsGridClass(metrics.length)}>
            {metrics.map((metric) => (
              <div
                key={metric.label}
                title={metric.title}
                className="rounded-xl border border-paper/10 bg-paper/10 px-3 py-2.5 backdrop-blur-sm"
              >
                <div className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-paper/55">
                  {metric.label}
                </div>
                <div
                  className={`mt-1 font-display text-2xl font-semibold leading-none ${metricValueClass(metric.tone)}`}
                >
                  {metric.value}
                </div>
                {metric.sub ? (
                  <div className="mt-1.5 truncate text-xs text-paper/60">{metric.sub}</div>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}
      </div>
      {bottom ? <div className="relative mt-5">{bottom}</div> : null}
    </section>
  )
}
