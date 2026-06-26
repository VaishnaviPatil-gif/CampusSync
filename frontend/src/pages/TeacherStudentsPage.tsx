import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './TeacherStudentsPage.module.css'
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

interface BackendStudent {
  name: string
  attendance: number
  marks: number
  risk: 'low' | 'medium' | 'high'
  className: string
  rollNumber: string
  department: string
  semester: number
  gender: string
  dob: string
  bloodGroup: string
  grade: string
  email: string
  phone: string
  parentName: string
  parentPhone: string
  financialStatus: string
  feeStatus: string
  scholarship: string
  stress: number
}

const FIRST_NAMES = [
  'Aarav', 'Ananya', 'Ishita', 'Rahul', 'Sanjana', 'Vikram', 'Karthik', 'Meghana',
  'Rohit', 'Nithya', 'Harsha', 'Kavya', 'Tarun', 'Sneha', 'Aditya', 'Pooja',
  'Arjun', 'Siddhi', 'Ritesh', 'Neha', 'Sai', 'Divya', 'Pranav', 'Lavanya',
  'Sagar', 'Hema'
]

const LAST_NAMES = [
  'Reddy', 'Sharma', 'Kumar', 'Varma', 'Yadav', 'Rao', 'Naidu', 'Patel',
  'Gupta', 'Iyer', 'Kapoor', 'Mishra', 'Goud', 'Nair', 'Joshi', 'Agarwal',
  'Singh', 'Jain', 'Das', 'Mohan'
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const FINANCIAL_STATUSES = ['Low Income', 'Middle Income', 'Upper Middle', 'Economically Weaker Section']
const FEE_STATUSES = ['Paid', 'Pending', 'Partially Paid', 'Overdue']
const SCHOLARSHIP_STATUSES = ['No Scholarship', 'Merit Scholarship', 'Need-based Scholarship', 'Sports Scholarship', 'Government Scholarship']

function hashText(text: string): number {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = ((hash * 31) + text.charCodeAt(i)) >>> 0
  }
  return hash
}

function pick<T>(list: T[], seed: number): T {
  return list[seed % list.length]
}

function departmentFromClass(className: string): string {
  if (className.startsWith('CSE')) return 'Computer Science and Engineering'
  if (className.startsWith('ECE')) return 'Electronics and Communication Engineering'
  return 'Information Technology'
}

function getRiskLevel(marks: number, attendance: number): 'low' | 'medium' | 'high' {
  if (attendance < 65 || marks < 50) return 'high'
  if (attendance < 75 || marks < 65) return 'medium'
  return 'low'
}

function buildStudent(className: string, index: number): BackendStudent {
  const baseSeed = hashText(`${className}-${index}`)
  const firstNameVal = pick(FIRST_NAMES, baseSeed + 3)
  const lastNameVal = pick(LAST_NAMES, baseSeed + 11)
  const name = `${firstNameVal} ${lastNameVal}`
  const department = departmentFromClass(className)
  const attendance = Math.max(0, Math.min(100, 58 + ((baseSeed >> 2) % 43)))
  const marks = Math.max(40, Math.min(100, 40 + ((baseSeed >> 4) % 57)))
  const stress = 1 + ((baseSeed >> 6) % 10)
  const semester = Math.max(1, 1 + ((baseSeed >> 5) % 8))
  const gender = baseSeed % 2 === 0 ? 'Female' : 'Male'
  const bloodGroup = pick(BLOOD_GROUPS, baseSeed + 13)
  const grade = marks >= 90 ? 'A+' : marks >= 80 ? 'A' : marks >= 70 ? 'B' : marks >= 60 ? 'C' : 'D'
  const rollNumber = `${className.replace('-', '')}${String(index + 1).padStart(3, '0')}`
  const year = 2003 + (baseSeed % 4)
  const month = String(1 + ((baseSeed >> 3) % 12)).padStart(2, '0')
  const day = String(1 + ((baseSeed >> 7) % 28)).padStart(2, '0')
  const dob = `${year}-${month}-${day}`
  const phone = `9${String(100000000 + (baseSeed % 900000000)).padStart(9, '0')}`
  const parentPhone = `9${String(100000000 + ((baseSeed * 7) % 900000000)).padStart(9, '0')}`
  const email = `${firstNameVal.toLowerCase()}.${lastNameVal.toLowerCase()}${index + 1}@student360.edu`
  const parentName = `${pick(FIRST_NAMES, baseSeed + 17)} ${lastNameVal}`
  const financialStatus = pick(FINANCIAL_STATUSES, baseSeed + 19)
  const feeStatus = pick(FEE_STATUSES, baseSeed + 23)
  const scholarship = pick(SCHOLARSHIP_STATUSES, baseSeed + 29)
  const risk = getRiskLevel(marks, attendance)

  return {
    name,
    attendance,
    marks,
    risk,
    className,
    rollNumber,
    department,
    semester,
    gender,
    dob,
    bloodGroup,
    grade,
    email,
    phone,
    parentName,
    parentPhone,
    financialStatus,
    feeStatus,
    scholarship,
    stress,
  }
}

