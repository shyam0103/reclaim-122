import { useParams, Link } from 'react-router-dom'
import { useMission } from '../hooks/useMission'
import { GoalKey, GOAL_META, Status } from '../types'
import { MonthCalendar } from '../components/MonthCalendar'
import { monthDates } from '../lib/dates'
import { GOAL_ACCENT } from '../lib/statusUi'
import { ChevronLeft, Brain, Dumbbell, Briefcase, Code2 } from 'lucide-react'
import { motion } from 'framer-motion'

const ICONS: Record<string, typeof Brain> = { Brain, Dumbbell, Briefcase, Code2 }

export function CalendarGoalDetail({ userId }: { userId: string | null }) {
  const { goal } = useParams<{ goal: GoalKey }>()
  const m = useMission(userId)
  if (m.loading || !goal) return null

  const meta = GOAL_META[goal]
  const Icon = ICONS[meta.icon]
  const accent = GOAL_ACCENT[goal]
  const streak = m.goalStreaks[goal]

  const statusByDate = new Map<string, Status>()
  for (const [date, rec] of m.records) {
    const g = rec.goals[goal]
    if (g) statusByDate.set(date, g.status)
  }

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      <Link to="/calendar" className="flex items-center gap-1 text-sm text-muted dark:text-muted-dark mb-3">
        <ChevronLeft size={16} /> Calendar
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accent}22`, color: accent }}>
          <Icon size={20} strokeWidth={1.8} />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{meta.label}</h1>
          <p className="text-xs text-muted dark:text-muted-dark mt-0.5">
            {streak.current}-day current streak · {streak.longest}-day longest
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {m.months.map(({ year, month, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="rounded-card bg-surface dark:bg-surface-dark shadow-soft dark:shadow-soft-dark p-4"
          >
            <p className="text-sm font-medium mb-3">{label}</p>
            <MonthCalendar year={year} month={month} monthDates={monthDates(year, month)} statusByDate={statusByDate} today={m.today} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}
