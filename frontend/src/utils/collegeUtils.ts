/**
 * src/utils/collegeUtils.ts
 *
 * Shared college resolution utilities — previously duplicated between
 * AuthPage.tsx, useCollegeTheme.ts, and StudentDashboard.tsx.
 *
 * Single source of truth for:
 *   - College name resolution from URL / localStorage values
 *   - College logo map
 *   - College gradient + sidebar theme maps
 *   - Student class derivation
 */
import type { College, CollegeTheme } from '@/types'

export const COLLEGE_ALIASES: Record<string, College> = {
  brecw: 'BRECW',
  anuraguniversity: 'Anurag University',
  bvrit: 'BVRIT',
  mrem: 'MREM',
  jntuh: 'JNTUH',
  cbit: 'CBIT',
  vnrvjiet: 'VNRVJIET',
}

/** Resolve a raw college string (URL param or localStorage value) → canonical College. */
export function resolveCollegeName(value: string): College {
  const key = (value ?? '').toString().trim().toLowerCase().replace(/\s+/g, '')
  return COLLEGE_ALIASES[key] ?? 'BRECW'
}

export const COLLEGE_LOGOS: Record<College, string> = {
  BRECW: '/src/assets/images/brecw.jpeg',
  'Anurag University': '/src/assets/images/anurag.png',
  BVRIT: '/src/assets/images/bvrit.png',
  MREM: '/src/assets/images/mrem.jpeg',
  JNTUH: '/src/assets/images/jntuh.jpeg',
  CBIT: '/src/assets/images/cbit.jpeg',
  VNRVJIET: '/src/assets/images/vnrvjiet.png',
}

/**
 * Gradient colors [bgA, bgB] — used for body background.
 * Mirrors original `collegeThemes` in student.html and teacher.html.
 */
export const COLLEGE_GRADIENT: Record<College, [string, string]> = {
  BRECW: ['#56ab2f', '#a8e063'],
  'Anurag University': ['#faa84a', '#fcc470'],
  BVRIT: ['#cb2d3e', '#ef473a'],
  MREM: ['#A0522D', '#D2691E'],
  JNTUH: ['#4f46e5', '#ec4899'],
  CBIT: ['#11998e', '#38ef7d'],
  VNRVJIET: ['#b91c1c', '#ef4444'],
}

/**
 * Full theme including sidebar + text + chip colors.
 * Mirrors the 10-value arrays in teacher.html `collegeSidebarThemes`.
 */
export const COLLEGE_THEME_MAP: Record<College, CollegeTheme> = {
  BRECW: {
    bgA: '#56ab2f', bgB: '#a8e063',
    sidebarA: '#2f8f46', sidebarB: '#89d36c',
    textMain: '#124b2e', textMuted: '#4b7a63',
    lineColor: '#d7efdf', chipBorder: '#96d6ae', chipBg: '#effaf2', chipText: '#14532d',
    barA: '#4ade80', barB: '#16a34a',
  },
  'Anurag University': {
    bgA: '#faa84a', bgB: '#fcc470',
    sidebarA: '#d97706', sidebarB: '#f59e0b',
    textMain: '#92400e', textMuted: '#a16207',
    lineColor: '#f6d9a6', chipBorder: '#f0b45a', chipBg: '#fff7e8', chipText: '#92400e',
    barA: '#f59e0b', barB: '#d97706',
  },
  BVRIT: {
    bgA: '#cb2d3e', bgB: '#ef473a',
    sidebarA: '#991b1b', sidebarB: '#dc2626',
    textMain: '#7f1d1d', textMuted: '#991b1b',
    lineColor: '#f4c7c7', chipBorder: '#e88f8f', chipBg: '#fff2f2', chipText: '#7f1d1d',
    barA: '#f87171', barB: '#dc2626',
  },
  MREM: {
    bgA: '#A0522D', bgB: '#D2691E',
    sidebarA: '#8B4513', sidebarB: '#D2691E',
    textMain: '#5a2f0d', textMuted: '#7c4a22',
    lineColor: '#ecd3bf', chipBorder: '#d89c6d', chipBg: '#fff6ef', chipText: '#6f3d14',
    barA: '#e59d5d', barB: '#c56a2a',
  },
  JNTUH: {
    bgA: '#4f46e5', bgB: '#ec4899',
    sidebarA: '#5b21b6', sidebarB: '#a855f7',
    textMain: '#3f0f5c', textMuted: '#5b2286',
    lineColor: '#e6d4fb', chipBorder: '#c59df4', chipBg: '#f7f1ff', chipText: '#4c1d95',
    barA: '#c084fc', barB: '#9333ea',
  },
  CBIT: {
    bgA: '#11998e', bgB: '#38ef7d',
    sidebarA: '#0d9488', sidebarB: '#14b8a6',
    textMain: '#134e4a', textMuted: '#0f766e',
    lineColor: '#c7ece8', chipBorder: '#86d9d1', chipBg: '#eefcf9', chipText: '#115e59',
    barA: '#2dd4bf', barB: '#14b8a6',
  },
  VNRVJIET: {
    bgA: '#b91c1c', bgB: '#ef4444',
    sidebarA: '#7f1d1d', sidebarB: '#b91c1c',
    textMain: '#5f1718', textMuted: '#7b2121',
    lineColor: '#f2c6c6', chipBorder: '#dc9d9d', chipBg: '#fff3f3', chipText: '#7f1d1d',
    barA: '#ef4444', barB: '#b91c1c',
  },
}

/** All valid student class identifiers */
export const VALID_CLASSES = ['CSE-A', 'CSE-B', 'CSE-C', 'ECE-A', 'IT-A', 'IT-B'] as const
export type StudentClass = (typeof VALID_CLASSES)[number]

export function getValidStudentClass(value: string): StudentClass | null {
  return (VALID_CLASSES as readonly string[]).includes(value) ? (value as StudentClass) : null
}

/** Derive a deterministic class from an email/name string (hash-based). */
export function deriveStudentClass(emailOrName: string): StudentClass {
  const seed = emailOrName || 'student'
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash * 31) + seed.charCodeAt(i)) >>> 0
  }
  return VALID_CLASSES[hash % VALID_CLASSES.length]
}

/** Build the CSS custom property object for the given college. */
export function buildCollegeCssVars(college: College): React.CSSProperties {
  const t = COLLEGE_THEME_MAP[college]
  return {
    '--sd-bg-a': t.bgA,
    '--sd-bg-b': t.bgB,
    '--sd-sidebar-1': t.sidebarA,
    '--sd-sidebar-2': t.sidebarB,
    '--sd-text-main': t.textMain,
    '--sd-text-muted': t.textMuted,
    '--td-line': t.lineColor,
    '--td-chip-border': t.chipBorder,
    '--td-chip-bg': t.chipBg,
    '--td-chip-text': t.chipText,
    '--td-bar-a': t.barA,
    '--td-bar-b': t.barB,
  } as React.CSSProperties
}