export default function TeacherStudentsPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuth()

  // Input states
  const [selectedClass, setSelectedClass] = useState<string>('CSE-A')
  const [feeFilter, setFeeFilter] = useState<string>('all')
  const [marksRange, setMarksRange] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('nameAsc')

  const [selectedStudent, setSelectedStudent] = useState<BackendStudent | null>(null)

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

  // Generate class data deterministically (cached by class selection)
  const classData = useMemo(() => {
    const list: BackendStudent[] = []
    for (let i = 0; i < 60; i++) {
      list.push(buildStudent(selectedClass, i))
    }
    return list
  }, [selectedClass])

  // Filter students based on state
  const filteredStudents = useMemo(() => {
    let list = [...classData]

    if (feeFilter !== 'all') {
      list = list.filter((s) => s.feeStatus === feeFilter)
    }

    if (marksRange !== 'all') {
      list = list.filter((s) => {
        if (marksRange === 'lt50') return s.marks < 50
        if (marksRange === '50to64') return s.marks >= 50 && s.marks < 65
        if (marksRange === '65to79') return s.marks >= 65 && s.marks < 80
        if (marksRange === '80plus') return s.marks >= 80
        return true
      })
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'marksDesc') return b.marks - a.marks
      if (sortBy === 'marksAsc') return a.marks - b.marks
      if (sortBy === 'attendanceDesc') return b.attendance - a.attendance
      return a.name.localeCompare(b.name)
    })

    return list
  }, [classData, feeFilter, marksRange, sortBy])

  // Default-select first student of filtered list on change
  useEffect(() => {
    if (filteredStudents.length > 0) {
      setSelectedStudent(filteredStudents[0])
    } else {
      setSelectedStudent(null)
    }
  }, [filteredStudents])

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
      title="Teacher Students"
      subtitle="Pick a class and review list, risk and full student details."
      userName={teacherName}
      themeColor={theme.sidebarA}
      showNotificationAndAvatar={false}
    />
  )

  return (
    <DashboardLayout college={college} sidebar={sidebar} topbar={topbar}>
      {/* Filters Control Bar */}
      <section className={styles.panel} style={{ padding: '14px 16px' }}>
        <div className={styles.control}>
          <div className={styles.controlGroup}>
            <label htmlFor="classSelect">Select Class:</label>
            <select
              id="classSelect"
              className={styles.selectInput}
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="CSE-A">CSE-A</option>
              <option value="CSE-B">CSE-B</option>
              <option value="CSE-C">CSE-C</option>
              <option value="ECE-A">ECE-A</option>
              <option value="IT-A">IT-A</option>
              <option value="IT-B">IT-B</option>
            </select>
          </div>

          <div className={styles.controlGroup}>
            <label htmlFor="feeFilter">Fee Status:</label>
            <select
              id="feeFilter"
              className={styles.selectInput}
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div className={styles.controlGroup}>
            <label htmlFor="marksRange">Marks Range:</label>
            <select
              id="marksRange"
              className={styles.selectInput}
              value={marksRange}
              onChange={(e) => setMarksRange(e.target.value)}
            >
              <option value="all">All</option>
              <option value="lt50">Below 50</option>
              <option value="50to64">50 - 64</option>
              <option value="65to79">65 - 79</option>
              <option value="80plus">80 and above</option>
            </select>
          </div>

          <div className={styles.controlGroup}>
            <label htmlFor="sortBy">Sort:</label>
            <select
              id="sortBy"
              className={styles.selectInput}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="nameAsc">Name A-Z</option>
              <option value="marksDesc">Marks High-Low</option>
              <option value="marksAsc">Marks Low-High</option>
              <option value="attendanceDesc">Attendance High-Low</option>
            </select>
          </div>
        </div>
      </section>

      {/* Students List Table Panel */}
      <section className={styles.panel}>
        <div className={styles.tableWrap}>
          <table className={styles.studentTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Attendance</th>
                <th>Marks</th>
                <th>Risk</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center' }}>
                    No students match current filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student, idx) => (
                  <tr key={idx}>
                    <td>{student.name}</td>
                    <td>{student.attendance}%</td>
                    <td>{student.marks}%</td>
                    <td>
                      <span
                        className={`${styles.badge} ${
                          student.risk === 'low'
                            ? styles.badgeLow
                            : student.risk === 'medium'
                              ? styles.badgeMedium
                              : styles.badgeHigh
                        }`}
                      >
                        {student.risk.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button
                        className={styles.viewBtn}
                        type="button"
                        onClick={() => setSelectedStudent(student)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Details Inspector Panel */}
      <section className={styles.detailsPanel}>
        <div className={styles.detailsHead}>
          <h4>
            {selectedStudent ? `View Details: ${selectedStudent.name}` : 'View Details'}
          </h4>
          <p>
            {selectedStudent
              ? `Overall Risk: ${selectedStudent.risk.toUpperCase()} | Marks: ${selectedStudent.marks}% | Fee Status: ${selectedStudent.feeStatus}`
              : 'Select a class/filter with student results.'}
          </p>
        </div>

        {selectedStudent && (
          <div className={styles.detailsGrid}>
            <div className={styles.field}>
              <p>Name</p>
              <h5>{selectedStudent.name}</h5>
            </div>
            <div className={styles.field}>
              <p>Roll Number</p>
              <h5>{selectedStudent.rollNumber}</h5>
            </div>
            <div className={styles.field}>
              <p>Class</p>
              <h5>{selectedStudent.className}</h5>
            </div>
            <div className={styles.field}>
              <p>Department</p>
              <h5>{selectedStudent.department}</h5>
            </div>
            <div className={styles.field}>
              <p>Semester</p>
              <h5>{selectedStudent.semester}</h5>
            </div>
            <div className={styles.field}>
              <p>Gender</p>
              <h5>{selectedStudent.gender}</h5>
            </div>
            <div className={styles.field}>
              <p>Date of Birth</p>
              <h5>{selectedStudent.dob}</h5>
            </div>
            <div className={styles.field}>
              <p>Blood Group</p>
              <h5>{selectedStudent.bloodGroup}</h5>
            </div>
            <div className={styles.field}>
              <p>Grade</p>
              <h5>{selectedStudent.grade}</h5>
            </div>
            <div className={styles.field}>
              <p>Attendance</p>
              <h5>{selectedStudent.attendance}%</h5>
            </div>
            <div className={styles.field}>
              <p>Marks</p>
              <h5>{selectedStudent.marks}%</h5>
            </div>
            <div className={styles.field}>
              <p>Stress Score</p>
              <h5>{selectedStudent.stress}/10</h5>
            </div>
            <div className={styles.field}>
              <p>Email ID</p>
              <h5>{selectedStudent.email}</h5>
            </div>
            <div className={styles.field}>
              <p>Phone Number</p>
              <h5>{selectedStudent.phone}</h5>
            </div>
            <div className={styles.field}>
              <p>Parent Name</p>
              <h5>{selectedStudent.parentName}</h5>
            </div>
            <div className={styles.field}>
              <p>Parent Phone</p>
              <h5>{selectedStudent.parentPhone}</h5>
            </div>
            <div className={styles.field}>
              <p>Financial Status</p>
              <h5>{selectedStudent.financialStatus}</h5>
            </div>
            <div className={styles.field}>
              <p>Fee Status</p>
              <h5>{selectedStudent.feeStatus}</h5>
            </div>
            <div className={styles.field}>
              <p>Scholarship</p>
              <h5>{selectedStudent.scholarship}</h5>
            </div>
          </div>
        )}
      </section>
    </DashboardLayout>
  )
}
