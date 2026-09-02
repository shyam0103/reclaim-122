import { useParams, Link } from 'react-router-dom'
import { useMission } from '../hooks/useMission'
import { GoalKey, GOAL_META, Status } from '../types'
import { StatBlock } from '../components/StatBlock'
import { MonthCalendar } from '../components/MonthCalendar'
import { monthDates } from '../lib/dates'
import { ChevronLeft } from 'lucide-react'

export function GoalDetail({ userId }: { userId: string | null }) {
  const { goal } = useParams<{ goal: GoalKey }>()
  const m = useMission(userId)

  if (m.loading || !goal) return null
  const meta = GOAL_META[goal]
  const streak = m.goalStreaks[goal]

  const statusByDate = new Map<string, Status>()
  for (const [date, rec] of m.records) {
    const g = rec.goals[goal]
    if (g) statusByDate.set(date, g.status)
  }

  // Simple per-goal aggregate totals for the extra metrics section
  let totalApplications = 0
  let totalMinutes = 0
  let workoutCount = 0
  let stepsEntries = 0
  const weights: number[] = []
  for (const rec of m.records.values()) {
    const g = rec.goals[goal]
    if (!g) continue
    if (g.pm) totalApplications += g.pm.applicationCount
    if (g.python) totalMinutes += g.python.learningMinutes
    if (g.fitness) {
      if (g.fitness.workoutDone) workoutCount++
      if (g.fitness.steps !== null && g.fitness.steps !== undefined) stepsEntries++
      if (g.fitness.weight !== null && g.fitness.weight !== undefined) weights.push(g.fitness.weight)
    }
  }
  const weightTrend = weights.length >= 2 ? weights[weights.length - 1] - weights[0] : null

  const now = new Date()

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      <Link to="/" className="flex items-center gap-1 text-sm text-muted dark:text-muted-dark mb-3">
        <ChevronLeft size={16} /> Home
      </Link>
      <h1 className="text-xl font-semibold tracking-tight">{meta.label}</h1>

      <div className="grid grid-cols-2 gap-4 mt-6">
        <StatBlock label="Current streak" value={streak.current} />
        <StatBlock label="Longest streak" value={streak.longest} />
        <StatBlock label="Completed days" value={streak.completedCount} />
        <StatBlock label="Off-track days" value={streak.redCount} />
      </div>

      {goal === 'pm' && (
        <div className="mt-6 rounded-card bg-surface dark:bg-surface-dark border border-line dark:border-line-dark p-4">
          <StatBlock label="Total applications" value={totalApplications} />
        </div>
      )}
      {goal === 'python' && (
        <div className="mt-6 rounded-card bg-surface dark:bg-surface-dark border border-line dark:border-line-dark p-4">
          <StatBlock label="Total learning minutes" value={totalMinutes} />
        </div>
      )}
      {goal === 'fitness' && (
        <div className="mt-6 rounded-card bg-surface dark:bg-surface-dark border border-line dark:border-line-dark p-4 grid grid-cols-2 gap-4">
          <StatBlock label="Workouts logged" value={workoutCount} />
          <StatBlock label="Steps entries" value={stepsEntries} />
          {weightTrend !== null && (
            <StatBlock label="Weight trend" value={`${weightTrend > 0 ? '+' : ''}${weightTrend.toFixed(1)}`} />
          )}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-6">
        {m.months.map(({ year, month, label }) => (
          <div key={label} className="rounded-card bg-surface dark:bg-surface-dark border border-line dark:border-line-dark p-4">
            <p className="text-sm font-medium mb-3">{label}</p>
            <MonthCalendar
              year={year}
              month={month}
              monthDates={monthDates(year, month)}
              statusByDate={statusByDate}
              today={m.today}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
