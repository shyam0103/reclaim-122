import { Brain, Dumbbell, Briefcase, Code2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { GoalKey, GOAL_META, StreakInfo, Status } from '../types'
import { STATUS_LABEL } from '../lib/statusUi'
import { GOAL_ACCENT } from '../lib/statusUi'
import { StatusDot } from './StatusDot'
import { Link } from 'react-router-dom'

const ICONS: Record<string, typeof Brain> = { Brain, Dumbbell, Briefcase, Code2 }

export function GoalCard({
  goal,
  todayStatus,
  streak,
  index = 0
}: {
  goal: GoalKey
  todayStatus: Status
  streak: StreakInfo
  index?: number
}) {
  const meta = GOAL_META[goal]
  const Icon = ICONS[meta.icon]
  const accent = GOAL_ACCENT[goal]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 + index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/analytics/${goal}`}
        className="rounded-card bg-surface dark:bg-surface-dark shadow-soft dark:shadow-soft-dark
                   p-4 flex flex-col gap-3 active:scale-[0.97] transition-transform h-full"
      >
        <div className="flex items-center justify-between">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${accent}22`, color: accent }}
          >
            <Icon size={18} strokeWidth={1.8} />
          </div>
          <div className="flex items-center gap-1.5">
            <StatusDot status={todayStatus} size="sm" />
            <span className="text-[11px] text-muted dark:text-muted-dark">{STATUS_LABEL[todayStatus]}</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-ink dark:text-ink-dark">{meta.label}</p>
          <div className="flex items-center gap-1 mt-1">
            <span className="text-base">🔥</span>
            <p className="text-xs text-muted dark:text-muted-dark">
              {streak.current} day{streak.current === 1 ? '' : 's'} streak
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
