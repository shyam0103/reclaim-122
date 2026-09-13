import { DayRecord, GoalKey, Status } from '../types'
import { addDays } from './dates'
import { MISSION_START, MISSION_END } from '../types'

export interface WeekBucket {
  label: string // e.g. "Sep 1"
  startDate: string
  endDate: string
  green: number
  blue: number
  yellow: number
  red: number
  notRecorded: number
  completed: number // green+blue+yellow
  total: number // days elapsed in this week up to "today"
}

const formatShort = (iso: string): string => {
  const d = new Date(`${iso}T12:00:00Z`)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}`
}

/** Buckets the mission into 7-day weeks starting Sep 1, and tallies overall (or a
 * single goal's) status counts per week, up to `todayIso`. Used for the weekly
 * consistency bar charts on Analytics pages. */
export function buildWeeklyBuckets(
  records: Map<string, DayRecord>,
  todayIso: string,
  goal?: GoalKey
): WeekBucket[] {
  const buckets: WeekBucket[] = []
  let cursor = MISSION_START

  while (cursor <= MISSION_END) {
    const weekEnd = addDays(cursor, 6) > MISSION_END ? MISSION_END : addDays(cursor, 6)
    const bucket: WeekBucket = {
      label: formatShort(cursor),
      startDate: cursor,
      endDate: weekEnd,
      green: 0,
      blue: 0,
      yellow: 0,
      red: 0,
      notRecorded: 0,
      completed: 0,
      total: 0
    }

    let d = cursor
    while (d <= weekEnd) {
      if (d <= todayIso) {
        bucket.total++
        const rec = records.get(d)
        const status: Status = goal ? rec?.goals[goal]?.status ?? 'not_recorded' : rec?.overallStatus ?? 'not_recorded'
        if (status === 'green') bucket.green++
        else if (status === 'blue') bucket.blue++
        else if (status === 'yellow') bucket.yellow++
        else if (status === 'red') bucket.red++
        else bucket.notRecorded++
      }
      d = addDays(d, 1)
    }
    bucket.completed = bucket.green + bucket.blue + bucket.yellow

    if (bucket.total > 0) buckets.push(bucket)
    cursor = addDays(weekEnd, 1)
  }

  return buckets
}
