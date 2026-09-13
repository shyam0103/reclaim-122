import { ReactNode } from 'react'

/** A single circular progress ring — Apple Fitness-style, but generic (used for
 * mission progress and completed-days), not a copy of any proprietary asset. */
export function RingProgress({
  percent,
  size = 64,
  strokeWidth = 7,
  color,
  trackColor = 'rgba(142,142,147,0.18)',
  children
}: {
  percent: number
  size?: number
  strokeWidth?: number
  color: string
  trackColor?: string
  children?: ReactNode
}) {
  const r = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * r
  const clamped = Math.max(0, Math.min(100, percent))
  const offset = circumference * (1 - clamped / 100)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  )
}
