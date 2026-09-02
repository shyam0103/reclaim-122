import { useState } from 'react'
import { useMission } from '../hooks/useMission'
import { GOAL_ORDER, GOAL_META, Status } from '../types'
import { MonthCalendar } from '../components/MonthCalendar'
import { monthDates } from '../lib/dates'

export function CalendarPage({ userId }: { userId: string | null }) {
  const m = useMission(userId)
  const [activeGoal, setActiveGoal] = useState<'overall' | (typeof GOAL_ORDER)[number]>('overall')

  if (m.loading) return null

  const statusByDate = (goal: typeof activeGoal) => {
    const map = new Map<string, Status>()
    for (const [date, rec] of m.records) {
      if (goal === 'overall') map.set(date, rec.overallStatus)
      else {
        const g = rec.goals[goal]
        if (g) map.set(date, g.status)
      }
    }
    return map
  }

  const currentStatusByDate = statusByDate(activeGoal)

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      <h1 className="text-xl font-semibold tracking-tight mb-4">Calendar</h1>

      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-5 px-5">
        <GoalTab active={activeGoal === 'overall'} label="Overall" onClick={() => setActiveGoal('overall')} />
        {GOAL_ORDER.map((g) => (
          <GoalTab key={g} active={activeGoal === g} label={GOAL_META[g].label} onClick={() => setActiveGoal(g)} />
        ))}
      </div>

      <Legend />

      <div className="flex flex-col gap-6 mt-5">
        {m.months.map(({ year, month, label }) => (
          <div key={label} className="rounded-card bg-surface dark:bg-surface-dark border border-line dark:border-line-dark p-4">
            <p className="text-sm font-medium mb-3">{label}</p>
            <MonthCalendar
              year={year}
              month={month}
              monthDates={monthDates(year, month)}
              statusByDate={currentStatusByDate}
              today={m.today}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

function GoalTab({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 text-xs font-medium px-3.5 py-2 rounded-full border ${
        active ? 'bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark border-transparent' : 'border-line dark:border-line-dark text-muted dark:text-muted-dark'
      }`}
    >
      {label}
    </button>
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
