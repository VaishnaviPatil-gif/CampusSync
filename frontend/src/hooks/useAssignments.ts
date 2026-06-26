/**
 * useAssignments — reads teacher assignments from localStorage.
 *
 * Converts the original getAssignmentsByCollege(), getAssignmentStatus(),
 * formatAssignmentDate(), renderAssignmentsForStudent() JS functions.
 *
 * Assignments are stored under:
 *   localStorage["student360Assignments::<college>"]
 *
 * Returns a filtered + sorted list of assignments for the given class,
 * plus derived display properties (status label, formatted date).
 */
import { useMemo } from 'react'
import type { Assignment } from '@/types'

export type AssignmentStatus = 'Overdue' | 'Pending' | 'Upcoming'

export interface DisplayAssignment extends Assignment {
  statusLabel: AssignmentStatus
  formattedDate: string
}

function assignmentsStorageKey(college: string): string {
  return `student360Assignments::${college}`
}

function getRawAssignments(college: string): Assignment[] {
  const raw = localStorage.getItem(assignmentsStorageKey(college))
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? (parsed as Assignment[]) : []
  } catch {
    return []
  }
}

function getAssignmentStatus(dueDate: string): AssignmentStatus {
  const todayOnly = new Date()
  todayOnly.setHours(0, 0, 0, 0)
  const due = new Date(`${dueDate}T00:00:00`)
  if (due < todayOnly) return 'Overdue'
  if (due.getTime() === todayOnly.getTime()) return 'Pending'
  return 'Upcoming'
}

function formatAssignmentDate(dueDate: string): string {
  const due = new Date(`${dueDate}T00:00:00`)
  return due.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  })
}

export function useAssignments(
  college: string,
  studentClass: string
): { assignments: DisplayAssignment[] } {
  const assignments = useMemo<DisplayAssignment[]>(() => {
    const raw = getRawAssignments(college)
    return raw
      .filter((a) => a.className === studentClass || !a.className)
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
      .map((a) => ({
        ...a,
        statusLabel: getAssignmentStatus(a.dueDate),
        formattedDate: formatAssignmentDate(a.dueDate),
      }))
  }, [college, studentClass])

  return { assignments }
}
