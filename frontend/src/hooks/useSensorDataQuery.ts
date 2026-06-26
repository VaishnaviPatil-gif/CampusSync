import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchSensorData } from '@/services/api'
import type { SensorReading, SensorHistory } from '@/types'

const MAX_DATA_POINTS = 60

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
  const hrScore = clamp((heartRate - 60) * 1.5, 0, 100)
  const tempScore = clamp((temp - 25) * 3.0, 0, 100)
  const humScore = clamp((hum - 40) * 1.2, 0, 100)
  return Math.round(clamp(0.6 * hrScore + 0.25 * tempScore + 0.15 * humScore, 0, 100))
}

function getStressLabel(stress: number): string {
  if (stress >= 70) return 'High stress detected - attention recommended'
  if (stress >= 40) return 'Moderate stress - keep monitoring'
  return 'Low stress - stable state'
}

function appendCapped<T>(arr: T[], value: T, max: number): T[] {
  const next = [...arr, value]
  return next.length > max ? next.slice(next.length - max) : next
}

export function useSensorDataQuery(): SensorState {
  const [history, setHistory] = useState<SensorHistory>({
    temperature: [],
    humidity: [],
    heartRate: [],
    stress: [],
  })

  // Poll Flask /api/latest every 2 seconds with React Query
  const { data, isError } = useQuery({
    queryKey: ['sensorData'],
    queryFn: async () => {
      const res = await fetchSensorData()
      if (!res.ok) throw new Error(res.message)
      return res.data
    },
    refetchInterval: 2000,
    refetchIntervalInBackground: true,
  })

  useEffect(() => {
    if (!data) return

    setHistory((h) => ({
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
    }))
  }, [data])

  const reading = data || {}
  const backendStatus: BackendStatus = isError ? 'offline' : data ? 'online' : 'waiting'

  const stress = reading.stress != null
    ? Math.round(reading.stress)
    : computeStressLevel(reading.temperature, reading.humidity, reading.heartRate)

  const lastReceivedAt = reading.receivedAt
    ? new Date(reading.receivedAt).toLocaleTimeString()
    : null

  const activeStressLabel =
    stress != null && !Number.isNaN(stress)
      ? getStressLabel(stress)
      : 'Waiting for live sensor data'

  return {
    reading: { ...reading, stress: Number.isNaN(stress) ? undefined : stress },
    history,
    backendStatus,
    lastReceivedAt,
    stressLabel: activeStressLabel,
  }
}
