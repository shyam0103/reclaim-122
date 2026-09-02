import { DayRecord, GOAL_ORDER, GoalRecord, Status } from '../types'

/**
 * Discipline GREEN/RED rule (spec section 9 / 6.1):
 * RED only when the user intentionally viewed pornography AND masturbated that day.
 * Urges never cause RED. If pornFree is null/undefined (not answered), there's no
 * discipline record at all, which is handled at the goal-record level (not_recorded).
 */
export function disciplineStatusFromPornFree(pornFree: boolean): 'green' | 'red' {
  return pornFree ? 'green' : 'red'
}

/** Any meaningful workout qualifies for GREEN. Steps/weight never required. */
export function fitnessAutoStatus(workoutDone: boolean): 'green' | 'red' {
  return workoutDone ? 'green' : 'red'
}

export function progressAutoStatus(progress: 'done' | 'partial' | 'not_done'): 'green' | 'red' {
  // "Any meaningful progress qualifies for GREEN" — treat partial as meaningful too,
  // since the spec's own examples (e.g. "PM learning", "practice") are partial-effort actions.
  return progress === 'not_done' ? 'red' : 'green'
}

/**
 * Overall day status (spec section 13 / 10):
 * - Any goal RED -> overall RED.
 * - No goal RED and at least one goal recorded -> GREEN, BLUE, or YELLOW per recorded goals
 *   (BLUE/YELLOW take precedence over GREEN as the more specific, user-chosen designation;
 *   if all recorded goals are GREEN, overall is GREEN).
 * - No goals recorded at all -> NOT_RECORDED.
 */
export function computeOverallStatus(goals: Partial<Record<string, GoalRecord>>): Status {
  const records = GOAL_ORDER.map((g) => goals[g]).filter(Boolean) as GoalRecord[]
  if (records.length === 0) return 'not_recorded'

  if (records.some((r) => r.status === 'red')) return 'red'
  if (records.some((r) => r.status === 'yellow')) return 'yellow'
  if (records.some((r) => r.status === 'blue')) return 'blue'
  return 'green'
}

/** Whether a status continues a streak (GREEN, BLUE, YELLOW) vs breaks it (RED) vs
 * doesn't count either way (NOT_RECORDED). */
export function streakEffect(status: Status): 'continue' | 'break' | 'neutral' {
  if (status === 'red') return 'break'
  if (status === 'not_recorded') return 'neutral'
  return 'continue'
}

export function recomputeDayOverallStatus(day: DayRecord): DayRecord {
  return { ...day, overallStatus: computeOverallStatus(day.goals) }
}
