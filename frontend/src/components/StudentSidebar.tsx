/**
 * StudentSidebar — the green sidebar with logo, student info, and navigation.
 *
 * Pixel-perfect React port of the original <aside class="sidebar"> markup.
 * Uses React Router's <Link> / useNavigate for navigation instead of plain <a> hrefs.
 * Uses useAuth().clearSession() for the Sign Out action.
 */
import { useNavigate, useLocation } from 'react-router-dom'
import styles from '@/pages/StudentDashboard.module.css'
import { useAuth } from '@/hooks/useAuth'

interface StudentSidebarProps {
  studentName: string
  college: string
  studentClass: string
  logoUrl: string
}

const NAV_ITEMS = [
  { label: 'Dashboard',        path: '/student' },
  { label: 'Attendance',       path: '/student/attendance' },
  { label: 'Mood Tracker',     path: '/student/mood' },
  { label: 'AI Support',       path: '/student/journal' },
  { label: 'Exercises',        path: '/student/exercises' },
  { label: 'Student Details',  path: '/student/details' },
] as const

export default function StudentSidebar({
  studentName,
  college,
  studentClass,
  logoUrl,
}: StudentSidebarProps) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const { clearSession } = useAuth()

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    clearSession()
    // Small delay to match original setTimeout 100ms behaviour
    setTimeout(() => navigate('/'), 100)
  }

  return (
    <aside className={styles.sidebar}>
      {/* Brand / logo */}
      <div className={styles.brand}>
        <img
          className={styles.brandImg}
          src={logoUrl}
          alt="College logo"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = '/src/assets/images/logo.png'
          }}
        />
        <h1 className={styles.brandTitle}>Student360</h1>
      </div>

      {/* Student info card */}
      <div className={styles.studentCard}>
        <p className={styles.studentCardLabel}>Student</p>
        <h2 className={styles.studentCardName}>{studentName}</h2>
        <p className={styles.studentCardLabel}>College: {college}</p>
        <p className={styles.studentCardLabel}>Class: {studentClass}</p>
      </div>

      {/* Navigation menu */}
      <ul className={styles.menu}>
        {NAV_ITEMS.map(({ label, path }) => (
          <li key={path}>
            <button
              type="button"
              className={`${styles.menuLink} ${location.pathname === path ? styles.menuLinkActive : ''}`}
              onClick={() => navigate(path)}
              aria-current={location.pathname === path ? 'page' : undefined}
            >
              {label}
            </button>
          </li>
        ))}
        <li>
          <button
            type="button"
            className={styles.menuLink}
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </li>
      </ul>
    </aside>
  )
}
