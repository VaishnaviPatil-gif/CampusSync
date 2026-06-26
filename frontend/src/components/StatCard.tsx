import React from 'react'
import styles from './StatCard.module.css'

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  sub?: React.ReactNode
  largeValue?: boolean
}

export default function StatCard({
  label,
  value,
  sub,
  largeValue = false,
  className = '',
  ...props
}: StatCardProps) {
  return (
    <article className={`${styles.statCard} ${className}`} {...props}>
      <p className={styles.label}>{label}</p>
      <h4 className={`${styles.value} ${largeValue ? styles.valueLarge : ''}`}>
        {value}
      </h4>
      {sub && <small className={styles.sub}>{sub}</small>}
    </article>
  )
}
