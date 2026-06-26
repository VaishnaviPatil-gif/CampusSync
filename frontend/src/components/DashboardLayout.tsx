import React from 'react'
import styles from './DashboardLayout.module.css'
import { College } from '@/types'
import { buildCollegeCssVars } from '@/utils/collegeUtils'

interface DashboardLayoutProps {
  college: College
  sidebar: React.ReactNode
  topbar: React.ReactNode
  children: React.ReactNode
}

export default function DashboardLayout({
  college,
  sidebar,
  topbar,
  children,
}: DashboardLayoutProps) {
  const cssVars = buildCollegeCssVars(college)

  return (
    <div className={styles.root} style={cssVars}>
      <div className={styles.app}>
        {sidebar}
        <main className={styles.main}>
          {topbar}
          {children}
        </main>
      </div>
    </div>
  )
}
