/**
 * CampusSync — Shared TypeScript Types
 *
 * Central type definitions used across the whole React app.
 * Extracted from the existing HTML/JS pages which stored these values
 * in localStorage and query-string parameters.
 */

/* --------------------------------------------------------------------------
   Roles
   Matches the role values used in the original sign-up / login form.
   -------------------------------------------------------------------------- */
export type Role = 'student' | 'teacher' | 'parent'

/* --------------------------------------------------------------------------
   Colleges
   Matches the <option> values in the original landing page form.
   -------------------------------------------------------------------------- */
export type College =
  | 'BRECW'
  | 'Anurag University'
  | 'BVRIT'
  | 'MREM'
  | 'JNTUH'
  | 'CBIT'
  | 'VNRVJIET'

/* --------------------------------------------------------------------------
   User
   Mirrors what the Flask backend returns and what the original frontend
   stored in localStorage under keys like `student360CurrentUser`.
   -------------------------------------------------------------------------- */
export interface User {
  /** Derived email: slug@student360.local */
  email: string
  fullName: string
  role: Role
  college: College
  /** e.g. "CSE-A" — derived server-side */
  assignedClass: string
  /** e.g. "Mathematics" — derived server-side */
  teacherSubject: string
}

/* --------------------------------------------------------------------------
   API response wrappers
   -------------------------------------------------------------------------- */
export interface ApiSuccess<T> {
  ok: true
  data: T
}

export interface ApiError {
  ok: false
  status: number
  message: string
}

export type ApiResult<T> = ApiSuccess<T> | ApiError

/* --------------------------------------------------------------------------
   Sensor / Alert types
   Matches the Flask GET /api/latest response shape.
   -------------------------------------------------------------------------- */
export interface SensorSnapshot {
  timestamp: string
  temperature?: number
  humidity?: number
  co2?: number
  [key: string]: unknown
}

export interface AlertPayload {
  studentName: string
  college: College
  assignedClass: string
  reason: string
  triggeredBy: Role
}

/* --------------------------------------------------------------------------
   Assignment — stored in localStorage under student360Assignments::<college>
   Written by the Teacher dashboard, read by the Student dashboard.
   -------------------------------------------------------------------------- */
export interface AssignmentAttachment {
  name: string
  dataUrl: string
}

export interface Assignment {
  subject: string
  task: string
  description?: string
  dueDate: string          // ISO date string "YYYY-MM-DD"
  className?: string       // e.g. "CSE-A" — undefined means all classes
  attachment?: AssignmentAttachment
}

/* --------------------------------------------------------------------------
   Sensor data — from Flask GET /api/latest
   -------------------------------------------------------------------------- */
export interface SensorReading {
  temperature?: number
  humidity?: number
  heartRate?: number
  stress?: number
  receivedAt?: string      // ISO timestamp
}

export interface SensorHistory {
  temperature: number[]
  humidity: number[]
  heartRate: number[]
  stress: number[]
}

/* --------------------------------------------------------------------------
   College theming
   -------------------------------------------------------------------------- */
export interface CollegeTheme {
  bgA: string
  bgB: string
  sidebarA: string
  sidebarB: string
  textMain: string
  textMuted: string
  /** Teacher dashboard additional tokens */
  lineColor: string
  chipBorder: string
  chipBg: string
  chipText: string
  barA: string
  barB: string
}

/* --------------------------------------------------------------------------
   Subject classification
   -------------------------------------------------------------------------- */
export type SubjectStatus = 'weak' | 'stable' | 'strong'

export interface SubjectEntry {
  name: string
  status: SubjectStatus
}
