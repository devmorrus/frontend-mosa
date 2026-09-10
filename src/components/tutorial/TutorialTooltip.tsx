import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, RotateCcw, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface TutorialTooltipProps {
  stepNumber: number
  totalSteps: number
  title: string
  instruction: string
  type: 'INFO' | 'ACTION'
  targetSelector: string
  targetFallback?: string
  isActionValid: boolean
  canSkip?: boolean
  tutorialTitle?: string
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  onClose: () => void
  onRestart?: () => void
}

export function TutorialTooltip({
  stepNumber,
  totalSteps,
  title,
  instruction,
  type,
  targetSelector,
  targetFallback,
  isActionValid,
  canSkip = true,
  tutorialTitle,
  onNext,
  onBack,
  onSkip,
  onClose,
  onRestart,
}: TutorialTooltipProps) {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: 60,
  })

  useEffect(() => {
    const updateTooltipPosition = () => {
      let el = document.querySelector<HTMLElement>(targetSelector)
      const targetBounds = el?.getBoundingClientRect()
      // Generic fallback (Tasking 5): use configured targetFallback before giving up.
      if ((!el || !targetBounds || targetBounds.width === 0 || targetBounds.height === 0) && targetFallback) {
        el = document.querySelector<HTMLElement>(targetFallback)
      }
      if (!el) {
        // Center-bottom fallback if element not found or mobile screen
        setStyle({
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: 'calc(100vw - 32px)',
          zIndex: 60,
        })
        return
      }

      const rect = el.getBoundingClientRect()
      const isMobile = window.innerWidth < 640

      if (isMobile) {
        setStyle({
          position: 'fixed',
          bottom: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          maxWidth: 'calc(100vw - 24px)',
          zIndex: 60,
        })
        return
      }

      // Desktop placement logic
      const tooltipWidth = 360
      const tooltipHeight = 220
      const padding = 16

      let top = rect.bottom + padding
      let left = rect.left

      // If tooltip overflows bottom of viewport, put it above target
      if (top + tooltipHeight > window.innerHeight) {
        top = rect.top - tooltipHeight - padding
      }

      // If tooltip overflows right of viewport, adjust left
      if (left + tooltipWidth > window.innerWidth) {
        left = window.innerWidth - tooltipWidth - padding
      }

      // Clamp left to avoid going off left edge
      if (left < padding) {
        left = padding
      }

      // Clamp top to avoid going off top edge
      if (top < padding) {
        top = padding
      }

      setStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${tooltipWidth}px`,
        zIndex: 60,
      })
    }

    updateTooltipPosition()
    window.addEventListener('resize', updateTooltipPosition)
    window.addEventListener('scroll', updateTooltipPosition)

    return () => {
      window.removeEventListener('resize', updateTooltipPosition)
      window.removeEventListener('scroll', updateTooltipPosition)
    }
  }, [targetSelector, targetFallback])

  const isFirstStep = stepNumber === 1
  const isLastStep = stepNumber === totalSteps

  return (
    <div
      style={style}
      className="w-full max-w-sm rounded-2xl border border-paper/15 bg-ink p-5 shadow-2xl backdrop-blur-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-paper/10 pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="subtle" className="bg-signal/20 text-signal font-semibold">
            Step {stepNumber} of {totalSteps}
          </Badge>
          {type === 'ACTION' && (
            <Badge variant="subtle" className="bg-amber-500/20 text-amber-400 font-semibold text-[10px]">
              Tindakan Diperlukan
            </Badge>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1 text-paper/40 transition-colors hover:bg-paper/10 hover:text-paper"
          aria-label="Tutup tutorial"
        >
          <X size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="py-3.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="subtle" className="bg-signal/20 text-signal font-bold text-[10px] uppercase tracking-wide">
            Mode Tutorial — bukan Live
          </Badge>
          {tutorialTitle ? (
            <span className="max-w-full truncate text-[11px] font-medium text-paper/50" title={tutorialTitle}>
              {tutorialTitle}
            </span>
          ) : null}
        </div>
        <h4 className="mt-2 font-display text-base font-semibold text-paper">{title}</h4>
        <p className="mt-1.5 text-xs leading-relaxed text-paper/70">{instruction}</p>
        {type === 'ACTION' && !isActionValid && (
          <p className="mt-2 text-[11px] font-medium text-amber-400">
            🔒 Selesaikan tindakan di atas untuk melanjutkan ke langkah berikutnya.
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1 w-full overflow-hidden rounded-full bg-paper/10">
        <div
          className="h-full bg-signal transition-all duration-300"
          style={{ width: `${(stepNumber / totalSteps) * 100}%` }}
        />
      </div>

      {/* Footer Navigation */}
      <div className="flex items-center justify-between gap-2">
        <div>
          {canSkip && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSkip}
              className="text-xs text-paper/50 hover:bg-paper/10 hover:text-paper px-2"
            >
              Skip Tutorial
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onRestart ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRestart}
              title="Ulangi tutorial dari awal"
              aria-label="Ulangi tutorial dari awal"
              className="h-8 text-xs px-2 text-paper/50 hover:bg-paper/10 hover:text-paper"
            >
              <RotateCcw size={14} className="mr-1" /> Restart
            </Button>
          ) : null}
          {!isFirstStep && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onBack}
              className="h-8 text-xs px-3"
            >
              <ArrowLeft size={14} className="mr-1" /> Back
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={onNext}
            disabled={type === 'ACTION' && !isActionValid}
            className="h-8 text-xs px-3 bg-signal text-paper hover:bg-signal/90 font-medium"
          >
            {isLastStep ? 'Selesai' : 'Next'} <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  )
}
