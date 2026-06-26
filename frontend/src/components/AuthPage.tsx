/**
 * AuthPage — the login form + hero section.
 *
 * Pixel-perfect React port of <div class="page auth-page"> from the original HTML.
 *
 * Key changes from original:
 *   - window.location.href routing  → useNavigate() from react-router-dom
 *   - localStorage writes           → useAuth().setUser()
 *   - DOM event listeners           → React state + controlled form
 *   - showAuthPage / showOverview   → onBack prop callback
 */
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '@/pages/LandingPage.module.css'
import { useAuth } from '@/hooks/useAuth'
import type { Role, College } from '@/types'

/* ── Types ── */
interface LoginFormState {
  fullName: string
  role: string
  college: string
}

interface NoteState {
  text: string
  isError: boolean
}

/* ── Constants ── */
const COLLEGE_ALIASES: Record<string, College> = {
  brecw: 'BRECW',
  anuraguniversity: 'Anurag University',
  bvrit: 'BVRIT',
  mrem: 'MREM',
  jntuh: 'JNTUH',
  cbit: 'CBIT',
  vnrvjiet: 'VNRVJIET',
}

const COLLEGES: Array<{ value: string; label: string }> = [
  { value: 'BRECW', label: 'BRECW' },
  { value: 'Anurag University', label: 'Anurag University' },
  { value: 'BVRIT', label: 'BVRIT' },
  { value: 'MREM', label: 'MREM' },
  { value: 'JNTUH', label: 'JNTUH' },
  { value: 'CBIT', label: 'CBIT' },
  { value: 'VNRVJIET', label: 'VNRVJIET' },
]

/* ── Helpers (mirrors original canonicalRole / canonicalCollege) ── */
const normalizeToken = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, '')

const canonicalRole = (value: string): Role | '' => {
  const r = value.trim().toLowerCase()
  if (r === 'student') return 'student'
  if (r === 'teacher' || r === 'faculty') return 'teacher'
  if (r === 'parent') return 'parent'
  return ''
}

const canonicalCollege = (value: string): College | '' => {
  const key = normalizeToken(value)
  return COLLEGE_ALIASES[key] ?? ''
}

/* ── Graduation cap SVG ── */
const GraduationCapSvg = ({ className }: { className: string }) => (
  <svg className={className} viewBox="0 0 64 64" aria-hidden="true">
    <path
      fill="currentColor"
      d="M32 12 8 24l24 12 19-9.5V42h5V24L32 12Zm-15 22.8V41c0 3.9 6.7 7 15 7s15-3.1 15-7v-6.2L32 42 17 34.8Z"
    />
  </svg>
)

/* ── Component ── */
interface AuthPageProps {
  isActive: boolean
  preselectedRole: string
  onBack: () => void
}

