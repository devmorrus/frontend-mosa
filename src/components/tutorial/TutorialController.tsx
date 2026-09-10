import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { useTutorialStore } from '@/stores/tutorialStore'
import { tutorialRegistry } from '@/config/tutorials'
import { syncTutorialProgressBestEffort, tutorialsApi } from '@/api/tutorials.api'
import { TutorialSpotlight } from './TutorialSpotlight'
import { TutorialTooltip } from './TutorialTooltip'

export function TutorialController() {
  const location = useLocation()
  const navigate = useNavigate()

  const {
    activeTutorialId,
    currentStepIndex,
    isActionValid,
    nextStep,
    previousStep,
    skipTutorial,
    closeTutorial,
    setStepValid,
  } = useTutorialStore()

  const [targetFound, setTargetFound] = useState<boolean>(true)

  const activeTutorial = activeTutorialId ? tutorialRegistry[activeTutorialId] : null
  const rawStep = activeTutorial?.steps[currentStepIndex]
  // Fail-safe (Tasking 5): critical steps are never ACTION — treat as INFO.
  const currentStep = useMemo(
    () => rawStep && rawStep.critical && rawStep.type === 'ACTION'
      ? { ...rawStep, type: 'INFO' as const }
      : rawStep,
    [rawStep],
  )
  const totalSteps = activeTutorial?.steps.length ?? 0

  // ── Backend progress sync (best-effort, localStorage stays primary) ──
  useEffect(() => {
    if (!activeTutorialId || !activeTutorial) return
    syncTutorialProgressBestEffort(
      tutorialsApi.start(activeTutorialId, totalSteps).catch(() => undefined),
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTutorialId])

  // ── Auto Navigation & Route Awareness ──────────────────────────────────────
  useEffect(() => {
    if (!currentStep) return

    if (currentStep.route && location.pathname !== currentStep.route) {
      // Navigate to expected route for step if not already there
      navigate(currentStep.route)
    }
  }, [currentStep, location.pathname, navigate])

  // ── Action Listener & Required Action Validation ─────────────────────────────
  useEffect(() => {
    if (!currentStep) return

    if (currentStep.type === 'INFO') {
      setStepValid(true)
      return
    }

    if (currentStep.type === 'ACTION' && currentStep.requiredAction) {
      const actionConfig = currentStep.requiredAction
      const targetEl = document.querySelector<HTMLElement>(
        actionConfig.elementSelector || currentStep.targetSelector,
      )

      // Initial validation check
      const checkValid = () => {
        if (actionConfig.validate) {
          return actionConfig.validate()
        }
        return true
      }

      setStepValid(checkValid())

      if (!targetEl) return

      const handleUserInteraction = () => {
        setTimeout(() => {
          setStepValid(checkValid())
        }, 100)
      }

      targetEl.addEventListener('click', handleUserInteraction)
      targetEl.addEventListener('change', handleUserInteraction)
      targetEl.addEventListener('input', handleUserInteraction)
      targetEl.addEventListener('submit', handleUserInteraction)

      // Search steps render their result asynchronously, so re-check after the DOM changes.
      const observer = new MutationObserver(handleUserInteraction)
      const contentRoot = document.querySelector('main')
      if (contentRoot) observer.observe(contentRoot, { childList: true, subtree: true })

      return () => {
        targetEl.removeEventListener('click', handleUserInteraction)
        targetEl.removeEventListener('change', handleUserInteraction)
        targetEl.removeEventListener('input', handleUserInteraction)
        targetEl.removeEventListener('submit', handleUserInteraction)
        observer.disconnect()
      }
    }
  }, [currentStep, setStepValid, location.pathname])

  if (!activeTutorial || !currentStep) return null

  return (
    <>
      {/* Target Not Found Warning Alert */}
      {!targetFound && (
        <div className="fixed top-24 right-6 z-50 flex max-w-md items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-950/90 p-4 text-amber-200 shadow-xl backdrop-blur-md">
          <AlertCircle size={20} className="shrink-0 text-amber-400" />
          <div className="text-xs leading-relaxed">
            Langkah tutorial belum dapat ditampilkan pada halaman ini. Muat ulang halaman atau mulai
            kembali tutorial.
          </div>
        </div>
      )}

      {/* Spotlight Overlay */}
      <TutorialSpotlight
        targetSelector={currentStep.targetSelector}
        targetFallback={currentStep.targetFallback}
        onTargetFound={(el) => setTargetFound(Boolean(el))}
      />

      {/* Tooltip Instruction Card */}
      <TutorialTooltip
        stepNumber={currentStep.stepNumber}
        totalSteps={totalSteps}
        title={currentStep.title}
        instruction={currentStep.instruction}
        type={currentStep.type}
        targetSelector={currentStep.targetSelector}
        targetFallback={currentStep.targetFallback}
        isActionValid={isActionValid}
        canSkip={currentStep.canSkip !== false}
        onNext={() => {
          if (activeTutorialId) {
            const nextIndex = currentStepIndex + 1
            if (nextIndex < totalSteps) {
              syncTutorialProgressBestEffort(
                tutorialsApi.advance(activeTutorialId, nextIndex).catch(() => undefined),
              )
            } else {
              syncTutorialProgressBestEffort(
                tutorialsApi.complete(activeTutorialId).catch(() => undefined),
              )
            }
          }
          nextStep(totalSteps)
        }}
        onBack={previousStep}
        onSkip={() => {
          if (activeTutorialId) {
            syncTutorialProgressBestEffort(
              tutorialsApi.skip(activeTutorialId).catch(() => undefined),
            )
          }
          skipTutorial()
        }}
        onClose={closeTutorial}
      />
    </>
  )
}
