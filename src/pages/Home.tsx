import { useMission } from '../hooks/useMission'
import { GOAL_ORDER, MISSION_TOTAL_DAYS } from '../types'
import { StatCard } from '../components/StatCard'
import { GoalCard } from '../components/GoalCard'
import { SwipeableMonthCalendar } from '../components/SwipeableMonthCalendar'
import { RingProgress } from '../components/RingProgress'
import { Link } from 'react-router-dom'
import { DEMO_MODE } from '../lib/supabase'
import { CalendarClock, Flame, Trophy, CheckCircle2, CalendarDays } from 'lucide-react'
import { motion } from 'framer-motion'
import { missionDayNumber } from '../lib/dates'

export function Home({ userId }: { userId: string | null }) {
  const m = useMission(userId)

  if (m.loading) return <CenteredNote text="Loading your mission…" />
  if (m.error) return <CenteredNote text={`Couldn't load data: ${m.error}`} />

  const today = m.today
  const todayRecord = m.records.get(today)
  const statusByDate = new Map(Array.from(m.records.entries()).map(([d, r]) => [d, r.overallStatus]))
  const dayNumber = m.currentDay ?? missionDayNumber(today) ?? 0
  const elapsedPercent = Math.round((dayNumber / MISSION_TOTAL_DAYS) * 100)
  const completedPercent = Math.round((m.overallStreak.completedCount / MISSION_TOTAL_DAYS) * 100)

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      {DEMO_MODE && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4 rounded-full bg-status-blue/10 text-status-blue text-xs font-medium px-3 py-1.5 text-center"
        >
          Demo mode — showing synthetic sample data
        </motion.div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">RECLAIM 122</h1>
          {dayNumber ? (
            <p className="text-sm text-muted dark:text-muted-dark mt-0.5">
              Day {dayNumber} of {MISSION_TOTAL_DAYS}
            </p>
          ) : (
            <p className="text-sm text-muted dark:text-muted-dark mt-0.5">Sep 1 – Dec 31, 2026</p>
          )}
        </div>
        {dayNumber > 0 && (
          <RingProgress percent={elapsedPercent} size={56} strokeWidth={6} color="#4A7FE0">
            <span className="text-xs font-semibold tabular-nums">{elapsedPercent}%</span>
          </RingProgress>
        )}
      </div>

      {/* Swipeable day strip */}
      <div className="mt-5">
        <SwipeableMonthCalendar
  statusByDate={statusByDate}
  today={today}
/>
      </div>

      {/* Animated stat cards */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <StatCard
          icon={<CalendarClock size={18} />}
          label="Days remaining"
          value={m.remaining}
          color="#4A7FE0"
          index={0}
        />
        <StatCard
          icon={<Flame size={18} />}
          label="Current streak"
          value={m.overallStreak.current}
          suffix="days"
          color="#F2994A"
          pulse={m.overallStreak.current > 0}
          index={1}
        />
        <StatCard
          icon={<Trophy size={18} />}
          label="Longest streak"
          value={m.overallStreak.longest}
          suffix="days"
          color="#E0B24A"
          index={2}
        />
        <StatCard
          icon={<CheckCircle2 size={18} />}
          label={`Completed / ${MISSION_TOTAL_DAYS}`}
          value={m.overallStreak.completedCount}
          color="#3F9A6E"
          ringPercent={completedPercent}
          index={3}
        />
      </div>

      <Link
        to="/calendar"
        className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-status-blue py-1"
      >
        <CalendarDays size={15} /> Open full calendar
      </Link>

      <p className="text-sm font-medium mt-6 mb-3">Today's goals</p>
      <div className="grid grid-cols-2 gap-3">
        {GOAL_ORDER.map((goal, i) => (
          <GoalCard
            key={goal}
            goal={goal}
            todayStatus={todayRecord?.goals[goal]?.status ?? 'not_recorded'}
            streak={m.goalStreaks[goal]}
            index={i}
          />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Link
          to="/today"
          className="mt-6 block text-center rounded-full bg-surface dark:bg-surface-dark
           border border-line dark:border-line-dark
           text-ink dark:text-ink-dark
           shadow-soft dark:shadow-soft-dark
           py-3.5 text-sm font-medium
           active:scale-[0.98] transition-transform"
        >
          {todayRecord ? 'Continue today' : 'Check in'}
        </Link>
      </motion.div>
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
