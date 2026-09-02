export type GoalKey = 'discipline' | 'fitness' | 'pm' | 'python'

export const GOAL_ORDER: GoalKey[] = ['discipline', 'fitness', 'pm', 'python']

export const GOAL_META: Record<GoalKey, { label: string; icon: string; weight: number }> = {
  discipline: { label: 'Discipline', icon: 'Brain', weight: 30 },
  fitness: { label: 'Fitness', icon: 'Dumbbell', weight: 25 },
  pm: { label: 'Product Management', icon: 'Briefcase', weight: 25 },
  python: { label: 'Python', icon: 'Code2', weight: 20 }
}

export type Status = 'green' | 'blue' | 'red' | 'yellow' | 'not_recorded'

export type ExcuseReason = 'travel' | 'illness' | 'family' | 'work' | 'emergency' | 'other'

export interface FitnessData {
  workoutDone: boolean
  steps: number | null
  weight: number | null
}

export interface PmData {
  meaningfulProgress: 'done' | 'partial' | 'not_done'
  applicationCount: number
}

export interface PythonData {
  meaningfulProgress: 'done' | 'partial' | 'not_done'
  learningMinutes: number
}

export interface GoalRecord {
  goal: GoalKey
  status: Status
  excuseReason: ExcuseReason | null
  fitness?: FitnessData
  pm?: PmData
  python?: PythonData
  disciplinePornFree?: boolean | null
}

export interface DayRecord {
  date: string // YYYY-MM-DD
  overallStatus: Status
  note: string | null
  goals: Partial<Record<GoalKey, GoalRecord>>
  updatedAt?: string
}

export interface StreakInfo {
  current: number
  longest: number
  greenCount: number
  blueCount: number
  redCount: number
  yellowCount: number
  notRecordedCount: number
  completedCount: number
}

export const MISSION_START = '2026-09-01'
export const MISSION_END = '2026-12-31'
export const MISSION_TOTAL_DAYS = 122
