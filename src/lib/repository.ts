import { supabase, DEMO_MODE } from './supabase'
import {
  DayRecord,
  ExcuseReason,
  GoalKey,
  GoalRecord,
  Status,
  MISSION_START,
  MISSION_END,
} from '../types'
import { getDemoDayRecords } from '../demo/syntheticData'
import { computeOverallStatus } from './status'

/**
 * Repository
 * ----------
 * The single place the UI talks to for reading/writing day + goal records.
 *
 * Demo mode:
 * - Uses synthetic in-memory data.
 * - Never touches Supabase.
 *
 * Private mode:
 * - Supabase is the source of truth.
 * - Reads parent/child tables separately rather than relying on nested
 *   PostgREST relationship responses.
 * - Every write checks for an error.
 */

/* -------------------------------------------------------------------------- */
/* In-memory demo state                                                       */
/* -------------------------------------------------------------------------- */

let demoStore: Map<string, DayRecord> | null = null

function getDemoStore(): Map<string, DayRecord> {
  if (!demoStore) {
    demoStore = new Map(getDemoDayRecords().map((day) => [day.date, day]))
  }

  return demoStore
}

/* -------------------------------------------------------------------------- */
/* Mission cache                                                             */
/* -------------------------------------------------------------------------- */

let missionIdCache: {
  userId: string
  missionId: string
} | null = null

/**
 * Get the user's RECLAIM 122 mission.
 *
 * We intentionally select one existing mission rather than using maybeSingle()
 * because an earlier development session may have created duplicate mission
 * rows before the uniqueness constraint was added.
 *
 * The earliest mission is used consistently.
 */
async function ensureMissionId(userId: string): Promise<string> {
  if (
    missionIdCache &&
    missionIdCache.userId === userId &&
    missionIdCache.missionId
  ) {
    return missionIdCache.missionId
  }

  if (!supabase) {
    throw new Error('Supabase not configured')
  }

  const { data: existing, error: findError } = await supabase
    .from('missions')
    .select('id, created_at')
    .eq('user_id', userId)
    .eq('name', 'RECLAIM 122')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (findError) {
    throw findError
  }

  if (existing) {
    missionIdCache = {
      userId,
      missionId: existing.id,
    }

    return existing.id
  }

  const { data: created, error: createError } = await supabase
    .from('missions')
    .insert({
      user_id: userId,
      name: 'RECLAIM 122',
      start_date: MISSION_START,
      end_date: MISSION_END,
      timezone: 'UTC',
    })
    .select('id')
    .single()

  if (createError) {
    throw createError
  }

  missionIdCache = {
    userId,
    missionId: created.id,
  }

  return created.id
}

/* -------------------------------------------------------------------------- */
/* Fetch                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Fetch all saved days for the authenticated user.
 *
 * IMPORTANT:
 * We do NOT use a deeply nested Supabase select here.
 *
 * Instead:
 *   1. Fetch day_records
 *   2. Fetch goal_records
 *   3. Fetch fitness_data
 *   4. Fetch pm_data
 *   5. Fetch python_data
 *   6. Fetch excuse_data
 *   7. Assemble the DayRecord objects locally
 *
 * This avoids relying on PostgREST's inferred relationship shape for the
 * one-to-one child tables and fixes the issue where old days appeared green
 * on the calendar but opened with missing goal details.
 */
