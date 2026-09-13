import { useMission } from '../hooks/useMission'
import { GOAL_ORDER, GOAL_META, Status } from '../types'
import { MonthCalendar } from '../components/MonthCalendar'
import { monthDates } from '../lib/dates'
import { GOAL_ACCENT } from '../lib/statusUi'
import { Link } from 'react-router-dom'
import { Brain, Dumbbell, Briefcase, Code2, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

const ICONS: Record<string, typeof Brain> = { Brain, Dumbbell, Briefcase, Code2 }

export function CalendarPage({ userId }: { userId: string | null }) {
  const m = useMission(userId)
  if (m.loading) return null

  const statusByDate = new Map<string, Status>()
  for (const [date, rec] of m.records) statusByDate.set(date, rec.overallStatus)

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      <h1 className="text-xl font-semibold tracking-tight mb-1">Calendar</h1>
      <p className="text-sm text-muted dark:text-muted-dark mb-5">Overall mission history</p>

      <Legend />

      <div className="flex flex-col gap-6 mt-5">
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

      <p className="text-sm font-medium mt-7 mb-3">By goal</p>
      <div className="flex flex-col gap-2.5">
        {GOAL_ORDER.map((goal) => {
          const Icon = ICONS[GOAL_META[goal].icon]
          const accent = GOAL_ACCENT[goal]
          const streak = m.goalStreaks[goal]
          return (
            <Link
              key={goal}
              to={`/calendar/${goal}`}
              className="rounded-card bg-surface dark:bg-surface-dark shadow-soft dark:shadow-soft-dark
                         p-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}22`, color: accent }}>
                <Icon size={17} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{GOAL_META[goal].label}</p>
                <p className="text-xs text-muted dark:text-muted-dark">{streak.current} day streak</p>
              </div>
              <ChevronRight size={16} className="text-muted dark:text-muted-dark shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}

function Legend() {
  const items: Array<{ status: Status; label: string }> = [
    { status: 'green', label: 'On track' },
    { status: 'blue', label: 'Partial' },
    { status: 'yellow', label: 'Excused' },
    { status: 'red', label: 'Off track' },
    { status: 'not_recorded', label: 'Not recorded' }
  ]
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1.5">
      {items.map((it) => (
        <div key={it.status} className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              { green: 'bg-status-green', blue: 'bg-status-blue', yellow: 'bg-status-yellow', red: 'bg-status-red', not_recorded: 'bg-status-none' }[it.status]
            }`}
          />
          <span className="text-[11px] text-muted dark:text-muted-dark">{it.label}</span>
        </div>
      ))}
    </div>
  )
}
