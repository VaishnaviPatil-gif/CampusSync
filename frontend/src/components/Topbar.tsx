import React from 'react'
import styles from './Topbar.module.css'

interface TopbarProps {
  title: string
  subtitle: string
  userName?: string
  themeColor?: string
  showNotificationAndAvatar?: boolean
  chips?: React.ReactNode
}

function BellIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 17H9M18 17V11C18 7.68629 15.3137 5 12 5C8.68629 5 6 7.68629 6 11V17L4 19V20H20V19L18 17Z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function Topbar({
  title,
  subtitle,
  userName,
  themeColor = '#2f8f46',
  showNotificationAndAvatar = false,
  chips,
}: TopbarProps) {
  const firstName = userName ? userName.split(' ')[0] : ''
  const avatarLetter = firstName ? firstName.charAt(0).toUpperCase() : ''

  return (
    <header className={styles.topbar}>
      <div>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      
      {chips && <div className={styles.chips}>{chips}</div>}

      {showNotificationAndAvatar && userName && (
        <div className={styles.topActions}>
          <button type="button" className={styles.iconBtn} aria-label="Notifications">
            <BellIcon color={themeColor} />
          </button>
          <div className={styles.avatar} aria-label={`Avatar: ${firstName}`}>
            {avatarLetter}
          </div>
        </div>
      )}
    </header>
  )
}
