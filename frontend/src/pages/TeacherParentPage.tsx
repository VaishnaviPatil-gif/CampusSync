import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './TeacherParentPage.module.css'
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

interface ParentMessage {
  id: string
  className: string
  type: string
  studentName: string
  parentPhone: string
  messageBody: string
  sentBy: string
  sentAt: string
}

function autoMessageTemplate(type: string, studentName: string): string {
  if (type === 'Upcoming PTM')
    return `Dear Parent, PTM for ${studentName} is scheduled this week. Kindly attend.`
  if (type === 'Low Attendance')
    return `Dear Parent, ${studentName} has low attendance. Please review and support regular attendance.`
  if (type === 'Fee Payment Reminder')
    return `Dear Parent, fee payment for ${studentName} is pending. Please clear dues at the earliest.`
  if (type === 'Academic Concern')
    return `Dear Parent, we observed academic concern for ${studentName}. Please connect with faculty.`
  return `Dear Parent, this is an update regarding ${studentName}. Please contact faculty for more details.`
}

export default function TeacherParentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuth()

  // Form states
  const [targetClass, setTargetClass] = useState<string>('')
  const [messageType, setMessageType] = useState<string>('')
  const [studentNameInput, setStudentNameInput] = useState<string>('')
  const [parentPhone, setParentPhone] = useState<string>('')
  const [messageBody, setMessageBody] = useState<string>('')

  const [messages, setMessages] = useState<ParentMessage[]>([])

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

  const storageKey = `student360ParentMessages::${college}`

  // Load message logs on mount or college change
  useEffect(() => {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setMessages(parsed)
          return
        }
      } catch {
        // Ignore
      }
    }
    setMessages([])
  }, [storageKey])

  const saveMessages = (list: ParentMessage[]) => {
    localStorage.setItem(storageKey, JSON.stringify(list))
    setMessages(list)
  }

  const formatDateTime = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Trigger autofill template if messageBody is empty and type/name exists
  const handleAutofill = (type: string, name: string) => {
    if (!type || !name || messageBody.trim() !== '') return
    setMessageBody(autoMessageTemplate(type, name))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!targetClass || !messageType || !studentNameInput || !parentPhone || !messageBody) {
      return
    }

    const newMessage: ParentMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      className: targetClass,
      type: messageType,
      studentName: studentNameInput.trim(),
      parentPhone: parentPhone.trim(),
      messageBody: messageBody.trim(),
      sentBy: teacherName,
      sentAt: new Date().toISOString(),
    }

    const nextList = [...messages, newMessage]
    saveMessages(nextList)

    // Reset form
    setTargetClass('')
    setMessageType('')
    setStudentNameInput('')
    setParentPhone('')
    setMessageBody('')
  }

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
  )

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
      title="Teacher Parent Communication"
      subtitle="Send alerts for PTM updates, low attendance, fee payment reminders, and student concerns."
      userName={teacherName}
      themeColor={theme.sidebarA}
      showNotificationAndAvatar={false}
    />
  )

  return (
    <DashboardLayout college={college} sidebar={sidebar} topbar={topbar}>
      {/* Messaging form panel */}
      <section className={styles.formPanel}>
        <form onSubmit={handleSubmit} className={styles.messageForm}>
          <div className={styles.field}>
            <label htmlFor="classSelect">Class</label>
            <select
              id="classSelect"
              value={targetClass}
              onChange={(e) => setTargetClass(e.target.value)}
              required
            >
              <option value="">Select</option>
              <option>CSE-A</option>
              <option>CSE-B</option>
              <option>CSE-C</option>
              <option>ECE-A</option>
              <option>IT-A</option>
              <option>IT-B</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="messageType">Message Type</label>
            <select
              id="messageType"
              value={messageType}
              onChange={(e) => {
                setMessageType(e.target.value)
                handleAutofill(e.target.value, studentNameInput)
              }}
              required
            >
              <option value="">Select</option>
              <option>Upcoming PTM</option>
              <option>Low Attendance</option>
              <option>Fee Payment Reminder</option>
              <option>Academic Concern</option>
              <option>General Update</option>
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="studentName">Student Name</label>
            <input
              id="studentName"
              type="text"
              placeholder="Enter student name"
              value={studentNameInput}
              onChange={(e) => setStudentNameInput(e.target.value)}
              onBlur={() => handleAutofill(messageType, studentNameInput)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="parentPhone">Parent Phone</label>
            <input
              id="parentPhone"
              type="tel"
              placeholder="Enter parent phone"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              required
            />
          </div>

          <div className={styles.field} style={{ gridColumn: '1 / -1' }}>
            <label htmlFor="messageBody">Message</label>
            <textarea
              id="messageBody"
              placeholder="Type message to parent"
              value={messageBody}
              onChange={(e) => setMessageBody(e.target.value)}
              required
            />
          </div>

          <button className={styles.btn} type="submit">
            Send Message
          </button>
        </form>
      </section>

      {/* History panel list */}
      <section className={styles.historyPanel}>
        <div className={styles.tableWrap}>
          <table className={styles.historyTable}>
            <thead>
              <tr>
                <th>Time</th>
                <th>Class</th>
                <th>Type</th>
                <th>Student</th>
                <th>Parent Phone</th>
                <th>Message</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sortedMessages.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>
                    No parent messages sent yet.
                  </td>
                </tr>
              ) : (
                sortedMessages.map((item) => (
                  <tr key={item.id}>
                    <td>{formatDateTime(item.sentAt)}</td>
                    <td>{item.className}</td>
                    <td>{item.type}</td>
                    <td>{item.studentName}</td>
                    <td>{item.parentPhone}</td>
                    <td>{item.messageBody}</td>
                    <td>
                      <span className={styles.tag}>SENT</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  )
}
