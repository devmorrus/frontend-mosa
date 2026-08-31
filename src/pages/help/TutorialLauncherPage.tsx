import { useState } from 'react'
import { BookOpen, CheckCircle, Play, RotateCcw, Sparkles } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTutorialStore } from '@/stores/tutorialStore'
import { getAvailableTutorials } from '@/config/tutorials'
import type { TutorialDefinition, TutorialState } from '@/types/tutorial'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function TutorialLauncherPage() {
  const { user } = useAuth()
  const permissions = user?.permissions ?? []
  const roles = user?.roles ?? []

  const availableTutorials = getAvailableTutorials(permissions, roles)
  const { progressRecord, startTutorial, restartTutorial } = useTutorialStore()

  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const categories = [
    { id: 'all', label: 'Semua Tutorial' },
    { id: 'general', label: 'Pengenalan' },
    { id: 'master-data', label: 'Master Data' },
    { id: 'warehouse', label: 'Warehouse' },
    { id: 'production', label: 'Production' },
  ]

  const filteredTutorials =
    categoryFilter === 'all'
      ? availableTutorials
      : availableTutorials.filter((t) => t.category === categoryFilter)

  function getStatusBadge(status?: TutorialState) {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30">
            <CheckCircle size={12} className="mr-1" /> Selesai
          </Badge>
        )
      case 'IN_PROGRESS':
        return (
          <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30">
            <Sparkles size={12} className="mr-1" /> Sedang Berjalan
          </Badge>
        )
      case 'SKIPPED':
        return (
          <Badge variant="subtle" className="text-slate-500">
            Dilewati
          </Badge>
        )
      default:
        return (
          <Badge variant="subtle" className="text-slate-600">
            Belum Dimulai
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl border border-slate-200/80 bg-paper p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="subtle" className="bg-signal/15 text-signal font-semibold">
                Interactive Onboarding
              </Badge>
            </div>
            <h1 className="mt-2 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              Tutorial & Panduan Operasional MOSA
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              Pelajari alur kerja aplikasi secara langsung di layar dengan instruksi interaktif step-by-step
              sesuai role dan hak akses Anda.
            </p>
          </div>
          <div className="flex shrink-0 items-center justify-center rounded-2xl bg-signal/10 p-4 text-signal">
            <BookOpen size={40} />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-medium transition-colors ${
                categoryFilter === cat.id
                  ? 'bg-ink text-paper shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tutorial Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTutorials.map((tutorial: TutorialDefinition) => {
          const progress = progressRecord[tutorial.id]
          const status = progress?.status
          const currentStep = (progress?.currentStepIndex ?? 0) + 1
          const totalSteps = tutorial.steps.length

          return (
            <Card
              key={tutorial.id}
              className="flex flex-col justify-between border-slate-200/80 bg-paper transition-shadow hover:shadow-md"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="subtle" className="capitalize text-[11px]">
                    {tutorial.category.replace('-', ' ')}
                  </Badge>
                  {getStatusBadge(status)}
                </div>
                <CardTitle className="font-display text-lg font-semibold text-ink">
                  {tutorial.title}
                </CardTitle>
                <CardDescription className="text-xs leading-relaxed text-slate-500">
                  {tutorial.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Step indicator */}
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                  <span>Total Langkah</span>
                  <span className="font-semibold text-slate-800">
                    {status === 'IN_PROGRESS' ? `Step ${currentStep} of ${totalSteps}` : `${totalSteps} Langkah`}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {status === 'IN_PROGRESS' ? (
                    <Button
                      type="button"
                      className="w-full bg-signal text-paper hover:bg-signal/90"
                      size="sm"
                      onClick={() => startTutorial(tutorial.id, false)}
                    >
                      <Play size={14} className="mr-1.5" /> Lanjutkan Tutorial
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      className="w-full bg-ink text-paper hover:bg-ink/90"
                      size="sm"
                      onClick={() => startTutorial(tutorial.id, true)}
                    >
                      <Play size={14} className="mr-1.5" /> Mulai Tutorial
                    </Button>
                  )}

                  {(status === 'COMPLETED' || status === 'SKIPPED' || status === 'IN_PROGRESS') && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      title="Ulangi dari Awal"
                      onClick={() => restartTutorial(tutorial.id)}
                    >
                      <RotateCcw size={15} />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredTutorials.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
          Tidak ada tutorial yang tersedia untuk kategori ini.
        </div>
      )}
    </div>
  )
}
