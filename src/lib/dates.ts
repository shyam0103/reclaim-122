import { MISSION_END, MISSION_START, MISSION_TOTAL_DAYS } from '../types'

/** All date math treats dates as plain YYYY-MM-DD strings / UTC-noon Dates to avoid
 * timezone drift moving a date across midnight. */

export function toDate(iso: string): Date {
  return new Date(`${iso}T12:00:00Z`)
}

export function toIso(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function todayIso(): string {
  return toIso(new Date())
}

export function isWithinMission(iso: string): boolean {
  return iso >= MISSION_START && iso <= MISSION_END
}

export function isFutureDate(iso: string, referenceIso: string = todayIso()): boolean {
  return iso > referenceIso
}

/** Mission day number, 1-indexed. Returns null if outside the mission window. */
export function missionDayNumber(iso: string): number | null {
  if (!isWithinMission(iso)) return null
  const start = toDate(MISSION_START)
  const d = toDate(iso)
  const diffDays = Math.round((d.getTime() - start.getTime()) / 86400000)
  return diffDays + 1
}

export function daysRemaining(referenceIso: string = todayIso()): number {
  const day = missionDayNumber(referenceIso)
  if (day === null) {
    return referenceIso < MISSION_START ? MISSION_TOTAL_DAYS : 0
  }
  return Math.max(0, MISSION_TOTAL_DAYS - day)
}

export function addDays(iso: string, n: number): string {
  const d = toDate(iso)
  d.setUTCDate(d.getUTCDate() + n)
  return toIso(d)
}

/** All 122 mission dates, in order. */
export function allMissionDates(): string[] {
  const dates: string[] = []
  let cur = MISSION_START
  while (cur <= MISSION_END) {
    dates.push(cur)
    cur = addDays(cur, 1)
  }
  return dates
}

export function monthDates(year: number, month: number /* 1-12 */): string[] {
  const first = new Date(Date.UTC(year, month - 1, 1))
  const dates: string[] = []
  const m = first.getUTCMonth()
  while (first.getUTCMonth() === m) {
    dates.push(toIso(first))
    first.setUTCDate(first.getUTCDate() + 1)
  }
  return dates
}

export const MISSION_MONTHS: Array<{ year: number; month: number; label: string }> = [
  { year: 2026, month: 9, label: 'September 2026' },
  { year: 2026, month: 10, label: 'October 2026' },
  { year: 2026, month: 11, label: 'November 2026' },
  { year: 2026, month: 12, label: 'December 2026' }
]
