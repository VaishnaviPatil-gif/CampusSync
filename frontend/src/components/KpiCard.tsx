/**
 * KpiCard — reusable KPI metric card.
 *
 * Used for both the academic KPI row and the sensor KPI row.
 * Matches the original .kpi-card styling exactly.
 */
import styles from '@/pages/StudentDashboard.module.css'

interface KpiCardProps {
  label: string
  value: string | number
  sub: string
}

export default function KpiCard({ label, value, sub }: KpiCardProps) {
  return (
    <article className={styles.kpiCard}>
      <p className={styles.kpiLabel}>{label}</p>
      <h4 className={styles.kpiValue}>{value}</h4>
      <small className={styles.kpiSub}>{sub}</small>
    </article>
  )
}
