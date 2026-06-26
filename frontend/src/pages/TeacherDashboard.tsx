/**
 * TeacherDashboard — production React + TypeScript port of teacher.html
 *
 * Refactored to use shared components: DashboardLayout, Sidebar, Topbar, StatCard, Card, Table, Badge, Button.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import styles from './TeacherDashboard.module.css'
import { useAuth } from '@/hooks/useAuth'
import { useCollegeTheme, resolveCollegeName } from '@/hooks/useCollegeTheme'
import { useToast } from '@/components/ToastContext'
import {
  getStudentCount,
  getStudentsByCollege,
  sendAlertToParent,
  BackendStudent,
} from '@/services/api'
import DashboardLayout from '@/components/DashboardLayout'
import Sidebar, { SidebarNavItem } from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import StatCard from '@/components/StatCard'
import Card from '@/components/Card'
import Table from '@/components/Table'
import Badge from '@/components/Badge'
import Button from '@/components/Button'

interface StudentRisk {
  name: string
  attendance: number
  marks: number
  stress: number
}

const NAV_ITEMS: readonly SidebarNavItem[] = [
  { label: 'Dashboard', path: '/teacher' },
  { label: 'Student Details', path: '/teacher/students' },
  { label: 'Assignments', path: '/teacher/assignments' },
  { label: 'Teacher Parent', path: '/teacher/parent-contact' },
  { label: 'Teacher Details', path: '/teacher/details' },
  { label: 'Telegram Alerts', path: '#telegramAlertsPanel' },
]

const STUDENT_RISK_DATA: StudentRisk[] = [
  { name: 'Ananya', attendance: 92, marks: 78, stress: 4 },
  { name: 'Rahul', attendance: 68, marks: 52, stress: 8 },
  { name: 'Ishita', attendance: 85, marks: 88, stress: 3 },
  { name: 'Sagar', attendance: 72, marks: 47, stress: 7 },
  { name: 'Kavya', attendance: 90, marks: 81, stress: 5 },
  { name: 'Ritesh', attendance: 64, marks: 58, stress: 9 },
  { name: 'Meghana', attendance: 78, marks: 66, stress: 6 },
  { name: 'Vikram', attendance: 88, marks: 74, stress: 5 },
]

const CLASS_PERFORMANCE = [72, 74, 70, 76, 79, 81, 78, 84]
const WEEK_LABELS = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8']

function getAttendanceStatus(value: number): 'low' | 'medium' | 'good' {
  if (value < 65) return 'low'
  if (value <= 75) return 'medium'
  return 'good'
}

function getAttendanceBadgeVariant(status: 'low' | 'medium' | 'good'): 'high' | 'medium' | 'low' {
  if (status === 'low') return 'high'
  if (status === 'medium') return 'medium'
  return 'low'
}

function getMarksRisk(value: number): 'high' | 'medium' | 'low' {
  if (value < 50) return 'high'
  if (value < 65) return 'medium'
  return 'low'
}

function getStressRisk(value: number): 'high' | 'medium' | 'low' {
  if (value > 7) return 'high'
  if (value > 5) return 'medium'
  return 'low'
}

function countHighRiskStudents(data: StudentRisk[]): number {
  return data.filter((student) => {
    const attendanceRisk = getAttendanceStatus(student.attendance)
    const marksRisk = getMarksRisk(student.marks)
    const stressRisk = getStressRisk(student.stress)
    return attendanceRisk === 'low' || marksRisk === 'high' || stressRisk === 'high'
  }).length
}

export default function TeacherDashboard() {
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

  const teacherName = user?.fullName ?? 'Ms. Teacher'

  // Per-college CSS custom properties + logo URL
  const { logoUrl } = useCollegeTheme(college)

  const { showToast } = useToast()

  // Telegram Alerts form state
  const [selectedStudentId, setSelectedStudentId] = useState<string>('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [availableClasses, setAvailableClasses] = useState<string[]>([])
  const [riskLevel, setRiskLevel] = useState<string>('high')
  const [reasonCategory, setReasonCategory] = useState<string>('Attendance concern')
  const [reasonDetails, setReasonDetails] = useState<string>('')
  const [alertStatus, setAlertStatus] = useState<string>('Ready to send.')

  // Fetch real student count from backend using React Query
  const { data: studentCount } = useQuery({
    queryKey: ['studentCount'],
    queryFn: async () => {
      const res = await getStudentCount()
      if (!res.ok) throw new Error(res.message)
      return res.data.count
    },
    placeholderData: STUDENT_RISK_DATA.length,
  })
  const totalStudentsCount = studentCount ?? STUDENT_RISK_DATA.length

  // Fetch students list for alert form using React Query
  const { data: studentsData } = useQuery({
    queryKey: ['students', college],
    queryFn: async () => {
      const res = await getStudentsByCollege(college)
      if (!res.ok) throw new Error(res.message)
      return res.data.data
    },
    placeholderData: [] as BackendStudent[],
  })
  const students = studentsData ?? []

  // Sync dropdown logic when students list resolves
  useEffect(() => {
    if (studentsData && studentsData.length > 0) {
      if (!selectedStudentId || !studentsData.some((s) => s.id === selectedStudentId)) {
        setSelectedStudentId(studentsData[0].id)
        setSelectedClass(studentsData[0].class)
      }
      const classesSet = new Set(studentsData.map((s) => s.class))
      setAvailableClasses(Array.from(classesSet).sort())
    } else {
      setSelectedStudentId('')
      setSelectedClass('')
      setAvailableClasses([])
    }
  }, [studentsData, selectedStudentId])

  // Update selected class when student dropdown changes
  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setSelectedStudentId(val)
    const found = students.find((s) => s.id === val)
    if (found) {
      setSelectedClass(found.class)
    }
  }

  // Handle Telegram alert submission using React Query useMutation
  const alertMutation = useMutation({
    mutationFn: async (payload: {
      studentId: string
      className: string
      riskLevel: string
      reason: string
    }) => {
      const res = await sendAlertToParent(payload)
      if (!res.ok) throw new Error(res.message)
      return res.data
    },
    onSuccess: (data) => {
      if (data.success) {
        setAlertStatus('Telegram alert sent to parent successfully.')
        showToast('Telegram alert sent to parent successfully.', 'success')
      } else {
        setAlertStatus('Unable to send Telegram alert.')
        showToast('Unable to send Telegram alert.', 'error')
      }
    },
    onError: (err: Error) => {
      const msg = err.message || 'Unable to send Telegram alert.'
      setAlertStatus(msg)
      showToast(msg, 'error')
    },
  })

  const handleSendAlert = () => {
    if (!selectedStudentId) {
      setAlertStatus('Select a student before sending.')
      showToast('Select a student before sending.', 'warning')
      return
    }
    setAlertStatus('Sending alert...')
    const reason = reasonDetails.trim()
      ? `${reasonCategory}: ${reasonDetails.trim()}`
      : reasonCategory

    alertMutation.mutate({
      studentId: selectedStudentId,
      className: selectedClass,
      riskLevel,
      reason,
    })
  }

  // Don't render until auth is confirmed
  if (!isAuthenticated) return null

  // Calculate local stats fallback
  const avgAttendance = Math.round(
    STUDENT_RISK_DATA.reduce((sum, student) => sum + student.attendance, 0) /
      STUDENT_RISK_DATA.length
  )
  const highRiskCount = countHighRiskStudents(STUDENT_RISK_DATA)

  // Layout sidebar & topbar definition
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
      title="Teacher Dashboard"
      subtitle="Track class performance and identify student risk quickly."
      chips={
        <>
          <span className="chip">Main Page</span>
          <span className="chip" id="riskStamp">
            Risk Scan: Active
          </span>
        </>
      }
    />
  )

  const tableHeaders = [
    'Student',
    'Attendance',
    'Marks',
    'Stress',
    'Attendance Risk',
    'Marks Risk',
    'Stress Risk',
  ]

  return (
    <DashboardLayout college={college} sidebar={sidebar} topbar={topbar}>
      {/* Metrics Row */}
      <section className={styles.metrics} aria-label="Metrics summary">
        <StatCard
          label="Total Students"
          value={totalStudentsCount}
          sub="Students in current class set"
          largeValue={true}
        />
        <StatCard
          label="Avg Attendance"
          value={`${avgAttendance}%`}
          sub="Class attendance trend"
          largeValue={true}
        />
        <StatCard
          label="High-Risk Students"
          value={highRiskCount}
          sub="Any high risk in attendance, marks, or stress"
          largeValue={true}
        />
      </section>

      {/* Class Performance Chart */}
      <Card>
        <div className={styles.panelHead}>
          <h5>Class Performance Chart</h5>
          <p>Average marks by recent weeks</p>
        </div>
        <div className={styles.chartWrap}>
          <div className={styles.bars}>
            {CLASS_PERFORMANCE.map((val, idx) => (
              <div key={idx} className={styles.bar} style={{ height: `${val}%` }}>
                <span>{val}</span>
              </div>
            ))}
          </div>
          <div className={styles.labels}>
            {WEEK_LABELS.map((lbl, idx) => (
              <p key={idx}>{lbl}</p>
            ))}
          </div>
        </div>
      </Card>

      {/* Risk Summary Table */}
      <Card>
        <div className={styles.panelHead}>
          <h5>Risk Summary of Students</h5>
          <p>Attendance risk, marks risk, and stress risk</p>
        </div>
        <Table headers={tableHeaders} minWidth="660px">
          {STUDENT_RISK_DATA.map((student) => {
            const attStatus = getAttendanceStatus(student.attendance)
            const attBadge = getAttendanceBadgeVariant(attStatus)
            const marksRisk = getMarksRisk(student.marks)
            const stressRisk = getStressRisk(student.stress)

            return (
              <tr key={student.name}>
                <td>{student.name}</td>
                <td>{student.attendance}%</td>
                <td>{student.marks}%</td>
                <td>{student.stress}/10</td>
                <td>
                  <Badge variant={attBadge}>{attStatus.toUpperCase()}</Badge>
                </td>
                <td>
                  <Badge variant={marksRisk}>{marksRisk.toUpperCase()}</Badge>
                </td>
                <td>
                  <Badge variant={stressRisk}>{stressRisk.toUpperCase()}</Badge>
                </td>
              </tr>
            )
          })}
        </Table>
      </Card>

      {/* Telegram Alerts Panel */}
      <Card id="telegramAlertsPanel">
        <div className={styles.panelHead}>
          <h5>Telegram Alerts</h5>
          <p>Send an alert to the concerned parent</p>
        </div>

        <div className={styles.telegramFormGrid}>
          <div className={styles.telegramField}>
            <label htmlFor="alertStudentId">Student ID</label>
            <select
              id="alertStudentId"
              value={selectedStudentId}
              onChange={handleStudentChange}
            >
              {students.length === 0 ? (
                <option value="">No students found for selected college</option>
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
            <label htmlFor="alertClassName">Class</label>
            <select
              id="alertClassName"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              {availableClasses.length === 0 ? (
                <option value="">No class available</option>
              ) : (
                availableClasses.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className={styles.telegramField}>
            <label htmlFor="alertRiskLevel">Risk Level</label>
            <select
              id="alertRiskLevel"
              value={riskLevel}
              onChange={(e) => setRiskLevel(e.target.value)}
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className={styles.telegramField}>
            <label htmlFor="alertReasonCategory">Reason Category</label>
            <select
              id="alertReasonCategory"
              value={reasonCategory}
              onChange={(e) => setReasonCategory(e.target.value)}
            >
              <option value="Attendance concern">Attendance concern</option>
              <option value="Academic performance concern">Academic performance concern</option>
              <option value="Fee payment reminder">Fee payment reminder</option>
              <option value="Behavioral observation">Behavioral observation</option>
              <option value="Health and wellness update">Health and wellness update</option>
              <option value="Examination preparation alert">Examination preparation alert</option>
              <option value="Assignment submission pending">Assignment submission pending</option>
              <option value="Disciplinary notice">Disciplinary notice</option>
              <option value="General teacher update">General teacher update</option>
            </select>
          </div>

          <div className={styles.telegramField}>
            <label htmlFor="alertReasonDetails">Additional Notes (Optional)</label>
            <input
              id="alertReasonDetails"
              type="text"
              placeholder="Add any specific context for the parent"
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.telegramActions}>
          <Button onClick={handleSendAlert}>Send Telegram Alert</Button>
          <span className={styles.telegramStatus}>{alertStatus}</span>
        </div>
      </Card>
    </DashboardLayout>
  )
}
