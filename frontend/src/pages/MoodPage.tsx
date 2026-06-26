import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import styles from './MoodPage.module.css'
import { useAuth } from '@/hooks/useAuth'
import { useCollegeTheme, resolveCollegeName } from '@/hooks/useCollegeTheme'
import { useWatchSamples } from '@/hooks/useWatchSamples'
import DashboardLayout from '@/components/DashboardLayout'
import Sidebar, { SidebarNavItem } from '@/components/Sidebar'
import Topbar from '@/components/Topbar'

const NAV_ITEMS: readonly SidebarNavItem[] = [
  { label: 'Dashboard', path: '/student' },
  { label: 'Attendance', path: '/student/attendance' },
  { label: 'Mood Tracker', path: '/student/mood' },
  { label: 'AI Support', path: '/student/journal' },
  { label: 'Exercises', path: '/student/exercises' },
  { label: 'Student Details', path: '/student/details' },
]

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface MoodBarChartProps {
  title: string
  counts: { happy: number; neutral: number; low: number; stress: number }
}

function MoodBarChart({ title, counts }: MoodBarChartProps) {
  const categories = [
    { label: 'Happy', key: 'happy' as const, color: '#16a34a' },
    { label: 'Neutral', key: 'neutral' as const, color: '#2563eb' },
    { label: 'Low', key: 'low' as const, color: '#f59e0b' },
    { label: 'Stress', key: 'stress' as const, color: '#dc2626' },
  ]

  const maxCount = Math.max(1, counts.happy, counts.neutral, counts.low, counts.stress)
  const yTicks = [
    maxCount,
    Math.round(maxCount * 0.75),
    Math.round(maxCount * 0.5),
    Math.round(maxCount * 0.25),
    0,
  ]

  return (
    <div className={styles.chartWrapper}>
      <h3>{title}</h3>
      <div className={styles.chartContent}>
        {/* Y Axis Ticks */}
        <div className={styles.yAxis}>
          {yTicks.map((tick, idx) => (
            <span key={idx}>{tick}</span>
          ))}
        </div>

        {/* Plot Area */}
        <div className={styles.plotArea}>
          {/* Grid Lines */}
          <div className={styles.gridLines}>
            {yTicks.map((_, idx) => (
              <div key={idx} className={styles.gridLine} />
            ))}
          </div>

          {/* Bars */}
          <div className={styles.barsContainer}>
            {categories.map(({ label, key, color }) => {
              const count = counts[key]
              const heightPercent = (count / maxCount) * 100

              return (
                <div key={key} className={styles.barCol}>
                  <div
                    className={styles.bar}
                    style={{
                      height: `${heightPercent}%`,
                      backgroundColor: color,
                    }}
                  >
                    <span className={styles.barValue}>{count}</span>
                  </div>
                  <span className={styles.barLabel}>{label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MoodPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, isAuthenticated } = useAuth()

  // Guard: redirect if not logged in
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const rawCollege = searchParams.get('college') ?? user?.college ?? 'BRECW'
  const college = resolveCollegeName(rawCollege)
  const { logoUrl, theme } = useCollegeTheme(college)

  const studentName = user?.fullName ?? 'Reya Student'
  const firstName = studentName.split(' ')[0]
  const studentClass = user?.assignedClass ?? 'CSE-A'

  // Access watch samples shared state
  const {
    moodDataByDay,
    dayMoodSummary,
    monthMoodSummary,
    yearMoodSummary,
    dailyCounts,
    monthlyCounts,
  } = useWatchSamples()

  const currentYear = new Date().getFullYear()

  const formatMoodLabel = (mood: string) => {
    if (!mood) return 'No mood yet'
    return mood.charAt(0).toUpperCase() + mood.slice(1)
  }

  // Calendar logic helpers
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const renderMonthGrid = (month: number) => {
    const daysInMonth = getDaysInMonth(month, currentYear)
    const firstDay = getFirstDayOfMonth(month, currentYear)

    // Fill placeholder cells for days of the week prior to the 1st
    const emptyCells = Array.from({ length: firstDay }).map((_, idx) => (
      <div key={`empty-${idx}`} className={styles.dayEmpty} />
    ))

    // Fill days of the month
    const dayCells = Array.from({ length: daysInMonth }).map((_, idx) => {
      const day = idx + 1
      const dateKey = `${currentYear}-${month}-${day}`
      const moodVal = moodDataByDay[dateKey]

      let moodClass = ''
      if (moodVal === 'happy') moodClass = styles.dayHappy
      else if (moodVal === 'neutral') moodClass = styles.dayNeutral
      else if (moodVal === 'low') moodClass = styles.dayLow
      else if (moodVal === 'stress') moodClass = styles.dayStress

      return (
        <div key={`day-${day}`} className={`${styles.day} ${moodClass}`}>
          {day}
        </div>
      )
    })

    return (
      <div className={styles.month} key={month}>
        <div className={styles.monthHeader}>
          {MONTH_NAMES[month]} {currentYear}
        </div>
        <div className={styles.weekdayHeader}>
          {WEEK_DAYS.map((day, idx) => (
            <div key={idx} className={styles.weekday}>
              {day}
            </div>
          ))}
        </div>
        <div className={styles.daysGrid}>
          {emptyCells}
          {dayCells}
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  const sidebar = (
    <Sidebar
      logoUrl={logoUrl}
      userName={studentName}
      roleLabel="Student"
      college={college}
      extraLabels={[`Class: ${studentClass}`]}
      navItems={NAV_ITEMS}
    />
  )

  const topbar = (
    <Topbar
      title={`Welcome back, ${firstName}`}
      subtitle="Track your moods throughout the year"
      userName={studentName}
      themeColor={theme.sidebarA}
      showNotificationAndAvatar={true}
    />
  )

  return (
    <DashboardLayout college={college} sidebar={sidebar} topbar={topbar}>
      <section className={styles.panel}>
        <h2>Year Mood Tracker - {currentYear}</h2>

        <div className={styles.moodLegend}>
          <div className={styles.moodItem}>
            <div
              className={styles.moodColor}
              style={{ background: '#16a34a' }}
              title="Happy"
            />
            <span>Happy</span>
          </div>
          <div className={styles.moodItem}>
            <div
              className={styles.moodColor}
              style={{ background: '#2563eb' }}
              title="Neutral"
            />
            <span>Neutral</span>
          </div>
          <div className={styles.moodItem}>
            <div
              className={styles.moodColor}
              style={{ background: '#f59e0b' }}
              title="Low"
            />
            <span>Low</span>
          </div>
          <div className={styles.moodItem}>
            <div
              className={styles.moodColor}
              style={{ background: '#dc2626' }}
              title="Stress"
            />
            <span>Stress</span>
          </div>
        </div>

        <div className={styles.summaryStrip}>
          <article className={styles.summaryCard}>
            <p>End Of Day Mood</p>
            <h4>{formatMoodLabel(dayMoodSummary)}</h4>
          </article>
          <article className={styles.summaryCard}>
            <p>Monthly Mood</p>
            <h4>{formatMoodLabel(monthMoodSummary)}</h4>
          </article>
          <article className={styles.summaryCard}>
            <p>Yearly Mood</p>
            <h4>{formatMoodLabel(yearMoodSummary)}</h4>
          </article>
        </div>

        <div className={styles.monthsContainer}>
          {Array.from({ length: 12 }).map((_, idx) => renderMonthGrid(idx))}
        </div>
      </section>

      <section className={styles.panel}>
        <h2>Mood Charts (Watch Data)</h2>
        <div className={styles.chartContainer}>
          <MoodBarChart title="Daily Mood Distribution" counts={dailyCounts} />
          <MoodBarChart title="Monthly Mood Distribution" counts={monthlyCounts} />
        </div>
      </section>
    </DashboardLayout>
  )
}
