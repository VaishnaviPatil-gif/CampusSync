/**
 * IntroAnimation — boot sequence overlay.
 *
 * Pixel-perfect React port of the original <section class="intro"> markup.
 * All CSS class toggling is replaced by conditional className composition.
 * The --stripe-step CSS custom property is set via inline style on the root div.
 */
import type { IntroPhase } from '@/hooks/useIntroAnimation'
import styles from '@/pages/LandingPage.module.css'

interface IntroAnimationProps {
  introText: string
  phase: IntroPhase
  stripeStep: number
  onSkip: () => void
}

export default function IntroAnimation({
  introText,
  phase,
  stripeStep,
  onSkip,
}: IntroAnimationProps) {
  const introClasses = [
    styles.intro,
    phase.wheelLayer1 ? styles.wheelLayer1 : '',
    phase.wheelLayer2 ? styles.wheelLayer2 : '',
    phase.wheelLayer3 ? styles.wheelLayer3 : '',
    phase.wheelLayer4 ? styles.wheelLayer4 : '',
    phase.cardReady ? styles.cardReady : '',
    phase.hidden ? styles.introHide : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section
      className={introClasses}
      aria-label="Intro animation"
      aria-live="polite"
      style={{ '--stripe-step': stripeStep } as React.CSSProperties}
    >
      <div className={styles.introGear} aria-hidden="true" />
      <div className={styles.introBox}>
        <div className={styles.ring} aria-hidden="true" />
        <div className={styles.introCopy}>
          <p className={styles.introOverline}>Student Intelligence Boot Sequence</p>
          <h1 className={styles.introTitle} aria-live="polite">
            {introText}
            <span className={styles.introCursor} aria-hidden="true">|</span>
          </h1>
          <p className={styles.introHint}>
            A 360 view of success, risk, and well-being.
          </p>
        </div>
        <button
          className={styles.skip}
          type="button"
          onClick={onSkip}
          aria-label="Skip intro animation"
        >
          Skip
        </button>
      </div>
    </section>
  )
}
