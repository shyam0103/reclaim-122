import { useParams, Link } from 'react-router-dom'
import { useMission } from '../hooks/useMission'
import { GoalKey, GOAL_META, Status } from '../types'
import { StatCard } from '../components/StatCard'
import { WeeklyBarChart } from '../components/WeeklyBarChart'
import { MetricChart, MetricPoint } from '../components/MetricChart'
import { SwipeableMonthCalendar } from '../components/SwipeableMonthCalendar'
import { buildWeeklyBuckets } from '../lib/weekly'
import { GOAL_ACCENT } from '../lib/statusUi'
import { ChevronLeft, Flame, Trophy, CheckCircle2, XCircle, Brain, Dumbbell, Briefcase, Code2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { allMissionDates } from '../lib/dates'
import type { ReactNode } from 'react'

const ICONS: Record<string, typeof Brain> = { Brain, Dumbbell, Briefcase, Code2 }

function formatShort(iso: string): string {
  const d = new Date(`${iso}T12:00:00Z`)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}`
}

export function AnalyticsGoalDetail({ userId }: { userId: string | null }) {
  const { goal } = useParams<{ goal: GoalKey }>()
  const m = useMission(userId)

  if (m.loading || !goal) return null

  const meta = GOAL_META[goal]
  const Icon = ICONS[meta.icon]
  const accent = GOAL_ACCENT[goal]
  const streak = m.goalStreaks[goal]
  const weekly = buildWeeklyBuckets(m.records, m.today, goal)
  const dates = allMissionDates().filter((d) => d <= m.today)

  // Build status data for this specific goal only.
  const goalStatusByDate = new Map<string, Status>()

  for (const [date, record] of m.records) {
    const goalRecord = record.goals[goal]

    if (goalRecord) {
      goalStatusByDate.set(date, goalRecord.status)
    }
  }

  // Goal-specific metric: only the one extra chart that's actually informative per goal.
  let extra: { title: string; sub: string; node: ReactNode } | null = null

  if (goal === 'fitness') {
    const weightPoints: MetricPoint[] = []

    for (const date of dates) {
      const w = m.records.get(date)?.goals.fitness?.fitness?.weight

      if (w !== null && w !== undefined) {
        weightPoints.push({
          label: formatShort(date),
          value: w
        })
      }
    }

    if (weightPoints.length >= 2) {
      extra = {
        title: 'Weight trend',
        sub: 'From your logged entries',
        node: (
          <MetricChart
            points={weightPoints}
            color={accent}
            kind="line"
          />
        )
      }
    }
  }

  if (goal === 'pm') {
    const perWeek: MetricPoint[] = weekly.map((w) => {
      let total = 0

      for (const date of dates) {
        if (date >= w.startDate && date <= w.endDate) {
          total += m.records.get(date)?.goals.pm?.pm?.applicationCount ?? 0
        }
      }

      return {
        label: w.label,
        value: total
      }
    })

    extra = {
      title: 'Applications per week',
      sub: 'Total submitted each week',
      node: (
        <MetricChart
          points={perWeek}
          color={accent}
          kind="bar"
        />
      )
    }
  }

  if (goal === 'python') {
    const perWeek: MetricPoint[] = weekly.map((w) => {
      let total = 0

      for (const date of dates) {
        if (date >= w.startDate && date <= w.endDate) {
          total += m.records.get(date)?.goals.python?.python?.learningMinutes ?? 0
        }
      }

      return {
        label: w.label,
        value: total
      }
    })

    extra = {
      title: 'Learning minutes per week',
      sub: 'Total minutes logged each week',
      node: (
        <MetricChart
          points={perWeek}
          color={accent}
          kind="bar"
          unit="min"
        />
      )
    }
  }

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      <Link
        to="/analytics"
        className="flex items-center gap-1 text-sm text-muted dark:text-muted-dark mb-3"
      >
        <ChevronLeft size={16} /> Analytics
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-11 h-11 rounded-full flex items-center justify-center"
          style={{
            backgroundColor: `${accent}22`,
            color: accent
          }}
        >
          <Icon size={20} strokeWidth={1.8} />
        </div>

        <h1 className="text-xl font-semibold tracking-tight">
          {meta.label}
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame size={18} />}
          label="Current streak"
          value={streak.current}
          suffix="days"
          color="#F2994A"
          pulse={streak.current > 0}
          index={0}
        />

        <StatCard
          icon={<Trophy size={18} />}
          label="Longest streak"
          value={streak.longest}
          suffix="days"
          color="#E0B24A"
          index={1}
        />

        <StatCard
          icon={<CheckCircle2 size={18} />}
          label="Completed days"
          value={streak.completedCount}
          color="#3F9A6E"
          index={2}
        />

        <StatCard
          icon={<XCircle size={18} />}
          label="Off-track days"
          value={streak.redCount}
          color="#C4573F"
          index={3}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 rounded-card bg-surface dark:bg-surface-dark shadow-soft dark:shadow-soft-dark p-4"
      >
        <p className="text-sm font-medium mb-1">
          Weekly consistency
        </p>

        <p className="text-xs text-muted dark:text-muted-dark mb-2">
          On-track days per week for {meta.label}
        </p>

        <WeeklyBarChart
          buckets={weekly}
          color={accent}
        />
      </motion.div>

      {extra && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38 }}
          className="mt-4 rounded-card bg-surface dark:bg-surface-dark shadow-soft dark:shadow-soft-dark p-4"
        >
          <p className="text-sm font-medium mb-1">
            {extra.title}
          </p>

          <p className="text-xs text-muted dark:text-muted-dark mb-2">
            {extra.sub}
          </p>

          {extra.node}
        </motion.div>
      )}

      {/* Goal calendar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mt-5"
      >
        <SwipeableMonthCalendar
          statusByDate={goalStatusByDate}
          today={m.today}
        />
      </motion.div>
    </div>
  )
} 