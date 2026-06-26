/**
 * useCollegeTheme — resolves the per-college CSS theme tokens.
 *
 * Scaffolds the college theme mapping by referencing the shared collegeUtils.
 */
import type { College, CollegeTheme } from '@/types'
import { COLLEGE_THEME_MAP, COLLEGE_LOGOS, buildCollegeCssVars } from '@/utils/collegeUtils'

export { resolveCollegeName, deriveStudentClass, getValidStudentClass } from '@/utils/collegeUtils'

export function useCollegeTheme(college: College): {
  theme: CollegeTheme
  logoUrl: string
  cssVars: React.CSSProperties
} {
  const theme = COLLEGE_THEME_MAP[college] ?? COLLEGE_THEME_MAP.BRECW
  const logoUrl = COLLEGE_LOGOS[college] ?? COLLEGE_LOGOS.BRECW
  const cssVars = buildCollegeCssVars(college)

  return {
    theme,
    logoUrl,
    cssVars,
  }
}
