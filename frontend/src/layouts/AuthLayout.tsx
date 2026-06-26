/**
 * AuthLayout — centered card wrapper for the landing / login page.
 *
 * Mirrors the dark, space-inspired background from the original index.html.
 * Used in Phase 2 when LandingPage.html is converted to React.
 */
import type { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: `
        radial-gradient(circle at 20% 50%, rgba(0,102,255,0.15), transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(0,217,255,0.1), transparent 40%),
        linear-gradient(125deg, var(--landing-bg-1) 0%, var(--landing-bg-2) 52%, var(--landing-bg-3) 100%)
      `,
      color: 'var(--landing-text-main)',
      fontFamily: 'var(--font-body)',
      overflowX: 'hidden',
    }}>
      {children}
    </div>
  )
}
