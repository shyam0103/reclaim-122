import { useMission } from '../hooks/useMission'
import { GOAL_ORDER, GOAL_META, MISSION_TOTAL_DAYS } from '../types'
import { StatBlock } from '../components/StatBlock'
import { Card } from '../components/Card'

export function Analytics({ userId }: { userId: string | null }) {
  const m = useMission(userId)
  if (m.loading) return null

  const s = m.overallStreak

  return (
    <div className="px-5 pt-6 pb-28 max-w-md mx-auto">
      <h1 className="text-xl font-semibold tracking-tight mb-5">Analytics</h1>

      <Card>
        <p className="text-sm font-medium mb-3">Overall</p>
        <div className="grid grid-cols-2 gap-4">
          <StatBlock label="Completed / total" value={`${s.completedCount} / ${MISSION_TOTAL_DAYS}`} />
          <StatBlock label="Current streak" value={s.current} />
          <StatBlock label="Longest streak" value={s.longest} />
          <StatBlock label="Green days" value={s.greenCount} />
          <StatBlock label="Blue days" value={s.blueCount} />
          <StatBlock label="Yellow days" value={s.yellowCount} />
          <StatBlock label="Red days" value={s.redCount} />
          <StatBlock label="Not recorded" value={s.notRecordedCount} />
        </div>
      </Card>

      <div className="flex flex-col gap-4 mt-4">
        {GOAL_ORDER.map((goal) => {
          const gs = m.goalStreaks[goal]
          return (
            <Card key={goal}>
              <p className="text-sm font-medium mb-3">{GOAL_META[goal].label}</p>
              <div className="grid grid-cols-2 gap-4">
                <StatBlock label="Current streak" value={gs.current} />
                <StatBlock label="Longest streak" value={gs.longest} />
                <StatBlock label="Completed days" value={gs.completedCount} />
                <StatBlock label="Red days" value={gs.redCount} />
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
