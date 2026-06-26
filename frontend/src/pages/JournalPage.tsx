import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './JournalPage.module.css'
import { useAuth } from '@/hooks/useAuth'
import { useCollegeTheme, resolveCollegeName } from '@/hooks/useCollegeTheme'
import DashboardLayout from '@/components/DashboardLayout'
import Sidebar, { SidebarNavItem } from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

const NAV_ITEMS: readonly SidebarNavItem[] = [
  { label: 'Dashboard', path: '/student' },
  { label: 'Attendance', path: '/student/attendance' },
  { label: 'Mood Tracker', path: '/student/mood' },
  { label: 'AI Support', path: '/student/journal' },
  { label: 'Exercises', path: '/student/exercises' },
  { label: 'Student Details', path: '/student/details' },
]

export default function JournalPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuth()

  // Guard: redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const rawCollege = searchParams.get('college') ?? user?.college ?? 'BRECW'
  const college = resolveCollegeName(rawCollege)
  const { logoUrl, theme } = useCollegeTheme(college)

  const studentName = user?.fullName ?? 'Reya Student'
  const firstName = studentName.split(' ')[0]
  const studentClass = user?.assignedClass ?? 'CSE-A'

  // Load Chatbase embed widget
  useEffect(() => {
    const win = window as unknown as {
      chatbase?: ((...args: unknown[]) => void) & { q?: unknown[] }
    }

    if (!win.chatbase) {
      const handler = (...args: unknown[]) => {
        if (!win.chatbase) return
        if (!win.chatbase.q) {
          win.chatbase.q = []
        }
        win.chatbase.q.push(args)
      }
      handler.q = [] as unknown[]
      win.chatbase = handler

      win.chatbase = new Proxy(win.chatbase, {
        get(target, prop) {
          if (prop === 'q') {
            return target.q
          }
          return (...args: unknown[]) => target(prop, ...args)
        },
      })
    }

    const scriptId = 'chatbase-embed-script'
    let script = document.getElementById(scriptId) as HTMLScriptElement | null

    if (!script) {
      script = document.createElement('script')
      script.src = 'https://www.chatbase.co/embed.min.js'
      script.id = scriptId
      script.setAttribute('domain', 'www.chatbase.co')
      script.setAttribute('chatbotId', 'lpjwddBIh1A40GzeR7Hc9')
      document.body.appendChild(script)
    }

    return () => {
      // Clean up script on unmount
      if (script && document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  if (!isAuthenticated) return null

  const sidebar = (
    <Sidebar
      logoUrl={logoUrl}
      userName={studentName}
      roleLabel="Student"
      college={college}
      extraLabels={[`Class: ${studentClass}`]}
      navItems={NAV_ITEMS}
    />
  )

  const topbar = (
    <Topbar
      title={`Welcome back, ${firstName}`}
      subtitle="Reflect on your day and capture your thoughts"
      userName={studentName}
      themeColor={theme.sidebarA}
      showNotificationAndAvatar={true}
    />
  )

  return (
    <DashboardLayout college={college} sidebar={sidebar} topbar={topbar}>
      <section className={`${styles.panel} ${styles.chatPanel}`}>
        <h2>SARTHI - AI Support</h2>
        <iframe
          src="https://www.chatbase.co/chatbot-iframe/lpjwddBIh1A40GzeR7Hc9"
          width="100%"
          height="700"
          frameBorder="0"
          allow="clipboard-write"
          className={styles.chatIframe}
          title="SARTHI AI Support"
        />
      </section>
    </DashboardLayout>
  )
}
