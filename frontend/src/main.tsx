import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

/**
 * Application entry point.
 *
 * StrictMode is enabled to surface potential issues during development.
 * It renders components twice in development (not production) to detect
 * side-effects in lifecycle methods and hooks.
 */
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error(
    '[CampusSync] Could not find #root element. Check index.html.'
  )
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)
