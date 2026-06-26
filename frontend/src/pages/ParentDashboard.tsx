/**
 * ParentDashboard — production React + TypeScript port of parent.html
 *
 * Refactored to use shared components: DashboardLayout, Sidebar, Topbar, StatCard, Card, Table, Badge, Button.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import styles from './ParentDashboard.module.css'
import { useAuth } from '@/hooks/useAuth'
import { useCollegeTheme, resolveCollegeName } from '@/hooks/useCollegeTheme'
import { useToast } from '@/components/ToastContext'
import { getStudentsByCollege, registerTelegramParent, BackendStudent } from '@/services/api'
import DashboardLayout from '@/components/DashboardLayout'
import Sidebar, { SidebarNavItem } from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Button from '@/components/Button'

const NAV_ITEMS: readonly SidebarNavItem[] = [
  { label: 'Dashboard', path: '/parent' },
  { label: 'Telegram Alerts', path: '#telegramAlertsPanel' },
]

function deriveNumber(seedText: string, min: number, max: number): number {
  const text = (seedText || 'seed').toString()
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash * 31) + text.charCodeAt(i)) >>> 0
  }
  return min + (hash % (max - min + 1))
}

function classifyRisk(attendancePct: number, marksAvg: number): 'Stable' | 'Needs Attention' | 'High Risk' {
  if (attendancePct < 70 || marksAvg < 55) return 'High Risk'
  if (attendancePct < 80 || marksAvg < 70) return 'Needs Attention'
  return 'Stable'
}

function getAttendanceBand(attendancePct: number): 'low' | 'medium' | 'good' {
  if (attendancePct < 65) return 'low'
  if (attendancePct <= 75) return 'medium'
  return 'good'
}

function inferStudentIdByName(name: string): string {
  const normalized = (name || '').trim().toLowerCase()
  if (normalized.includes('aarav')) return '1'
  if (normalized.includes('diya')) return '2'
  if (normalized.includes('rohan')) return '3'
  if (normalized.includes('meera')) return '4'
  return '1'
}

export default function ParentDashboard() {
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

  const selectedClass = searchParams.get('class') ?? user?.assignedClass ?? 'CSE-A'
  const childName = user?.fullName ?? 'Reya Student'
  const parentName = `Parent of ${childName.split(' ')[0]}`
  const emailSeed = user?.email ?? childName

  // Resolve child metrics using dynamic seed
  const rollNumber = `${selectedClass.replace('-', '')}${String(deriveNumber(emailSeed + 'roll', 1, 120)).padStart(3, '0')}`
  const semester = deriveNumber(emailSeed + 'semester', 1, 8)
  const totalClasses = deriveNumber(emailSeed + 'totalClasses', 180, 240)
  const classesAttended = deriveNumber(emailSeed + 'attended', Math.floor(totalClasses * 0.65), totalClasses)
  const attendancePct = Math.round((classesAttended / totalClasses) * 100)
  const gender = deriveNumber(emailSeed + 'gender', 0, 1) === 0 ? 'Female' : 'Male'
  
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  const bloodGroup = bloodGroups[deriveNumber(emailSeed + 'bg', 0, bloodGroups.length - 1)]

  const department = selectedClass.startsWith('CSE')
    ? 'Computer Science and Engineering'
    : selectedClass.startsWith('ECE')
    ? 'Electronics and Communication Engineering'
    : 'Information Technology'

  const dobYear = deriveNumber(emailSeed + 'dobY', 2003, 2006)
  const dobMonth = String(deriveNumber(emailSeed + 'dobM', 1, 12)).padStart(2, '0')
  const dobDay = String(deriveNumber(emailSeed + 'dobD', 1, 28)).padStart(2, '0')
  const dob = `${dobYear}-${dobMonth}-${dobDay}`
  const studentPhone = `9${deriveNumber(emailSeed + 'ph', 100000000, 999999999)}`

  // Academic subject list
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science']
  const subjectData = subjects.map((subject) => {
    const mid = deriveNumber(emailSeed + subject + 'mid', 48, 95)
    const sem = deriveNumber(emailSeed + subject + 'sem', 45, 98)
    return {
      subject,
      mid,
      sem,
      trend: sem >= mid ? 'Improving' : 'Declining',
    }
  })

  const marksAvg = Math.round(
    subjectData.reduce((sum, row) => sum + (row.mid + row.sem) / 2, 0) / subjectData.length
  )
  const feeStatus = attendancePct < 65 ? 'Pending' : 'Paid'
  const scholarship = marksAvg >= 80 ? 'Merit Scholarship' : 'No Scholarship'

  const overallStatus = classifyRisk(attendancePct, marksAvg)
  const attendanceBand = getAttendanceBand(attendancePct)

  // CSS variant classes mapping
  const riskVariant =
    overallStatus === 'High Risk' ? 'high' :
    overallStatus === 'Needs Attention' ? 'medium' : 'low'

  const attendanceVariant =
    attendanceBand === 'good' ? 'good' :
    attendanceBand === 'medium' ? 'stable' : 'weak'

  const marksVariant = marksAvg >= 70 ? 'good' : 'weak'

  // Per-college CSS custom properties + logo URL
  const { logoUrl } = useCollegeTheme(college)

  const { showToast } = useToast()

  // Telegram alerts form state
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [telegramClass, setTelegramClass] = useState<string>('')
  const [parentEmailInput, setParentEmailInput] = useState<string>(user?.email ?? '')
  const [telegramChatId, setTelegramChatId] = useState<string>('')
  const [telegramStatus, setTelegramStatus] = useState<string>('Not registered in this session.')

  // Load students list using React Query useQuery
  const { data: studentsData } = useQuery({
    queryKey: ['studentsAll'],
    queryFn: async () => {
      const res = await getStudentsByCollege('')
      if (!res.ok) throw new Error(res.message)
      return res.data.data
    },
    placeholderData: [] as BackendStudent[],
  })
  const students = studentsData ?? []

  // Sync selected student and class
  useEffect(() => {
    if (studentsData && studentsData.length > 0) {
      const inferredId = inferStudentIdByName(childName)
      const matched = studentsData.find((s) => s.id === inferredId) || studentsData[0]
      if (matched && !selectedStudentId) {
        setSelectedStudentId(matched.id)
        setTelegramClass(matched.class)
      }
    }
  }, [studentsData, childName, selectedStudentId])

  // Handle student select change
  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedStudentId(val)
    const matched = students.find((s) => s.id === val)
    if (matched) {
      setTelegramClass(matched.class)
    }
  }

  // Register parent Telegram alerts using React Query useMutation
  const registerMutation = useMutation({
    mutationFn: async (payload: {
      studentId: string
      parentEmail: string
      chatId: string
    }) => {
      const res = await registerTelegramParent(payload)
      if (!res.ok) throw new Error(res.message)
      return res.data
    },
    onSuccess: (data) => {
      if (data.success) {
        setTelegramStatus('Telegram registration completed successfully.')
        showToast('Telegram registration completed successfully.', 'success')
      } else {
        setTelegramStatus('Unable to register Telegram details.')
        showToast('Unable to register Telegram details.', 'error')
      }
    },
    onError: (err: Error) => {
      const msg = err.message || 'Unable to register Telegram details.'
      setTelegramStatus(msg)
      showToast(msg, 'error')
    },
  })

  const handleRegisterTelegram = () => {
    if (!parentEmailInput.trim() || !telegramChatId.trim()) {
      setTelegramStatus('Parent Email and Telegram Chat ID are required.')
      showToast('Parent Email and Telegram Chat ID are required.', 'warning')
      return
    }
    setTelegramStatus('Registering Telegram details...')
    registerMutation.mutate({
      studentId: selectedStudentId,
      parentEmail: parentEmailInput,
      chatId: telegramChatId,
    })
  }

  // Don't render until auth is validated
  if (!isAuthenticated) return null

  // Layout sidebar & topbar definition
  const sidebar = (
    <Sidebar
      logoUrl={logoUrl}
      userName={parentName}
      roleLabel="Parent Dashboard"
      college={college}
      extraLabels={[`Student: ${childName}`, `Class: ${selectedClass}`]}
      navItems={NAV_ITEMS}
    />
  )

  const topbar = (
    <Topbar
      title="Parent Insights"
      subtitle="Student name, class, semester, attendance, marks, status, goals, needs-attention and high-risk overview."
      chips={
        <Badge variant={riskVariant === 'high' ? 'high' : riskVariant === 'medium' ? 'medium' : 'low'}>
          Status: {overallStatus}
        </Badge>
      }
    />
  )

  // Derived feedback list items
  const weakSubjects = subjectData.filter((row) => (row.mid + row.sem) / 2 < 65).map((row) => row.subject)
  const feedbackItems = [
    {
      text: weakSubjects.length
        ? `Needs improvement in ${weakSubjects.join(', ')}.`
        : 'Good progress this month across subjects.',
      isRisk: weakSubjects.length > 0,
    },
    {
      text:
        attendancePct < 65
          ? 'Attendance is low. Please ensure regular attendance.'
          : attendancePct <= 75
          ? 'Attendance is medium. Please improve class consistency.'
          : 'Attendance consistency is good.',
      isRisk: attendancePct < 80,
    },
    {
      text:
        marksAvg >= 70
          ? 'Academic performance is steadily improving.'
          : 'Please focus on revision and weekly practice tests.',
      isRisk: false,
    },
  ]

  // Derived notification alerts items
  const alertItems = [
    {
      text:
        attendancePct < 65
          ? 'Low attendance warning generated.'
          : attendancePct <= 75
          ? 'Attendance is medium. Monitor closely.'
          : 'Attendance level is within safe range.',
      variant: attendancePct < 65 ? 'risk' : attendancePct <= 75 ? 'warn' : 'good',
    },
    {
      text:
        marksAvg < 70
          ? 'Academic alert: monitor subject performance.'
          : 'Academic progress is on track.',
      variant: marksAvg < 70 ? 'risk' : 'good',
    },
  ]

  return (
    <DashboardLayout college={college} sidebar={sidebar} topbar={topbar}>
      {/* Summary Cards */}
      <section className={styles.summaryGrid} aria-label="Student overview metrics">
        <StatCard
          label="Student"
          value={childName}
          sub={<Badge variant="good">{`Semester ${semester}`}</Badge>}
        />
        <StatCard
          label="Attendance"
          value={`${attendancePct}%`}
          sub={
            <Badge variant={attendanceVariant}>
              {attendanceBand === 'good'
                ? 'Good Attendance'
                : attendanceBand === 'medium'
                ? 'Medium Attendance'
                : 'Low Attendance'}
            </Badge>
          }
        />
        <StatCard
          label="Mid + Semester Avg"
          value={`${marksAvg}%`}
          sub={
            <Badge variant={marksVariant}>
              {marksAvg >= 70 ? 'Good Progress' : 'Needs Improvement'}
            </Badge>
          }
        />
        <StatCard
          label="Risk Level"
          value={overallStatus}
          sub={<Badge variant={riskVariant}>{overallStatus}</Badge>}
        />
      </section>

      {/* Stats List and Academic Performance Row */}
      <div className={styles.gridTwo}>
        <Card title="Attendance">
          <p className={styles.panelSub}>Total classes, attended classes, attendance percentage</p>
          <ul className={styles.statList}>
            <li>
              <span>Total Classes</span>
              <strong>{totalClasses}</strong>
            </li>
            <li>
              <span>Classes Attended</span>
              <strong>{classesAttended}</strong>
            </li>
            <li>
              <span>Attendance Percentage</span>
              <strong>{attendancePct}%</strong>
            </li>
          </ul>
        </Card>

        <Card title="Academic Performance">
          <p className={styles.panelSub}>Mid marks, semester marks, subject-wise trend (improving/declining)</p>
          <Table headers={['Subject', 'Mid Marks', 'Semester Marks', 'Trend']} minWidth="100%">
            {subjectData.map((row) => (
              <tr key={row.subject}>
                <td>{row.subject}</td>
                <td>{row.mid}%</td>
                <td>{row.sem}%</td>
                <td>{row.trend}</td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>

      {/* Teacher Feedback and Alerts Row */}
      <div className={styles.gridTwo}>
        <Card title="Teacher Feedback">
          <ul className={styles.alerts}>
            {feedbackItems.map((item, idx) => (
              <li key={idx} className={item.isRisk ? styles.risk : styles.good}>
                {item.text}
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Notifications & Alerts">
          <ul className={styles.alerts}>
            {alertItems.map((item, idx) => (
              <li key={idx} className={styles[item.variant]}>
                {item.text}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Student Details Grid */}
      <Card title="Student Information Profile">
        <div className={styles.detailsGrid}>
          <div className={styles.detailBox}>
            <p>Roll Number</p>
            <h5>{rollNumber}</h5>
          </div>
          <div className={styles.detailBox}>
            <p>Department</p>
            <h5>{department}</h5>
          </div>
          <div className={styles.detailBox}>
            <p>Class Section</p>
            <h5>{selectedClass}</h5>
          </div>
          <div className={styles.detailBox}>
            <p>Semester</p>
            <h5>Semester {semester}</h5>
          </div>
          <div className={styles.detailBox}>
            <p>Date of Birth</p>
            <h5>{dob}</h5>
          </div>
          <div className={styles.detailBox}>
            <p>Gender</p>
            <h5>{gender}</h5>
          </div>
          <div className={styles.detailBox}>
            <p>Blood Group</p>
            <h5>{bloodGroup}</h5>
          </div>
          <div className={styles.detailBox}>
            <p>Student Contact</p>
            <h5>+91 {studentPhone}</h5>
          </div>
          <div className={styles.detailBox}>
            <p>Fee Status</p>
            <h5>{feeStatus}</h5>
          </div>
          <div className={styles.detailBox}>
            <p>Scholarship</p>
            <h5>{scholarship}</h5>
          </div>
        </div>
      </Card>

      {/* Telegram Alerts Registration */}
      <Card id="telegramAlertsPanel" title="Telegram Alerts">
        <p className={styles.panelSub}>Register your Telegram chat ID so teachers can send alerts directly to you.</p>
        
        <div className={styles.telegramFormGrid}>
          <div className={styles.telegramField}>
            <label htmlFor="parentTelegramStudentId">Student ID</label>
            <select
              id="parentTelegramStudentId"
              value={selectedStudentId}
              onChange={handleStudentChange}
            >
              {students.length === 0 ? (
                <option value="">No students found</option>
              ) : (
                students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.id} - {student.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className={styles.telegramField}>
            <label htmlFor="parentTelegramClass">Class</label>
            <select
              id="parentTelegramClass"
              value={telegramClass}
              onChange={(e) => setTelegramClass(e.target.value)}
            >
              {telegramClass ? (
                <option value={telegramClass}>{telegramClass}</option>
              ) : (
                <option value="">No class resolved</option>
              )}
            </select>
          </div>

          <div className={styles.telegramField}>
            <label htmlFor="parentTelegramEmail">Parent Email</label>
            <input
              id="parentTelegramEmail"
              type="email"
              placeholder="parent@example.com"
              value={parentEmailInput}
              onChange={(e) => setParentEmailInput(e.target.value)}
            />
          </div>

          <div className={styles.telegramField}>
            <label htmlFor="parentTelegramChatId">Telegram Chat ID</label>
            <input
              id="parentTelegramChatId"
              type="text"
              placeholder="8680437609"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.telegramActions}>
          <Button onClick={handleRegisterTelegram}>Register Telegram Alerts</Button>
          <span className={styles.telegramStatus}>{telegramStatus}</span>
        </div>
      </Card>
    </DashboardLayout>
  )
}