export default function AuthPage({ isActive, preselectedRole, onBack }: AuthPageProps) {
  const navigate = useNavigate()
  const { setUser } = useAuth()

  const [form, setForm] = useState<LoginFormState>({
    fullName: '',
    role: preselectedRole,
    college: '',
  })

  // Sync preselectedRole from parent (when user clicks a role card on the showcase page)
  // Using a key on the form element (managed by parent) would be cleaner but
  // a direct state sync via useEffect is fine here given the shallow state.
  const [note, setNote] = useState<NoteState>({ text: '', isError: false })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Keep form.role in sync when parent passes a new preselectedRole
  // (e.g. user clicks "Login as Student" on showcase → authPage opens with role pre-filled)
  const prevRoleRef = useState(preselectedRole)
  if (prevRoleRef[0] !== preselectedRole) {
    prevRoleRef[0] = preselectedRole
    setForm((f) => ({ ...f, role: preselectedRole }))
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const fullName = form.fullName.trim()
    const role = canonicalRole(form.role)
    const college = canonicalCollege(form.college)

    if (!fullName || !role || !college) {
      setNote({ text: 'Name, role, and college are required.', isError: true })
      return
    }

    setNote({ text: 'Logging in...', isError: false })
    setIsSubmitting(true)

    // Derive email slug — same algorithm as original routeByRole()
    const slug =
      fullName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '.')
        .replace(/^\.+|\.+$/g, '') || 'student'
    const email = `${slug}@student360.local`

    const user = {
      email,
      fullName,
      role,
      college,
      assignedClass: 'CSE-A',      // defaults, will come from backend in Phase 3
      teacherSubject: 'Mathematics',
    }

    // Write to localStorage via the hook (same keys as original)
    setUser(user)

    // Navigate after 300ms — mirrors the original setTimeout delay
    setTimeout(() => {
      setIsSubmitting(false)
      if (role === 'student') {
        navigate(`/student?college=${encodeURIComponent(college)}&class=${encodeURIComponent(user.assignedClass)}`)
      } else if (role === 'teacher') {
        navigate(`/teacher?college=${encodeURIComponent(college)}`)
      } else if (role === 'parent') {
        navigate(`/parent?college=${encodeURIComponent(college)}&class=${encodeURIComponent(user.assignedClass)}`)
      } else {
        setNote({ text: 'Dashboard for this role is not available yet.', isError: true })
        setIsSubmitting(false)
      }
    }, 300)
  }

  return (
    <div
      className={`${styles.page} ${isActive ? styles.authPageVisible : styles.authPageHidden}`}
      id="authPage"
    >
      {/* ── Top bar ── */}
      <header className={styles.topbar}>
        <div className={styles.logoMark}>
          <span className={styles.brandWord}>
            STUDENT 360°
            <GraduationCapSvg className={styles.sCap} />
          </span>
        </div>
        <div className={styles.topbarSide}>
          <button
            className={styles.backNav}
            type="button"
            id="backOverviewBtn"
            onClick={onBack}
          >
            Back To Overview
          </button>
          <div className={styles.statusPill}>
            Live risk intelligence for teachers and parents
          </div>
        </div>
      </header>

      {/* ── Main layout ── */}
      <main className={styles.layout}>

        {/* Hero panel */}
        <section className={styles.hero}>
          <h1 className={styles.headingBrand}>
            Student 360°
            <GraduationCapSvg className={`${styles.sCap} ${styles.sCapHero}`} />
          </h1>
          <p>
            <strong>A 360 view of success before it is too late.</strong>{' '}
            Student 360° merges academics, mental health, attendance, and behavior into one
            real-time intelligence system that detects risk early and triggers meaningful intervention.
          </p>
          <div className={styles.chipRow}>
            <div className={styles.chip}><b>Real-Time:</b> continuous signal monitoring and alerting</div>
            <div className={styles.chip}><b>Predictive:</b> patterns identify hidden risk earlier</div>
            <div className={styles.chip}><b>Unified:</b> grades, mood, behavior, and context in one place</div>
            <div className={styles.chip}><b>Actionable:</b> parent-teacher alerts with intervention cues</div>
          </div>
        </section>

        {/* Auth panel */}
        <aside className={styles.auth} aria-label="Authentication">
          <div className={styles.authHead}>
            <h2>Access Portal</h2>
          </div>
          <p className={styles.authSub}>Select your role and college to enter directly.</p>

          <div className={styles.forms}>
            <form
              className={`${styles.form} ${styles.formActive}`}
              id="loginForm"
              onSubmit={handleSubmit}
              noValidate
            >
              <input
                className={styles.fieldInput}
                type="text"
                name="fullName"
                placeholder="Enter Name"
                required
                value={form.fullName}
                onChange={handleChange}
                autoComplete="name"
                aria-label="Full name"
              />

              <select
                className={styles.fieldSelect}
                name="role"
                required
                value={form.role}
                onChange={handleChange}
                aria-label="Select role"
              >
                <option value="">Select Role</option>
                <option value="Student">Student</option>
                <option value="Teacher">Teacher</option>
                <option value="Parent">Parent</option>
              </select>

              <select
                className={styles.fieldSelect}
                name="college"
                required
                value={form.college}
                onChange={handleChange}
                aria-label="Select college"
              >
                <option value="">Select College</option>
                {COLLEGES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>

              <button
                className={styles.submitBtn}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Entering...' : 'Enter Dashboard'}
              </button>

              <p
                className={`${styles.authNote} ${
                  note.isError ? styles.authNoteError : note.text ? styles.authNoteSuccess : ''
                }`}
                id="loginNote"
                role="status"
                aria-live="polite"
              >
                {note.text}
              </p>
            </form>
          </div>
        </aside>
      </main>
    </div>
  )
}
