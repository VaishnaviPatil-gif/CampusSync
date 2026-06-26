import React from 'react'
import styles from './Table.module.css'

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  headers: (React.ReactNode | string)[]
  children: React.ReactNode
  minWidth?: string
}

export default function Table({
  headers,
  children,
  minWidth = '560px',
  className = '',
  ...props
}: TableProps) {
  return (
    <div className={styles.tableWrap}>
      <table className={`${styles.table} ${className}`} style={{ minWidth }} {...props}>
        <thead>
          <tr>
            {headers.map((h, index) => (
              <th key={index}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
