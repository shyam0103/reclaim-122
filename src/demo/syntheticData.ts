import { DayRecord, GoalKey, GoalRecord, Status } from '../types'
import { allMissionDates, todayIso } from '../lib/dates'
import { computeOverallStatus } from '../lib/status'

/** Deterministic, seeded synthetic dataset — same output every run — used only by the
 * public demo deployment. Never derived from or mixed with real personal data. */
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function goalRecord(goal: GoalKey, status: Status): GoalRecord {
  const rec: GoalRecord = { goal, status, excuseReason: status === 'yellow' ? 'work' : null }
  if (goal === 'discipline') rec.disciplinePornFree = status !== 'red'
  if (goal === 'fitness') rec.fitness = { workoutDone: status !== 'red', steps: 4000 + Math.floor(Math.random() * 6000), weight: null }
  if (goal === 'pm') rec.pm = { meaningfulProgress: status === 'red' ? 'not_done' : 'done', applicationCount: status === 'red' ? 0 : 1 }
  if (goal === 'python') rec.python = { meaningfulProgress: status === 'red' ? 'not_done' : 'done', learningMinutes: status === 'red' ? 0 : 30 + Math.floor(Math.random() * 60) }
  return rec
}

let cached: DayRecord[] | null = null

export function getDemoDayRecords(): DayRecord[] {
  if (cached) return cached
  const rand = seededRandom(42)
  const today = todayIso()
  const goals: GoalKey[] = ['discipline', 'fitness', 'pm', 'python']

  cached = allMissionDates()
    .filter((d) => d <= today)
    .map((date) => {
      const dayGoals: DayRecord['goals'] = {}
      for (const g of goals) {
        const r = rand()
        const status: Status = r < 0.75 ? 'green' : r < 0.85 ? 'blue' : r < 0.93 ? 'yellow' : 'red'
        dayGoals[g] = goalRecord(g, status)
      }
      return {
        date,
        overallStatus: computeOverallStatus(dayGoals),
        note: null,
        goals: dayGoals
      }
    })

  return cached
}