export async function fetchAllDayRecords(
  userId: string | null,
): Promise<Map<string, DayRecord>> {
  if (DEMO_MODE || !supabase || !userId) {
    return getDemoStore()
  }

  const missionId = await ensureMissionId(userId)

  /* ------------------------------ Day records ----------------------------- */

  const {
    data: dayRows,
    error: dayError,
  } = await supabase
    .from('day_records')
    .select('id, date, overall_status, note, updated_at')
    .eq('mission_id', missionId)
    .eq('user_id', userId)
    .order('date', { ascending: true })

  if (dayError) {
    throw dayError
  }

  const days = dayRows ?? []

  if (days.length === 0) {
    return new Map<string, DayRecord>()
  }

  const dayIds = days.map((day) => day.id)

  /* ------------------------------ Goal records ---------------------------- */

  const {
    data: goalRows,
    error: goalError,
  } = await supabase
    .from('goal_records')
    .select(
      'id, day_id, user_id, goal, status, discipline_porn_free',
    )
    .in('day_id', dayIds)
    .eq('user_id', userId)

  if (goalError) {
    throw goalError
  }

  const goals = goalRows ?? []

  /* ----------------------------- Child record IDs ------------------------- */

  const goalRecordIds = goals.map((goal) => goal.id)

  /*
   * If there are no goal records, we can still return the day records.
   * This is useful for NOT RECORDED / partially constructed days.
   */
  if (goalRecordIds.length === 0) {
    const emptyMap = new Map<string, DayRecord>()

    for (const day of days) {
      emptyMap.set(day.date, {
        date: day.date,
        overallStatus: day.overall_status as Status,
        note: day.note,
        goals: {},
        updatedAt: day.updated_at,
      })
    }

    return emptyMap
  }

  /* ----------------------------- Fitness data ----------------------------- */

  const {
    data: fitnessRows,
    error: fitnessError,
  } = await supabase
    .from('fitness_data')
    .select('goal_record_id, workout_done, steps, weight')
    .in('goal_record_id', goalRecordIds)

  if (fitnessError) {
    throw fitnessError
  }

  /* ------------------------------- PM data -------------------------------- */

  const {
    data: pmRows,
    error: pmError,
  } = await supabase
    .from('pm_data')
    .select('goal_record_id, meaningful_progress, application_count')
    .in('goal_record_id', goalRecordIds)

  if (pmError) {
    throw pmError
  }

  /* ----------------------------- Python data ------------------------------ */

  const {
    data: pythonRows,
    error: pythonError,
  } = await supabase
    .from('python_data')
    .select('goal_record_id, meaningful_progress, learning_minutes')
    .in('goal_record_id', goalRecordIds)

  if (pythonError) {
    throw pythonError
  }

  /* ----------------------------- Excuse data ------------------------------ */

  const {
    data: excuseRows,
    error: excuseError,
  } = await supabase
    .from('excuse_data')
    .select('goal_record_id, reason')
    .in('goal_record_id', goalRecordIds)

  if (excuseError) {
    throw excuseError
  }

  /* ------------------------------ Lookup maps ------------------------------ */

  const fitnessByGoalId = new Map(
    (fitnessRows ?? []).map((row) => [row.goal_record_id, row]),
  )

  const pmByGoalId = new Map(
    (pmRows ?? []).map((row) => [row.goal_record_id, row]),
  )

  const pythonByGoalId = new Map(
    (pythonRows ?? []).map((row) => [row.goal_record_id, row]),
  )

  const excuseByGoalId = new Map(
    (excuseRows ?? []).map((row) => [row.goal_record_id, row]),
  )

  /* ---------------------------- Goal lookup ------------------------------- */

  const goalsByDayId = new Map<string, GoalRecord[]>()

  for (const row of goals) {
    const goalKey = row.goal as GoalKey

    const record: GoalRecord = {
      goal: goalKey,
      status: row.status as Status,
      excuseReason:
        (excuseByGoalId.get(row.id)?.reason as ExcuseReason) ?? null,
      disciplinePornFree: row.discipline_porn_free ?? null,
    }

    /* ---------------------------- Fitness ---------------------------- */

    if (goalKey === 'fitness') {
      const fitness = fitnessByGoalId.get(row.id)

      if (fitness) {
        record.fitness = {
          workoutDone: fitness.workout_done,
          steps: fitness.steps,
          weight: fitness.weight,
        }
      }
    }

    /* ------------------------------- PM ------------------------------ */

    if (goalKey === 'pm') {
      const pm = pmByGoalId.get(row.id)

      if (pm) {
        record.pm = {
          meaningfulProgress: pm.meaningful_progress,
          applicationCount: pm.application_count,
        }
      }
    }

    /* ----------------------------- Python ---------------------------- */

    if (goalKey === 'python') {
      const python = pythonByGoalId.get(row.id)

      if (python) {
        record.python = {
          meaningfulProgress: python.meaningful_progress,
          learningMinutes: python.learning_minutes,
        }
      }
    }

    const existing = goalsByDayId.get(row.day_id) ?? []
    existing.push(record)
    goalsByDayId.set(row.day_id, existing)
  }

  /* --------------------------- Assemble days ------------------------------ */

  const result = new Map<string, DayRecord>()

  for (const day of days) {
    const goalsForDay = goalsByDayId.get(day.id) ?? []

    const goals: DayRecord['goals'] = {}

    for (const goal of goalsForDay) {
      goals[goal.goal] = goal
    }

    result.set(day.date, {
      date: day.date,
      overallStatus: day.overall_status as Status,
      note: day.note,
      goals,
      updatedAt: day.updated_at,
    })
  }

  return result
}

/* -------------------------------------------------------------------------- */
/* Save                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Save a complete day record.
 *
 * The final overall status is ALWAYS recomputed from the goal records.
 */
