/**
 * LandingPage — production React + TypeScript port of LandingPage.html.
 *
 * Architecture:
 *   LandingPage             ← owns view state (showcase | auth) + intro state
 *     ├── IntroAnimation    ← boot sequence overlay (gear + typewriter)
 *     ├── ShowcasePage      ← marketing/overview page (default view)
 *     └── AuthPage          ← login form + hero panel
 *
 * CSS: LandingPage.module.css (full extraction of original inline <style>)
 * Hooks:
 *   useIntroAnimation  → typewriter + gear layer phases
 *   useWorkflowAnimation → used inside ShowcasePage
 *
 * Navigation:
 *   useNavigate() from react-router-dom replaces window.location.href
 */
import { useState, useEffect } from 'react'
import styles from './LandingPage.module.css'
import IntroAnimation from '@/components/IntroAnimation'
import ShowcasePage from '@/components/ShowcasePage'
import AuthPage from '@/components/AuthPage'
import { useIntroAnimation } from '@/hooks/useIntroAnimation'

type ActiveView = 'showcase' | 'auth'

export default function LandingPage() {
  const [view, setView] = useState<ActiveView>('showcase')
  const [preselectedRole, setPreselectedRole] = useState('')
  const [introFinished, setIntroFinished] = useState(false)

  // Boot sequence animation — runs once on mount
  const { introText, phase, stripeStep, skipIntro } = useIntroAnimation(() => {
    setIntroFinished(true)
  })

  // Lock body scroll while intro plays (mirrors body.classList.add('intro-lock'))
  useEffect(() => {
    if (!introFinished) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [introFinished])

  // Scroll to top on view change (mirrors original window.scrollTo)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [view])

  const handleNavigateToAuth = (role = '') => {
    setPreselectedRole(role)
    setView('auth')
  }

  const handleBackToOverview = () => {
    setView('showcase')
  }

  const rootClasses = [
    styles.root,
    !introFinished ? styles.introLock : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={rootClasses}>
      {/* Fixed background decoration layers */}
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.noise} aria-hidden="true" />

      {/* Intro boot sequence overlay */}
      <IntroAnimation
        introText={introText}
        phase={phase}
        stripeStep={stripeStep}
        onSkip={skipIntro}
      />

      {/* Showcase / marketing overview */}
      <ShowcasePage
        isActive={view === 'showcase'}
        onNavigateToAuth={handleNavigateToAuth}
      />

      {/* Auth / login form */}
      <AuthPage
        isActive={view === 'auth'}
        preselectedRole={preselectedRole}
        onBack={handleBackToOverview}
      />
    </div>
  )
}
