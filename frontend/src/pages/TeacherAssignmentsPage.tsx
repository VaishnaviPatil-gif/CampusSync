import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './TeacherAssignmentsPage.module.css'
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

interface LocalAssignment {
  id: string
  className: string
  subject: string
  task: string
  description: string
  dueDate: string
  createdAt: string
  createdBy: string
  attachment?: {
    name: string
    type: string
    dataUrl: string
  } | null
}

function deriveTeacherSubject(seedText: string): string {
  const subjects = ['Mathematics', 'Physics', 'Chemistry', 'English', 'Computer Science', 'Electronics', 'Data Structures']
  const text = (seedText || 'teacher').toString()
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash * 31) + text.charCodeAt(i)) >>> 0
  }
  return subjects[hash % subjects.length]
}

export default function TeacherAssignmentsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuth()

  // Form states
  const [targetClass, setTargetClass] = useState<string>('')
  const [task, setTask] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [dueDate, setDueDate] = useState<string>('')
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)

  const [assignments, setAssignments] = useState<LocalAssignment[]>([])

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

  const storageKey = `student360Assignments::${college}`

  // Load assignments on mount or college change
  useEffect(() => {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          setAssignments(parsed)
          return
        }
      } catch {
        // Ignore
      }
    }
    setAssignments([])
  }, [storageKey])

  const saveAssignments = (list: LocalAssignment[]) => {
    localStorage.setItem(storageKey, JSON.stringify(list))
    setAssignments(list)
  }

  const getStatus = (dateVal: string): 'overdue' | 'pending' | 'upcoming' => {
    const today = new Date()
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const due = new Date(dateVal + 'T00:00:00')

    if (due < todayOnly) return 'overdue'
    if (due.getTime() === todayOnly.getTime()) return 'pending'
    return 'upcoming'
  }

  const formatDate = (dateValue: string) => {
    const date = new Date(dateValue + 'T00:00:00')
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: '2-digit' })
  }

  const readAttachment = (file: File | null): Promise<{ name: string; type: string; dataUrl: string } | null> => {
    if (!file) return Promise.resolve(null)

    const maxBytes = 1.5 * 1024 * 1024
    if (file.size > maxBytes) {
      alert('Attachment too large. Please upload a file up to 1.5 MB.')
      return Promise.resolve(null)
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve({
          name: file.name,
          type: file.type || 'application/octet-stream',
          dataUrl: reader.result as string,
        })
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!targetClass || !task || !dueDate) return

    const fileDetails = await readAttachment(attachmentFile)

    const newAssignment: LocalAssignment = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      className: targetClass,
      subject: teacherSubject,
      task: task.trim(),
      description: description.trim(),
      dueDate,
      createdAt: new Date().toISOString(),
      createdBy: teacherName,
      attachment: fileDetails,
    }

    const nextList = [...assignments, newAssignment]
    saveAssignments(nextList)

    // Reset form
    setTargetClass('')
    setTask('')
    setDescription('')
    setDueDate('')
    setAttachmentFile(null)
    const fileInput = document.getElementById('attachment') as HTMLInputElement | null
    if (fileInput) fileInput.value = ''
  }

  const handleDelete = (id: string) => {
    const yes = confirm('Delete this assignment?')
    if (!yes) return
    const nextList = assignments.filter((item) => item.id !== id)
    saveAssignments(nextList)
  }

  const handleExtend = (id: string) => {
    const item = assignments.find((a) => a.id === id)
    if (!item) return
    const currentDue = item.dueDate
    const nextDue = prompt('Enter new due date (YYYY-MM-DD)', currentDue)
    if (!nextDue) return

    const isValid = /^\d{4}-\d{2}-\d{2}$/.test(nextDue)
    if (!isValid) {
      alert('Please enter date in YYYY-MM-DD format.')
      return
    }

    const nextList = assignments.map((a) => (a.id === id ? { ...a, dueDate: nextDue } : a))
    saveAssignments(nextList)
  }

  const handleEdit = (id: string) => {
    const item = assignments.find((a) => a.id === id)
    if (!item) return

    const updatedTask = prompt('Edit task', item.task)
    if (!updatedTask) return

    const updatedDesc = prompt('Edit description', item.description)
    if (updatedDesc === null) return

    const updatedClass = prompt('Edit class (CSE-A/CSE-B/CSE-C/ECE-A/IT-A/IT-B)', item.className)
    if (!updatedClass) return

    const allowedClasses = ['CSE-A', 'CSE-B', 'CSE-C', 'ECE-A', 'IT-A', 'IT-B']
    if (!allowedClasses.includes(updatedClass.trim().toUpperCase())) {
      alert('Invalid class. Please use CSE-A, CSE-B, CSE-C, ECE-A, IT-A, or IT-B.')
      return
    }

    const nextList = assignments.map((a) =>
      a.id === id
        ? {
            ...a,
            task: updatedTask.trim(),
            description: updatedDesc.trim(),
            className: updatedClass.trim().toUpperCase(),
          }
        : a
    )
    saveAssignments(nextList)
  }

  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
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
      title="Assignments"
      subtitle="Add homework/tasks with due date. Only your subject assignments are allowed and students in selected class will see them."
      userName={teacherName}
      themeColor={theme.sidebarA}
      showNotificationAndAvatar={false}
    />
  )

  return (
    <DashboardLayout college={college} sidebar={sidebar} topbar={topbar}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '10px',
        }}
      >
        <span className={styles.pill}>Total: {assignments.length}</span>
      </header>

      {/* Assignment Publishing Form */}
      <section className={styles.formPanel}>
        <form onSubmit={handleSubmit} className={styles.assignmentForm}>
          <div className={styles.field}>
            <label>Your Subject</label>
            <input type="text" value={teacherSubject} readOnly />
          </div>

          <div className={styles.field}>
            <label htmlFor="targetClass">Select Class</label>
            <select
              id="targetClass"
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
            <label htmlFor="task">Add Assignment</label>
            <input
              id="task"
              type="text"
              placeholder="Enter homework / task"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="dueDate">Add Due Date</label>
            <input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="attachment">Attachment</label>
            <input
              id="attachment"
              type="file"
              accept=".doc,.docx,.pdf,image/*"
              onChange={(e) => setAttachmentFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <button className={styles.btn} type="submit">
            Add Assignment
          </button>
        </form>
      </section>

      {/* Assignments List Table */}
      <section className={styles.tablePanel}>
        <div className={styles.tableWrap}>
          <table className={styles.assignmentTable}>
            <thead>
              <tr>
                <th>Class</th>
                <th>Subject</th>
                <th>Task</th>
                <th>Description</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Attachment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedAssignments.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center' }}>
                    No assignments added yet.
                  </td>
                </tr>
              ) : (
                sortedAssignments.map((item) => {
                  const statusVal = getStatus(item.dueDate)
                  return (
                    <tr key={item.id}>
                      <td>{item.className}</td>
                      <td>{item.subject}</td>
                      <td>{item.task}</td>
                      <td>{item.description || '-'}</td>
                      <td>{formatDate(item.dueDate)}</td>
                      <td>
                        <span
                          className={`${styles.status} ${
                            statusVal === 'overdue'
                              ? styles.statusOverdue
                              : statusVal === 'pending'
                                ? styles.statusPending
                                : styles.statusUpcoming
                          }`}
                        >
                          {statusVal.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {item.attachment?.dataUrl ? (
                          <a
                            href={item.attachment.dataUrl}
                            download={item.attachment.name}
                            style={{ color: 'var(--sd-sidebar-1)', textDecoration: 'underline' }}
                          >
                            Download
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.actionBtn}
                            type="button"
                            onClick={() => handleEdit(item.id)}
                          >
                            Edit
                          </button>
                          <button
                            className={styles.actionBtn}
                            type="button"
                            onClick={() => handleExtend(item.id)}
                          >
                            Extend
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.actionBtnDelete}`}
                            type="button"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  )
}