export async function saveDayRecord(
  userId: string | null,
  day: DayRecord,
): Promise<DayRecord> {
  const finalDay: DayRecord = {
    ...day,
    overallStatus: computeOverallStatus(day.goals),
  }

  /* ------------------------------ Demo mode ------------------------------- */

  if (DEMO_MODE || !supabase || !userId) {
    getDemoStore().set(finalDay.date, finalDay)
    return finalDay
  }

  const missionId = await ensureMissionId(userId)

  /* ------------------------------ Day record ------------------------------ */

  const {
    data: dayRow,
    error: dayError,
  } = await supabase
    .from('day_records')
    .upsert(
      {
        mission_id: missionId,
        user_id: userId,
        date: finalDay.date,
        overall_status: finalDay.overallStatus,
        note: finalDay.note ?? null,
      },
      {
        onConflict: 'mission_id,date',
      },
    )
    .select('id')
    .single()

  if (dayError) {
    throw dayError
  }

  if (!dayRow?.id) {
    throw new Error('Supabase did not return a day record ID.')
  }

  const dayId = dayRow.id

  /* ------------------------------ Goal records ---------------------------- */

  for (const goalKey of Object.keys(finalDay.goals) as GoalKey[]) {
    const goal = finalDay.goals[goalKey]

    if (!goal) {
      continue
    }

    const {
      data: goalRow,
      error: goalError,
    } = await supabase
      .from('goal_records')
      .upsert(
        {
          day_id: dayId,
          user_id: userId,
          goal: goalKey,
          status: goal.status,
          discipline_porn_free:
            goal.disciplinePornFree ?? null,
        },
        {
          onConflict: 'day_id,goal',
        },
      )
      .select('id')
      .single()

    if (goalError) {
      throw goalError
    }

    if (!goalRow?.id) {
      throw new Error(
        `Supabase did not return a goal record ID for ${goalKey}.`,
      )
    }

    const goalRecordId = goalRow.id

    /* ------------------------------ Fitness ------------------------------- */

    if (goalKey === 'fitness') {
      if (goal.fitness) {
        const { error: fitnessError } = await supabase
          .from('fitness_data')
          .upsert(
            {
              goal_record_id: goalRecordId,
              workout_done: goal.fitness.workoutDone,
              steps: goal.fitness.steps ?? null,
              weight: goal.fitness.weight ?? null,
            },
            {
              onConflict: 'goal_record_id',
            },
          )

        if (fitnessError) {
          throw fitnessError
        }
      } else {
        /*
         * If fitness data was removed while editing an existing day,
         * remove the old child row so a later reload cannot resurrect it.
         */
        const { error: deleteFitnessError } = await supabase
          .from('fitness_data')
          .delete()
          .eq('goal_record_id', goalRecordId)

        if (deleteFitnessError) {
          throw deleteFitnessError
        }
      }
    }

    /* -------------------------------- PM ---------------------------------- */

    if (goalKey === 'pm') {
      if (goal.pm) {
        const { error: pmError } = await supabase
          .from('pm_data')
          .upsert(
            {
              goal_record_id: goalRecordId,
              meaningful_progress: goal.pm.meaningfulProgress,
              application_count: goal.pm.applicationCount ?? 0,
            },
            {
              onConflict: 'goal_record_id',
            },
          )

        if (pmError) {
          throw pmError
        }
      } else {
        const { error: deletePmError } = await supabase
          .from('pm_data')
          .delete()
          .eq('goal_record_id', goalRecordId)

        if (deletePmError) {
          throw deletePmError
        }
      }
    }

    /* ------------------------------- Python ------------------------------- */

    if (goalKey === 'python') {
      if (goal.python) {
        const { error: pythonError } = await supabase
          .from('python_data')
          .upsert(
            {
              goal_record_id: goalRecordId,
              meaningful_progress: goal.python.meaningfulProgress,
              learning_minutes: goal.python.learningMinutes ?? 0,
            },
            {
              onConflict: 'goal_record_id',
            },
          )

        if (pythonError) {
          throw pythonError
        }
      } else {
        const { error: deletePythonError } = await supabase
          .from('python_data')
          .delete()
          .eq('goal_record_id', goalRecordId)

        if (deletePythonError) {
          throw deletePythonError
        }
      }
    }

    /* ------------------------------- Excuse ------------------------------- */

    if (goal.excuseReason) {
      const { error: excuseError } = await supabase
        .from('excuse_data')
        .upsert(
          {
            goal_record_id: goalRecordId,
            reason: goal.excuseReason,
          },
          {
            onConflict: 'goal_record_id',
          },
        )

      if (excuseError) {
        throw excuseError
      }
    } else {
      const { error: deleteExcuseError } = await supabase
        .from('excuse_data')
        .delete()
        .eq('goal_record_id', goalRecordId)

      if (deleteExcuseError) {
        throw deleteExcuseError
      }
    }
  }

  return finalDay
}