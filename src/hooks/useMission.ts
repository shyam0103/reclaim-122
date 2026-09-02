import { useCallback, useEffect, useMemo, useState } from 'react'
import { DayRecord, GOAL_ORDER, GoalKey, Status, StreakInfo } from '../types'
import { allMissionDates, todayIso, missionDayNumber, daysRemaining, MISSION_MONTHS } from '../lib/dates'
import { computeStreaks } from '../lib/streaks'
import { fetchAllDayRecords, saveDayRecord } from '../lib/repository'

export function useMission(userId: string | null) {
  const [records, setRecords] = useState<Map<string, DayRecord>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchAllDayRecords(userId)
      setRecords(new Map(data))
    } catch (e: any) {
      setError(e?.message ?? 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  const save = useCallback(
    async (day: DayRecord) => {
      const saved = await saveDayRecord(userId, day)
      setRecords((prev) => {
        const next = new Map(prev)
        next.set(saved.date, saved)
        return next
      })
      return saved
    },
    [userId]
  )

  const allDates = useMemo(() => allMissionDates(), [])
  const today = todayIso()

  const overallStreak: StreakInfo = useMemo(() => {
    const statusByDate = new Map<string, Status>()
    for (const [date, rec] of records) statusByDate.set(date, rec.overallStatus)
    return computeStreaks(allDates, statusByDate, today)
  }, [records, allDates, today])

  const goalStreaks: Record<GoalKey, StreakInfo> = useMemo(() => {
    const result = {} as Record<GoalKey, StreakInfo>
    for (const goal of GOAL_ORDER) {
      const statusByDate = new Map<string, Status>()
      for (const [date, rec] of records) {
        const g = rec.goals[goal]
        if (g) statusByDate.set(date, g.status)
      }
      result[goal] = computeStreaks(allDates, statusByDate, today)
    }
    return result
  }, [records, allDates, today])

  const currentDay = missionDayNumber(today)
  const remaining = daysRemaining(today)

  return {
    records,
    loading,
    error,
    reload,
    save,
    allDates,
    today,
    currentDay,
    remaining,
    overallStreak,
    goalStreaks,
    months: MISSION_MONTHS
  }
}
