import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './StudentDetailsPage.module.css'
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

function hashText(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash * 31) + text.charCodeAt(i)) >>> 0
  }
  return hash
}

function getRiskLevel(marks: number, attendance: number): 'low' | 'medium' | 'high' {
  if (attendance < 65 || marks < 50) return 'high'
  if (attendance < 75 || marks < 65) return 'medium'
  return 'low'
}

export default function StudentDetailsPage() {
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

  const studentName = user?.fullName ?? 'Reya Student'
  const studentEmail = user?.email ?? `${studentName.replace(/\s+/g, '').toLowerCase()}@student360.edu`
  const studentClass = user?.assignedClass ?? 'CSE-A'

  // Deterministic profile data derivation based on credentials hash
  const seed = hashText(`${studentEmail}-${studentClass}`)
  const computedAttendance = 58 + (seed % 43)
  const marks = 40 + ((seed >> 4) % 57)
  const engagement = (62 + ((seed >> 3) % 38)) / 10
  const wellness = (54 + ((seed >> 6) % 41)) / 10
  const semester = 1 + ((seed >> 5) % 8)
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const bloodGroup = bloodGroups[(seed >> 7) % bloodGroups.length]
  const grade = marks >= 90 ? 'A+' : marks >= 80 ? 'A' : marks >= 70 ? 'B' : marks >= 60 ? 'C' : 'D'
  const risk = getRiskLevel(marks, computedAttendance)
  const rollNumber = `${studentClass.replace('-', '')}${String((seed % 72) + 1).padStart(3, '0')}`
  const department = studentClass.startsWith('CSE')
    ? 'Computer Science and Engineering'
    : studentClass.startsWith('ECE')
      ? 'Electronics and Communication Engineering'
      : 'Information Technology'
  const parentPhone = `9${String(100000000 + ((seed * 7) % 900000000)).padStart(9, '0')}`
  const feeStatus = marks >= 75 ? 'Paid' : marks >= 60 ? 'Partially Paid' : 'Pending'

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
      title="Student Details"
      subtitle="Your personal and academic profile in one place"
      userName={studentName}
      themeColor={theme.sidebarA}
      showNotificationAndAvatar={true}
    />
  )

  return (
    <DashboardLayout college={college} sidebar={sidebar} topbar={topbar}>
      {/* Overview stats */}
      <section className={styles.summaryGrid}>
        <article className={styles.summaryCard}>
          <p>Attendance</p>
          <h4>90.5%</h4>
          <small>Current overall attendance</small>
        </article>
        <article className={styles.summaryCard}>
          <p>Average Marks</p>
          <h4>{marks}%</h4>
          <small>Latest academic average</small>
        </article>
        <article className={styles.summaryCard}>
          <p>Engagement Score</p>
          <h4>{engagement.toFixed(1)} / 10</h4>
          <small>Class and activity participation</small>
        </article>
        <article className={styles.summaryCard}>
          <p>Wellness Score</p>
          <h4>{wellness.toFixed(1)} / 10</h4>
          <small>Based on mood and journal inputs</small>
        </article>
      </section>

      {/* Complete Profile details */}
      <section className={styles.detailsPanel}>
        <div className={styles.detailsHead}>
          <h4>Complete Profile</h4>
          <span
            className={`${styles.riskBadge} ${
              risk === 'low'
                ? styles.riskLow
                : risk === 'medium'
                  ? styles.riskMedium
                  : styles.riskHigh
            }`}
          >
            Risk: {risk.toUpperCase()}
          </span>
        </div>

        <div className={styles.detailsGrid}>
          <div className={styles.field}>
            <p>Full Name</p>
            <h5>{studentName}</h5>
          </div>
          <div className={styles.field}>
            <p>Email</p>
            <h5>{studentEmail}</h5>
          </div>
          <div className={styles.field}>
            <p>Class</p>
            <h5>{studentClass}</h5>
          </div>
          <div className={styles.field}>
            <p>Roll Number</p>
            <h5>{rollNumber}</h5>
          </div>
          <div className={styles.field}>
            <p>Department</p>
            <h5>{department}</h5>
          </div>
          <div className={styles.field}>
            <p>Semester</p>
            <h5>{semester}</h5>
          </div>
          <div className={styles.field}>
            <p>Attendance</p>
            <h5>90.5%</h5>
          </div>
          <div className={styles.field}>
            <p>Average Marks</p>
            <h5>{marks}%</h5>
          </div>
          <div className={styles.field}>
            <p>Grade</p>
            <h5>{grade}</h5>
          </div>
          <div className={styles.field}>
            <p>Blood Group</p>
            <h5>{bloodGroup}</h5>
          </div>
          <div className={styles.field}>
            <p>Parent Contact</p>
            <h5>{parentPhone}</h5>
          </div>
          <div className={styles.field}>
            <p>Fee Status</p>
            <h5>{feeStatus}</h5>
          </div>
        </div>
      </section>
    </DashboardLayout>
  )
}
