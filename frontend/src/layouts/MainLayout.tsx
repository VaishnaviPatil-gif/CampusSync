/**
 * MainLayout — sidebar + main content grid wrapper for dashboard pages.
 *
 * Mirrors the `grid-template-columns: 280px 1fr` layout shared by all
 * dashboard pages (student.html, teacher.html, parent.html, etc.).
 * Accepts optional sidebar content and main content as separate slots.
 *
 * Used in Phase 2 when dashboard HTML pages are converted to React.
 */
import type { ReactNode } from 'react'

interface MainLayoutProps {
  sidebar: ReactNode
  children: ReactNode
}

export default function MainLayout({ sidebar, children }: MainLayoutProps) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '280px 1fr',
      fontFamily: 'var(--font-dashboard)',
      color: 'var(--dash-text-main)',
      background: '#ffffff',
    }}>
      <aside style={{
        background: `linear-gradient(160deg, var(--dash-sidebar-1), var(--dash-sidebar-2))`,
        borderRight: '1px solid rgba(17,84,41,0.25)',
        padding: '24px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '22px',
        color: '#f8fff9',
      }}>
        {sidebar}
      </aside>

      <main style={{ overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
