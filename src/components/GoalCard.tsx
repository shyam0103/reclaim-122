import { Brain, Dumbbell, Briefcase, Code2 } from 'lucide-react'
import { GoalKey, GOAL_META, StreakInfo, Status } from '../types'
import { STATUS_LABEL, STATUS_TEXT_CLASS, STATUS_BG_SOFT_CLASS } from '../lib/statusUi'
import { StatusDot } from './StatusDot'
import { Link } from 'react-router-dom'

const ICONS: Record<string, typeof Brain> = { Brain, Dumbbell, Briefcase, Code2 }

export function GoalCard({
  goal,
  todayStatus,
  streak
}: {
  goal: GoalKey
  todayStatus: Status
  streak: StreakInfo
}) {
  const meta = GOAL_META[goal]
  const Icon = ICONS[meta.icon]

  return (
    <Link
      to={`/goal/${goal}`}
      className="rounded-card bg-surface dark:bg-surface-dark border border-line dark:border-line-dark
                 p-4 flex flex-col gap-3 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${STATUS_BG_SOFT_CLASS[todayStatus]}`}>
          <Icon size={18} className={STATUS_TEXT_CLASS[todayStatus]} strokeWidth={1.8} />
        </div>
        <div className="flex items-center gap-1.5">
          <StatusDot status={todayStatus} size="sm" />
          <span className="text-xs text-muted dark:text-muted-dark">{STATUS_LABEL[todayStatus]}</span>
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-ink dark:text-ink-dark">{meta.label}</p>
        <p className="text-xs text-muted dark:text-muted-dark mt-0.5">
          {streak.current} day{streak.current === 1 ? '' : 's'} current streak
        </p>
      </div>
    </Link>
  )
}
