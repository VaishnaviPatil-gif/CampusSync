import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './useAuth'
import { useSensorDataQuery } from './useSensorDataQuery'

export interface WatchSample {
  receivedAt: string
  temperature: number
  humidity: number
  heartRate: number
  stress: number
  mood: 'happy' | 'neutral' | 'low' | 'stress'
}

export interface MoodCounts {
  happy: number
  neutral: number
  low: number
  stress: number
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

function computeStressLevel(temp: number, hum: number, heartRate: number): number {
  const hrScore = clamp((heartRate - 60) * 1.5, 0, 100)
  const tempScore = clamp((temp - 25) * 3.0, 0, 100)
  const humScore = clamp((hum - 40) * 1.2, 0, 100)
  return Math.round(clamp(0.6 * hrScore + 0.25 * tempScore + 0.15 * humScore, 0, 100))
}

function moodFromStress(stress: number): 'happy' | 'neutral' | 'low' | 'stress' {
  if (stress >= 75) return 'stress'
  if (stress >= 55) return 'low'
  if (stress >= 30) return 'neutral'
  return 'happy'
}

export function useWatchSamples() {
  const { user } = useAuth()
  const { reading } = useSensorDataQuery()

  const storageKey = useMemo(() => {
    return user?.email ? `${user.email}_watchMoodSamples` : 'guest_watchMoodSamples'
  }, [user?.email])

  // Load initial samples
  const [samples, setSamples] = useState<WatchSample[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) return parsed
      }
    } catch {
      // Ignored
    }
    return []
  })

  // Watch for storage key change (e.g. user switch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setSamples(parsed)
          return
        }
      }
    } catch {
      // Ignored
    }
    setSamples([])
  }, [storageKey])

  // Add a sample safely and write to storage
  const addSample = useCallback(
    (newSample: Omit<WatchSample, 'mood' | 'stress'> & { stress?: number }) => {
      setSamples((prev) => {
        const lastSample = prev[prev.length - 1]
        // Prevent duplicate logs for the exact same timestamp
        if (lastSample && lastSample.receivedAt === newSample.receivedAt) {
          return prev
        }

        const stressVal =
          newSample.stress !== undefined
            ? newSample.stress
            : computeStressLevel(newSample.temperature, newSample.humidity, newSample.heartRate)

        const moodVal = moodFromStress(stressVal)

        const createdSample: WatchSample = {
          receivedAt: newSample.receivedAt,
          temperature: newSample.temperature,
          humidity: newSample.humidity,
          heartRate: newSample.heartRate,
          stress: stressVal,
          mood: moodVal,
        }

        const next = [...prev, createdSample]
        if (next.length > 4000) {
          next.splice(0, next.length - 4000)
        }

        localStorage.setItem(storageKey, JSON.stringify(next))
        return next
      })
    },
    [storageKey]
  )

  // Sync live readings from useSensorDataQuery
  useEffect(() => {
    if (!reading.receivedAt) return
    const temp = Number(reading.temperature)
    const hum = Number(reading.humidity)
    const hr = Number(reading.heartRate)

    if (Number.isNaN(temp) || Number.isNaN(hum) || Number.isNaN(hr)) return

    addSample({
      receivedAt: reading.receivedAt,
      temperature: temp,
      humidity: hum,
      heartRate: hr,
      stress: reading.stress != null ? Number(reading.stress) : undefined,
    })
  }, [reading, addSample])

  // Derive display values from samples
  const moodDataByDay = useMemo(() => {
    const data: Record<string, 'happy' | 'neutral' | 'low' | 'stress'> = {}
    // Sort ascending by receivedAt
    const sorted = [...samples].sort(
      (a, b) => new Date(a.receivedAt).getTime() - new Date(b.receivedAt).getTime()
    )
    sorted.forEach((sample) => {
      const d = new Date(sample.receivedAt)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      data[key] = sample.mood
    })
    return data
  }, [samples])

  const { dayMoodSummary, monthMoodSummary, yearMoodSummary } = useMemo(() => {
    const now = new Date()
    const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`

    // End Of Day Mood (current day's last recorded mood value)
    const dayMood = moodDataByDay[dayKey] ?? ''

    // Monthly Mood (last recorded sample of the current month)
    const monthlySamples = samples.filter((sample) => {
      const d = new Date(sample.receivedAt)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    const monthMood = monthlySamples.length > 0 ? monthlySamples[monthlySamples.length - 1].mood : ''

    // Yearly Mood (last recorded sample of the current year)
    const yearlySamples = samples.filter((sample) => {
      return new Date(sample.receivedAt).getFullYear() === now.getFullYear()
    })
    const yearMood = yearlySamples.length > 0 ? yearlySamples[yearlySamples.length - 1].mood : ''

    return {
      dayMoodSummary: dayMood,
      monthMoodSummary: monthMood,
      yearMoodSummary: yearMood,
    }
  }, [samples, moodDataByDay])

  // Compute daily distribution counts (for today)
  const dailyCounts = useMemo(() => {
    const counts: MoodCounts = { happy: 0, neutral: 0, low: 0, stress: 0 }
    const now = new Date()
    samples.forEach((sample) => {
      const d = new Date(sample.receivedAt)
      const isToday =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()

      if (isToday && counts[sample.mood] !== undefined) {
        counts[sample.mood] += 1
      }
    })
    return counts
  }, [samples])

  // Compute monthly distribution counts (for this month)
  const monthlyCounts = useMemo(() => {
    const counts: MoodCounts = { happy: 0, neutral: 0, low: 0, stress: 0 }
    const now = new Date()
    samples.forEach((sample) => {
      const d = new Date(sample.receivedAt)
      const isThisMonth = d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()

      if (isThisMonth && counts[sample.mood] !== undefined) {
        counts[sample.mood] += 1
      }
    })
    return counts
  }, [samples])

  return {
    samples,
    moodDataByDay,
    dayMoodSummary,
    monthMoodSummary,
    yearMoodSummary,
    dailyCounts,
    monthlyCounts,
  }
}
