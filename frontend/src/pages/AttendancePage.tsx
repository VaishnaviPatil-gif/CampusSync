/**
 * AttendancePage — production React + TypeScript port of attendance.html
 *
 * Refactored to use shared components: DashboardLayout, Sidebar, Topbar, Card, StatCard, Button, Badge.
 */
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './AttendancePage.module.css'
import { useAuth } from '@/hooks/useAuth'
import { useCollegeTheme, resolveCollegeName, getValidStudentClass, deriveStudentClass } from '@/hooks/useCollegeTheme'
import { useToast } from '@/components/ToastContext'
import DashboardLayout from '@/components/DashboardLayout'
import Sidebar, { SidebarNavItem } from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import Card from '@/components/Card'
import Button from '@/components/Button'

const NAV_ITEMS: readonly SidebarNavItem[] = [
  { label: 'Dashboard', path: '/student' },
  { label: 'Attendance', path: '/student/attendance' },
  { label: 'Mood Tracker', path: '/student/mood' },
  { label: 'AI Support', path: '/student/journal' },
  { label: 'Exercises', path: '/student/exercises' },
  { label: 'Student Details', path: '/student/details' },
]

function deriveNumber(seedText: string, min: number, max: number): number {
  const text = (seedText || 'seed').toString()
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash * 31) + text.charCodeAt(i)) >>> 0
  }
  return min + (hash % (max - min + 1))
}

