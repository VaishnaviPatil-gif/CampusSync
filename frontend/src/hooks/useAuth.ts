/**
 * useAuth — hook for reading and managing the current user session.
 *
 * The original HTML pages stored user context in localStorage under these keys:
 *   'student360CurrentUser'           → current user email
 *   `${email}_student360Name`         → display name
 *   `${email}_student360College`      → college slug
 *   `${email}_student360Class`        → assigned class (e.g. "CSE-A")
 *   `${email}_student360TeacherSubject` → subject (e.g. "Mathematics")
 *
 * This hook reads all those keys, reconstructs a typed User object, and
 * provides a clearSession() function for logout.
 *
 * Phase 2 will extend this with proper JWT / session-cookie auth.
 */
import { useCallback } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { User, Role, College } from '@/types'

const CURRENT_USER_KEY = 'student360CurrentUser'

export function useAuth(): {
  user: User | null
  isAuthenticated: boolean
  setUser: (user: User) => void
  clearSession: () => void
} {
  const [email, setEmail, removeEmail] = useLocalStorage<string | null>(
    CURRENT_USER_KEY,
    null
  )

  // Reconstruct the full User object from the individual localStorage keys
  // that the original pages wrote after login.
  const user: User | null = (() => {
    if (!email) return null

    const fullName = localStorage.getItem(`${email}_student360Name`) ?? ''
    const college = localStorage.getItem(`${email}_student360College`) ?? ''
    const assignedClass = localStorage.getItem(`${email}_student360Class`) ?? ''
    const teacherSubject =
      localStorage.getItem(`${email}_student360TeacherSubject`) ?? ''

    // Derive role from the email slug convention established in the original app.
    // Phase 2 will get this from the backend response directly.
    const roleRaw = localStorage.getItem(`${email}_student360Role`) ?? ''
    const role: Role =
      roleRaw === 'teacher'
        ? 'teacher'
        : roleRaw === 'parent'
          ? 'parent'
          : 'student'

    return {
      email,
      fullName,
      role,
      college: college as College,
      assignedClass,
      teacherSubject,
    }
  })()

  const setUser = useCallback(
    (u: User) => {
      // Write all the individual keys that the original app expected.
      localStorage.setItem(`${u.email}_student360Name`, u.fullName)
      localStorage.setItem(`${u.email}_student360College`, u.college)
      localStorage.setItem(`${u.email}_student360Class`, u.assignedClass)
      localStorage.setItem(
        `${u.email}_student360TeacherSubject`,
        u.teacherSubject
      )
      localStorage.setItem(`${u.email}_student360Role`, u.role)
      setEmail(u.email)
    },
    [setEmail]
  )

  const clearSession = useCallback(() => {
    if (email) {
      // Clean up all per-user keys.
      ;[
        '_student360Name',
        '_student360College',
        '_student360Class',
        '_student360TeacherSubject',
        '_student360Role',
      ].forEach((suffix) => localStorage.removeItem(`${email}${suffix}`))
    }
    removeEmail()
  }, [email, removeEmail])

  return {
    user,
    isAuthenticated: !!email,
    setUser,
    clearSession,
  }
}
