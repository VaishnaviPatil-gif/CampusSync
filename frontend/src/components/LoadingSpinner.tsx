import styles from './LoadingSpinner.module.css'

export default function LoadingSpinner() {
  return (
    <div className={styles.spinnerContainer} aria-live="polite" aria-busy="true">
      <div className={styles.spinner}></div>
    </div>
  )
}
