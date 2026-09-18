import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Breadcrumb } from '@/components/common/Breadcrumb'
import type { BreadcrumbItem } from '@/routes/canonicalRoutes'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description?: string
  breadcrumb?: BreadcrumbItem[]
  backTo?: string
  backLabel?: string
  statusBlock?: ReactNode
  actions?: ReactNode
}

/**
 * Layout page standar Tasking 4: breadcrumb + title + subtitle +
 * primary/secondary action + status block. Dipakai di semua page utama.
 */
export function PageHeader({
  eyebrow,
  title,
  description,
  breadcrumb,
  backTo,
  backLabel,
  statusBlock,
  actions,
}: PageHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[30px] border border-ink/8 bg-ink px-6 py-7 text-paper shadow-[0_24px_80px_rgba(6,59,140,0.16)] sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,201,40,0.22),transparent_55%)]" />
      <div className="relative space-y-4">
        {breadcrumb ? <div className="[&_a]:text-paper/70 [&_span]:text-paper/60 [&_[aria-current='page']]:text-paper"><Breadcrumb items={breadcrumb} /></div> : null}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            {backTo ? (
              <Button asChild variant="ghost" className="-ml-3 h-auto px-3 py-2 text-paper hover:text-paper">
                <Link to={backTo}>
                  <ArrowLeft size={16} />
                  {backLabel ?? 'Kembali'}
                </Link>
              </Button>
            ) : null}
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-paper/10 bg-paper/6 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-paper/72">
              {eyebrow}
            </div>
            <h1 className="mt-5 font-display text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 max-w-xl text-sm leading-7 text-paper/68 sm:text-base">{description}</p>
            ) : null}
            {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
          </div>
          {statusBlock ? (
            <Card className="rounded-[24px] border-paper/10 bg-paper/7 text-paper shadow-none">
              <CardContent className="space-y-2 p-5 text-sm">{statusBlock}</CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </section>
  )
}