export default function AttendancePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuth()
  const { showToast } = useToast()

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

  const studentName = user?.fullName ?? 'Reya Student'
  const firstName = studentName.split(' ')[0]
  const emailSeed = user?.email ?? studentName

  // Resolve consistent roll number for letter template
  const rollNumber = `${studentClass.replace('-', '')}${String(deriveNumber(emailSeed + 'roll', 1, 120)).padStart(3, '0')}`

  // Per-college CSS custom properties + logo URL
  const { logoUrl, theme } = useCollegeTheme(college)

  // Calculator inputs state
  const [totalInput, setTotalInput] = useState<string>('42')
  const [attendedInput, setAttendedInput] = useState<string>('38')
  const [requiredInput, setRequiredInput] = useState<string>('75')

  // Calculator outputs derived state
  const total = parseInt(totalInput) || 0
  const attended = parseInt(attendedInput) || 0
  const required = parseInt(requiredInput) || 0

  const isInputValid = total > 0 && attended <= total

  const currentPercentVal = isInputValid ? (attended / total) * 100 : 0
  const currentPercent = currentPercentVal.toFixed(1) + '%'
  const minRequired = isInputValid ? Math.ceil((required / 100) * total) : 0
  const canMiss = isInputValid ? Math.max(0, attended - minRequired) : 0
  const safeMarginVal = attended - minRequired
  const safeMargin = (safeMarginVal >= 0 ? '+' : '') + safeMarginVal

  const handleCopy = () => {
    const letterBlock = document.getElementById('leaveLetterContent')
    const content = letterBlock?.innerText || ''
    navigator.clipboard.writeText(content).then(() => {
      showToast('Leave request letter copied to clipboard!', 'success')
    })
  }

  // Don't render until auth is confirmed
  if (!isAuthenticated) return null

  // Layout sidebar & topbar definition
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
      subtitle="Track your attendance and plan ahead"
      userName={studentName}
      themeColor={theme.sidebarA}
      showNotificationAndAvatar={true}
    />
  )

  return (
    <DashboardLayout college={college} sidebar={sidebar} topbar={topbar}>
      <Card>
        <h2>Attendance Overview</h2>
        
        {/* Stats Summary Cards Row */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Total Classes</div>
            <div className={styles.statValue}>{total}</div>
            <div className={styles.statSubtext}>Held this semester</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Classes Attended</div>
            <div className={styles.statValue}>{attended}</div>
            <div className={styles.statSubtext}>On track</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>Attendance %</div>
            <div className={styles.statValue}>{currentPercent}</div>
            <div className={styles.statSubtext}>Excellent</div>
          </div>
        </div>

        <h2 style={{ marginTop: '30px' }}>Attendance Calculator</h2>
        
        <div className={styles.calculatorSection}>
          {/* Inputs */}
          <div className={styles.calcInputs}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Total Classes Conducted</label>
              <input
                type="number"
                className={styles.inputField}
                placeholder="Enter total classes"
                value={totalInput}
                onChange={(e) => setTotalInput(e.target.value)}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Classes You Attended</label>
              <input
                type="number"
                className={styles.inputField}
                placeholder="Enter attended classes"
                value={attendedInput}
                onChange={(e) => setAttendedInput(e.target.value)}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Required Attendance %</label>
              <input
                type="number"
                className={styles.inputField}
                placeholder="Enter required %"
                value={requiredInput}
                min="0"
                max="100"
                onChange={(e) => setRequiredInput(e.target.value)}
              />
            </div>

            <Button
              onClick={() => {
                if (!isInputValid) {
                  showToast('Please enter valid attendance numbers.', 'error')
                } else {
                  showToast('Attendance stats recalculated successfully.', 'success')
                }
              }}
            >
              Calculate
            </Button>
          </div>

          {/* Outputs */}
          <div className={styles.calcOutput}>
            <div className={styles.outputItem}>
              <span className={styles.outputLabel}>Current Attendance %</span>
              <span className={styles.outputValue}>{currentPercent}</span>
            </div>
            <div className={styles.outputItem}>
              <span className={styles.outputLabel}>Classes You Can Miss</span>
              <span className={styles.outputValue}>{canMiss}</span>
            </div>
            <div className={styles.outputItem}>
              <span className={styles.outputLabel}>Classes to Attend (Min Required)</span>
              <span className={styles.outputValue}>{minRequired}</span>
            </div>
            <div className={styles.outputItem}>
              <span className={styles.outputLabel}>Safe Margin</span>
              <span className={styles.outputValue}>{safeMargin}</span>
            </div>
          </div>
        </div>

        {/* Letter Template */}
        <div className={styles.letterSection}>
          <h2>Letter Template for Ma'am (Emergency)</h2>
          
          <div id="leaveLetterContent" className={styles.letterContent}>
            <div className={styles.letterHeader}>To,</div>
            <div className={styles.letterParagraph}>
              The Course Instructor/Head of Department,<br />
              <span>{college}</span>
            </div>

            <div className={styles.letterHeader}>Subject: Request for Leave - Attendance Relaxation</div>

            <div className={styles.letterParagraph}>Dear Ma'am/Sir,</div>

            <div className={styles.letterParagraph}>
              I am writing to request consideration for attendance relaxation due to{' '}
              <span style={{ fontWeight: 600 }}>[mention reason: medical emergency, family emergency, etc.]</span>.
              During this period, I was unable to attend <span style={{ fontWeight: 600 }}>[number of classes]</span> classes.
            </div>

            <div className={styles.letterParagraph}>
              My current attendance is <span style={{ fontWeight: 600 }}>{currentPercent}</span>, and I
              understand the importance of maintaining the required attendance percentage. I assure
              you that this was an unforeseen circumstance, and I am committed to making up for the
              missed lectures and understanding the course material.
            </div>

            <div className={styles.letterParagraph}>
              I kindly request your understanding and support in this matter. I am available to
              provide any necessary documentation regarding the emergency.
            </div>

            <div className={styles.letterParagraph}>Thank you for your consideration and support.</div>

            <div className={styles.letterParagraph}>
              Sincerely,<br />
              <br />
              <span>{studentName}</span>
              <br />
              Roll Number: <span>{rollNumber}</span>
            </div>
          </div>
          
          <button type="button" className="btn-copy" style={{ marginTop: '16px', padding: '10px 16px', background: '#fbbf24', color: '#1f2937', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }} onClick={handleCopy}>
            Copy Letter
          </button>
        </div>
      </Card>
    </DashboardLayout>
  )
}
