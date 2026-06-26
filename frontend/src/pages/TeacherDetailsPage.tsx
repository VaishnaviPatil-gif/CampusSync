import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './TeacherDetailsPage.module.css'
import { useAuth } from '@/hooks/useAuth'
import { useCollegeTheme, resolveCollegeName } from '@/hooks/useCollegeTheme'
import DashboardLayout from '@/components/DashboardLayout'
import Sidebar, { SidebarNavItem } from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

const NAV_ITEMS: readonly SidebarNavItem[] = [
  { label: 'Dashboard', path: '/teacher' },
  { label: 'Student Details', path: '/teacher/students' },
  { label: 'Assignments', path: '/teacher/assignments' },
  { label: 'Teacher Parent', path: '/teacher/parent-contact' },
  { label: 'Teacher Details', path: '/teacher/details' },
]

interface TeacherMeta {
  department: string
  experience: string
  employeeId: string
  phone: string
}

function hashText(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash * 31) + text.charCodeAt(i)) >>> 0
  }
  return hash
}

function deriveTeacherSubject(seedText: string): string {
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science', 'Electronics', 'Data Structures']
  const seed = hashText(seedText || 'teacher')
  return subjects[seed % subjects.length]
}

function deriveTeacherMeta(seedText: string): TeacherMeta {
  const departments = ['Science', 'Humanities', 'Engineering', 'Computing', 'Electronics']
  const experiences = ['2 years', '4 years', '6 years', '8 years', '10 years']
  const seed = hashText(seedText || 'teacher')
  return {
    department: departments[seed % departments.length],
    experience: experiences[seed % experiences.length],
    employeeId: `TCH-${String((seed % 9000) + 1000)}`,
    phone: `9${String(100000000 + (seed % 900000000)).padStart(9, '0')}`,
  }
}

export default function TeacherDetailsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuth()

  // Guard: redirect to landing if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const rawCollege = searchParams.get('college') ?? user?.college ?? 'BRECW'
  const college = resolveCollegeName(rawCollege)
  const { logoUrl, theme } = useCollegeTheme(college)

  const teacherName = user?.fullName ?? 'Ms. Teacher'
  const teacherEmail = user?.email ?? 'teacher@student360.edu'
  const teacherSubject = user?.teacherSubject || deriveTeacherSubject(teacherEmail)
  const meta = deriveTeacherMeta(teacherEmail)

  if (!isAuthenticated) return null

  const sidebar = (
    <Sidebar
      logoUrl={logoUrl}
      userName={teacherName}
      roleLabel="Teacher Panel"
      college={college}
      navItems={NAV_ITEMS}
    />
  )

  const topbar = (
    <Topbar
      title="Teacher Details"
      subtitle="Your profile and subject details used for assignment publishing."
      userName={teacherName}
      themeColor={theme.sidebarA}
      showNotificationAndAvatar={false}
    />
  )

  return (
    <DashboardLayout college={college} sidebar={sidebar} topbar={topbar}>
      <section className={styles.detailsPanel}>
        <div className={styles.detailsGrid}>
          <div className={styles.field}>
            <p>Teacher Name</p>
            <h4>{teacherName}</h4>
          </div>
          <div className={styles.field}>
            <p>Email</p>
            <h4>{teacherEmail}</h4>
          </div>
          <div className={styles.field}>
            <p>Primary Subject</p>
            <h4>{teacherSubject}</h4>
          </div>
          <div className={styles.field}>
            <p>Employee ID</p>
            <h4>{meta.employeeId}</h4>
          </div>
          <div className={styles.field}>
            <p>Department</p>
            <h4>{meta.department}</h4>
          </div>
          <div className={styles.field}>
            <p>Experience</p>
            <h4>{meta.experience}</h4>
          </div>
          <div className={styles.field}>
            <p>Phone</p>
            <h4>{meta.phone}</h4>
          </div>
          <div className={styles.field}>
            <p>College</p>
            <h4>{college}</h4>
          </div>
          <div className={styles.field}>
            <p>Classes Handling</p>
            <h4>CSE-A, CSE-B, CSE-C, ECE-A, IT-A, IT-B</h4>
          </div>
        </div>
      </section>
    </DashboardLayout>
  )
}
