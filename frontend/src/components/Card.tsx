import React from 'react'
import styles from './Card.module.css'

interface CardProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  children: React.ReactNode
}

export default function Card({ title, children, className = '', ...props }: CardProps) {
  return (
    <section className={`${styles.card} ${className}`} {...props}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {children}
    </section>
  )
}
