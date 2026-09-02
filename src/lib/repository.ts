import { supabase, DEMO_MODE } from './supabase'
import { DayRecord, ExcuseReason, GoalKey, GoalRecord, Status, MISSION_START, MISSION_END } from '../types'
import { getDemoDayRecords } from '../demo/syntheticData'
import { computeOverallStatus } from './status'

/**
 * Repository: the single place the UI talks to for reading/writing day + goal records.
 * In demo mode (no Supabase env vars, or VITE_DEMO_MODE=true) it serves synthetic
 * in-memory data and writes are no-ops that update local state only — safe for the
 * public showcase deployment, which must never touch a real database.
 */

let missionIdCache: string | null = null
let demoStore: Map<string, DayRecord> | null = null

function getDemoStore(): Map<string, DayRecord> {
  if (!demoStore) {
    demoStore = new Map(getDemoDayRecords().map((d) => [d.date, d]))
  }
  return demoStore
}

async function ensureMissionId(userId: string): Promise<string> {
  if (missionIdCache) return missionIdCache
  if (!supabase) throw new Error('Supabase not configured')

  const { data: existing } = await supabase
    .from('missions')
    .select('id')
    .eq('user_id', userId)
    .eq('name', 'RECLAIM 122')
    .maybeSingle()

  if (existing) {
    missionIdCache = existing.id
    return existing.id
  }

  const { data: created, error } = await supabase
    .from('missions')
    .insert({
      user_id: userId,
      name: 'RECLAIM 122',
      start_date: MISSION_START,
      end_date: MISSION_END,
      timezone: 'UTC'
    })
    .select('id')
    .single()

  if (error) throw error
  missionIdCache = created.id
  return created.id
}

export async function fetchAllDayRecords(userId: string | null): Promise<Map<string, DayRecord>> {
  if (DEMO_MODE || !supabase || !userId) return getDemoStore()

  const missionId = await ensureMissionId(userId)
  const { data: days, error } = await supabase
    .from('day_records')
    .select(
      `id, date, overall_status, note, updated_at,
       goal_records ( id, goal, status, discipline_porn_free,
         fitness_data ( workout_done, steps, weight ),
         pm_data ( meaningful_progress, application_count ),
         python_data ( meaningful_progress, learning_minutes ),
         excuse_data ( reason ) )`
    )
    .eq('mission_id', missionId)

  if (error) throw error

  const map = new Map<string, DayRecord>()
  for (const row of days ?? []) {
    const goals: DayRecord['goals'] = {}
    for (const gr of row.goal_records ?? []) {
      const goalKey = gr.goal as GoalKey
      const rec: GoalRecord = {
        goal: goalKey,
        status: gr.status as Status,
        excuseReason: (gr.excuse_data?.[0]?.reason as ExcuseReason) ?? null,
        disciplinePornFree: gr.discipline_porn_free ?? null
      }
      if (gr.fitness_data?.[0]) {
        rec.fitness = {
          workoutDone: gr.fitness_data[0].workout_done,
          steps: gr.fitness_data[0].steps,
          weight: gr.fitness_data[0].weight
        }
      }
      if (gr.pm_data?.[0]) {
        rec.pm = {
          meaningfulProgress: gr.pm_data[0].meaningful_progress,
          applicationCount: gr.pm_data[0].application_count
        }
      }
      if (gr.python_data?.[0]) {
        rec.python = {
          meaningfulProgress: gr.python_data[0].meaningful_progress,
          learningMinutes: gr.python_data[0].learning_minutes
        }
      }
      goals[goalKey] = rec
    }
    map.set(row.date, {
      date: row.date,
      overallStatus: row.overall_status as Status,
      note: row.note,
      goals,
      updatedAt: row.updated_at
    })
  }
  return map
}

/** Upserts a full day record (all provided goals) in one call. Recomputes overall status. */
export async function saveDayRecord(userId: string | null, day: DayRecord): Promise<DayRecord> {
  const finalDay: DayRecord = { ...day, overallStatus: computeOverallStatus(day.goals) }

  if (DEMO_MODE || !supabase || !userId) {
    getDemoStore().set(finalDay.date, finalDay)
    return finalDay
  }

  const missionId = await ensureMissionId(userId)

  const { data: dayRow, error: dayErr } = await supabase
    .from('day_records')
    .upsert(
      {
        mission_id: missionId,
        user_id: userId,
        date: finalDay.date,
        overall_status: finalDay.overallStatus,
        note: finalDay.note
      },
      { onConflict: 'mission_id,date' }
    )
    .select('id')
    .single()

  if (dayErr) throw dayErr
  const dayId = dayRow.id

  for (const goalKey of Object.keys(finalDay.goals) as GoalKey[]) {
    const g = finalDay.goals[goalKey]
    if (!g) continue

    const { data: goalRow, error: goalErr } = await supabase
      .from('goal_records')
      .upsert(
        {
          day_id: dayId,
          user_id: userId,
          goal: goalKey,
          status: g.status,
          discipline_porn_free: g.disciplinePornFree ?? null
        },
        { onConflict: 'day_id,goal' }
      )
      .select('id')
      .single()

    if (goalErr) throw goalErr
    const goalRecordId = goalRow.id

    if (goalKey === 'fitness' && g.fitness) {
      await supabase.from('fitness_data').upsert({
        goal_record_id: goalRecordId,
        workout_done: g.fitness.workoutDone,
        steps: g.fitness.steps,
        weight: g.fitness.weight
      })
    }
    if (goalKey === 'pm' && g.pm) {
      await supabase.from('pm_data').upsert({
        goal_record_id: goalRecordId,
        meaningful_progress: g.pm.meaningfulProgress,
        application_count: g.pm.applicationCount
      })
    }
    if (goalKey === 'python' && g.python) {
      await supabase.from('python_data').upsert({
        goal_record_id: goalRecordId,
        meaningful_progress: g.python.meaningfulProgress,
        learning_minutes: g.python.learningMinutes
      })
    }
    if (g.excuseReason) {
      await supabase.from('excuse_data').upsert({ goal_record_id: goalRecordId, reason: g.excuseReason })
    } else {
      await supabase.from('excuse_data').delete().eq('goal_record_id', goalRecordId)
    }
  }

  return finalDay
}
