/**
 * useIntroAnimation — encapsulates the boot-sequence typewriter animation.
 *
 * Converts the original JS intro logic:
 *   playIntro() → wheel layer classes + typed text + finishIntro()
 *
 * Returns:
 *   - introText:    currently displayed typed text
 *   - showCursor:  whether the blinking cursor is visible
 *   - phase:       which CSS layer classes are active on the intro element
 *   - stripeStep:  CSS --stripe-step custom property value (0–11)
 *   - isHidden:    whether the intro overlay should be hidden (CSS .hide)
 *   - skipIntro(): call to immediately end the intro
 */
import { useState, useEffect, useRef, useCallback } from 'react'

export type IntroPhase = {
  wheelLayer1: boolean
  wheelLayer2: boolean
  wheelLayer3: boolean
  wheelLayer4: boolean
  cardReady: boolean
  hidden: boolean
}

interface UseIntroAnimationReturn {
  introText: string
  phase: IntroPhase
  stripeStep: number
  skipIntro: () => void
}

const INTRO_LINES = ['Student 360°', 'Launch Intelligence'] as const
const TYPE_SPEED_MS = 72
const ERASE_SPEED_MS = 28
const HOLD_AFTER_TYPE_MS = 700
const FINISH_DELAY_MS = 450

export function useIntroAnimation(
  onFinish: () => void
): UseIntroAnimationReturn {
  const [introText, setIntroText] = useState('')
  const [stripeStep, setStripeStep] = useState(0)
  const [phase, setPhase] = useState<IntroPhase>({
    wheelLayer1: false,
    wheelLayer2: false,
    wheelLayer3: false,
    wheelLayer4: false,
    cardReady: false,
    hidden: false,
  })

  // Stable ref so timers/intervals can read the latest value without re-subscribing
  const skippedRef = useRef(false)
  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish

  const finishIntro = useCallback(() => {
    skippedRef.current = true
    setPhase((p) => ({ ...p, hidden: true }))
    onFinishRef.current()
  }, [])

  const skipIntro = useCallback(() => {
    finishIntro()
  }, [finishIntro])

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    // --- Typewriter helpers ---
    const typeLine = (text: string, done: () => void): (() => void) => {
      let charIndex = 0
      let timerId: ReturnType<typeof setTimeout>

      const step = () => {
        if (skippedRef.current) return
        if (charIndex <= text.length) {
          setIntroText(text.slice(0, charIndex))
          charIndex += 1
          timerId = setTimeout(step, TYPE_SPEED_MS)
        } else {
          done()
        }
      }

      timerId = setTimeout(step, TYPE_SPEED_MS)
      return () => clearTimeout(timerId)
    }

    const eraseLine = (text: string, done: () => void): (() => void) => {
      let charIndex = text.length
      let timerId: ReturnType<typeof setTimeout>

      const step = () => {
        if (skippedRef.current) return
        if (charIndex >= 0) {
          setIntroText(text.slice(0, charIndex))
          charIndex -= 1
          timerId = setTimeout(step, ERASE_SPEED_MS)
        } else {
          done()
        }
      }

      timerId = setTimeout(step, ERASE_SPEED_MS)
      return () => clearTimeout(timerId)
    }

    // --- Sequence runner ---
    let lineIndex = 0
    const cleanups: Array<() => void> = []

    const runSequence = () => {
      if (skippedRef.current) return
      if (lineIndex >= INTRO_LINES.length) {
        const t = setTimeout(finishIntro, FINISH_DELAY_MS)
        cleanups.push(() => clearTimeout(t))
        return
      }

      const line = INTRO_LINES[lineIndex]
      const cleanup = typeLine(line, () => {
        if (skippedRef.current) return
        const t = setTimeout(() => {
          if (skippedRef.current) return
          if (lineIndex < INTRO_LINES.length - 1) {
            const eraseCleanup = eraseLine(line, () => {
              lineIndex += 1
              runSequence()
            })
            cleanups.push(eraseCleanup)
          } else {
            lineIndex += 1
            runSequence()
          }
        }, HOLD_AFTER_TYPE_MS)
        cleanups.push(() => clearTimeout(t))
      })
      cleanups.push(cleanup)
    }

    if (prefersReduced) {
      // Skip animation, show text immediately
      setStripeStep(11)
      setPhase({
        wheelLayer1: true,
        wheelLayer2: true,
        wheelLayer3: true,
        wheelLayer4: true,
        cardReady: true,
        hidden: false,
      })
      runSequence()
      return () => cleanups.forEach((c) => c())
    }

    // --- Layered wheel reveal (mirrors original JS setTimeout chain) ---
    setPhase((p) => ({ ...p, wheelLayer1: true }))

    const t1 = setTimeout(() => {
      if (skippedRef.current) return
      setPhase((p) => ({ ...p, wheelLayer2: true }))

      const STRIPE_STEPS = 11
      const STRIPE_DELAY = 130
      let step = 0

      const stripeTimer = setInterval(() => {
        if (skippedRef.current) {
          clearInterval(stripeTimer)
          return
        }
        step += 1
        setStripeStep(step)

        if (step < STRIPE_STEPS) return
        clearInterval(stripeTimer)

        const t2 = setTimeout(() => {
          if (skippedRef.current) return
          setPhase((p) => ({ ...p, wheelLayer3: true }))

          const t3 = setTimeout(() => {
            if (skippedRef.current) return
            setPhase((p) => ({ ...p, wheelLayer4: true }))

            const t4 = setTimeout(() => {
              if (skippedRef.current) return
              setPhase((p) => ({ ...p, cardReady: true }))
              runSequence()
            }, 170)
            cleanups.push(() => clearTimeout(t4))
          }, 170)
          cleanups.push(() => clearTimeout(t3))
        }, 140)
        cleanups.push(() => clearTimeout(t2))
      }, STRIPE_DELAY)

      cleanups.push(() => clearInterval(stripeTimer))
    }, 170)

    cleanups.push(() => clearTimeout(t1))

    return () => {
      cleanups.forEach((c) => c())
    }
  }, [finishIntro])

  return { introText, phase, stripeStep, skipIntro }
}
