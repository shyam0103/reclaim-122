import { useMission } from '../hooks/useMission'
import { GOAL_ORDER, GOAL_META, MISSION_TOTAL_DAYS } from '../types'
import { StatCard } from '../components/StatCard'
import { StatusPie } from '../components/StatusPie'
import { WeeklyBarChart } from '../components/WeeklyBarChart'
import { buildWeeklyBuckets } from '../lib/weekly'
import { GOAL_ACCENT } from '../lib/statusUi'
import { Link } from 'react-router-dom'
import { CheckCircle2, Flame, Trophy, TrendingUp, Brain, Dumbbell, Briefcase, Code2, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'

const ICONS: Record<string, typeof Brain> = { Brain, Dumbbell, Briefcase, Code2 }

export function Analytics({ userId }: { userId: string | null }) {
  const m = useMission(userId)
  if (m.loading) return null

  const s = m.overallStreak
  const weekly = buildWeeklyBuckets(m.records, m.today)

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      <h1 className="text-xl font-semibold tracking-tight mb-5">Analytics</h1>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={<CheckCircle2 size={18} />} label={`Completed / ${MISSION_TOTAL_DAYS}`} value={s.completedCount} color="#3F9A6E" index={0} />
        <StatCard icon={<Flame size={18} />} label="Current streak" value={s.current} suffix="days" color="#F2994A" pulse={s.current > 0} index={1} />
        <StatCard icon={<Trophy size={18} />} label="Longest streak" value={s.longest} suffix="days" color="#E0B24A" index={2} />
        <StatCard icon={<TrendingUp size={18} />} label="Green days" value={s.greenCount} color="#4A7FE0" index={3} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 rounded-card bg-surface dark:bg-surface-dark shadow-soft dark:shadow-soft-dark p-4"
      >
        <p className="text-sm font-medium mb-1">Status breakdown</p>
        <p className="text-xs text-muted dark:text-muted-dark mb-2">How your recorded days have landed so far</p>
        <StatusPie streak={s} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="mt-4 rounded-card bg-surface dark:bg-surface-dark shadow-soft dark:shadow-soft-dark p-4"
      >
        <p className="text-sm font-medium mb-1">Weekly consistency</p>
        <p className="text-xs text-muted dark:text-muted-dark mb-2">On-track days per week, mission-wide</p>
        <WeeklyBarChart buckets={weekly} color="#4A7FE0" />
      </motion.div>

      <p className="text-sm font-medium mt-7 mb-3">By goal</p>
      <div className="flex flex-col gap-2.5">
        {GOAL_ORDER.map((goal) => {
          const Icon = ICONS[GOAL_META[goal].icon]
          const accent = GOAL_ACCENT[goal]
          const gs = m.goalStreaks[goal]
          return (
            <Link
              key={goal}
              to={`/analytics/${goal}`}
              className="rounded-card bg-surface dark:bg-surface-dark shadow-soft dark:shadow-soft-dark
                         p-3.5 flex items-center gap-3 active:scale-[0.98] transition-transform"
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}22`, color: accent }}>
                <Icon size={17} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{GOAL_META[goal].label}</p>
                <p className="text-xs text-muted dark:text-muted-dark">
                  {gs.current}-day streak · {gs.completedCount} completed
                </p>
              </div>
              <ChevronRight size={16} className="text-muted dark:text-muted-dark shrink-0" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
