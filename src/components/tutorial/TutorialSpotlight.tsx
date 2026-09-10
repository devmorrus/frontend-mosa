import { useEffect, useRef, useState } from 'react'

interface SpotlightRect {
  top: number
  left: number
  width: number
  height: number
}

interface TutorialSpotlightProps {
  targetSelector: string
  targetFallback?: string
  onTargetFound?: (element: HTMLElement | null) => void
}

export function TutorialSpotlight({
  targetSelector,
  targetFallback,
  onTargetFound,
}: TutorialSpotlightProps) {
  const [rect, setRect] = useState<SpotlightRect | null>(null)
  const onTargetFoundRef = useRef(onTargetFound)

  useEffect(() => {
    onTargetFoundRef.current = onTargetFound
  }, [onTargetFound])

  useEffect(() => {
    let animationFrameId: number

    const updatePosition = () => {
      let el = document.querySelector<HTMLElement>(targetSelector)
      const targetBounds = el?.getBoundingClientRect()
      if ((!el || !targetBounds || targetBounds.width === 0 || targetBounds.height === 0) && targetFallback) {
        el = document.querySelector<HTMLElement>(targetFallback)
      }

      onTargetFoundRef.current?.(el)

      if (el) {
        const bounds = el.getBoundingClientRect()
        // Add 6px padding around target
        const padding = 6
        const newRect: SpotlightRect = {
          top: bounds.top - padding + window.scrollY,
          left: bounds.left - padding + window.scrollX,
          width: bounds.width + padding * 2,
          height: bounds.height + padding * 2,
        }

        setRect(newRect)
      } else {
        setRect(null)
      }
    }

    updatePosition()

    const handleResizeOrScroll = () => {
      animationFrameId = requestAnimationFrame(updatePosition)
    }

    window.addEventListener('resize', handleResizeOrScroll, { passive: true })
    window.addEventListener('scroll', handleResizeOrScroll, { passive: true })

    const observer = new ResizeObserver(updatePosition)
    const observedElement = document.querySelector<HTMLElement>(targetSelector) ??
      (targetFallback ? document.querySelector<HTMLElement>(targetFallback) : null)
    if (observedElement) observer.observe(observedElement)

    return () => {
      window.removeEventListener('resize', handleResizeOrScroll)
      window.removeEventListener('scroll', handleResizeOrScroll)
      cancelAnimationFrame(animationFrameId)
      observer.disconnect()
    }
  }, [targetSelector, targetFallback])

  if (!rect) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {/* Target spotlight ring animation */}
      <div
        className="absolute rounded-xl transition-all duration-300 ease-out border-2 border-signal shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] ring-4 ring-signal/30 animate-pulse"
        style={{
          top: `${rect.top - window.scrollY}px`,
          left: `${rect.left - window.scrollX}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
        }}
      />
    </div>
  )
}
