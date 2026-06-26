/**
 * CampusSync — API Service Layer
 *
 * Centralised fetch wrappers for all backend calls.
 * The original pages made raw fetch() calls inline; this module extracts
 * them into typed, reusable functions.
 *
 * Base URLs:
 *   Flask  (auth, SQLite, sensors) → http://localhost:5000
 *   Express (alerts, Telegram)     → http://localhost:3001
 *
 * In development, Vite's proxy (vite.config.ts) forwards /api/* to Flask
 * automatically, so no CORS headers are needed for those routes.
 */

import type { ApiResult, AlertPayload, SensorSnapshot, User } from '@/types'

/* --------------------------------------------------------------------------
   Configuration
   -------------------------------------------------------------------------- */
const FLASK_BASE = import.meta.env.VITE_FLASK_URL ?? 'http://localhost:5000'
const EXPRESS_BASE = import.meta.env.VITE_EXPRESS_URL ?? 'http://localhost:3001'

/* --------------------------------------------------------------------------
   Internal helper — typed fetch wrapper
   -------------------------------------------------------------------------- */
async function request<T>(
  url: string,
  options?: RequestInit
): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })

    if (!res.ok) {
      const text = await res.text().catch(() => res.statusText)
      return { ok: false, status: res.status, message: text }
    }

    const data = (await res.json()) as T
    return { ok: true, data }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    return { ok: false, status: 0, message }
  }
}

/* --------------------------------------------------------------------------
   Auth — Flask service
   -------------------------------------------------------------------------- */

/** Log in with name + role + college (no password in current flow). */
export async function login(payload: {
  fullName: string
  role: string
  college: string
}): Promise<ApiResult<User>> {
  return request<User>(`${FLASK_BASE}/api/login`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** Sign up a new user. */
export async function signUp(payload: {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  role: string
  college: string
}): Promise<ApiResult<User>> {
  return request<User>(`${FLASK_BASE}/api/signup`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/* --------------------------------------------------------------------------
   Sensor data — Flask service
   -------------------------------------------------------------------------- */

/** Fetch the latest sensor snapshot (temperature, humidity, CO₂, etc.). */
export async function getLatestSensor(): Promise<ApiResult<SensorSnapshot>> {
  return request<SensorSnapshot>(`${FLASK_BASE}/api/latest`)
}

/** Fetch live sensor reading (typed for the student dashboard). */
export async function fetchSensorData(): Promise<ApiResult<import('@/types').SensorReading>> {
  return request<import('@/types').SensorReading>(`${FLASK_BASE}/api/latest`)
}

/** Fetch total number of students. */
export async function getStudentCount(): Promise<ApiResult<{ count: number }>> {
  return request<{ count: number }>(`${FLASK_BASE}/api/students/count`)
}

/** Fetch total number of teachers. */
export async function getTeacherCount(): Promise<ApiResult<{ count: number }>> {
  return request<{ count: number }>(`${FLASK_BASE}/api/teachers/count`)
}

/** Fetch student list. */
export async function getStudents(): Promise<ApiResult<User[]>> {
  return request<User[]>(`${FLASK_BASE}/api/students`)
}

export interface BackendStudent {
  id: string
  name: string
  class: string
  email: string
}

/** Fetch student list by college for teacher alerts. */
export async function getStudentsByCollege(
  college: string
): Promise<ApiResult<{ success: boolean; data: BackendStudent[] }>> {
  return request<{ success: boolean; data: BackendStudent[] }>(
    `${FLASK_BASE}/api/students?college=${encodeURIComponent(college)}`
  )
}

export interface ParentAlertPayload {
  studentId: string
  className: string
  riskLevel: string
  reason: string
}

/** Send parent Telegram alert from teacher dashboard. */
export async function sendAlertToParent(
  payload: ParentAlertPayload
): Promise<ApiResult<{ success: boolean; message: string }>> {
  return request<{ success: boolean; message: string }>(`${FLASK_BASE}/api/alert/parent`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/* --------------------------------------------------------------------------
   Alerts — Express service
   -------------------------------------------------------------------------- */

/** Submit a risk alert (triggers Telegram if configured). */
export async function sendAlert(
  payload: AlertPayload
): Promise<ApiResult<{ sent: boolean; telegram: boolean }>> {
  return request(`${EXPRESS_BASE}/api/alert`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** Register a Telegram chat ID for notifications. */
export async function registerTelegram(payload: {
  userId: string
  chatId: string
}): Promise<ApiResult<{ registered: boolean }>> {
  return request(`${EXPRESS_BASE}/api/telegram/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export interface TelegramRegistrationPayload {
  studentId: string
  parentEmail: string
  chatId: string
}

/** Register parent Telegram warning notifications. */
export async function registerTelegramParent(
  payload: TelegramRegistrationPayload
): Promise<ApiResult<{ success: boolean; message: string }>> {
  return request<{ success: boolean; message: string }>(`${EXPRESS_BASE}/api/telegram/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/* --------------------------------------------------------------------------
   Health check
   -------------------------------------------------------------------------- */
export async function healthCheck(): Promise<ApiResult<{ status: string }>> {
  return request<{ status: string }>(`${FLASK_BASE}/health`)
}
