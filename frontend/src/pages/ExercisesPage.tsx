import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './ExercisesPage.module.css'
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

interface AssignmentItem {
  id: number
  subject: string
  subjectCode: string
  title: string
  description: string
  dueDate: string
  status: 'pending' | 'completed'
  completed: boolean
}

const SAMPLE_ASSIGNMENTS: AssignmentItem[] = [
  {
    id: 1,
    subject: 'Math',
    subjectCode: 'math',
    title: 'Assignment 1 - Calculus',
    description: 'Solve differential equations from Chapter 5',
    dueDate: '2026-03-22',
    status: 'pending',
    completed: false,
  },
  {
    id: 2,
    subject: 'Physics',
    subjectCode: 'physics',
    title: 'Practice Problems on Thermodynamics',
    description: 'Complete 15 problems from the exercise set',
    dueDate: '2026-03-20',
    status: 'pending',
    completed: false,
  },
  {
    id: 3,
    subject: 'Chemistry',
    subjectCode: 'chemistry',
    title: 'Lab Report - Organic Synthesis',
    description: 'Document and analyze your lab results',
    dueDate: '2026-03-25',
    status: 'completed',
    completed: true,
  },
  {
    id: 4,
    subject: 'English',
    subjectCode: 'english',
    title: 'Essay on Modern Literature',
    description: 'Write 1500-word essay on contemporary authors',
    dueDate: '2026-03-28',
    status: 'pending',
    completed: false,
  },
  {
    id: 5,
    subject: 'Math',
    subjectCode: 'math',
    title: 'Assignment 2 - Linear Algebra',
    description: 'Matrix operations and eigenvalues',
    dueDate: '2026-03-19',
    status: 'completed',
    completed: true,
  },
  {
    id: 6,
    subject: 'Physics',
    subjectCode: 'physics',
    title: 'Quantum Mechanics Problem Set',
    description: 'Problems from sections 3-4 of lecture notes',
    dueDate: '2026-03-23',
    status: 'pending',
    completed: false,
  },
  {
    id: 7,
    subject: 'Chemistry',
    subjectCode: 'chemistry',
    title: 'Assignment - Equilibrium Reactions',
    description: 'Calculate equilibrium constants for given reactions',
    dueDate: '2026-03-21',
    status: 'pending',
    completed: false,
  },
  {
    id: 8,
    subject: 'English',
    subjectCode: 'english',
    title: 'Reading Comprehension Test',
    description: 'Complete practice test with 20 passages',
    dueDate: '2026-03-17',
    status: 'completed',
    completed: true,
  },
]

export default function ExercisesPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuth()

  const [activeFilter, setActiveFilter] = useState<string>('all')

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
  const firstName = studentName.split(' ')[0]
  const studentClass = user?.assignedClass ?? 'CSE-A'

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString('en-US', options)
  }

  const filteredAssignments = SAMPLE_ASSIGNMENTS.filter((item) => {
    if (activeFilter === 'all') return true
    if (activeFilter === 'pending') return !item.completed
    if (activeFilter === 'completed') return item.completed
    return item.subjectCode === activeFilter
  })

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
      subtitle="Track your assignments here"
      userName={studentName}
      themeColor={theme.sidebarA}
      showNotificationAndAvatar={true}
    />
  )

  return (
    <DashboardLayout college={college} sidebar={sidebar} topbar={topbar}>
      <div className={styles.readOnlyNotice}>
        ℹ️ Your assignments are managed by instructors. Marks and status updates are made by teachers only.
      </div>

      <div className={styles.filters}>
        {(['all', 'pending', 'completed', 'math', 'physics', 'chemistry', 'english'] as const).map(
          (filter) => (
            <button
              key={filter}
              type="button"
              className={`${styles.filterBtn} ${activeFilter === filter ? styles.filterBtnActive : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          )
        )}
      </div>

      <div className={styles.assignmentsGrid}>
        {filteredAssignments.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <div className={styles.emptyTitle}>No Assignments</div>
            <div className={styles.emptyText}>
              Great! You've completed all your assignments for this filter
            </div>
          </div>
        ) : (
          filteredAssignments.map((assignment) => (
            <div key={assignment.id} className={styles.assignmentCard}>
              <div className={styles.cardHeader}>
                <div>
                  <div className={styles.subjectBadge}>{assignment.subject}</div>
                  <div className={styles.taskTitle}>{assignment.title}</div>
                </div>
                <span
                  className={`${styles.statusBadge} ${
                    assignment.completed ? styles.statusBadgeCompleted : styles.statusBadgePending
                  }`}
                >
                  {assignment.status.toUpperCase()}
                </span>
              </div>

              <div className={styles.taskDescription}>{assignment.description}</div>

              <div className={styles.dueDate}>
                <span>📅 Due: {formatDate(assignment.dueDate)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}
