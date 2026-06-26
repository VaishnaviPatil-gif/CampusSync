/**
 * useSensorData — live IoT sensor polling hook.
 *
 * Converts the original fetchLatestSensorData(), addSensorDataPoint(),
 * computeStressLevel(), updateStressStatus() JS functions into a clean hook.
 *
 * Behaviour:
 *   - Polls /api/latest every 2 seconds (SENSOR_REFRESH_INTERVAL)
 *   - Accumulates up to 60 data points in rolling history (for charts)
 *   - Derives stress if backend doesn't supply it
 *   - Returns both current readings + history arrays for chart rendering
 *   - Cleans up intervals on unmount
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchSensorData } from '@/services/api'
import type { SensorReading, SensorHistory } from '@/types'

const SENSOR_REFRESH_MS = 2_000   // 2 seconds — matches original
const MAX_DATA_POINTS   = 60      // matches original MAX_DATA_POINTS

export type BackendStatus = 'offline' | 'online' | 'waiting'

export interface SensorState {
  reading: SensorReading
  history: SensorHistory
  backendStatus: BackendStatus
  lastReceivedAt: string | null
  stressLabel: string
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function computeStressLevel(
  temp: number | undefined,
  hum: number | undefined,
  heartRate: number | undefined
): number {
  if (temp == null || hum == null || heartRate == null) return 0
  const hrScore   = clamp((heartRate - 60) * 1.5, 0, 100)
  const tempScore = clamp((temp - 25) * 3.0, 0, 100)
  const humScore  = clamp((hum - 40) * 1.2, 0, 100)
  return Math.round(clamp(0.6 * hrScore + 0.25 * tempScore + 0.15 * humScore, 0, 100))
}

function stressLabel(stress: number): string {
  if (stress >= 70) return 'High stress detected - attention recommended'
  if (stress >= 40) return 'Moderate stress - keep monitoring'
  return 'Low stress - stable state'
}

function appendCapped<T>(arr: T[], value: T, max: number): T[] {
  const next = [...arr, value]
  return next.length > max ? next.slice(next.length - max) : next
}

const EMPTY_HISTORY: SensorHistory = {
  temperature: [],
  humidity: [],
  heartRate: [],
  stress: [],
}

export function useSensorData(): SensorState {
  const [reading, setReading] = useState<SensorReading>({})
  const [history, setHistory] = useState<SensorHistory>(EMPTY_HISTORY)
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('waiting')
  const [lastReceivedAt, setLastReceivedAt] = useState<string | null>(null)
  const [currentStressLabel, setCurrentStressLabel] = useState('Waiting for live sensor data')

  // Keep history in a ref so the callback doesn't re-close over stale state
  const historyRef = useRef<SensorHistory>(EMPTY_HISTORY)

  const fetchOnce = useCallback(async () => {
    const result = await fetchSensorData()

    if (!result.ok) {
      setBackendStatus('offline')
      return
    }

    const data = result.data

    // Accumulate history
    const h = historyRef.current
    const next: SensorHistory = {
      temperature: data.temperature != null
        ? appendCapped(h.temperature, data.temperature, MAX_DATA_POINTS)
        : h.temperature,
      humidity: data.humidity != null
        ? appendCapped(h.humidity, data.humidity, MAX_DATA_POINTS)
        : h.humidity,
      heartRate: data.heartRate != null
        ? appendCapped(h.heartRate, data.heartRate, MAX_DATA_POINTS)
        : h.heartRate,
      stress: data.stress != null
        ? appendCapped(h.stress, data.stress, MAX_DATA_POINTS)
        : h.stress,
    }
    historyRef.current = next
    setHistory(next)

    // Derive stress if not supplied by backend
    const stress = data.stress != null
      ? Math.round(data.stress)
      : computeStressLevel(data.temperature, data.humidity, data.heartRate)

    setReading({ ...data, stress: Number.isNaN(stress) ? undefined : stress })
    setCurrentStressLabel(stress != null && !Number.isNaN(stress) ? stressLabel(stress) : 'Waiting for live sensor data')
    setBackendStatus('online')
    if (data.receivedAt) {
      setLastReceivedAt(new Date(data.receivedAt).toLocaleTimeString())
    } else {
      setLastReceivedAt(null)
    }
  }, [])

  useEffect(() => {
    void fetchOnce()
    const id = setInterval(() => void fetchOnce(), SENSOR_REFRESH_MS)
    return () => clearInterval(id)
  }, [fetchOnce])

  return {
    reading,
    history,
    backendStatus,
    lastReceivedAt,
    stressLabel: currentStressLabel,
  }
}
