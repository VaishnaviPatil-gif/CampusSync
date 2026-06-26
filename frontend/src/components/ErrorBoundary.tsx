import { Component, ErrorInfo, ReactNode } from 'react'
import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.icon}>⚠️</div>
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.subtitle}>
              An unexpected error occurred in the application view.
            </p>
            {this.state.error && (
              <details className={styles.details}>
                <summary className={styles.detailsSummary}>View Error details</summary>
                <pre className={styles.errorText}>{this.state.error.stack}</pre>
              </details>
            )}
            <button type="button" className={styles.reloadBtn} onClick={this.handleReload}>
              Reload Application
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
