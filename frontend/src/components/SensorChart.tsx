/**
 * SensorChart — Canvas-based line chart.
 *
 * Pixel-perfect React port of the original drawLineChart() JS function.
 * Uses a ref for the canvas element and useEffect to re-draw when data changes.
 * Matches original drawing code exactly: grid lines, axes, line, dots, Y-labels.
 */
import { useRef, useEffect } from 'react'
import styles from '@/pages/StudentDashboard.module.css'

interface SensorChartProps {
  /** Title shown above the chart */
  title: string
  /** Data points (up to 60) */
  data: number[]
  /** Y-axis minimum */
  minValue: number
  /** Y-axis maximum */
  maxValue: number
  /** Stroke color for the line and dots */
  lineColor: string
  /** Sub-label shown below the chart */
  chartLabel: string
}

export default function SensorChart({
  title,
  data,
  minValue,
  maxValue,
  lineColor,
  chartLabel,
}: SensorChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Sync logical size to display size (mirrors original getBoundingClientRect pattern)
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const padding = 40
    const width   = canvas.width  - 2 * padding
    const height  = canvas.height - 2 * padding

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Grid lines
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth   = 0.5
    for (let i = 0; i <= 4; i++) {
      const y = padding + (height / 4) * i
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvas.width - padding, y)
      ctx.stroke()
    }

    // Axes
    ctx.strokeStyle = '#9ca3af'
    ctx.lineWidth   = 1
    ctx.beginPath()
    ctx.moveTo(padding, padding)
    ctx.lineTo(padding, canvas.height - padding)
    ctx.lineTo(canvas.width - padding, canvas.height - padding)
    ctx.stroke()

    // Data line
    ctx.strokeStyle = lineColor
    ctx.lineWidth   = 2.5
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'

    const range        = maxValue - minValue || 1
    const pointSpacing = width / Math.max(data.length - 1, 1)

    ctx.beginPath()
    data.forEach((value, index) => {
      const x = padding + index * pointSpacing
      const y = canvas.height - padding - ((value - minValue) / range) * height
      if (index === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

    // Data points (dots)
    ctx.fillStyle = lineColor
    data.forEach((value, index) => {
      const x = padding + index * pointSpacing
      const y = canvas.height - padding - ((value - minValue) / range) * height
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    })

    // Y-axis labels
    ctx.fillStyle  = '#6b7280'
    ctx.font       = '11px Poppins'
    ctx.textAlign  = 'right'
    for (let i = 0; i <= 4; i++) {
      const value = maxValue - (range / 4) * i
      const y     = padding + (height / 4) * i
      ctx.fillText(value.toFixed(0), padding - 8, y + 4)
    }
  }, [data, minValue, maxValue, lineColor])

  return (
    <div className={styles.sensorChartPanel}>
      <h4 className={styles.sensorChartTitle}>{title}</h4>
      <canvas
        ref={canvasRef}
        className={styles.sensorChartCanvas}
        aria-label={`${title} trend chart`}
        role="img"
      />
      <div className={styles.chartLabel}>{chartLabel}</div>
    </div>
  )
}
