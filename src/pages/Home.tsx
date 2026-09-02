import { useMission } from '../hooks/useMission'
import { GOAL_ORDER, MISSION_TOTAL_DAYS } from '../types'
import { StatBlock } from '../components/StatBlock'
import { GoalCard } from '../components/GoalCard'
import { MonthCalendar } from '../components/MonthCalendar'
import { monthDates } from '../lib/dates'
import { Link } from 'react-router-dom'
import { DEMO_MODE } from '../lib/supabase'

export function Home({ userId }: { userId: string | null }) {
  const m = useMission(userId)

  if (m.loading) return <CenteredNote text="Loading your mission…" />
  if (m.error) return <CenteredNote text={`Couldn't load data: ${m.error}`} />

  const today = m.today
  const todayRecord = m.records.get(today)
  const now = new Date()
  const [year, month] = [now.getUTCFullYear(), now.getUTCMonth() + 1]
  const statusByDate = new Map(Array.from(m.records.entries()).map(([d, r]) => [d, r.overallStatus]))

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      {DEMO_MODE && (
        <div className="mb-4 rounded-full bg-status-blue/10 text-status-blue text-xs font-medium px-3 py-1.5 text-center">
          Demo mode — showing synthetic sample data
        </div>
      )}

      <h1 className="text-xl font-semibold tracking-tight">RECLAIM 122</h1>
      {m.currentDay ? (
        <p className="text-sm text-muted dark:text-muted-dark mt-0.5">
          Day {m.currentDay} of {MISSION_TOTAL_DAYS}
        </p>
      ) : (
        <p className="text-sm text-muted dark:text-muted-dark mt-0.5">Mission runs Sep 1 – Dec 31, 2026</p>
      )}

      <div className="grid grid-cols-2 gap-4 mt-6">
        <StatBlock label="Days remaining" value={m.remaining} />
        <StatBlock label="Current streak" value={m.overallStreak.current} />
        <StatBlock label="Longest streak" value={m.overallStreak.longest} />
        <StatBlock label="Completed days" value={`${m.overallStreak.completedCount} / ${MISSION_TOTAL_DAYS}`} />
      </div>

      <div className="mt-7 rounded-card bg-surface dark:bg-surface-dark border border-line dark:border-line-dark p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium">This month</p>
          <Link to="/calendar" className="text-xs text-status-blue font-medium">
            Full calendar
          </Link>
        </div>
        <MonthCalendar
          year={year}
          month={month}
          monthDates={monthDates(year, month)}
          statusByDate={statusByDate}
          today={today}
        />
      </div>

      <p className="text-sm font-medium mt-7 mb-3">Today's goals</p>
      <div className="grid grid-cols-2 gap-3">
        {GOAL_ORDER.map((goal) => (
          <GoalCard
            key={goal}
            goal={goal}
            todayStatus={todayRecord?.goals[goal]?.status ?? 'not_recorded'}
            streak={m.goalStreaks[goal]}
          />
        ))}
      </div>

      <Link
        to="/today"
        className="mt-7 block text-center rounded-full bg-ink dark:bg-ink-dark text-paper dark:text-paper-dark
                   py-3.5 text-sm font-medium active:scale-[0.98] transition-transform"
      >
        {todayRecord ? 'Continue today' : 'Check in'}
      </Link>
    </div>
  )
}

function CenteredNote({ text }: { text: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <p className="text-sm text-muted dark:text-muted-dark text-center">{text}</p>
    </div>
  )
}
