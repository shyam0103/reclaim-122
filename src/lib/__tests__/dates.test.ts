import { describe, it, expect } from 'vitest'
import { missionDayNumber, daysRemaining, isWithinMission, allMissionDates, isFutureDate } from '../dates'
import { MISSION_TOTAL_DAYS } from '../../types'

describe('mission date boundaries (Sep 1 - Dec 31, 2026)', () => {
  it('Sep 1 2026 is day 1', () => {
    expect(missionDayNumber('2026-09-01')).toBe(1)
  })
  it('Dec 31 2026 is day 122', () => {
    expect(missionDayNumber('2026-12-31')).toBe(122)
  })
  it('Aug 31 2026 is outside the mission', () => {
    expect(isWithinMission('2026-08-31')).toBe(false)
    expect(missionDayNumber('2026-08-31')).toBeNull()
  })
  it('Jan 1 2027 is outside the mission', () => {
    expect(isWithinMission('2027-01-01')).toBe(false)
  })
  it('allMissionDates has exactly 122 entries', () => {
    expect(allMissionDates()).toHaveLength(MISSION_TOTAL_DAYS)
  })
  it('daysRemaining on day 1 is 121', () => {
    expect(daysRemaining('2026-09-01')).toBe(121)
  })
  it('daysRemaining on the final day is 0', () => {
    expect(daysRemaining('2026-12-31')).toBe(0)
  })
  it('isFutureDate correctly flags dates after the reference', () => {
    expect(isFutureDate('2026-09-05', '2026-09-01')).toBe(true)
    expect(isFutureDate('2026-09-01', '2026-09-01')).toBe(false)
  })
})
