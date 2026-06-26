import React from 'react'
import styles from './Badge.module.css'

export type BadgeVariant = 'low' | 'medium' | 'high' | 'weak' | 'stable' | 'strong' | 'good'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant
  children: React.ReactNode
}

export default function Badge({ variant, children, className = '', ...props }: BadgeProps) {
  const variantClass = styles[variant] || ''
  return (
    <span className={`${styles.badge} ${variantClass} ${className}`} {...props}>
      {children}
    </span>
  )
}
