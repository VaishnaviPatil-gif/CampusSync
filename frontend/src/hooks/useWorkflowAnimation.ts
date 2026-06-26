/**
 * useWorkflowAnimation — cycles through workflow stages every 1500ms.
 *
 * Converts the original startWorkflowAnimation() JS function.
 * Returns the index of the currently active workflow stage (0–4)
 * and the progress bar fill percentage.
 */
import { useState, useEffect } from 'react'

const STAGE_COUNT = 5
const CYCLE_INTERVAL_MS = 1500

interface UseWorkflowAnimationReturn {
  activeIndex: number
  progressPercent: number
}

export function useWorkflowAnimation(): UseWorkflowAnimationReturn {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (prefersReduced) {
      // Just show first stage when motion is reduced
      setActiveIndex(0)
      return
    }

    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % STAGE_COUNT)
    }, CYCLE_INTERVAL_MS)

    return () => clearInterval(id)
  }, [])

  const progressPercent = ((activeIndex + 1) / STAGE_COUNT) * 100

  return { activeIndex, progressPercent }
}
