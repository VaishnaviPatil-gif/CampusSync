/**
 * StudentDashboard — production React + TypeScript port of student.html
 *
 * Refactored to use shared components: DashboardLayout, Sidebar, Topbar, StatCard.
 */
import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './StudentDashboard.module.css'
import { useAuth } from '@/hooks/useAuth'
import {
  useCollegeTheme,
  resolveCollegeName,
  deriveStudentClass,
  getValidStudentClass,
} from '@/hooks/useCollegeTheme'
import { useSensorDataQuery } from '@/hooks/useSensorDataQuery'
import { useAssignments } from '@/hooks/useAssignments'
import DashboardLayout from '@/components/DashboardLayout'
import Sidebar, { SidebarNavItem } from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import StatCard from '@/components/StatCard'
import SensorChart from '@/components/SensorChart'
import SubjectsPanel from '@/components/SubjectsPanel'
import AssignmentsPanel from '@/components/AssignmentsPanel'

const NAV_ITEMS: readonly SidebarNavItem[] = [
  { label: 'Dashboard', path: '/student' },
  { label: 'Attendance', path: '/student/attendance' },
  { label: 'Mood Tracker', path: '/student/mood' },
  { label: 'AI Support', path: '/student/journal' },
  { label: 'Exercises', path: '/student/exercises' },
  { label: 'Student Details', path: '/student/details' },
]

export default function StudentDashboard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuth()

  // Guard: redirect to landing if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // Resolve college — priority: URL param → storage → default
  const rawCollege = searchParams.get('college') ?? user?.college ?? 'BRECW'
  const college = resolveCollegeName(rawCollege)

  // Resolve class — priority: URL param → storage → derived from email
  const classFromUrl = getValidStudentClass(searchParams.get('class') ?? '')
  const classFromStorage = getValidStudentClass(user?.assignedClass ?? '')
  const studentClass =
    classFromUrl ?? classFromStorage ?? deriveStudentClass(user?.email ?? 'student')

  const studentName = user?.fullName ?? 'Student'
  const firstName = studentName.split(' ')[0]

  // Per-college CSS custom properties + logo URL
  const { logoUrl, theme } = useCollegeTheme(college)

  // Live sensor data (polls every 2s)
  const { reading, history, backendStatus, lastReceivedAt, stressLabel } = useSensorDataQuery()

  // Assignments from localStorage
  const { assignments } = useAssignments(college, studentClass)

  // Don't render until auth is confirmed (avoids flash before redirect)
  if (!isAuthenticated) return null

  // Sensor KPI derived display values
  const tempDisplay = reading.temperature != null ? `${reading.temperature}°C` : '--°C'
  const tempStatus = reading.temperature != null ? (reading.temperature > 38 ? '⚠️ High' : '✅ Normal') : 'No data'
  const humDisplay = reading.humidity != null ? `${reading.humidity}%` : '--%'
  const humStatus = reading.humidity != null ? (reading.humidity > 70 ? '⚠️ High' : '✅ Normal') : 'No data'
  const hrDisplay = reading.heartRate != null ? `${reading.heartRate} bpm` : '-- bpm'
  const hrStatus = reading.heartRate != null ? (reading.heartRate > 100 ? '⚠️ Elevated' : '✅ Normal') : 'No data'
  const stressDisplay = reading.stress != null ? `${reading.stress}/100` : '--/100'
  const backendStatusDisplay =
    backendStatus === 'online' ? '🟢 Online' :
    backendStatus === 'offline' ? '🔴 Offline' : '⚪ Offline'
  const backendTimeSub = lastReceivedAt
    ? `Last: ${lastReceivedAt}`
    : backendStatus === 'online' ? 'Online (waiting for data)' : 'Waiting...'

  // Layout sub-components
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
      subtitle="Your 360 degree learning snapshot for today"
      userName={studentName}
      themeColor={theme.sidebarA}
      showNotificationAndAvatar={true}
    />
  )

  return (
    <DashboardLayout college={college} sidebar={sidebar} topbar={topbar}>
      {/* Academic KPIs */}
      <section className={styles.kpiGrid} aria-label="Academic overview">
        <StatCard label="Attendance %" value="89%" sub="+2.1% this week" />
        <StatCard label="Engagement Score" value="8.3/10" sub="Strong classroom activity" />
        <StatCard
          label="Assignments"
          value={assignments.length}
          sub={assignments.length === 1 ? 'Assignment from teachers' : 'Assignments from teachers'}
        />
        <StatCard label="Weak Subjects" value="2" sub="Math, Chemistry" />
        <StatCard label="Teacher Suggestions" value="3" sub="Review chapter tests" />
      </section>

      {/* Sensor KPIs */}
      <section className={styles.kpiGrid} aria-label="Live sensor readings">
        <StatCard label="🌡️ Temperature" value={tempDisplay} sub={tempStatus} />
        <StatCard label="💧 Humidity" value={humDisplay} sub={humStatus} />
        <StatCard label="❤️ Heart Rate" value={hrDisplay} sub={hrStatus} />
        <StatCard label="🧠 Stress Level" value={stressDisplay} sub={stressLabel} />
        <StatCard label="📡 Backend Status" value={backendStatusDisplay} sub={backendTimeSub} />
      </section>

      {/* Sensor charts */}
      <section className={styles.sensorAnalysisGrid} aria-label="Sensor trend charts">
        <SensorChart
          title="❤️ Heart Rate Trend"
          data={history.heartRate}
          minValue={50}
          maxValue={120}
          lineColor="#ec4899"
          chartLabel="Last 60 minutes"
        />
        <SensorChart
          title="🧠 Stress Level Trend"
          data={history.stress}
          minValue={0}
          maxValue={100}
          lineColor="#a855f7"
          chartLabel="Last 60 minutes"
        />
      </section>

      {/* Subjects overview */}
      <SubjectsPanel />

      {/* Assignments table */}
      <AssignmentsPanel assignments={assignments} assignmentCount={assignments.length} />
    </DashboardLayout>
  )
}
