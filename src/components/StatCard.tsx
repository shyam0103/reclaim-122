import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useCountUp } from '../hooks/useCountUp'

/** Apple Health-style colorful stat tile: icon badge + big animated number + label.
 * `index` staggers the entrance animation across a grid of these. */
export function StatCard({
  icon,
  label,
  value,
  suffix,
  color,
  index = 0,
  pulse = false,
  ringPercent
}: {
  icon: ReactNode
  label: string
  value: number
  suffix?: string
  color: string
  index?: number
  pulse?: boolean
  ringPercent?: number
}) {
  const animated = useCountUp(value)

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-card bg-surface dark:bg-surface-dark p-4 shadow-soft dark:shadow-soft-dark
                 flex flex-col justify-between gap-3 relative overflow-hidden"
    >
      {ringPercent !== undefined && (
        <div
          className="absolute -right-4 -top-4 w-20 h-20 rounded-full opacity-[0.12]"
          style={{ background: `conic-gradient(${color} ${ringPercent}%, transparent 0)` }}
        />
      )}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center relative z-10 ${pulse ? 'animate-flame-pulse' : ''}`}
        style={{ backgroundColor: `${color}22`, color }}
      >
        {icon}
      </div>
      <div className="relative z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-[26px] leading-none font-bold tabular-nums text-ink dark:text-ink-dark">
            {animated}
          </span>
          {suffix && <span className="text-sm font-medium text-muted dark:text-muted-dark">{suffix}</span>}
        </div>
        <p className="text-xs text-muted dark:text-muted-dark mt-1">{label}</p>
      </div>
    </motion.div>
  )
}
