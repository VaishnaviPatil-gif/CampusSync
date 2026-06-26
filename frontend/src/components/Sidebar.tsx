import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './Sidebar.module.css'
import { useAuth } from '@/hooks/useAuth'

export interface SidebarNavItem {
  label: string
  path: string
}

interface SidebarProps {
  logoUrl: string
  userName: string
  roleLabel: string
  college: string
  extraLabels?: string[]
  navItems: readonly SidebarNavItem[]
}

export default function Sidebar({
  logoUrl,
  userName,
  roleLabel,
  college,
  extraLabels = [],
  navItems,
}: SidebarProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { clearSession } = useAuth()

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    clearSession()
    // Small delay matching the original code's 100ms behaviour
    setTimeout(() => navigate('/'), 100)
  }

  return (
    <aside className={styles.sidebar}>
      {/* Brand / Logo */}
      <div className={styles.brand}>
        <img
          className={styles.brandImg}
          src={logoUrl}
          alt="College logo"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = '/src/assets/images/logo.png'
          }}
        />
        <h1 className={styles.brandTitle}>Student360</h1>
      </div>

      {/* User Info Card */}
      <div className={styles.userCard}>
        <p className={styles.userCardLabel}>{roleLabel}</p>
        <h2 className={styles.userCardName}>{userName}</h2>
        <p className={styles.userCardLabel}>College: {college}</p>
        {extraLabels.map((lbl, idx) => (
          <p key={idx} className={styles.userCardLabel}>
            {lbl}
          </p>
        ))}
      </div>

      {/* Navigation Menu */}
      <ul className={styles.menu}>
        {navItems.map(({ label, path }) => {
          // In teacher.html, some links might be anchor tags on the page itself (e.g. href="#telegramAlertsPanel").
          // If a path starts with '#', we can handle it differently, or just use standard navigation/hash navigation.
          const isActive = location.pathname === path
          const handleNav = () => {
            if (path.startsWith('#')) {
              const el = document.querySelector(path)
              if (el) {
                el.scrollIntoView({ behavior: 'smooth' })
              }
            } else {
              navigate(path)
            }
          }

          return (
            <li key={path}>
              <button
                type="button"
                className={`${styles.menuLink} ${isActive ? styles.menuLinkActive : ''}`}
                onClick={handleNav}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </button>
            </li>
          )
        })}
        <li>
          <button type="button" className={styles.menuLink} onClick={handleLogout}>
            Sign Out
          </button>
        </li>
      </ul>
    </aside>
  )
}
